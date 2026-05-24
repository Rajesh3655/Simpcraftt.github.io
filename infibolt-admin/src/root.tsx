import { Links, Meta, Scripts, ScrollRestoration, useOutlet } from 'react-router';
import { Toaster } from 'sonner';
import { initializeMonitoring } from './config/monitoring';
import './styles/global.css';

initializeMonitoring();

export const links = () => [
  { rel: 'manifest', href: '/manifest.webmanifest' },
  { rel: 'icon', href: '/images/favicon-tab.ico' },
  { rel: 'icon', type: 'image/png', href: '/images/favicon-tab.png' },
  { rel: 'apple-touch-icon', href: '/images/apple-touch-icon.png' },
];

// @ts-expect-error Hostinger React Router parser rejects TS annotations here.
export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Satoshi, sans-serif', background: '#f8f7f5', padding: 24 }}>
      <div style={{ maxWidth: 460, textAlign: 'center', border: '1px solid rgba(15,23,42,.1)', borderRadius: 24, background: 'rgba(255,255,255,.75)', padding: 32 }}>
        <h1>Something went wrong</h1>
        <p>Please refresh or return to the previous page.</p>
      </div>
    </div>
  );
}

export default function App() {
  const outlet = useOutlet();
  return (
    <>
      {outlet}
      <Toaster richColors position="top-right" />
    </>
  );
}
