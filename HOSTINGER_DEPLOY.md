# Hostinger Deployment Guide (Node.js)

This project is configured to run on Hostinger Node.js hosting.

## 1) Hostinger App Setup

In Hostinger hPanel:

1. Go to `Websites` -> `Manage` -> `Advanced` -> `Node.js`.
2. Create/select your Node app.
3. Use:
   - `Node.js version`: `20.x` (or latest available)
   - `Application root`: folder where this project is uploaded
   - `Startup command`: `npm run start`

## 2) Upload Project Files

Upload the full project into the selected application root using File Manager, Git, or SFTP.

## 3) Environment Variables

Set these in Hostinger Node.js environment variables:

- `NODE_ENV=production`
- `AUTH_URL=https://yourdomain.com`
- `AUTH_SECRET=your-long-random-secret`
- `DATABASE_URL=your-database-connection-string`
- `NEXT_PUBLIC_CREATE_ENV=PRODUCTION`

Optional:

- `CORS_ORIGINS=https://yourdomain.com`

If your auth/social login is enabled, also add related provider keys used by your app.

## 4) Install and Build

Open Hostinger terminal (or SSH), then run in app root:

```bash
npm install
npm run build
```

## 5) Start / Restart

Start or restart the app from Hostinger Node.js panel, or run:

```bash
npm run start
```

## 6) Domain + SSL

1. Ensure your domain points to Hostinger hosting.
2. In Hostinger SSL section, install SSL certificate.
3. Enable force HTTPS.

## 7) Quick Health Checks

If site does not load:

1. Check Node app logs in Hostinger panel.
2. Confirm `npm run build` completed without errors.
3. Confirm `AUTH_URL` exactly matches your live HTTPS domain.
4. Confirm DB/API env variables are present.
5. Restart app after any env change.

## Local Reference Commands

```bash
npm run build
npm run start
```

