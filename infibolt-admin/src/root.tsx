import { useEffect } from 'react';
import { Links, Meta, Scripts, ScrollRestoration, useNavigate, useOutlet } from 'react-router';
import { Toaster } from 'sonner';
import { initializeMonitoring } from './config/monitoring';
import { useAdminStore } from './store/appStore';
import globalStylesHref from './styles/global.css?url';

initializeMonitoring();

export const meta = () => [
  { title: 'INFIBOLT Admin OS' },
  { name: 'description', content: 'Protected INFIBOLT operations console for products, care, warranty, media, and analytics.' },
  { name: 'robots', content: 'noindex,nofollow' },
  { name: 'theme-color', content: '#090A0D' },
];

export const links = () => [
  { rel: 'stylesheet', href: globalStylesHref },
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
  const expireSession = useAdminStore((state) => state.expireSession);

  useEffect(() => {
    const onSessionExpired = () => expireSession();
    window.addEventListener('infibolt-admin-session-expired', onSessionExpired);
    return () => window.removeEventListener('infibolt-admin-session-expired', onSessionExpired);
  }, [expireSession]);

  return (
    <>
      {outlet}
      <SessionExpiredOverlay />
      <Toaster richColors position="top-right" />
    </>
  );
}

function SessionExpiredOverlay() {
  const navigate = useNavigate();
  const auth = useAdminStore((state) => state.auth);
  const clearLocalSession = useAdminStore((state) => state.clearLocalSession);
  const visible = auth.status === 'session-expired';

  if (!visible) return null;

  const goToLogin = () => {
    clearLocalSession();
    navigate('/auth/login', { replace: true });
  };

  const exitAdmin = () => {
    clearLocalSession();
    window.location.assign('http://localhost:3000/');
  };

  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="session-expired-title" className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950/72 px-5 backdrop-blur-xl">
      <div className="w-full max-w-md rounded-[1.35rem] border border-white/16 bg-white p-6 text-slate-950 shadow-[0_34px_110px_rgba(0,0,0,0.34)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-600">Secure session ended</p>
        <h1 id="session-expired-title" className="mt-4 text-2xl font-semibold tracking-tight">Admin session timed out</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          For security, this admin workspace is locked. Please login again to continue, or exit the admin panel.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={goToLogin} className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-950 px-5 text-xs font-bold uppercase tracking-[0.16em] text-white">
            Login again
          </button>
          <button type="button" onClick={exitAdmin} className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-900/12 bg-white px-5 text-xs font-bold uppercase tracking-[0.16em] text-slate-800">
            Exit admin
          </button>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">This warning cannot be closed without leaving the expired session.</p>
      </div>
    </div>
  );
}
