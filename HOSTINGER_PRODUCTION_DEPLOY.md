# Infibolt Hostinger Production Deployment

Final domain map:

- `https://infibolt.com` -> customer frontend
- `https://api.infibolt.com` -> backend API and protected uploads
- `https://admin.infibolt.com` -> Admin OS

## 1. Build And Verify Before Upload

Run from repository root:

```bash
npm install
npm run preprod:check
```

Optional dependency audit:

```bash
npm run preprod:audit
```

## 2. Backend: api.infibolt.com

Hostinger Node.js app:

- App root: `infibolt-backend`
- Entry file: `src/server.js`
- Start command: `npm start`
- Node version: 22+

Use `infibolt-backend/.env.production.example` as the template.

Required production values:

```txt
NODE_ENV=production
API_ORIGIN=https://api.infibolt.com
FRONTEND_ORIGIN=https://infibolt.com
ADMIN_ORIGIN=https://admin.infibolt.com
CORS_ORIGINS=https://infibolt.com,https://www.infibolt.com,https://admin.infibolt.com
MONGODB_URI=<MongoDB Atlas app user connection string>
MONGODB_DB=infibolt_prod
UPLOAD_PROVIDER=local
UPLOAD_BASE_PATH=/home/USER/domains/api.infibolt.com/infibolt-backend/uploads
ALLOW_PRODUCTION_SEED=false
```

Generate unique 64+ character values for:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `COOKIE_SECRET`

Persistent upload folders must exist and be writable:

- `uploads/products`
- `uploads/policies`
- `uploads/warranty`
- `uploads/rma`
- `uploads/support`
- `uploads/temp`

Protected upload behavior:

- Product and policy files can be served publicly.
- Warranty, RMA, and support files require authenticated customer/admin cookies.
- API and sensitive uploads return `X-Robots-Tag: noindex, nofollow, noarchive`.
- Temp uploads are cleaned hourly and should not be used as permanent records.

Health checks:

- `https://api.infibolt.com/health`
- `https://api.infibolt.com/api/v1/health`
- `https://api.infibolt.com/api/v1/csrf-token`

## 3. Customer Frontend: infibolt.com

Hostinger Node.js app:

- App root: `infibolt-frontend`
- Build command: `npm run build`
- Entry file: `server.js`
- Start command: `npm start`
- Node version: 22+

Use `infibolt-frontend/.env.production.example`.

```txt
NODE_ENV=production
AUTH_URL=https://infibolt.com
VITE_API_URL=https://api.infibolt.com/api/v1
VITE_UPLOAD_URL=https://api.infibolt.com/uploads
VITE_USE_MOCK_API=false
```

Indexing:

- Public pages are in `public/sitemap.xml`.
- Private pages such as profile, warranty, support, auth, cart, and checkout are blocked in `public/robots.txt` and marked `noindex` in app metadata.

## 4. Admin OS: admin.infibolt.com

Hostinger Node.js app:

- App root: `infibolt-admin`
- Build command: `npm run build`
- Entry file: `server.js`
- Start command: `npm start`
- Node version: 22+

Use `infibolt-admin/.env.production.example`.

```txt
NODE_ENV=production
AUTH_URL=https://admin.infibolt.com
VITE_API_URL=https://api.infibolt.com/api/v1
VITE_UPLOAD_URL=https://api.infibolt.com/uploads
VITE_USE_MOCK_API=false
```

Admin indexing:

- `infibolt-admin/public/robots.txt` disallows everything.
- Root metadata includes `noindex,nofollow`.

## 5. PM2 Alternative

If deploying on VPS or Hostinger with PM2 access:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 6. Production Smoke Tests

Backend:

- Health route responds.
- CSRF token route responds.
- CORS allows only `infibolt.com`, `www.infibolt.com`, and `admin.infibolt.com`.
- Product upload works for admin.
- Warranty/support files are not available without auth.

Frontend:

- Homepage, products, product detail, collections, warranty policy, FAQ, and contact load.
- Product images resolve from `https://api.infibolt.com/uploads`.
- Newsletter subscribe saves once and handles duplicate emails.
- Notify Me stores a lead per product/contact.

Admin:

- Admin login works.
- Product, category, collection, warranty, support, newsletter, lead, export, and audit sections open.
- CSV export downloads.
- Warranty policy PDF upload works.

## 7. Backup And Restore

Daily:

- MongoDB Atlas automated backup.
- Hostinger file backup of `infibolt-backend/uploads`.

Before each release:

- Export MongoDB snapshot.
- Archive `uploads`.
- Record deployed git commit.

Restore order:

1. Restore MongoDB.
2. Restore `uploads`.
3. Deploy backend.
4. Deploy frontend and admin.
5. Run smoke tests.
