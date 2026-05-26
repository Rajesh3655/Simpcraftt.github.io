process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.PORT = process.env.PORT || '3000';

try {
  await import('./build/server/index.js');
} catch (err) {
  console.error('SSR STARTUP ERROR');
  console.error(err);
  process.exit(1);
}
