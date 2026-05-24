# INFIBOLT Backend

Production-grade API service for `https://api.infibolt.com`.

## Structure

- `src/config` - environment and runtime configuration
- `src/controllers` - request handlers
- `src/middleware` - cross-cutting request middleware
- `src/models` - Mongoose models for users, admins, products, support, warranty, OTP, refresh tokens, and audit logs
- `src/routes` - API route registration
- `src/services` - business and integration services
- `src/uploads` - upload destination for local development
- `src/utils` - shared backend helpers
- `src/validators` - request validation

## Development

```bash
npm install
npm run dev
```

Local URLs:

- API: `http://localhost:4000/api/v1`
- Customer frontend: `http://localhost:3000`
- Admin frontend: `http://localhost:3001`

Seed/reset local development data:

```bash
npm run seed
```

Local credentials:

- Customer: `customer@infibolt.com` / `Customer@12345`
- Admin: `admin@infibolt.com` / `Admin@12345`

## Security

- JWT access tokens are short-lived and stored only in signed HTTP-only cookies.
- Refresh tokens are rotated and stored as hashes in MongoDB.
- Unsafe methods require `X-CSRF-Token` from `/api/v1/csrf-token`.
- Admin APIs require `admin` or `super-admin` RBAC.
- Customer support/warranty reads enforce ownership filtering.
- Uploads are MIME, extension, size, and path validated.

## API Groups

- `/api/v1/auth`
- `/api/v1/products`
- `/api/v1/categories`
- `/api/v1/collections`
- `/api/v1/warranty` and `/api/v1/warranty-claims`
- `/api/v1/support` and `/api/v1/support-tickets`
- `/api/v1/uploads`
- `/api/v1/admin`

Frontend applications should call this backend through `https://api.infibolt.com` in production only.
