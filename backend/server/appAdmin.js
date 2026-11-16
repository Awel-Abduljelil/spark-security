import { Router } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, tx, RECEIPTS } from './db.js';
import {
  csrf, requireAdmin, limiter, verify, DUMMY, startSession, endSession, totpOk, normPhone, parseJ,
} from './security.js';

const r = Router();
const bad = (res, message, status = 400) => res.status(status).json({ message });
const statusToDb = (status) => status === 'verified' ? 'approved' : status;
const statusFromDb = (status) => status === 'approved' ? 'verified' : status;
const dateIsValid = (value) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
};
const emailIsValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const list = (value) => Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];

function log(req, action, entity, detail = '') {
  db.prepare('INSERT INTO audit(admin_id,email,action,entity,detail,ip) VALUES(?,?,?,?,?,?)')
    .run(req.admin?.id ?? null, req.admin?.email ?? null, action, entity, String(detail).slice(0, 500), req.ip || '');
}

function enrollmentCounts(cohortId) {
  const rows = db.prepare(`SELECT status,COUNT(*) n FROM enrollments WHERE cohort_id=? GROUP BY status`).all(cohortId);
  const counts = { pending: 0, verified: 0, rejected: 0 };
  for (const row of rows) counts[statusFromDb(row.status)] = row.n;
  return counts;
}

function cohortView(cohort) {
  const counts = enrollmentCounts(cohort.id);
  return {
    id: cohort.id,
    courseSlug: cohort.course_slug,
    label: cohort.label,
    startDate: cohort.start_date ?? '',
    totalSeats: cohort.total_seats,
    priceEtb: cohort.price_etb,
    schedule: cohort.schedule,
    isOpen: !!cohort.is_open,
    counts,
    seatsLeft: cohort.total_seats === 0 ? 0 : Math.max(0, cohort.total_seats - counts.verified),
  };
}

function cohortQuery(id) {
  return db.prepare(`SELECT h.*,c.slug course_slug FROM cohorts h JOIN courses c ON c.id=h.course_id WHERE h.id=?`).get(id);
}

function courseContent(course) {
  try {
    const saved = JSON.parse(course.content_json || '{}');
    if (saved && Array.isArray(saved.outcomes) && Array.isArray(saved.weeks)
      && Array.isArray(saved.requirements) && Array.isArray(saved.audience)
      && Array.isArray(saved.instructors)) return saved;
  } catch {
    // Older rows can be reconstructed from their legacy content columns.
  }
  const topics = parseJ(course.topics);
  return {
    outcomes: parseJ(course.objectives),
    weeks: topics.length ? [{ title: 'Course topics', topics }] : [],
    requirements: parseJ(course.prereqs),
    audience: parseJ(course.audience),
    instructors: course.instructor ? [{ name: course.instructor, role: 'Instructor', bio: '' }] : [],
  };
}

function courseView(course) {
  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    status: course.status,
    sortOrder: course.sort,
    updatedAt: course.updated_at,
    createdAt: course.created_at,
    duration: course.duration ?? '',
    sessions: course.sessions ?? 0,
    labs: course.labs ?? 0,
    tag: course.tag || null,
    description: course.description || '',
    cover: course.cover || null,
    skills: parseJ(course.skills),
    content: courseContent(course),
    platform: course.format || null,
    language: course.language || 'en',
    cohortsPerYear: course.cohorts_per_year ?? null,
  };
}

function courseListItem(course) {
  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    status: course.status,
    language: course.language || 'en',
    sortOrder: course.sort,
    updatedAt: course.updated_at,
    cohortCount: db.prepare('SELECT COUNT(*) n FROM cohorts WHERE course_id=?').get(course.id).n,
    enrollmentCount: db.prepare('SELECT COUNT(*) n FROM enrollments WHERE course_id=?').get(course.id).n,
  };
}

function contentFromInput(input) {
  const content = input.content;
  if (!content || !Array.isArray(content.outcomes) || !Array.isArray(content.weeks)
    || !Array.isArray(content.requirements) || !Array.isArray(content.audience)
    || !Array.isArray(content.instructors)) return null;
  const stringList = (items) => items.length <= 60 && items.every((item) => typeof item === 'string');
  if (!stringList(content.outcomes) || !stringList(content.requirements) || !stringList(content.audience)
    || !content.weeks.every((week) => week && typeof week.title === 'string'
      && Array.isArray(week.topics) && stringList(week.topics))
    || !content.instructors.every((instructor) => instructor
      && typeof instructor.name === 'string' && typeof instructor.role === 'string'
      && typeof instructor.bio === 'string'
      && (instructor.photo == null || typeof instructor.photo === 'string'))) {
    return null;
  }
  return {
    outcomes: content.outcomes.map((item) => item.trim()).filter(Boolean),
    weeks: content.weeks.map((week) => ({ title: week.title.trim(), topics: week.topics.map((item) => item.trim()).filter(Boolean) })),
    requirements: content.requirements.map((item) => item.trim()).filter(Boolean),
    audience: content.audience.map((item) => item.trim()).filter(Boolean),
    instructors: content.instructors.map((instructor) => ({
      name: instructor.name.trim(), role: instructor.role.trim(), bio: instructor.bio.trim(),
      ...(instructor.photo ? { photo: instructor.photo.trim().slice(0, 500) } : {}),
    })),
  };
}

function courseValues(input) {
  const content = contentFromInput(input);
  if (!content) return null;
  const level = input.level;
  const status = input.status ?? 'draft';
  const finiteInteger = (value, fallback = 0) => {
    if (value === undefined || value === null || value === '') return fallback;
    const number = Number(value);
    return Number.isSafeInteger(number) ? number : Number.NaN;
  };
  return {
    title: String(input.title ?? '').trim().slice(0, 140),
    slug: String(input.slug ?? '').trim().toLowerCase().slice(0, 80),
    status,
    short: String(input.description ?? '').trim().slice(0, 300),
    description: String(input.description ?? '').trim().slice(0, 8000),
    cover: String(input.cover ?? '').trim().slice(0, 500),
    level,
    duration: String(input.duration ?? '').trim().slice(0, 60),
    format: String(input.platform ?? '').trim().slice(0, 120),
    instructor: content.instructors[0]?.name ?? '',
    objectives: JSON.stringify(content.outcomes),
    topics: JSON.stringify(content.weeks.flatMap((week) => week.topics)),
    prereqs: JSON.stringify(content.requirements),
    audience: JSON.stringify(content.audience),
    content_json: JSON.stringify(content),
    sessions: finiteInteger(input.sessions),
    labs: finiteInteger(input.labs),
    tag: String(input.tag ?? '').trim().slice(0, 60),
    skills: JSON.stringify(list(input.skills)),
    language: input.language ?? 'en',
    cohorts_per_year: input.cohortsPerYear == null ? null : finiteInteger(input.cohortsPerYear, -1),
    sort: finiteInteger(input.sortOrder),
  };
}

function validateCourse(input, values, slug = values?.slug) {
  if (!values?.title || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return 'Enter a title and a valid course slug.';
  if (!['draft', 'published', 'archived'].includes(values.status)) return 'Invalid course status.';
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(values.level)) return 'Invalid course level.';
  if (!['en', 'om', 'am'].includes(values.language)) return 'Language must be en, om, or am.';
  for (const key of ['sessions', 'labs', 'cohorts_per_year', 'sort']) {
    if (values[key] != null && (!Number.isSafeInteger(values[key]) || values[key] < 0)) return `Invalid ${key.replaceAll('_', ' ')} value.`;
  }
  if (!Array.isArray(input.skills) || input.skills.length > 60) return 'Course skills must be a list of at most 60 items.';
  if (values.cover && !/^(https:\/\/|\/media\/)/.test(values.cover)) return 'Course cover must be an HTTPS URL or a media upload.';
  if (JSON.parse(values.content_json).instructors.some((instructor) =>
    instructor.photo && !/^(https:\/\/|\/media\/)/.test(instructor.photo))) {
    return 'Instructor photos must be HTTPS URLs or media uploads.';
  }
  return '';
}

function getCourseBySlug(slug) {
  return db.prepare('SELECT * FROM courses WHERE slug=?').get(slug);
}

function courseEditBody(req) {
  const current = getCourseBySlug(req.params.slug);
  if (!current) return { error: 'Course not found.' };
  const existing = courseView(current);
  const next = { ...existing, ...req.body, slug: existing.slug };
  const values = courseValues(next);
  const error = validateCourse(next, values, existing.slug);
  if (error) return { error };
  return { current, values };
}

function seatsLeft(cohort) {
  if (cohort.total_seats === 0) return 0;
  return Math.max(0, cohort.total_seats - db.prepare("SELECT COUNT(*) n FROM enrollments WHERE cohort_id=? AND status='approved'").get(cohort.id).n);
}

function enrollmentView(enrollment) {
  const cohort = enrollment.cohort_id ? cohortQuery(enrollment.cohort_id) : null;
  const possibleDuplicate = !!db.prepare(`SELECT 1 FROM enrollments other WHERE other.id<>? AND other.course_id=?
    AND other.phone=? AND other.status IN ('pending','approved') LIMIT 1`)
    .get(enrollment.id, enrollment.course_id, enrollment.phone);
  const receiptRef = enrollment.receipt_type === 'upload'
    ? `/api/admin/enrollments/${enrollment.id}/receipt`
    : enrollment.receipt_type === 'link' ? enrollment.receipt_link : null;
  return {
    id: enrollment.id,
    cohortId: enrollment.cohort_id ?? 0,
    courseSlug: enrollment.course_slug,
    startDate: cohort?.start_date ?? '',
    totalSeats: cohort?.total_seats ?? 0,
    isOpen: !!cohort?.is_open,
    fullName: enrollment.full_name,
    email: enrollment.email,
    phone: enrollment.phone,
    telegram: enrollment.telegram,
    receiptType: enrollment.receipt_type,
    receiptRef,
    status: statusFromDb(enrollment.status),
    createdAt: enrollment.created_at,
    rejectionReason: enrollment.reject_reason,
    adminNote: enrollment.admin_note,
    accessNote: enrollment.access_note,
    telegramInvited: !!enrollment.telegram_invited,
    reviewedAt: enrollment.decided_at,
    possibleDuplicate,
    createdByAdmin: !!enrollment.created_by_admin,
  };
}

function getEnrollment(id) {
  return db.prepare(`SELECT e.*,c.slug course_slug FROM enrollments e
    JOIN courses c ON c.id=e.course_id WHERE e.id=?`).get(id);
}

function applyEnrollmentFilters(query) {
  const where = [];
  const params = [];
  if (['pending', 'verified', 'rejected'].includes(query.status)) {
    where.push('e.status=?');
    params.push(statusToDb(query.status));
  }
  if (query.courseSlug) {
    where.push('c.slug=?');
    params.push(String(query.courseSlug).slice(0, 80));
  }
  if (Number.isSafeInteger(Number(query.cohortId)) && Number(query.cohortId) > 0) {
    where.push('e.cohort_id=?');
    params.push(Number(query.cohortId));
  }
  if (query.q) {
    const like = `%${String(query.q).slice(0, 50)}%`;
    where.push('(e.full_name LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR e.username LIKE ? OR e.ref LIKE ? OR e.telegram LIKE ?)');
    params.push(like, like, like, like, like, like);
  }
  return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

function enrollmentsQuery(query, limit, offset) {
  const filters = applyEnrollmentFilters(query);
  return db.prepare(`SELECT e.*,c.slug course_slug FROM enrollments e JOIN courses c ON c.id=e.course_id
    ${filters.clause} ORDER BY e.id DESC LIMIT ? OFFSET ?`).all(...filters.params, limit, offset);
}

function isAtCapacity(cohort) {
  return cohort.total_seats !== 0 && seatsLeft(cohort) <= 0;
}

r.use(csrf);
r.post('/login', limiter(20, 15 * 60e3), limiter(5, 15 * 60e3, (req) => `${req.ip}|${String(req.body.email).toLowerCase()}`), (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const admin = db.prepare('SELECT * FROM admins WHERE email=?').get(email);
  const passwordOk = verify(password, admin ? admin.pass_hash : DUMMY) && !!admin;
  const codeOk = passwordOk && (!admin.totp_on || totpOk(admin.totp_secret, req.body.code));
  if (!passwordOk || !codeOk) {
    db.prepare('INSERT INTO audit(email,action,ip) VALUES(?,?,?)').run(email.slice(0, 120), 'login_failed', req.ip || '');
    return bad(res, admin && passwordOk && admin.totp_on && !req.body.code
      ? 'Enter your authentication code.'
      : 'Invalid credentials.', 401);
  }
  startSession(res, admin.id, req.ip);
  db.prepare('INSERT INTO audit(admin_id,email,action,ip) VALUES(?,?,?,?)').run(admin.id, admin.email, 'login', req.ip || '');
  res.json({ ok: true });
});
r.post('/logout', (req, res) => {
  endSession(req, res);
  res.json({ ok: true });
});
r.use(requireAdmin);
r.get('/me', (req, res) => res.json({ ok: true, email: req.admin.email, totp: !!req.admin.totp_on }));

r.get('/summary', (req, res) => {
  const count = (status) => db.prepare('SELECT COUNT(*) n FROM enrollments WHERE status=?').get(status).n;
  const cohorts = db.prepare(`SELECT h.*,c.slug course_slug FROM cohorts h JOIN courses c ON c.id=h.course_id
    ORDER BY h.start_date,h.id`).all().map(cohortView);
  res.json({ pending: count('pending'), verified: count('approved'), rejected: count('rejected'), cohorts });
});

r.get('/courses', (req, res) => {
  const rows = db.prepare('SELECT * FROM courses ORDER BY sort,id DESC').all();
  res.json(rows.map(courseListItem));
});
r.get('/courses/:slug', (req, res) => {
  const course = getCourseBySlug(req.params.slug);
  if (!course) return bad(res, 'Course not found.', 404);
  res.json(courseView(course));
});
r.post('/courses', (req, res) => {
  const values = courseValues(req.body);
  const validation = validateCourse(req.body, values);
  if (validation) return bad(res, validation);
  if (getCourseBySlug(values.slug)) return bad(res, 'A course with that slug already exists.', 409);
  const fields = Object.keys(values).filter((field) => field !== 'status');
  const result = db.prepare(`INSERT INTO courses(${fields.join(',')},price,status) VALUES(${fields.map(() => '?').join(',')},0,?)`)
    .run(...fields.map((field) => values[field]), values.status);
  const course = db.prepare('SELECT * FROM courses WHERE id=?').get(result.lastInsertRowid);
  log(req, 'course_created', `courses:${course.id}`, `${course.title} (language: ${course.language})`);
  res.status(201).json(courseView(course));
});
r.patch('/courses/:slug', (req, res) => {
  const result = courseEditBody(req);
  if (result.error) return bad(res, result.error, result.error === 'Course not found.' ? 404 : 400);
  const { current, values } = result;
  const oldLanguage = current.language || 'en';
  const fields = Object.keys(values).filter((field) => field !== 'slug');
  db.prepare(`UPDATE courses SET ${fields.map((field) => `${field}=?`).join(',')},updated_at=? WHERE id=?`)
    .run(...fields.map((field) => values[field]), Date.now(), current.id);
  log(req, 'course_updated', `courses:${current.id}`, current.title);
  if (values.language !== oldLanguage) {
    log(req, 'course_language_updated', `courses:${current.id}`, `${oldLanguage} -> ${values.language}`);
  }
  res.json(courseView(getCourseBySlug(current.slug)));
});
r.delete('/courses/:slug', (req, res) => {
  const course = getCourseBySlug(req.params.slug);
  if (!course) return bad(res, 'Course not found.', 404);
  if (db.prepare('SELECT 1 FROM enrollments WHERE course_id=?').get(course.id)) {
    return bad(res, 'This course has enrollments. Archive it instead of deleting.', 409);
  }
  db.prepare('DELETE FROM cohorts WHERE course_id=?').run(course.id);
  db.prepare('DELETE FROM courses WHERE id=?').run(course.id);
  log(req, 'course_deleted', `courses:${course.id}`, course.title);
  res.json({ ok: true });
});

r.get('/cohorts', (req, res) => {
  const filters = [];
  const params = [];
  if (req.query.courseSlug) {
    filters.push('c.slug=?');
    params.push(String(req.query.courseSlug).slice(0, 80));
  }
  if (req.query.isOpen === 'true' || req.query.isOpen === 'false') {
    filters.push('h.is_open=?');
    params.push(req.query.isOpen === 'true' ? 1 : 0);
  }
  const rows = db.prepare(`SELECT h.*,c.slug course_slug FROM cohorts h JOIN courses c ON c.id=h.course_id
    ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''} ORDER BY h.start_date,h.id`).all(...params);
  res.json(rows.map(cohortView));
});
r.post('/cohorts', (req, res) => {
  const input = req.body;
  const course = getCourseBySlug(String(input.courseSlug ?? ''));
  const startDate = String(input.startDate ?? '');
  const seats = Number(input.totalSeats);
  const price = Number(input.priceEtb);
  if (!course || course.status === 'archived') return bad(res, 'Choose an existing, non-archived course.');
  if (!dateIsValid(startDate) || !startDate) return bad(res, 'Enter a valid cohort start date.');
  if (!Number.isInteger(seats) || seats < 0 || seats > 500) return bad(res, 'Seats must be an integer from 0 to 500.');
  if (!Number.isInteger(price) || price < 0 || price > 1000000) return bad(res, 'Price must be an integer from 0 to 1,000,000 ETB.');
  const result = db.prepare(`INSERT INTO cohorts(course_id,label,start_date,total_seats,price_etb,schedule,is_open)
    VALUES(?,?,?,?,?,?,?)`).run(
    course.id, String(input.label ?? '').trim().slice(0, 120) || null, startDate, seats, price,
    String(input.schedule ?? '').trim().slice(0, 200) || null, input.isOpen === false ? 0 : 1,
  );
  log(req, 'cohort_created', `cohorts:${result.lastInsertRowid}`, course.slug);
  res.status(201).json(cohortView(cohortQuery(result.lastInsertRowid)));
});
r.patch('/cohorts/:id', (req, res) => {
  const current = cohortQuery(Number(req.params.id));
  if (!current) return bad(res, 'Cohort not found.', 404);
  const input = req.body;
  const course = input.courseSlug === undefined ? getCourseBySlug(current.course_slug) : getCourseBySlug(String(input.courseSlug));
  const startDate = input.startDate === undefined ? current.start_date ?? '' : String(input.startDate);
  const seats = input.totalSeats === undefined ? current.total_seats : Number(input.totalSeats);
  const price = input.priceEtb === undefined ? current.price_etb : input.priceEtb === null ? null : Number(input.priceEtb);
  if (!course || course.status === 'archived') return bad(res, 'Choose an existing, non-archived course.');
  if (!dateIsValid(startDate)) return bad(res, 'Enter a valid cohort start date.');
  if (!Number.isInteger(seats) || seats < 0 || seats > 500) return bad(res, 'Seats must be an integer from 0 to 500.');
  if (price !== null && (!Number.isInteger(price) || price < 0 || price > 1000000)) {
    return bad(res, 'Price must be an integer from 0 to 1,000,000 ETB.');
  }
  const label = input.label === undefined ? current.label : String(input.label ?? '').trim().slice(0, 120) || null;
  const schedule = input.schedule === undefined ? current.schedule : String(input.schedule ?? '').trim().slice(0, 200) || null;
  const isOpen = input.isOpen === undefined ? current.is_open : input.isOpen ? 1 : 0;
  db.prepare(`UPDATE cohorts SET course_id=?,label=?,start_date=?,total_seats=?,price_etb=?,schedule=?,is_open=?,updated_at=?
    WHERE id=?`).run(course.id, label, startDate || null, seats, price, schedule, isOpen, Date.now(), current.id);
  log(req, 'cohort_updated', `cohorts:${current.id}`, course.slug);
  res.json(cohortView(cohortQuery(current.id)));
});
r.delete('/cohorts/:id', (req, res) => {
  const cohort = cohortQuery(Number(req.params.id));
  if (!cohort) return bad(res, 'Cohort not found.', 404);
  if (db.prepare('SELECT 1 FROM enrollments WHERE cohort_id=?').get(cohort.id)) {
    return bad(res, 'This cohort has enrollments and cannot be deleted.', 409);
  }
  db.prepare('DELETE FROM cohorts WHERE id=?').run(cohort.id);
  log(req, 'cohort_deleted', `cohorts:${cohort.id}`, cohort.course_slug);
  res.json({ ok: true });
});

r.get('/enrollments/export.csv', (req, res) => {
  const filters = applyEnrollmentFilters(req.query);
  const rows = db.prepare(`SELECT e.ref,e.full_name,e.email,e.phone,e.telegram,e.amount,e.status,e.created_at,c.title course,
    h.start_date FROM enrollments e JOIN courses c ON c.id=e.course_id LEFT JOIN cohorts h ON h.id=e.cohort_id
    ${filters.clause} ORDER BY e.id DESC`).all(...filters.params);
  const cell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  res.type('text/csv').set('Content-Disposition', 'attachment; filename="enrollments.csv"');
  res.send([
    ['Reference', 'Name', 'Email', 'Phone', 'Telegram', 'Course', 'Cohort start', 'Amount', 'Status', 'Created'].map(cell).join(','),
    ...rows.map((row) => [row.ref, row.full_name, row.email, row.phone, row.telegram, row.course, row.start_date, row.amount, statusFromDb(row.status), row.created_at].map(cell).join(',')),
  ].join('\r\n'));
});
r.get('/enrollments', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = 20;
  const filters = applyEnrollmentFilters(req.query);
  const total = db.prepare(`SELECT COUNT(*) n FROM enrollments e JOIN courses c ON c.id=e.course_id ${filters.clause}`)
    .get(...filters.params).n;
  const rows = enrollmentsQuery(req.query, perPage, (page - 1) * perPage);
  res.json({ items: rows.map(enrollmentView), total, page, pageCount: Math.max(1, Math.ceil(total / perPage)) });
});
r.get('/enrollments/:id', (req, res) => {
  const enrollment = getEnrollment(Number(req.params.id));
  if (!enrollment) return bad(res, 'Enrollment not found.', 404);
  res.json(enrollmentView(enrollment));
});
r.patch('/enrollments/:id', (req, res) => {
  const enrollment = getEnrollment(Number(req.params.id));
  if (!enrollment) return bad(res, 'Enrollment not found.', 404);
  const input = req.body;
  if (input.status !== undefined) {
    if (!['pending', 'verified', 'rejected'].includes(input.status)) return bad(res, 'Invalid enrollment status.');
    const next = statusToDb(input.status);
    if (next === 'rejected') return bad(res, 'Use DELETE to reject and permanently delete this enrollment.');
    if (enrollment.status === 'rejected' && next !== 'rejected') return bad(res, 'Rejected enrollments cannot be restored.', 409);
    if (next === 'approved' && enrollment.status !== 'approved') {
      const cohort = enrollment.cohort_id ? cohortQuery(enrollment.cohort_id) : null;
      if (cohort && isAtCapacity(cohort)) return bad(res, 'This cohort is full.', 409);
    }
    db.prepare(`UPDATE enrollments SET status=?,reject_reason=?,decided_by=?,decided_at=? WHERE id=?`)
      .run(next, null,
        next === 'pending' ? null : req.admin.id, next === 'pending' ? null : Date.now(), enrollment.id);
    log(req, next === 'approved' ? 'enrollment_approved' : 'enrollment_reopened',
      `enrollment:${enrollment.id}`);
  }
  if (input.adminNote !== undefined) {
    db.prepare('UPDATE enrollments SET admin_note=? WHERE id=?')
      .run(String(input.adminNote ?? '').trim().slice(0, 5000), enrollment.id);
    log(req, 'enrollment_note_saved', `enrollment:${enrollment.id}`);
  }
  if (input.accessNote !== undefined) {
    db.prepare('UPDATE enrollments SET access_note=? WHERE id=?')
      .run(String(input.accessNote ?? '').trim().slice(0, 500), enrollment.id);
  }
  if (input.telegramInvited !== undefined) {
    db.prepare('UPDATE enrollments SET telegram_invited=? WHERE id=?')
      .run(input.telegramInvited ? 1 : 0, enrollment.id);
  }
  res.json(enrollmentView(getEnrollment(enrollment.id)));
});
r.delete('/enrollments/:id', (req, res) => {
  const id = Number(req.params.id);
  const enrollment = db.prepare('SELECT id,receipt_file FROM enrollments WHERE id=?').get(id);
  if (!enrollment) return bad(res, 'Enrollment not found.', 404);
  try {
    tx(() => {
      log(req, 'enrollment_rejected_and_deleted', `enrollment:${id}`);
      db.prepare('DELETE FROM enrollments WHERE id=?').run(id);
    });
  } catch (error) {
    console.error('Enrollment deletion failed:', error);
    return bad(res, 'The enrollment could not be permanently deleted.', 500);
  }
  if (enrollment.receipt_file) {
    try {
      fs.rmSync(path.join(RECEIPTS, path.basename(enrollment.receipt_file)), { force: true });
    } catch (error) {
      console.error('Deleted enrollment receipt cleanup failed:', error);
      return bad(res, 'The enrollment was deleted, but its uploaded receipt could not be removed.', 500);
    }
  }
  res.json({ ok: true });
});
r.post('/enrollments/bulk-verify', (req, res) => {
  const ids = Array.isArray(req.body.ids) ? [...new Set(req.body.ids.map(Number))] : [];
  if (!ids.length || ids.length > 100 || ids.some((id) => !Number.isSafeInteger(id) || id < 1)) {
    return bad(res, 'Select between 1 and 100 valid enrollments.');
  }
  const verified = [];
  const skipped = [];
  tx(() => {
    for (const id of ids) {
      const enrollment = getEnrollment(id);
      if (!enrollment) {
        skipped.push({ id, reason: 'not_found' });
        continue;
      }
      if (enrollment.status !== 'pending') {
        skipped.push({ id, reason: 'not_pending' });
        continue;
      }
      const cohort = enrollment.cohort_id ? cohortQuery(enrollment.cohort_id) : null;
      if (cohort && isAtCapacity(cohort)) {
        skipped.push({ id, reason: 'cohort_full' });
        continue;
      }
      db.prepare(`UPDATE enrollments SET status='approved',decided_by=?,decided_at=? WHERE id=?`)
        .run(req.admin.id, Date.now(), id);
      verified.push(id);
      log(req, 'enrollment_approved', `enrollment:${id}`);
    }
  });
  res.json({ verified, skipped });
});
r.post('/enrollments', (req, res) => {
  const input = req.body;
  const cohort = cohortQuery(Number(input.cohortId));
  const fullName = String(input.fullName ?? '').trim().slice(0, 80);
  const email = String(input.email ?? '').trim().slice(0, 120);
  const phone = normPhone(input.phone);
  const telegram = String(input.telegram ?? '').trim().replace(/^@/, '').slice(0, 32);
  if (!cohort) return bad(res, 'Choose a valid cohort.');
  if (fullName.length < 3) return bad(res, 'Enter the student’s full name.');
  if (!emailIsValid(email)) return bad(res, 'Enter a valid email address.');
  if (!phone) return bad(res, 'Enter a valid phone number.');
  if (!/^[A-Za-z0-9_]{5,32}$/.test(telegram)) return bad(res, 'Enter a valid Telegram username.');
  if (!['pending', 'verified'].includes(input.status)) return bad(res, 'Invalid enrollment status.');
  if (input.status === 'verified' && isAtCapacity(cohort)) return bad(res, 'This cohort is full.', 409);
  const ref = `SPK-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  const course = getCourseBySlug(cohort.course_slug);
  const amount = cohort.price_etb ?? course.price;
  const status = statusToDb(input.status);
  const result = db.prepare(`INSERT INTO enrollments(ref,course_id,cohort_id,full_name,email,username,phone,telegram,amount,
    receipt_type,status,admin_note,decided_by,decided_at,created_by_admin,ip)
    VALUES(?,?,?,?,?,?,?,?,?,'manual',?,?,?,?,1,?)`)
    .run(ref, course.id, cohort.id, fullName, email, '', phone, telegram, amount, status,
      String(input.adminNote ?? '').trim().slice(0, 5000) || null,
      status === 'approved' ? req.admin.id : null, status === 'approved' ? Date.now() : null, req.ip || '');
  log(req, 'enrollment_created', `enrollment:${result.lastInsertRowid}`, fullName);
  res.status(201).json(enrollmentView(getEnrollment(result.lastInsertRowid)));
});
r.post('/enrollments/:id/move', (req, res) => {
  const enrollment = getEnrollment(Number(req.params.id));
  const cohort = cohortQuery(Number(req.body.cohortId));
  if (!enrollment || !cohort) return bad(res, 'Enrollment or cohort not found.', 404);
  if (enrollment.course_id !== cohort.course_id) return bad(res, 'Enrollments can only be moved within the same course.');
  if (enrollment.status === 'approved' && isAtCapacity(cohort)) return bad(res, 'This cohort is full.', 409);
  const course = getCourseBySlug(cohort.course_slug);
  db.prepare('UPDATE enrollments SET cohort_id=?,amount=? WHERE id=?')
    .run(cohort.id, cohort.price_etb ?? course.price, enrollment.id);
  log(req, 'enrollment_moved', `enrollment:${enrollment.id}`, `cohort:${cohort.id}`);
  res.json(enrollmentView(getEnrollment(enrollment.id)));
});

export default r;
