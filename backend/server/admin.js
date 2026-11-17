import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, tx, RECEIPTS, MEDIA } from './db.js';
import { csrf, requireAdmin, limiter, hash, verify, DUMMY, pwOk, startSession, endSession, dropOtherSessions, newSecret, totpOk, sniff, MIME, parseJ } from './security.js';
import { DEFAULT_SETTINGS } from './seed.js';

const r = Router();
r.use(csrf);
const log = (q, action, entity, detail) =>
  db.prepare('INSERT INTO audit(admin_id,email,action,entity,detail,ip) VALUES(?,?,?,?,?,?)').run(q.admin?.id ?? null, q.admin?.email ?? null, action, entity ?? null, detail ? String(detail).slice(0, 500) : null, q.ip || '');
const bad = (s, m, c = 400) => s.status(c).json({ error: m });

// ---------- auth ----------
r.post('/login', limiter(20, 15 * 60e3), limiter(5, 15 * 60e3, (q) => q.ip + '|' + String(q.body.email).toLowerCase()), (q, s) => {
  const { email, password, code } = q.body;
  const a = db.prepare('SELECT * FROM admins WHERE email=?').get(String(email || '').toLowerCase().trim());
  const ok = verify(password || '', a ? a.pass_hash : DUMMY) && a;
  const totpPass = ok && (!a.totp_on || totpOk(a.totp_secret, code));
  if (!ok || !totpPass) {
    db.prepare('INSERT INTO audit(email,action,ip) VALUES(?,?,?)').run(String(email || '').slice(0, 120), 'login_failed', q.ip || '');
    return bad(s, a && ok && a.totp_on && !code ? 'Enter your authentication code.' : 'Invalid credentials.', 401);
  }
  startSession(s, a.id, q.ip);
  db.prepare('INSERT INTO audit(admin_id,email,action,ip) VALUES(?,?,?,?)').run(a.id, a.email, 'login', q.ip || '');
  s.json({ ok: true });
});
r.post('/logout', (q, s) => { endSession(q, s); s.json({ ok: true }); });
r.use(requireAdmin);
r.get('/me', (q, s) => s.json({ email: q.admin.email, totp: !!q.admin.totp_on }));

r.post('/password', limiter(5, 15 * 60e3), (q, s) => {
  const { current, next, confirm } = q.body;
  const a = db.prepare('SELECT * FROM admins WHERE id=?').get(q.admin.id);
  if (!verify(current || '', a.pass_hash)) return bad(s, 'Current password is incorrect.', 403);
  if (next !== confirm) return bad(s, 'New passwords do not match.');
  if (!pwOk(next)) return bad(s, 'Use at least 10 characters with upper case, lower case, and a number.');
  db.prepare('UPDATE admins SET pass_hash=? WHERE id=?').run(hash(next), a.id);
  dropOtherSessions(a.id, q); log(q, 'password_changed', 'admin:' + a.id);
  s.json({ ok: true });
});
r.post('/2fa/setup', (q, s) => {
  const secret = newSecret();
  db.prepare('UPDATE admins SET totp_secret=?,totp_on=0 WHERE id=?').run(secret, q.admin.id);
  s.json({ secret, uri: `otpauth://totp/Spark%20Security:${encodeURIComponent(q.admin.email)}?secret=${secret}&issuer=Spark%20Security` });
});
r.post('/2fa/enable', (q, s) => {
  const a = db.prepare('SELECT totp_secret FROM admins WHERE id=?').get(q.admin.id);
  if (!a.totp_secret || !totpOk(a.totp_secret, q.body.code)) return bad(s, 'Code is incorrect.');
  db.prepare('UPDATE admins SET totp_on=1 WHERE id=?').run(q.admin.id); log(q, '2fa_enabled'); s.json({ ok: true });
});
r.post('/2fa/disable', (q, s) => {
  const a = db.prepare('SELECT * FROM admins WHERE id=?').get(q.admin.id);
  if (!verify(q.body.password || '', a.pass_hash)) return bad(s, 'Password is incorrect.', 403);
  db.prepare('UPDATE admins SET totp_on=0,totp_secret=NULL WHERE id=?').run(q.admin.id); log(q, '2fa_disabled'); s.json({ ok: true });
});

// ---------- dashboard ----------
r.get('/dashboard', (q, s) => {
  const n = (sql) => db.prepare(sql).get().n;
  s.json({
    published: n("SELECT COUNT(*) n FROM courses WHERE status='published'"), drafts: n("SELECT COUNT(*) n FROM courses WHERE status='draft'"),
    total: n('SELECT COUNT(*) n FROM enrollments'), pending: n("SELECT COUNT(*) n FROM enrollments WHERE status='pending'"),
    approved: n("SELECT COUNT(*) n FROM enrollments WHERE status='approved'"), rejected: n("SELECT COUNT(*) n FROM enrollments WHERE status='rejected'"),
    unread: n('SELECT COUNT(*) n FROM messages WHERE read=0'),
    revenue: n("SELECT COALESCE(SUM(amount),0) n FROM enrollments WHERE status='approved'"),
    activity: db.prepare('SELECT email,action,entity,detail,created_at FROM audit ORDER BY id DESC LIMIT 8').all(),
  });
});

// ---------- generic CRUD factory ----------
// spec: t:N = trimmed text up to N chars, n = integer or null, b = boolean, l = list (one per line, stored as JSON)
function crud(route, table, spec, { required = [], check, guard } = {}) {
  const cols = Object.keys(spec);
  const clean = (b) => Object.fromEntries(cols.map((k) => {
    const t = spec[k], v = b[k];
    if (t === 'b') return [k, v ? 1 : 0];
    if (t === 'n') { const x = v === '' || v == null ? null : Math.trunc(Number(v)); return [k, Number.isFinite(x) ? x : null]; }
    if (t === 'l') return [k, JSON.stringify((Array.isArray(v) ? v : String(v || '').split('\n')).map((x) => String(x).trim()).filter(Boolean).slice(0, 60))];
    return [k, String(v ?? '').trim().slice(0, +t.slice(2))];
  }));
  const out = (row) => { for (const k of cols) if (spec[k] === 'l') row[k] = parseJ(row[k]); return row; };
  r.get(route, (q, s) => s.json(db.prepare(`SELECT * FROM ${table} ORDER BY sort,id`).all().map(out)));
  const save = (q, s, id) => {
    const o = clean(q.body);
    for (const k of required) if (!o[k]) return bad(s, `${k} is required.`);
    const e = check && check(o, id); if (e) return bad(s, e, e.includes('exists') ? 409 : 400);
    if (id) {
      const set = cols.map((k) => `${k}=?`).join(',') + (table === 'courses' ? ",updated_at=strftime('%s','now')*1000" : '');
      if (!db.prepare(`UPDATE ${table} SET ${set} WHERE id=?`).run(...cols.map((k) => o[k]), id).changes) return bad(s, 'Not found', 404);
    } else id = db.prepare(`INSERT INTO ${table}(${cols.join(',')}) VALUES(${cols.map(() => '?').join(',')})`).run(...cols.map((k) => o[k])).lastInsertRowid;
    log(q, q.method === 'POST' ? `${table}_created` : `${table}_updated`, `${table}:${id}`, o.title || o.name || o.question || o.type);
    s.json(out(db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id)));
  };
  r.post(route, (q, s) => save(q, s, null));
  r.put(`${route}/:id`, (q, s) => save(q, s, +q.params.id));
  r.delete(`${route}/:id`, (q, s) => {
    const g = guard && guard(+q.params.id); if (g) return bad(s, g, 409);
    db.prepare(`DELETE FROM ${table} WHERE id=?`).run(+q.params.id); log(q, `${table}_deleted`, `${table}:${q.params.id}`); s.json({ ok: true });
  });
}
crud('/courses', 'courses', {
  title: 't:140', slug: 't:80', status: 't:12', short: 't:300', description: 't:8000', level: 't:20', duration: 't:60', format: 't:120', instructor: 't:120', schedule: 't:200', cover: 't:300',
  price: 'n', discount: 'n', seats: 'n', deadline: 't:10', enrollment_open: 'b', objectives: 'l', topics: 'l', prereqs: 'l', audience: 'l', sort: 'n',
}, {
  required: ['title', 'slug'],
  check: (o, id) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(o.slug)) return 'Slug may contain lower-case letters, numbers, and hyphens only.';
    if (!['draft', 'published', 'archived'].includes(o.status)) return 'Invalid status.';
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(o.level)) return 'Invalid level.';
    if (o.price == null || o.price < 0) return 'Price must be zero or more.';
    if (o.discount != null && (o.discount < 0 || o.discount >= o.price)) return 'Discount price must be lower than the original price.';
    if (o.seats != null && o.seats < 1) return 'Seats must be at least 1.';
    if (o.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(o.deadline)) return 'Deadline must be a date.';
    if (db.prepare('SELECT 1 FROM courses WHERE slug=? AND id IS NOT ?').get(o.slug, id ?? null)) return 'A course with that slug already exists.';
  },
  guard: (id) => db.prepare('SELECT 1 FROM enrollments WHERE course_id=?').get(id) && 'This course has enrollments. Archive it instead of deleting.',
});
crud('/mentors', 'mentors', { name: 't:120', role: 't:120', bio: 't:2000', specialties: 'l', achievements: 'l', photo: 't:300', linkedin: 't:300', github: 't:300', published: 'b', sort: 'n' }, { required: ['name'],
  check: (o) => {
    const validHttps = (value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password;
      } catch {
        return false;
      }
    };
    if (o.linkedin && !validHttps(o.linkedin)) return 'LinkedIn links must be valid https:// URLs.';
    if (o.github && !validHttps(o.github)) return 'GitHub links must be valid https:// URLs.';
    if (o.photo && !validHttps(o.photo) && !/^\/media\/[A-Za-z0-9_-]+\.(?:jpg|png|webp)$/i.test(o.photo)) {
      return 'Photo must be an https:// URL or a valid uploaded image.';
    }
  } });
crud('/faqs', 'faqs', { question: 't:300', answer: 't:3000', published: 'b', sort: 'n' }, { required: ['question', 'answer'] });
crud('/payment-methods', 'payment_methods', { type: 't:60', bank: 't:80', holder: 't:120', number: 't:60', notes: 't:300', active: 'b', sort: 'n' }, { required: ['type'] });

// ---------- enrollments ----------
r.get('/enrollments', (q, s) => {
  const page = Math.max(1, +q.query.page || 1), per = 20, w = [], a = [];
  if (['pending', 'approved', 'rejected'].includes(q.query.status)) { w.push('e.status=?'); a.push(q.query.status); }
  if (q.query.course) { w.push('c.slug=?'); a.push(String(q.query.course)); }
  if (q.query.q) { w.push('(e.full_name LIKE ? OR e.phone LIKE ? OR e.username LIKE ? OR e.ref LIKE ? OR e.telegram LIKE ?)'); const l = `%${String(q.query.q).slice(0, 50)}%`; a.push(l, l, l, l, l); }
  const where = w.length ? 'WHERE ' + w.join(' AND ') : '';
  const total = db.prepare(`SELECT COUNT(*) n FROM enrollments e JOIN courses c ON c.id=e.course_id ${where}`).get(...a).n;
  const items = db.prepare(`SELECT e.id,e.ref,e.full_name,e.username,e.phone,e.telegram,e.amount,e.status,e.receipt_type,e.created_at,c.title course FROM enrollments e JOIN courses c ON c.id=e.course_id ${where} ORDER BY e.id DESC LIMIT ? OFFSET ?`).all(...a, per, (page - 1) * per);
  s.json({ items, total, page, pages: Math.max(1, Math.ceil(total / per)) });
});
r.get('/enrollments/:id', (q, s) => {
  const e = db.prepare('SELECT e.*,c.title course FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.id=?').get(+q.params.id);
  if (!e) return bad(s, 'Not found', 404);
  delete e.receipt_file; delete e.ip;
  e.history = db.prepare("SELECT email,action,detail,created_at FROM audit WHERE entity=? ORDER BY id").all('enrollment:' + e.id);
  s.json(e);
});
r.get('/enrollments/:id/receipt', (q, s) => {
  const e = db.prepare('SELECT receipt_file FROM enrollments WHERE id=?').get(+q.params.id);
  if (!e?.receipt_file) return bad(s, 'No uploaded receipt.', 404);
  const ext = path.extname(e.receipt_file).slice(1), file = path.join(RECEIPTS, path.basename(e.receipt_file));
  if (!fs.existsSync(file)) return bad(s, 'File missing.', 404);
  log(q, 'receipt_viewed', 'enrollment:' + q.params.id);
  s.set({ 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'private, no-store', 'Content-Disposition': 'inline', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" });
  fs.createReadStream(file).pipe(s);
});
r.post('/enrollments/:id/decision', (q, s) => {
  const { decision, accessNote } = q.body, id = +q.params.id;
  if (!['approve', 'reject'].includes(decision)) return bad(s, 'Invalid decision.');
  try {
    tx(() => {
      const e = db.prepare('SELECT e.*,c.seats FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.id=?').get(id);
      if (!e) throw Object.assign(new Error('Not found'), { code: 404 });
      if (decision === 'approve' && e.status !== 'pending') throw Object.assign(new Error('Only pending applications can be approved.'), { code: 409 });
      if (decision === 'reject' && e.status === 'rejected') throw Object.assign(new Error('This application was already rejected.'), { code: 409 });
      if (decision === 'approve' && e.seats && db.prepare("SELECT COUNT(*) n FROM enrollments WHERE course_id=? AND status='approved'").get(e.course_id).n >= e.seats)
        throw Object.assign(new Error('This course is full.'), { code: 409 });
      if (decision === 'approve') {
        db.prepare('UPDATE enrollments SET status=?,reject_reason=NULL,access_note=?,decided_by=?,decided_at=? WHERE id=?')
          .run('approved', String(accessNote || '').trim().slice(0, 500) || null, q.admin.id, Date.now(), id);
        log(q, 'enrollment_approved', 'enrollment:' + id);
      } else {
        log(q, 'enrollment_rejected_and_deleted', 'enrollment:' + id);
        db.prepare('DELETE FROM enrollments WHERE id=?').run(id);
        if (e.receipt_file) {
          try {
            fs.rmSync(path.join(RECEIPTS, path.basename(e.receipt_file)), { force: true });
          } catch (error) {
            console.error('Deleted enrollment receipt cleanup failed:', error);
            throw Object.assign(new Error('The enrollment was deleted, but its uploaded receipt could not be removed.'), { code: 500 });
          }
        }
      }
    });
  } catch (e) { return bad(s, e.message, e.code || 500); }
  s.json({ ok: true });
});
r.put('/enrollments/:id/note', (q, s) => {
  db.prepare('UPDATE enrollments SET admin_note=? WHERE id=?').run(String(q.body.note || '').slice(0, 1000), +q.params.id);
  log(q, 'note_saved', 'enrollment:' + q.params.id); s.json({ ok: true });
});

// ---------- settings, messages, audit, uploads ----------
r.get('/settings', (q, s) => {
  const cur = Object.fromEntries(db.prepare('SELECT key,value FROM settings').all().map((x) => [x.key, x.value]));
  s.json(Object.fromEntries(Object.keys(DEFAULT_SETTINGS).map((k) => [k, cur[k] ?? ''])));
});
r.put('/settings', (q, s) => {
  const up = db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  tx(() => { for (const k of Object.keys(DEFAULT_SETTINGS)) if (typeof q.body[k] === 'string') up.run(k, q.body[k].trim().slice(0, 2000)); });
  log(q, 'settings_updated'); s.json({ ok: true });
});
r.get('/messages', (q, s) => s.json(db.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT 200').all()));
r.put('/messages/:id/read', (q, s) => { db.prepare('UPDATE messages SET read=1 WHERE id=?').run(+q.params.id); log(q, 'message_marked_read', 'message:' + q.params.id); s.json({ ok: true }); });
r.delete('/messages/:id', (q, s) => { db.prepare('DELETE FROM messages WHERE id=?').run(+q.params.id); log(q, 'message_deleted'); s.json({ ok: true }); });
r.get('/audit', (q, s) => s.json(db.prepare('SELECT email,action,entity,detail,ip,created_at FROM audit ORDER BY id DESC LIMIT 200').all()));

const img = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1 } });
r.post('/upload', (q, s) => img.single('file')(q, s, (e) => {
  if (e || !q.file) return bad(s, 'Upload failed (max 2 MB).');
  const ext = sniff(q.file.buffer);
  if (!ext || ext === 'pdf') return bad(s, 'Use a JPEG, PNG, or WebP image.');
  const name = crypto.randomBytes(12).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(MEDIA, name), q.file.buffer); log(q, 'image_uploaded', null, name);
  s.json({ url: '/media/' + name });
}));

export default r;
