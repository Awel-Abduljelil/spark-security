# Spark Security

This is the retained legacy Node.js + SQLite backend. Production migration to PHP + MySQL, including export/import instructions, is documented in [the PHP deployment guide](../php/README.md). Keep this backend and its database intact until the PHP deployment and data import have been verified.

Cybersecurity training and enrollment website with a secure admin dashboard.
React + Vite frontend with Node.js + Express + SQLite (built-in `node:sqlite`) backend; no student accounts.

## Legacy Node quick start

Requires **Node.js 22.13 or newer**.

Install and start both apps from the workspace root:

```bash
cd backend
npm ci
cp .env.example .env      # optional: set ADMIN_EMAIL / ADMIN_PASSWORD
npm start                 # API at http://localhost:3000
```

In another terminal:

```bash
cd frontend
npm ci
# Set VITE_ADMIN_PATH to the same 32-character URL-safe value as backend ADMIN_PATH.
npm run dev               # React app at http://localhost:5173
```

- Vite proxies `/api` and `/media` to the backend.
- Set the same 32-character URL-safe value for `ADMIN_PATH` in `backend/.env` and `VITE_ADMIN_PATH` in `frontend/.env` to move the admin UI from `/admin` to a less discoverable URL. Rebuild the frontend after changing `VITE_ADMIN_PATH`. This obscures the UI URL but does not secure it; login, rate limiting, and two-factor authentication remain necessary.
- Build the frontend with `cd frontend && npm run build`; when `frontend/dist` exists, Express serves the React site and admin routes at `http://localhost:3000`.
- On first backend run an admin is created. If `ADMIN_PASSWORD` is empty, a random password is printed once in the terminal.
- React admin sign-in uses the configured admin email and password; enter a TOTP code when two-factor authentication is enabled.
- Two draft sample courses are seeded. In Admin, publish a course and create/open a cohort before accepting enrollments.
- Set each course's teaching language in Admin > Courses. Public course lists accept `?lang=en|om|am`; English shows all courses, while Afaan Oromoo and Amharic each show courses in that language plus English.

Run backend tests with `cd backend && npm test` and frontend tests with `cd frontend && npm test`.

## What is included

**Public site:** landing page, dynamic course list and detail pages, enrollment form and status lookup, payment instructions, receipt upload or link, pending confirmation with a reference number, mentors, FAQ, and contact form.

Students with a pending or approved registration cannot submit another registration using the same email address or Telegram username, even for another course. The browser caches the latest reference and status for 24 hours; phone and contact details are not cached. Duplicate attempts direct students to wait up to 24 hours or contact `@Awexaa` on Telegram.

**Payment:** manual bank transfer or mobile money. The student uploads a receipt (JPEG, PNG, WebP, or PDF up to 5 MB) or pastes an https link. An admin reviews it and approves or rejects.

**Admin:** The configured admin URL manages enrollments (search, filter, pagination, private receipt viewer, approve, reject, notes, bulk verify, CSV export), courses, cohorts, website content, payment methods, mentors, FAQs, contact messages, security (password change, TOTP 2FA), and audit log. Without `ADMIN_PATH` / `VITE_ADMIN_PATH`, the URL remains `/admin`. The former `/legacy-admin/` URL redirects to the merged Management screen.

Existing course capacity, effective price, and schedule are migrated into an initial cohort at startup. A cohort capacity of `0` means unlimited. Existing enrollment records are associated with that cohort; unknown start dates remain unset.

## Security notes

- Passwords hashed with scrypt; sessions are random tokens stored hashed, HttpOnly + SameSite=Strict cookies (Secure when `NODE_ENV=production`), 8 hour expiry.
- State-changing admin calls require an `X-Requested-With` header (CSRF defense on top of SameSite).
- Login rate limiting per IP and per email; generic failure message; optional TOTP 2FA.
- Changing the password signs out all other sessions.
- Receipts live in `data/receipts` (never under `public/`), random file names, content checked by file signature, served only to signed-in admins.
- Prices are read from the database on the server; the amount is snapshotted on each enrollment.
- Security headers and a strict Content-Security-Policy are set on every response.

## Production deployment

Do not use the legacy Node deployment steps for the migrated production site. Use the [PHP + MySQL Plesk guide](../php/README.md). The legacy backend remains available for local regression tests and one-time SQLite data export only.

## Manual configuration still needed

- Replace the placeholder bank and mobile money details (`/admin` > Management > Payment methods).
- Fill in contact email, phone, and social links (`/admin` > Management > Website content).
- Manage real mentor profiles (`/admin` > Management > Mentors): publish/unpublish, edit profiles and achievements, set their display order, and upload JPEG, PNG, or WebP photos up to 2 MB. Unpublished profiles are not returned publicly.
- In React Admin > Courses, set a course cover and lead instructor photo by URL or upload. Uploaded JPEG, PNG, and WebP files are limited to 2 MB; the cover is displayed in a split hero and the instructor photo appears with the instructor details.
- Privacy Policy and Terms pages are not included; the consent checkbox is.
- Rejection permanently deletes the enrollment and its uploaded receipt after admin confirmation. Rejected enrollments cannot be restored.
- Verified students see the invite link or instructions set by the admin in the enrollment status lookup. Telegram cannot add a student by username alone; direct bot invitations require additional bot setup.
- Email or Telegram notifications are not configured.
