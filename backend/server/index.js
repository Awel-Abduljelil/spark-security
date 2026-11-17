import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './db.js';
import { seed } from './seed.js';
import pub from './public.js';
import admin from './admin.js';
import appPublic from './appPublic.js';
import appAdmin from './appAdmin.js';

seed();
export const app = express();
const frontendDist = path.resolve(ROOT, '../frontend/dist');
const frontendBuilt = fs.existsSync(path.join(frontendDist, 'index.html'));
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '1');
app.use((q, s, n) => {
  s.set({
    'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  });
  n();
});
app.use(express.json({ limit: '100kb' }));
app.use('/api/app/admin', appAdmin);
app.use('/api/app', appPublic);
app.use('/api/admin', admin);
app.use('/api', pub);
app.use('/api', (q, s) => s.status(404).json({ error: 'Not found' }));
app.use('/media', express.static(path.join(ROOT, 'public', 'media')));
const adminPath = process.env.ADMIN_PATH || 'admin';
if (process.env.ADMIN_PATH && !/^[A-Za-z0-9_-]{32}$/.test(adminPath)) {
  throw new Error('ADMIN_PATH must be exactly 32 URL-safe characters.');
}
app.use('/legacy-admin', (q, s) => s.redirect(302, `/${adminPath}/settings/website`));
app.use(express.static(frontendBuilt ? frontendDist : path.join(ROOT, 'public'), { extensions: ['html'], index: 'index.html' }));
if (frontendBuilt) {
  app.get(/^(?!\/api\/).*/, (q, s) => s.sendFile(path.join(frontendDist, 'index.html')));
}
app.use((e, q, s, n) => { console.error(e); s.status(e.status && e.status < 500 ? e.status : 500).json({ error: e.status && e.status < 500 ? e.message : 'Server error' }); });

const port = +process.env.PORT || 3000;
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) app.listen(port, () => console.log(`Spark Security running on http://localhost:${port}`));
