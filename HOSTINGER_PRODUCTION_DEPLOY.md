# Hostinger Production Deployment

## 1. Backend: api.infibolt.com

Hostinger Node.js app:

- App root: `infibolt-backend`
- Entry file: `src/server.js`
- Start command: `npm start`
- Node version: 22+

Environment variables:

```txt
NODE_ENV=production
HOST=0.0.0.0
PORT=<Hostinger-provided-port>
API_ORIGIN=https://api.infibolt.com
FRONTEND_ORIGIN=https://app.infibolt.com
ADMIN_ORIGIN=https://admin.infibolt.com
CORS_ORIGINS=https://app.infibolt.com,https://admin.infibolt.com
MONGODB_URI=<MongoDB Atlas connection string>
MONGODB_DB=infibolt_prod
JWT_ACCESS_SECRET=<64-byte random secret>
JWT_REFRESH_SECRET=<different 64-byte random secret>
COOKIE_SECRET=<different 64-byte random secret>
UPLOAD_PROVIDER=local
UPLOAD_BASE_PATH=uploads
OTP_PROVIDER=local
OTP_TTL_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_REQUESTS_PER_HOUR=5
OTP_MAX_VERIFY_ATTEMPTS=5
SENTRY_DSN=<optional>
```

Verify:

- `https://api.infibolt.com/api/v1/health`
- `https://api.infibolt.com/api/v1/csrf-token`

## 2. Customer Frontend: app.infibolt.com

- App root: `infibolt-frontend`
- Build command: `npm run build`
- Start command: `npm start`
- Entry file: `server.js`

Environment:

```txt
NODE_ENV=production
AUTH_URL=https://app.infibolt.com
AUTH_SECRET=<random secret>
VITE_API_URL=https://api.infibolt.com/api/v1
VITE_USE_MOCK_API=false
VITE_SENTRY_DSN=<optional>
```

## 3. Admin Frontend: admin.infibolt.com

- App root: `infibolt-admin`
- Build command: `npm run build`
- Start command: `npm start`
- Entry file: `server.js`

Environment:

```txt
NODE_ENV=production
AUTH_URL=https://admin.infibolt.com
AUTH_SECRET=<random secret>
VITE_API_URL=https://api.infibolt.com/api/v1
VITE_USE_MOCK_API=false
VITE_SENTRY_DSN=<optional>
```

## Smoke Tests

- Customer login.
- Customer product listing and detail.
- Customer support ticket creation.
- Customer warranty claim and OTP verification.
- Signup OTP, login OTP, and password-reset OTP.
- Admin login.
- Admin product create/update/delete.
- Admin warranty status update.
- Admin support reply.
- Local product, warranty, and support uploads.
