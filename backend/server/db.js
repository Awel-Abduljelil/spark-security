import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = path.resolve(ROOT, process.env.DATA_DIR || 'data');
export const RECEIPTS = path.join(DATA, 'receipts'); // private: never served statically
export const MEDIA = path.join(ROOT, 'public', 'media'); // public images (covers, mentor photos)
fs.mkdirSync(RECEIPTS, { recursive: true });
fs.mkdirSync(MEDIA, { recursive: true });

export const db = new DatabaseSync(path.join(DATA, 'spark.db'));
db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
const NOW = "(strftime('%s','now')*1000)";
db.exec(`
CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, pass_hash TEXT NOT NULL, totp_secret TEXT, totp_on INTEGER DEFAULT 0, created_at INTEGER DEFAULT ${NOW});
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL, ip TEXT, created_at INTEGER);
CREATE TABLE IF NOT EXISTS courses(id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, short TEXT, description TEXT, level TEXT DEFAULT 'Beginner', duration TEXT, format TEXT, instructor TEXT, schedule TEXT, cover TEXT,
  price INTEGER NOT NULL DEFAULT 0, discount INTEGER, seats INTEGER, deadline TEXT, enrollment_open INTEGER DEFAULT 1, status TEXT DEFAULT 'draft',
  objectives TEXT DEFAULT '[]', topics TEXT DEFAULT '[]', prereqs TEXT DEFAULT '[]', audience TEXT DEFAULT '[]', sort INTEGER DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0, labs INTEGER NOT NULL DEFAULT 0, tag TEXT, skills TEXT DEFAULT '[]', content_json TEXT DEFAULT '{}', language TEXT NOT NULL DEFAULT 'en' CHECK(language IN ('en','om','am')), cohorts_per_year INTEGER,
  created_at INTEGER DEFAULT ${NOW}, updated_at INTEGER DEFAULT ${NOW});
CREATE TABLE IF NOT EXISTS mentors(id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT, bio TEXT, specialties TEXT DEFAULT '[]', achievements TEXT DEFAULT '[]', photo TEXT, linkedin TEXT, github TEXT, published INTEGER DEFAULT 0, sort INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS faqs(id INTEGER PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, published INTEGER DEFAULT 1, sort INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS payment_methods(id INTEGER PRIMARY KEY, type TEXT NOT NULL, holder TEXT, number TEXT, bank TEXT, notes TEXT, active INTEGER DEFAULT 1, sort INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS app_migrations(name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS cohorts(id INTEGER PRIMARY KEY, course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  label TEXT, start_date TEXT, total_seats INTEGER NOT NULL DEFAULT 0, price_etb INTEGER, schedule TEXT, is_open INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER DEFAULT ${NOW}, updated_at INTEGER DEFAULT ${NOW});
CREATE TABLE IF NOT EXISTS enrollments(id INTEGER PRIMARY KEY, ref TEXT UNIQUE NOT NULL, course_id INTEGER NOT NULL REFERENCES courses(id),
  cohort_id INTEGER REFERENCES cohorts(id), full_name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', username TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL, telegram TEXT NOT NULL, amount INTEGER NOT NULL,
  receipt_type TEXT NOT NULL, receipt_file TEXT, receipt_link TEXT, status TEXT NOT NULL DEFAULT 'pending',
  reject_reason TEXT, admin_note TEXT, access_note TEXT, decided_by INTEGER, decided_at INTEGER, telegram_invited INTEGER NOT NULL DEFAULT 0,
  created_by_admin INTEGER NOT NULL DEFAULT 0, ip TEXT, created_at INTEGER DEFAULT ${NOW});
CREATE INDEX IF NOT EXISTS enr_status ON enrollments(status, created_at);
CREATE INDEX IF NOT EXISTS enr_course ON enrollments(course_id, phone);
CREATE INDEX IF NOT EXISTS cohort_course ON cohorts(course_id, start_date, id);
CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY, name TEXT, email TEXT, body TEXT, read INTEGER DEFAULT 0, created_at INTEGER DEFAULT ${NOW});
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, admin_id INTEGER, email TEXT, action TEXT NOT NULL, entity TEXT, detail TEXT, ip TEXT, created_at INTEGER DEFAULT ${NOW});
`);

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((entry) => entry.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

for (const [column, definition] of [
  ['sessions', 'INTEGER NOT NULL DEFAULT 0'],
  ['labs', 'INTEGER NOT NULL DEFAULT 0'],
  ['tag', 'TEXT'],
  ['skills', "TEXT DEFAULT '[]'"],
  ['content_json', "TEXT DEFAULT '{}'"],
  ['language', "TEXT NOT NULL DEFAULT 'en' CHECK(language IN ('en','om','am'))"],
  ['cohorts_per_year', 'INTEGER'],
]) ensureColumn('courses', column, definition);

if (!db.prepare("SELECT 1 FROM app_migrations WHERE name='course_language_v1'").get()) {
  db.exec("UPDATE courses SET language='en'");
  db.prepare('INSERT INTO app_migrations(name,applied_at) VALUES(?,?)')
    .run('course_language_v1', Date.now());
}

db.exec(`
DROP TRIGGER IF EXISTS courses_language_insert;
CREATE TRIGGER courses_language_insert
BEFORE INSERT ON courses
WHEN NEW.language IS NOT NULL AND NEW.language NOT IN ('en','om','am')
BEGIN SELECT RAISE(ABORT, 'Invalid course language'); END;
CREATE TRIGGER IF NOT EXISTS courses_language_default
AFTER INSERT ON courses
WHEN NEW.language IS NULL
BEGIN UPDATE courses SET language='en' WHERE id=NEW.id; END;
CREATE TRIGGER IF NOT EXISTS courses_language_update
BEFORE UPDATE OF language ON courses
WHEN NEW.language IS NULL OR NEW.language NOT IN ('en','om','am')
BEGIN SELECT RAISE(ABORT, 'Invalid course language'); END;
`);

for (const [column, definition] of [
  ['email', "TEXT NOT NULL DEFAULT ''"],
  ['cohort_id', 'INTEGER REFERENCES cohorts(id)'],
  ['telegram_invited', 'INTEGER NOT NULL DEFAULT 0'],
  ['created_by_admin', 'INTEGER NOT NULL DEFAULT 0'],
]) ensureColumn('enrollments', column, definition);

export function ensureInitialCohorts() {
  if (db.prepare("SELECT 1 FROM app_migrations WHERE name='course_cohorts_v1'").get()) return;
  const addInitialCohort = db.prepare(`INSERT INTO cohorts(course_id,total_seats,price_etb,schedule,is_open)
    VALUES(?,?,?,?,?)`);
  for (const course of db.prepare(`SELECT c.* FROM courses c
    WHERE NOT EXISTS (SELECT 1 FROM cohorts h WHERE h.course_id=c.id)`).all()) {
    const price = course.discount != null && course.discount > 0 && course.discount < course.price
      ? course.discount
      : course.price;
    addInitialCohort.run(course.id, course.seats ?? 0, price, course.schedule ?? null, course.enrollment_open ? 1 : 0);
  }
  db.exec(`UPDATE enrollments SET cohort_id=(SELECT id FROM cohorts WHERE cohorts.course_id=enrollments.course_id ORDER BY id LIMIT 1)
    WHERE cohort_id IS NULL`);
  db.prepare('INSERT INTO app_migrations(name,applied_at) VALUES(?,?)').run('course_cohorts_v1', Date.now());
}

export function tx(fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; }
}
