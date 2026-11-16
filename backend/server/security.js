import crypto from 'node:crypto';
import { db } from './db.js';

// ---- passwords (scrypt) ----
export const hash = (pw) => { const s = crypto.randomBytes(16).toString('hex'); return `s1$${s}$${crypto.scryptSync(pw, s, 64).toString('hex')}`; };
export const verify = (pw, st) => {
  const [, s, h] = String(st).split('$'); if (!s || !h) return false;
  const a = Buffer.from(h, 'hex'), b = crypto.scryptSync(String(pw), s, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
export const DUMMY = hash(crypto.randomBytes(8).toString('hex')); // equalises timing for unknown emails
export const pwOk = (pw) => typeof pw === 'string' && pw.length >= 10 && pw.length <= 200 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw);

// ---- sessions ----
const sha = (t) => crypto.createHash('sha256').update(t).digest('hex');
const TTL = 8 * 3600e3;
const secure = () => process.env.NODE_ENV === 'production';
function cookie(req, name) {
  const m = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? m.slice(name.length + 1) : null;
}
export function startSession(res, adminId, ip) {
  const t = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions VALUES(?,?,?,?,?)').run(sha(t), adminId, Date.now() + TTL, ip || '', Date.now());
  res.setHeader('Set-Cookie', `sid=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${TTL / 1000}${secure() ? '; Secure' : ''}`);
}
export function endSession(req, res) {
  const t = cookie(req, 'sid'); if (t) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sha(t));
  res.setHeader('Set-Cookie', `sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure() ? '; Secure' : ''}`);
}
export const dropOtherSessions = (adminId, req) =>
  db.prepare('DELETE FROM sessions WHERE admin_id=? AND token_hash<>?').run(adminId, sha(cookie(req, 'sid') || ''));
export function requireAdmin(req, res, next) {
  const t = cookie(req, 'sid');
  const row = t && db.prepare('SELECT a.id,a.email,a.totp_on FROM sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires_at>?').get(sha(t), Date.now());
  if (!row) return res.status(401).json({ error: 'Not signed in' });
  req.admin = row; next();
}
// CSRF: SameSite=Strict cookie + required custom header on every state-changing request.
export function csrf(req, res, next) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('X-Requested-With') !== 'spark')
    return res.status(403).json({ error: 'Forbidden' });
  next();
}

// ---- rate limiting (in-memory; fine for a single instance) ----
export function limiter(max, windowMs, key = (q) => q.ip, message = 'Too many attempts. Please try again later.') {
  const hits = new Map();
  return (req, res, next) => {
    const k = key(req), now = Date.now();
    const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) return res.status(429).json({ error: message });
    arr.push(now); hits.set(k, arr);
    if (hits.size > 5000) for (const [kk, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(kk);
    next();
  };
}

// ---- TOTP (RFC 6238) ----
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const newSecret = () => { let bits = ''; for (const x of crypto.randomBytes(20)) bits += x.toString(2).padStart(8, '0'); let o = ''; for (let i = 0; i < bits.length; i += 5) o += B32[parseInt(bits.slice(i, i + 5), 2)]; return o; };
const unb32 = (s) => { let bits = ''; for (const c of s) bits += B32.indexOf(c).toString(2).padStart(5, '0'); const o = []; for (let i = 0; i + 8 <= bits.length; i += 8) o.push(parseInt(bits.slice(i, i + 8), 2)); return Buffer.from(o); };
const hotp = (k, c) => { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(c)); const h = crypto.createHmac('sha1', unb32(k)).update(b).digest(); const o = h[19] & 15; return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, '0'); };
export const totpOk = (k, code) => { const c = Math.floor(Date.now() / 30000); return [-1, 0, 1].some((d) => hotp(k, c + d) === String(code || '').trim()); };

// ---- input helpers ----
export function normPhone(p) {
  const s = String(p || '').replace(/[\s()-]/g, '');
  if (/^0[79]\d{8}$/.test(s)) return '+251' + s.slice(1);
  return /^\+\d{9,15}$/.test(s) ? s : null;
}
export function sniff(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return 'webp';
  if (buf.subarray(0, 4).toString() === '%PDF') return 'pdf';
  return null;
}
export const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf' };
export const parseJ = (s) => { try { return JSON.parse(s || '[]'); } catch { return []; } };
