import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'spark-'));
process.env.ADMIN_PASSWORD = 'Sparkadmin123';
process.env.ADMIN_PATH = '0123456789abcdef0123456789abcdef';
const { app } = await import('../server/index.js');
let server, base, cookie = '';
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]);

before(() => new Promise((r) => { server = app.listen(0, () => { base = 'http://localhost:' + server.address().port; r(); }); }));
after(() => server.close());
const call = async (m, p, body, hdr = {}) => {
  const isFD = body instanceof FormData;
  const r = await fetch(base + p, { method: m, headers: { 'X-Requested-With': 'spark', cookie, ...(body && !isFD ? { 'Content-Type': 'application/json' } : {}), ...hdr }, body: body ? (isFD ? body : JSON.stringify(body)) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  return { status: r.status, json: await r.clone().json().catch(() => ({})), r };
};
const enrollFD = (over = {}) => {
  const f = new FormData();
  const v = { courseSlug: 'web-penetration-testing', fullName: 'Abel Tesfaye', email: 'abel@example.test', username: 'abel_t', phone: '0911223344', telegram: '@abelt1', consent: 'true', receiptType: 'upload', ...over };
  for (const [k, x] of Object.entries(v)) f.set(k, x);
  if (!over.noFile) f.set('receipt', new Blob([over.bad ? Buffer.from('not an image at all!!') : PNG], { type: 'image/png' }), 'x.png');
  return f;
};

test('admin routes need auth, CSRF header, and correct credentials', async () => {
  assert.equal((await call('GET', '/api/admin/dashboard')).status, 401);
  assert.equal((await call('POST', '/api/admin/login', { email: 'a@b.c', password: 'x' }, { 'X-Requested-With': '' })).status, 403);
  assert.equal((await call('POST', '/api/admin/login', { email: 'admin@sparksecurity.local', password: 'wrong' })).status, 401);
  assert.equal((await call('POST', '/api/admin/login', { email: 'admin@sparksecurity.local', password: 'Sparkadmin123' })).status, 200);
  assert.ok((await call('GET', '/api/admin/dashboard')).json.drafts >= 2);
  const settings = await call('GET', '/api/admin/settings');
  assert.equal(settings.status, 200);
  assert.equal((await call('PUT', '/api/admin/settings', { contact_email: 'admin@example.test' })).status, 200);
  assert.equal((await call('GET', '/api/admin/settings')).json.contact_email, 'admin@example.test');
  assert.equal((await call('GET', '/api/admin/mentors')).status, 200);
  assert.equal((await call('GET', '/api/admin/faqs')).status, 200);
  assert.equal((await call('GET', '/api/admin/payment-methods')).status, 200);
  assert.ok((await call('GET', '/api/admin/audit')).json.some((entry) => entry.action === 'settings_updated'));
});

test('legacy admin path redirects to the configured admin URL', async () => {
  const page = await fetch(base + '/legacy-admin/', { redirect: 'manual' });
  assert.equal(page.status, 302);
  assert.equal(page.headers.get('location'), `/${process.env.ADMIN_PATH}/settings/website`);
});

test('mentor admin validates links, uploads photos, audits changes, and publishes in order', async () => {
  const invalid = await call('POST', '/api/admin/mentors', {
    name: 'Invalid Mentor', linkedin: 'http://linkedin.example/user', published: true, sort: 0,
  });
  assert.equal(invalid.status, 400);

  const upload = new FormData();
  upload.set('file', new Blob([PNG], { type: 'image/png' }), 'mentor.png');
  const photo = await call('POST', '/api/admin/upload', upload);
  assert.equal(photo.status, 200);
  assert.match(photo.json.url, /^\/media\/[a-f0-9]+\.png$/);

  const first = await call('POST', '/api/admin/mentors', {
    name: 'Published Mentor Two', role: 'Instructor', bio: 'A real profile.',
    specialties: ['Application security'], achievements: ['Verified research'],
    photo: photo.json.url, linkedin: 'https://linkedin.example/mentor', github: '',
    published: true, sort: 2,
  });
  const second = await call('POST', '/api/admin/mentors', {
    name: 'Published Mentor One', role: 'Educator', bio: 'Another real profile.',
    specialties: [], achievements: [], photo: '', linkedin: '',
    github: 'https://github.example/mentor', published: true, sort: 1,
  });
  const hidden = await call('POST', '/api/admin/mentors', {
    name: 'Unpublished Mentor', published: false, sort: 0,
  });
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(hidden.status, 200);

  const adminMentors = await call('GET', '/api/admin/mentors');
  assert.deepEqual(adminMentors.json.map((mentor) => mentor.name).slice(0, 3), [
    'Unpublished Mentor', 'Published Mentor One', 'Published Mentor Two',
  ]);
  const publicMentors = (await call('GET', '/api/site')).json.mentors;
  assert.deepEqual(publicMentors.map((mentor) => mentor.name), [
    'Published Mentor One', 'Published Mentor Two',
  ]);
  assert.deepEqual(publicMentors[1].achievements, ['Verified research']);

  const audit = (await call('GET', '/api/admin/audit')).json;
  assert.ok(audit.some((entry) => entry.action === 'mentors_created' && entry.entity === `mentors:${first.json.id}`));
  assert.ok(audit.some((entry) => entry.action === 'image_uploaded'));
});

test('draft courses are hidden; publishing exposes them; discount rules enforced', async () => {
  assert.equal((await call('GET', '/api/site')).json.courses.length, 0);
  const list = (await call('GET', '/api/admin/courses')).json;
  const c = list.find((x) => x.slug === 'web-penetration-testing');
  assert.equal((await call('PUT', `/api/admin/courses/${c.id}`, { ...c, status: 'published', discount: 4000 })).status, 400);
  assert.equal((await call('PUT', `/api/admin/courses/${c.id}`, { ...c, status: 'published', seats: 1 })).status, 200);
  const pub = (await call('GET', '/api/site')).json.courses;
  assert.equal(pub.length, 1); assert.equal(pub[0].amount, 2200); assert.equal(pub[0].open, true);
});

test('enrollment validation, receipt sniffing, price from server, duplicate block', async () => {
  const anon = ''; const saved = cookie; cookie = anon;
  assert.equal((await call('POST', '/api/enroll', enrollFD({ bad: true }))).status, 400);
  assert.equal((await call('POST', '/api/enroll', enrollFD({ noFile: true }))).status, 400);
  assert.equal((await call('POST', '/api/enroll', enrollFD({ phone: '123' }))).status, 400);
  const ok = await call('POST', '/api/enroll', enrollFD({ amount: '1' }));
  assert.equal(ok.status, 201); assert.equal(ok.json.amount, 2200); assert.match(ok.json.ref, /^SPK-[0-9A-F]{10}$/);
  const emailDuplicate = await call('POST', '/api/enroll', enrollFD({
    email: 'ABEL@example.test', phone: '0911998877', telegram: '@othertelegram',
  }));
  assert.equal(emailDuplicate.status, 409);
  assert.equal(emailDuplicate.json.code, 'already_registered');
  assert.match(emailDuplicate.json.error, /wait up to 24 hours/);
  const telegramDuplicate = await call('POST', '/api/enroll', enrollFD({
    email: 'different@example.test', phone: '0911998878', telegram: '@ABELT1',
  }));
  assert.equal(telegramDuplicate.status, 409);
  assert.equal(telegramDuplicate.json.code, 'already_registered');
  globalThis.REF = ok.json.ref; cookie = saved;
});

test('status lookup needs ref + phone; approval, capacity, private receipt', async () => {
  const anon = cookie; cookie = '';
  assert.equal((await call('POST', '/api/enroll/status', { ref: REF, phone: '0900000000' })).status, 404);
  assert.equal((await call('POST', '/api/enroll/status', { ref: REF, phone: '0911223344' })).json.status, 'pending');
  cookie = anon;
  const e = (await call('GET', '/api/admin/enrollments?q=abel')).json.items[0];
  assert.equal((await call('GET', `/api/admin/enrollments/${e.id}/receipt`)).r.headers.get('content-type'), 'image/png');
  const noAuth = cookie; cookie = '';
  assert.equal((await call('GET', `/api/admin/enrollments/${e.id}/receipt`)).status, 401); cookie = noAuth;
  const rejected = await call('POST', '/api/enroll', enrollFD({
    email: 'reject@example.test', phone: '0911223345', telegram: '@rejectme',
  }));
  const rejectedEnrollment = (await call('GET', '/api/admin/enrollments?q=rejectme')).json.items[0];
  assert.equal((await call('POST', `/api/admin/enrollments/${rejectedEnrollment.id}/decision`, { decision: 'reject' })).status, 200);
  assert.equal((await call('GET', `/api/admin/enrollments/${rejectedEnrollment.id}`)).status, 404);
  assert.equal((await call('GET', `/api/admin/enrollments/${rejectedEnrollment.id}/receipt`)).status, 404);
  assert.equal((await call('POST', '/api/enroll/status', { ref: rejected.json.ref, phone: '0911223345' })).status, 404);
  assert.equal((await call('POST', `/api/admin/enrollments/${e.id}/decision`, { decision: 'approve', accessNote: 'Join: t.me/+private' })).status, 200);
  assert.equal((await call('POST', `/api/admin/enrollments/${e.id}/decision`, { decision: 'approve' })).status, 409);
  cookie = '';
  const st = (await call('POST', '/api/enroll/status', { ref: REF, phone: '+251911223344' })).json;
  assert.equal(st.status, 'approved'); assert.equal(st.instructions, 'Join: t.me/+private');
  const approvedDuplicate = await call('POST', '/api/enroll', enrollFD({
    email: 'ABEL@example.test', phone: '0911998877', telegram: '@differenttelegram',
  }));
  assert.equal(approvedDuplicate.status, 409);
  assert.equal(approvedDuplicate.json.code, 'already_registered');
  assert.equal((await call('GET', '/api/site')).json.courses[0].open, false); // seats = 1, now full
  cookie = anon;
});

test('password change, contact message, and 2FA login', async () => {
  const f = new FormData(); // contact
  assert.equal((await call('POST', '/api/contact', { name: 'Sam', email: 's@x.co', message: 'Hello there, quick question.' })).status, 201);
  const messages = (await call('GET', '/api/admin/messages')).json;
  assert.equal(messages.length, 1);
  assert.equal((await call('PUT', `/api/admin/messages/${messages[0].id}/read`)).status, 200);
  assert.equal((await call('GET', '/api/admin/messages')).json[0].read, 1);
  assert.ok((await call('GET', '/api/admin/audit')).json.some((entry) => entry.action === 'message_marked_read'));
  assert.equal((await call('POST', '/api/admin/password', { current: 'Sparkadmin123', next: 'short', confirm: 'short' })).status, 400);
  assert.equal((await call('POST', '/api/admin/password', { current: 'Sparkadmin123', next: 'NewStrongPass9', confirm: 'NewStrongPass9' })).status, 200);
  const { totp } = await import('./totp.js');
  const s = (await call('POST', '/api/admin/2fa/setup')).json.secret;
  globalThis.REACT_ADMIN_TOTP_SECRET = s;
  assert.equal((await call('POST', '/api/admin/2fa/enable', { code: '000000' })).status, 400);
  assert.equal((await call('POST', '/api/admin/2fa/enable', { code: totp(s) })).status, 200);
  cookie = '';
  assert.equal((await call('POST', '/api/admin/login', { email: 'admin@sparksecurity.local', password: 'NewStrongPass9' })).status, 401);
  assert.equal((await call('POST', '/api/admin/login', { email: 'admin@sparksecurity.local', password: 'NewStrongPass9', code: totp(s) })).status, 200);
});

test('React API integrates courses, cohorts, enrollment, and admin workflows', async () => {
  const { totp } = await import('./totp.js');
  cookie = '';
  const login = await call('POST', '/api/app/admin/login', {
    email: 'admin@sparksecurity.local',
    password: 'NewStrongPass9',
    code: totp(globalThis.REACT_ADMIN_TOTP_SECRET),
  });
  assert.equal(login.status, 200);
  const seededCourses = await call('GET', '/api/app/admin/courses');
  assert.ok(seededCourses.json.every((course) => course.language === 'en'));
  assert.equal((await call('GET', '/api/app/admin/me')).json.email, 'admin@sparksecurity.local');
  const migrated = await call('GET', '/api/app/admin/cohorts?courseSlug=cybersecurity-fundamentals');
  assert.equal(migrated.json.length, 1);
  assert.equal(migrated.json[0].totalSeats, 0);
  assert.equal(migrated.json[0].priceEtb, 1500);

  const content = {
    outcomes: ['Describe a safe lab workflow'],
    weeks: [{ title: 'Foundations', topics: ['Set up a local lab'] }],
    requirements: ['A computer'],
    audience: ['New learners'],
    instructors: [{ name: 'Spark Team', role: 'Instructor', bio: 'Training team', photo: '/media/instructor.webp' }],
  };
  const created = await call('POST', '/api/app/admin/courses', {
    slug: 'react-api-integration',
    status: 'published',
    sortOrder: 1,
    title: 'React API Integration',
    level: 'Beginner',
    duration: '2 weeks',
    sessions: 4,
    labs: 2,
    tag: 'New',
    description: 'A practical integration course.',
    cover: '/media/course-cover.webp',
    skills: ['Lab setup'],
    content,
    platform: 'Online',
    cohortsPerYear: 2,
  });
  assert.equal(created.status, 201);
  assert.equal(created.json.content.weeks[0].title, 'Foundations');
  assert.equal(created.json.language, 'en');
  const featuredCard = (await call('GET', '/api/app/courses?lang=en')).json
    .find((course) => course.slug === 'react-api-integration');
  assert.equal(featuredCard.cover, '/media/course-cover.webp');
  assert.equal(featuredCard.priceEtb, 0);
  assert.equal(featuredCard.discountPriceEtb, null);
  assert.equal(featuredCard.enrollmentOpen, false);

  assert.equal((await call('PATCH', '/api/app/admin/courses/react-api-integration', {
    language: 'invalid',
  })).status, 400);
  assert.equal((await call('PATCH', '/api/app/admin/courses/react-api-integration', {
    language: 'om',
  })).json.language, 'om');
  const languageAudit = await call('GET', '/api/admin/audit');
  assert.ok(languageAudit.json.some((item) => item.action === 'course_language_updated'
    && item.detail === 'en -> om'));

  const amharicCourse = await call('POST', '/api/app/admin/courses', {
    slug: 'amharic-course',
    status: 'published',
    sortOrder: 2,
    title: 'Amharic Course',
    level: 'Beginner',
    duration: '2 weeks',
    sessions: 2,
    labs: 1,
    description: 'A practical Amharic language course.',
    skills: ['Foundations'],
    content,
    language: 'am',
  });
  assert.equal(amharicCourse.status, 201);
  assert.equal(amharicCourse.json.language, 'am');

  const allCourses = (await call('GET', '/api/app/courses')).json;
  const englishCourses = (await call('GET', '/api/app/courses?lang=en')).json;
  assert.deepEqual(englishCourses.map((course) => course.slug), allCourses.map((course) => course.slug));
  assert.ok(allCourses.every((course) => ['en', 'om', 'am'].includes(course.language)));
  const oromoCourses = (await call('GET', '/api/app/courses?lang=om')).json;
  assert.ok(oromoCourses.some((course) => course.language === 'en'));
  assert.ok(oromoCourses.some((course) => course.language === 'om'));
  assert.ok(oromoCourses.every((course) => course.language !== 'am'));
  const amharicCourses = (await call('GET', '/api/app/courses?lang=am')).json;
  assert.ok(amharicCourses.some((course) => course.language === 'en'));
  assert.ok(amharicCourses.some((course) => course.language === 'am'));
  assert.ok(amharicCourses.every((course) => course.language !== 'om'));
  assert.equal((await call('GET', '/api/app/courses?lang=xx')).status, 400);
  assert.equal(created.json.cover, '/media/course-cover.webp');
  assert.equal(created.json.content.instructors[0].photo, '/media/instructor.webp');

  const cohort = await call('POST', '/api/app/admin/cohorts', {
    courseSlug: 'react-api-integration',
    label: 'November',
    startDate: '2026-11-20',
    totalSeats: 2,
    priceEtb: 900,
    schedule: 'Saturday',
    isOpen: true,
  });
  assert.equal(cohort.status, 201);
  assert.equal(cohort.json.seatsLeft, 2);

  const courses = await call('GET', '/api/app/courses');
  const publicCourse = courses.json.find((course) => course.slug === 'react-api-integration');
  assert.equal(publicCourse.nextCohort.priceEtb, 900);
  assert.equal(publicCourse.nextCohort.totalSeats, 2);
  const publicDetail = (await call('GET', '/api/app/courses/react-api-integration')).json;
  assert.equal(publicDetail.content.weeks[0].topics[0], 'Set up a local lab');
  assert.equal(publicDetail.cover, '/media/course-cover.webp');
  assert.equal(publicDetail.content.instructors[0].photo, '/media/instructor.webp');
  assert.equal((await call('GET', '/api/app/cohorts/react-api-integration')).json.id, cohort.json.id);

  const form = new FormData();
  for (const [key, value] of Object.entries({
    courseSlug: 'react-api-integration',
    cohortId: String(cohort.json.id),
    fullName: 'Test Student',
    email: 'student@example.test',
    phone: '0911223345',
    telegram: '@teststudent',
    consent: 'true',
    receiptType: 'upload',
  })) form.set(key, value);
  form.set('receipt', new Blob([PNG], { type: 'image/png' }), 'receipt.png');
  const application = await call('POST', '/api/enroll', form);
  assert.equal(application.status, 201);
  assert.match(application.json.ref, /^SPK-[0-9A-F]{10}$/);

  const listed = await call('GET', '/api/app/admin/enrollments?status=pending');
  const entry = listed.json.items.find((item) => item.id === application.json.id);
  assert.equal(entry.email, 'student@example.test');
  assert.equal(entry.cohortId, cohort.json.id);
  assert.equal((await call('POST', '/api/app/admin/enrollments/bulk-verify', { ids: [entry.id] })).json.verified[0], entry.id);
  assert.equal((await call('PATCH', `/api/app/admin/enrollments/${entry.id}`, {
    telegramInvited: true,
  })).json.telegramInvited, true);
  const invitedStatus = await call('POST', '/api/enroll/status', {
    ref: application.json.ref,
    phone: '0911223345',
  });
  assert.equal(invitedStatus.json.telegramInvited, true);
  assert.ok((await call('GET', '/api/app/admin/summary')).json.verified >= 1);
  assert.equal((await call('GET', entry.receiptRef)).status, 200);

  const manual = await call('POST', '/api/app/admin/enrollments', {
    cohortId: cohort.json.id,
    fullName: 'Manual Student',
    email: 'manual@example.test',
    phone: '0911223346',
    telegram: '@manualstudent',
    status: 'pending',
    adminNote: 'Added by the admin',
  });
  assert.equal(manual.status, 201);
  assert.equal(manual.json.receiptType, 'manual');
  assert.equal((await call('DELETE', `/api/app/admin/enrollments/${manual.json.id}`)).json.ok, true);
  const rejectedStudentCanRetry = await call('POST', '/api/enroll', enrollFD({
    courseSlug: 'react-api-integration',
    email: 'manual@example.test',
    phone: '0911223347',
    telegram: '@manualstudent',
  }));
  assert.equal(rejectedStudentCanRetry.status, 201);

  const csv = await call('GET', '/api/app/admin/enrollments/export.csv');
  assert.equal(csv.r.headers.get('content-type'), 'text/csv; charset=utf-8');
  assert.match(await csv.r.text(), /student@example\.test/);
});
