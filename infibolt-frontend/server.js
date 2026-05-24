process.env.NODE_ENV = 'production';
process.env.HOST = '0.0.0.0';
process.env.PORT = process.env.PORT || '3000';

console.log('Starting Infibolt SSR server...');

try {
  await import('./build/server/index.js');
  console.log('SSR server loaded successfully');
} catch (err) {
  console.error('SSR STARTUP ERROR');
  console.error(err);
  process.exit(1);
}