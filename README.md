# spark-security
A growing cybersecurity community, built for what comes next. Learn through practical courses, expert mentorship, and responsible hands-on practice.

## Production deployment

The production backend is Native PHP 8.2+ with MySQL and an unchanged React/Vite frontend. For Plesk shared hosting setup, schema migrations, and the data-preserving SQLite import procedure, see [PHP + MySQL Deployment](php/README.md).

The original Express/SQLite implementation remains in `backend/` as a migration source and regression reference; it is not required on the production host.
