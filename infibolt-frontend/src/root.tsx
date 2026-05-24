import { Links, Meta, Scripts, ScrollRestoration, useOutlet } from 'react-router';
import { Toaster } from 'sonner';
import { initializeMonitoring } from './config/monitoring';
import './styles/global.css';

initializeMonitoring();

const siteUrl = 'https://app.infibolt.com';
const defaultTitle = 'INFIBOLT | Premium Electronics for Focused Living';
const defaultDescription =
  'INFIBOLT builds premium electronics for focused work, cinematic sound, and long-term ownership care.';

export const meta = () => [
  { title: defaultTitle },
  { name: 'description', content: defaultDescription },
  { name: 'theme-color', content: '#f7f5f0' },
  { name: 'robots', content: 'index,follow,max-image-preview:large' },
  { property: 'og:site_name', content: 'INFIBOLT' },
  { property: 'og:title', content: defaultTitle },
  { property: 'og:description', content: defaultDescription },
  { property: 'og:type', content: 'website' },
  { property: 'og:url', content: siteUrl },
  { property: 'og:image', content: `${siteUrl}/images/Litemood-hero.png` },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: defaultTitle },
  { name: 'twitter:description', content: defaultDescription },
  { name: 'twitter:image', content: `${siteUrl}/images/Litemood-hero.png` },
];

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
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'INFIBOLT',
              url: siteUrl,
              logo: `${siteUrl}/images/apple-touch-icon.png`,
              sameAs: ['https://www.infibolt.com'],
            }),
          }}
        />
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3600,
          className: "premium-toast",
        }}
      />
    </>
  );
}

