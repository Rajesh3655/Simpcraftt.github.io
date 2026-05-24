# Hostinger Deployment

Use these settings for `app.infibolt.com` in Hostinger Node.js hosting.

## App Settings

- Domain: `app.infibolt.com`
- Runtime: Node.js `20` or newer
- Install command: `npm ci`
- Build command: `npm run build`
- Start command: `npm start`
- Entry file: `app.js`
- Output directory: `./`
- Port: `3000` if Hostinger asks for one

## Environment Variables

Set these in Hostinger's Node.js app environment variable panel:

```txt
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
AUTH_URL=https://app.infibolt.com
CORS_ORIGINS=https://app.infibolt.com,https://infibolt.com
```

If Hostinger provides its own `PORT`, use Hostinger's value instead of `3000`.

## Deploy Flow

1. Upload or connect this repository to Hostinger.
2. Make sure Hostinger runs `npm ci`, then `npm run build`.
3. Make sure the output directory is `./`, not `build`.
4. Make sure the start command is `npm start`.
5. Make sure the entry file is `app.js`.
6. Restart the Node.js app after changing environment variables.
7. Open `https://app.infibolt.com`.

`npm run build` only creates the production files. The app is served only after `npm start` runs `app.js`.
