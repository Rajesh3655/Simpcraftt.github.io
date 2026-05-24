# Hostinger Deployment

Use these settings for `app.infibolt.com` in Hostinger Node.js hosting.

## App Settings

- Domain: `app.infibolt.com`
- Framework: `React Router`
- Runtime: Node.js `22` or newer
- Package manager: `npm`
- Build command: `npm run build`
- Entry file: `build/server/index.js`
- Output directory: `./`
- Port: `3000` if Hostinger asks for one

If Hostinger shows a start command field, use `npm start`.

## Environment Variables

Set these in Hostinger's Node.js app environment variable panel:

```txt
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
AUTH_URL=https://app.infibolt.com
CORS_ORIGINS=https://app.infibolt.com,https://infibolt.com
AUTH_SECRET=<generate-a-long-random-secret>
```

If Hostinger provides its own `PORT`, use Hostinger's value instead of `3000`.

## Deploy Flow

1. Upload or connect this repository to Hostinger.
2. Make sure Hostinger runs `npm run build`.
3. Make sure the output directory is `./`, not `build/client`.
4. Make sure the entry file is `build/server/index.js`.
5. Make sure the start command is `npm start` if Hostinger asks for it.
6. Restart the Node.js app after changing environment variables.
7. Open `https://app.infibolt.com`.

`npm run build` creates `build/client` and `build/server`. The compiled Hono/React Router SSR server is `build/server/index.js`; it already starts the HTTP server and serves `build/client` assets.
