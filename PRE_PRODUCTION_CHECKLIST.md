# Infibolt Final Pre-Production Checklist

Status date: 2026-05-24

## Local Validation

- Run `npm run preprod:check` from the repository root.
- Confirm customer and admin builds pass after production env files are present.
- Confirm backend health at `http://localhost:4000/api/v1/health`.
- Confirm customer app at `http://localhost:3000`.
- Confirm admin app at `http://localhost:3001`.
- Confirm `npm audit --workspaces` reports zero known vulnerabilities.
- Spot-check mobile, tablet, desktop, and ultrawide viewports for header, footer, forms, OTP inputs, admin drawer, tables, and product media.

## Local Upload Storage

- Set `UPLOAD_PROVIDER=local` in backend production.
- Set `UPLOAD_BASE_PATH=uploads`.
- Confirm Hostinger Node.js app can write to `infibolt-backend/uploads`.
- Keep `uploads/products`, `uploads/warranty`, `uploads/support`, and `uploads/temp` persistent between deployments.
- Store only relative URLs such as `/uploads/products/file.webp` in database records.

## Hostinger Domains

- Backend: `api.infibolt.com`
- Customer frontend: `app.infibolt.com`
- Admin: `admin.infibolt.com`

## Production Environment

- Replace all `replace-with-*` values before deployment.
- Use MongoDB Atlas production connection string.
- Set `NODE_ENV=production`.
- Set strict `CORS_ORIGINS` only to production domains.
- Set `VITE_API_URL=https://api.infibolt.com/api/v1`.
- Set `VITE_UPLOAD_URL=https://api.infibolt.com/uploads`.
- Set `OTP_PROVIDER=local` for launch, then switch to `OTP_PROVIDER=msg91` after provider credentials are added.
- Keep OTP values server-side only; local OTPs are printed only in backend logs during development.
- Set `SENTRY_DSN` and `VITE_SENTRY_DSN` when Sentry projects are created.
- Production backend startup now fails fast if HTTPS origins, MongoDB URI, JWT secrets, cookie secret, or admin seed password are left as placeholders.

## Security Launch Gate

- No localhost references in production env files.
- No demo passwords in production secrets.
- HTTPS enabled for all domains.
- Cookies are Secure and SameSite=None in production.
- CSRF endpoint and unsafe method checks verified.
- Admin APIs require `admin` or `super-admin`.
- OTP resend cooldown, one-time consumption, expiry, and failed-attempt lockout verified.
- Upload MIME, extension, and size validation verified.
- Rate limits enabled.
- Production upload responses use relative paths plus API-origin full URLs.
- Protected upload assets are served with nosniff, sandboxed CSP, cross-origin resource policy, and production cache headers.

## Performance Launch Gate

- Client env variables are exposed through `VITE_` in both frontend and admin bundles.
- Mobile form controls use 16px input sizing to prevent iOS zoom jumps.
- Touch targets use manipulation hints to reduce mobile tap delay.
- Reduced-motion users receive non-animated shared reveal sections.
- Image containers have stable aspect ratios, lazy decoding, and critical hero images use eager loading.
- Admin tables remain horizontally scrollable inside their panels on narrow screens.

## Monitoring

- Sentry backend DSN configured.
- Sentry frontend/admin DSNs configured.
- Hostinger uptime monitor configured for `/api/v1/health`.
- Failed login and admin actions visible in `AuditLog`.

## Deployment Order

1. Deploy backend to `api.infibolt.com`.
2. Verify health, CORS, cookies, CSRF, and local uploads.
3. Deploy customer frontend to `app.infibolt.com`.
4. Deploy admin dashboard to `admin.infibolt.com`.
5. Run customer/admin smoke tests against production API.
