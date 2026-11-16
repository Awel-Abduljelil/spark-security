import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, tx, RECEIPTS } from './db.js';
import { limiter, normPhone, sniff, parseJ } from './security.js';

const r = Router();
const up = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20 } });
const upload = (field) => (q, s, n) => up.single(field)(q, s, (e) =>
  e ? s.status(400).json({ error: e.code === 'LIMIT_FILE_SIZE' ? 'Receipt must be 5 MB or smaller.' : 'Upload failed.' }) : n());

export const effective = (c) => (c.discount != null && c.discount > 0 && c.discount < c.price ? c.discount : c.price);
function shape(c) {
  const used = db.prepare("SELECT COUNT(*) n FROM enrollments WHERE course_id=? AND status='approved'").get(c.id).n;
  const seatsLeft = c.seats ? Math.max(0, c.seats - used) : null;
  const expired = c.deadline && new Date(c.deadline + 'T23:59:59') < new Date();
  const eff = effective(c);
  return {
    slug: c.slug, title: c.title, short: c.short, description: c.description, level: c.level, duration: c.duration, format: c.format,
    instructor: c.instructor, schedule: c.schedule, cover: c.cover, price: c.price, discount: eff < c.price ? eff : null, amount: eff,
    seats: c.seats, seatsLeft, deadline: c.deadline, objectives: parseJ(c.objectives), topics: parseJ(c.topics), prereqs: parseJ(c.prereqs), audience: parseJ(c.audience),
    open: !!c.enrollment_open && !expired && (seatsLeft === null || seatsLeft > 0),
  };
}
const published = () => db.prepare("SELECT * FROM courses WHERE status='published' ORDER BY sort, id DESC").all();
const settings = () => Object.fromEntries(db.prepare('SELECT key,value FROM settings').all().map((x) => [x.key, x.value]));

r.get('/health', (q, s) => s.json({ ok: true }));
r.get('/site', (q, s) => {
  const st = settings(); delete st.group_instructions; // only shown to approved students
  s.json({
    settings: st,
    courses: published().map(shape),
    mentors: db.prepare('SELECT id,name,role,bio,specialties,achievements,photo,linkedin,github FROM mentors WHERE published=1 ORDER BY sort,id').all()
      .map((m) => ({ ...m, specialties: parseJ(m.specialties), achievements: parseJ(m.achievements) })),
    faqs: db.prepare('SELECT question,answer FROM faqs WHERE published=1 ORDER BY sort,id').all(),
  });
});
r.get('/courses/:slug', (q, s) => {
  const c = db.prepare("SELECT * FROM courses WHERE slug=? AND status='published'").get(q.params.slug);
  c ? s.json(shape(c)) : s.status(404).json({ error: 'Course not found' });
});
r.get('/payment-methods', (q, s) => s.json({
  methods: db.prepare('SELECT type,bank,holder,number,notes FROM payment_methods WHERE active=1 ORDER BY sort,id').all(),
  reference: settings().payment_reference,
}));

const str = (v, max) => String(v ?? '').trim().slice(0, max);
const duplicateMessage = 'You are already registered. Please wait up to 24 hours for your registration to be reviewed, or contact our team on Telegram.';
const enrollmentRateLimitMessage = 'Too many registration attempts. Please wait 5 minutes before trying again.';
const findActiveRegistration = (email, telegram, courseId, phone) => db.prepare(`SELECT id FROM enrollments
  WHERE status IN ('pending','approved') AND
  (lower(trim(email))=? OR lower(replace(trim(telegram),'@',''))=? OR (course_id=? AND phone=?)) LIMIT 1`)
  .get(email, telegram, courseId, phone);
r.post('/enroll', limiter(10, 5 * 60e3, undefined, enrollmentRateLimitMessage), upload('receipt'), (q, s) => {
  const b = q.body, err = {};
  const course = db.prepare("SELECT * FROM courses WHERE slug=? AND status='published'").get(str(b.courseSlug, 80));
  if (!course) return s.status(404).json({ error: 'Course not found' });
  const c = shape(course);

  const fullName = str(b.fullName, 80), username = str(b.username, 24).toLowerCase();
  const email = str(b.email, 120).toLowerCase(), phone = normPhone(b.phone);
  const telegram = str(b.telegram, 33).replace(/^@/, '').toLowerCase();
  const requestedCohortId = Number(b.cohortId);
  let cohort = Number.isSafeInteger(requestedCohortId) && requestedCohortId > 0
    ? db.prepare('SELECT * FROM cohorts WHERE id=? AND course_id=?').get(requestedCohortId, course.id)
    : null;
  if (Number.isSafeInteger(requestedCohortId) && requestedCohortId > 0 && !cohort) {
    return s.status(404).json({ error: 'Cohort not found.' });
  }
  if (!cohort) {
    const choices = db.prepare(`SELECT * FROM cohorts WHERE course_id=? AND is_open=1
      ORDER BY CASE WHEN start_date IS NULL OR start_date='' THEN 1 ELSE 0 END,start_date,id`).all(course.id);
    cohort = choices.find((item) => item.total_seats === 0
      || db.prepare("SELECT COUNT(*) n FROM enrollments WHERE cohort_id=? AND status='approved'").get(item.id).n < item.total_seats);
  }
  if (fullName.length < 3) err.fullName = 'Enter your full name.';
  if (username && !/^[a-z0-9_]{3,24}$/.test(username)) err.username = 'Use 3-24 letters, numbers, or underscores.';
  if (!email) err.email = 'Enter an email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'Enter a valid email address.';
  if (!phone) err.phone = 'Enter a valid phone number.';
  if (!/^[A-Za-z0-9_]{5,32}$/.test(telegram)) err.telegram = 'Enter your Telegram username (5-32 characters).';
  if (!['true', 'on', '1'].includes(String(b.consent))) err.consent = 'Consent is required.';
  if (!Object.keys(err).length && findActiveRegistration(email, telegram, course.id, phone)) {
    return s.status(409).json({ error: duplicateMessage, code: 'already_registered' });
  }
  if (!course.enrollment_open || (course.deadline && new Date(course.deadline + 'T23:59:59') < new Date())) {
    return s.status(409).json({ error: 'Enrollment is closed for this course.' });
  }
  if (cohort && (!cohort.is_open || (cohort.total_seats > 0
    && db.prepare("SELECT COUNT(*) n FROM enrollments WHERE cohort_id=? AND status='approved'").get(cohort.id).n >= cohort.total_seats))) {
    return s.status(409).json({ error: 'Enrollment is closed or this cohort is full.' });
  }
  if (!cohort) {
    const hasCohorts = db.prepare('SELECT 1 FROM cohorts WHERE course_id=?').get(course.id);
    if (hasCohorts || !c.open) return s.status(409).json({ error: 'Enrollment is closed or all cohorts are full.' });
  }

  const receiptType = b.receiptType === 'link' ? 'link' : 'upload';
  let link = null, ext = null;
  if (receiptType === 'link') {
    link = str(b.receiptLink, 500);
    try { if (new URL(link).protocol !== 'https:') throw 0; } catch { err.receipt = 'Enter a valid https:// receipt link.'; }
  } else if (!q.file) err.receipt = 'Upload your payment receipt.';
  else if (!(ext = sniff(q.file.buffer))) err.receipt = 'Receipt must be a JPEG, PNG, WebP, or PDF file.';
  if (Object.keys(err).length) return s.status(400).json({ error: 'Please fix the highlighted fields.', fields: err });

  const ref = 'SPK-' + crypto.randomBytes(5).toString('hex').toUpperCase();
  const file = ext ? crypto.randomBytes(16).toString('hex') + '.' + ext : null;
  if (file) fs.writeFileSync(path.join(RECEIPTS, file), q.file.buffer, { mode: 0o600 });
  const amount = cohort?.price_etb ?? effective(course);
  try {
    tx(() => {
      if (findActiveRegistration(email, telegram, course.id, phone)) {
        throw Object.assign(new Error(duplicateMessage), { code: 'DUPLICATE_REGISTRATION' });
      }
      db.prepare(`INSERT INTO enrollments(ref,course_id,cohort_id,full_name,email,username,phone,telegram,amount,receipt_type,receipt_file,receipt_link,ip)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(ref, course.id, cohort?.id ?? null, fullName, email, username, phone, telegram, amount, receiptType, file, link, q.ip || '');
    });
  } catch (e) {
    if (file) fs.rmSync(path.join(RECEIPTS, file), { force: true });
    if (e.code === 'DUPLICATE_REGISTRATION') {
      return s.status(409).json({ error: duplicateMessage, code: 'already_registered' });
    }
    throw e;
  }
  const id = db.prepare('SELECT id FROM enrollments WHERE ref=?').get(ref).id;
  s.status(201).json({ id, ref, course: c.title, amount, status: 'pending', createdAt: Date.now() });
});

// Status lookup needs the reference AND the registered phone; failures look identical.
r.post('/enroll/status', limiter(10, 15 * 60e3), (q, s) => {
  const phone = normPhone(q.body.phone);
  const e = phone && db.prepare('SELECT e.*,c.title FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.ref=?').get(str(q.body.ref, 20).toUpperCase());
  if (!e || e.phone !== phone) return s.status(404).json({ error: 'No application matches those details.' });
  const out = { ref: e.ref, course: e.title, amount: e.amount, status: e.status, createdAt: e.created_at };
  if (e.status === 'rejected') out.reason = e.reject_reason;
  if (e.status === 'approved') {
    out.instructions = e.access_note || settings().group_instructions;
    out.telegramInvited = !!e.telegram_invited;
  }
  s.json(out);
});

r.post('/contact', limiter(5, 3600e3), (q, s) => {
  const { name, email, message, website } = q.body;
  if (website) return s.json({ ok: true }); // honeypot
  const n = str(name, 80), m = str(email, 120), b = str(message, 3000);
  if (n.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m) || b.length < 10) return s.status(400).json({ error: 'Please complete all fields.' });
  db.prepare('INSERT INTO messages(name,email,body) VALUES(?,?,?)').run(n, m, b);
  s.status(201).json({ ok: true });
});

export default r;
