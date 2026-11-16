import crypto from 'node:crypto';
const B = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function totp(secret) {
  let bits = ''; for (const c of secret) bits += B.indexOf(c).toString(2).padStart(5, '0');
  const key = Buffer.from(bits.match(/.{8}/g).map((x) => parseInt(x, 2)));
  const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = crypto.createHmac('sha1', key).update(b).digest(); const o = h[19] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, '0');
}
