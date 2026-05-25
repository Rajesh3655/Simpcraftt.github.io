# Infibolt Security Audit And Hardening Report

Date: 2026-05-24

Scope:
- `infibolt-frontend`
- `infibolt-admin`
- `infibolt-backend`
- Local API: `http://localhost:4000/api/v1`
- Production targets: `infibolt.com`, `admin.infibolt.com`, `api.infibolt.com`

## Executive Summary

Infibolt has been hardened from a mock-token local stack into a production-oriented architecture with isolated customer/admin apps and an Express/Mongoose API boundary. The highest-risk issue fixed was JavaScript-readable auth tokens in the frontend. Authentication now uses signed HTTP-only cookies, CSRF protection, refresh token rotation, RBAC middleware, password hashing, account lockout, route validation, strict CORS, security headers, upload controls, and audit logging.

Current security score: 8.4 / 10

Remaining production work before public launch:
- Replace all local `.env` secrets with generated production secrets.
- Configure CAPTCHA provider keys and verify CAPTCHA server-side for auth/contact/support endpoints.
- Add malware scanning or moderation if uploads become public or high-volume.
- Configure production monitoring/SIEM/error tracking.
- Create least-privilege MongoDB Atlas user and restrict database network access.

## Findings Fixed

Critical:
- Removed frontend/admin `localStorage` bearer-token storage.
- Replaced mock JWT flow with signed HTTP-only cookie sessions.
- Added refresh-token hashing and rotation on refresh/login.
- Added admin/customer RBAC separation and protected admin APIs.

High:
- Added CSRF token issuance and header validation for unsafe methods.
- Added Helmet security headers and strict CORS allowlist.
- Added bcrypt password hashing and seeded local credentials.
- Added account lockout after repeated failed logins.
- Added centralized request validation with `express-validator`.
- Added NoSQL/prototype pollution payload sanitization.
- Upgraded vulnerable `pdfjs-dist` to remediate the high-severity PDF.js advisory.

Medium:
- Added centralized error handler without production stack disclosure.
- Added rate limiting for global, auth, and upload routes.
- Added secure upload MIME/extension/size validation and path traversal checks.
- Added audit logging for login, logout, admin product edits, support replies, and warranty updates.
- Added `.env.example` templates and hardened `.gitignore` for secret hygiene.

## Security Controls Implemented

Authentication:
- bcrypt password hashing with configurable rounds.
- Access JWT expiration: `15m`.
- Refresh token lifetime: configurable days.
- Refresh tokens are stored only as SHA-256 hashes in MongoDB.
- Signed HTTP-only cookies with `SameSite` and production `Secure` support.
- OTPs are generated with cryptographic randomness, stored only as bcrypt hashes, expire automatically, and are single-use.
- OTP request cooldown, hourly request caps, and failed verification attempt caps are enforced.
- Account lockout after repeated failures.
- Admin and customer role separation.
- Secure logout invalidates the stored refresh hash and clears cookies.

API Security:
- `requireAuth("customer")` and `requireAuth("admin")` middleware.
- Ownership-style filtering for customer support/warranty list endpoints.
- Centralized validation and sanitized payloads.
- Structured error responses with request IDs.
- Global and auth-specific throttling.

Frontend Security:
- Axios now uses `withCredentials`.
- CSRF token is fetched from `/csrf-token` and sent as `X-CSRF-Token`.
- No Authorization bearer token injection from browser storage.
- Protected route checks no longer depend on localStorage.
- Production envs target `https://api.infibolt.com/api/v1`.

Database Security:
- Mongoose schemas use strict mode.
- Sensitive fields are excluded from normal selection and JSON output.
- Password/reset/refresh token fields are hidden.
- Production database must use a least-privilege MongoDB user.

Upload Security:
- Multer local upload middleware with one-file limit.
- Allowed types: PNG, JPEG, WEBP, PDF.
- Extension and MIME checks.
- 5 MB default upload cap.
- Safe filename regex and resolved-path validation.
- Provider-ready local upload API boundary remains isolated behind `/uploads`.

## Production Checklist

- Generate unique `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET`.
- Set `NODE_ENV=production`.
- Set `API_ORIGIN=https://api.infibolt.com`.
- Set `CORS_ORIGINS=https://infibolt.com,https://www.infibolt.com,https://admin.infibolt.com`.
- Enable HTTPS on all domains.
- Confirm cookies are sent only over HTTPS.
- Rotate local seed admin password before launch.
- Disable or protect seed logic for production imports.
- Add CAPTCHA verification to login/signup/contact/support.
- Confirm Hostinger upload folder permissions and backup policy.
- Configure MongoDB Atlas network access and least-privilege credentials.
- Add centralized logging/error monitoring.
- Run `npm audit --workspaces` before each deployment.
- Run frontend/admin builds before each deployment.

## Validation Completed

- Backend syntax checks completed.
- Local API health check passed.
- Customer CSRF + login + protected session check passed.
- Admin CSRF + login + protected overview check passed.
- Product listing, support creation, and warranty creation smoke tests passed.
- `npm audit --workspaces` reports 0 vulnerabilities.
- `npm --workspace infibolt-frontend run typecheck` passed.
- `npm --workspace infibolt-admin run typecheck` passed.
- `npm --workspace infibolt-frontend run build` passed.
- `npm --workspace infibolt-admin run build` passed.
