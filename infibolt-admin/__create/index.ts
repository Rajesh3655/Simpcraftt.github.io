import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import { getHTMLForErrorPage } from './get-html-for-error-page';

const app = new Hono();

const requiredEnv = ['NODE_ENV', 'AUTH_URL'];
const recommendedEnv = ['AUTH_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const missingRecommendedEnv = recommendedEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.log(`[infibolt] Missing environment variables: ${missingEnv.join(', ')}`);
}

if (missingRecommendedEnv.length > 0) {
  console.log(`[infibolt] Missing recommended environment variables: ${missingRecommendedEnv.join(', ')}`);
}

console.log(`[infibolt] Runtime: node ${process.version}`);
console.log(`[infibolt] Host: ${process.env.HOST || '0.0.0.0'}`);
console.log(`[infibolt] Port: ${process.env.PORT || '3000'}`);
console.log(`[infibolt] Auth URL configured: ${process.env.AUTH_URL ? 'yes' : 'no'}`);
console.log(`[infibolt] CORS origins configured: ${process.env.CORS_ORIGINS ? 'yes' : 'no'}`);

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOST || '0.0.0.0';

app.use('*', requestId());

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500
    );
  }

  return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
  app.use(
    '/*',
    cors({
      origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    })
  );
}

for (const method of ['post', 'put', 'patch'] as const) {
  app[method](
    '*',
    bodyLimit({
      maxSize: 4.5 * 1024 * 1024,
      onError: (c) => c.json({ error: 'Body size limit exceeded' }, 413),
    })
  );
}

app.post('/api/newsletter', async (c) => {
  const payload = await c.req.json<{ email?: string }>().catch(() => ({}));
  const email = payload.email;

  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  return c.json({ success: true });
});

app.post('/api/leads', async (c) => {
  const payload = await c.req
    .json<{ name?: string; email?: string; message?: string; whatsapp?: string }>()
    .catch(() => ({}));
  const name = payload.name;
  const email = payload.email;

  if (!name || !email) {
    return c.json({ error: 'Name and email are required' }, 400);
  }

  return c.json({ success: true });
});

export default await createHonoServer({
  app,
  defaultLogger: false,
  hostname,
  port,
});
