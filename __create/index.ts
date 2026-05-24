import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import { getHTMLForErrorPage } from './get-html-for-error-page';

const app = new Hono();

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
  const { email } = await c.req.json<{ email?: string }>().catch(() => ({}));

  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  return c.json({ success: true });
});

app.post('/api/leads', async (c) => {
  const { name, email } = await c.req
    .json<{ name?: string; email?: string; message?: string; whatsapp?: string }>()
    .catch(() => ({}));

  if (!name || !email) {
    return c.json({ error: 'Name and email are required' }, 400);
  }

  return c.json({ success: true });
});

export default await createHonoServer({
  app,
  defaultLogger: false,
});
