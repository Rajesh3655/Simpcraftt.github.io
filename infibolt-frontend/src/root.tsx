import { Links, Meta, Scripts, ScrollRestoration, useOutlet } from 'react-router';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { initializeMonitoring } from './config/monitoring';
import { useAppStore } from './store/appStore';
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  PRIVATE_ROUTE_PATTERN,
  SITE_NAME,
  absoluteUrl,
  canonicalUrl,
  organizationSchema,
  safeJsonLd,
  websiteSchema,
} from './utils/seo';
import './styles/global.css';
import globalStylesheetUrl from './styles/global.css?url';

initializeMonitoring();

let hasHydratedCustomerSession = false;

const defaultTitle = 'INFIBOLT | Premium Electronics for Focused Living';
const defaultDescription =
  'INFIBOLT builds premium electronics for focused work, cinematic sound, and long-term ownership care.';

export const meta = (args = {}) => {
  const location = Reflect.get(args, 'location') || {};
  const pathname = Reflect.get(location, 'pathname') || '/';
  const privatePath = PRIVATE_ROUTE_PATTERN.test(pathname);
  const canonical = canonicalUrl(pathname);
  const ogImage = absoluteUrl(DEFAULT_OG_IMAGE);
  return [
    { title: defaultTitle },
    { name: 'description', content: defaultDescription },
    { name: 'theme-color', content: '#f7f5f0' },
    { name: 'robots', content: privatePath ? 'noindex,nofollow' : 'index,follow,max-image-preview:large' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: defaultTitle },
    { property: 'og:description', content: defaultDescription },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: DEFAULT_OG_IMAGE_ALT },
    { property: 'og:locale', content: 'en_IN' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@infibolt' },
    { name: 'twitter:creator', content: '@infibolt' },
    { name: 'twitter:title', content: defaultTitle },
    { name: 'twitter:description', content: defaultDescription },
    { name: 'twitter:image', content: ogImage },
    { name: 'twitter:image:alt', content: DEFAULT_OG_IMAGE_ALT },
  ];
};

export const links = () => [
  { rel: 'stylesheet', href: globalStylesheetUrl },
  { rel: 'manifest', href: '/manifest.webmanifest' },
  { rel: 'icon', href: '/images/favicon-tab.ico' },
  { rel: 'icon', type: 'image/png', href: '/images/favicon-tab.png' },
  { rel: 'apple-touch-icon', href: '/images/apple-touch-icon.png' },
  { rel: 'preload', as: 'image', href: '/images/Litemood-hero.webp?v=20260530', type: 'image/webp', fetchPriority: 'high' },
];

// @ts-expect-error Hostinger React Router parser rejects TS annotations here.
export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <meta name="google-site-verification" content="1hVKgnV3bpsEjAqm1GyhsWTFHrGwpzsUjrvs9w6Kj7I" />
        <Links />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              '@context': 'https://schema.org',
              '@graph': [organizationSchema(), websiteSchema()],
            }),
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-MFDFMT0GE5" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MFDFMT0GE5');
            `,
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
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Satoshi, Inter, sans-serif', background: '#f7f5f0', padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: 'center', border: '1px solid rgba(15,23,42,.1)', borderRadius: 22, background: 'rgba(255,255,255,.82)', padding: 36, boxShadow: '0 24px 80px rgba(15,23,42,.08)' }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#64748b' }}>Infibolt experience</p>
        <h1 style={{ margin: '14px 0 0', fontSize: 30, lineHeight: 1.1, color: '#020617' }}>We could not open this view.</h1>
        <p style={{ margin: '14px auto 0', maxWidth: 360, color: '#475569', lineHeight: 1.7 }}>Refresh the page or return to the previous screen. Your account and ownership data remain protected.</p>
      </div>
    </div>
  );
}

export default function App() {
  const outlet = useOutlet();
  return (
    <>
      <CustomerSessionManager />
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

function CustomerSessionManager() {
  const authUser = useAppStore((state) => state.auth.user);
  const hydrateSession = useAppStore((state) => state.hydrateSession);
  const refreshSession = useAppStore((state) => state.refreshSession);
  const expireCustomerSession = useAppStore((state) => state.expireCustomerSession);

  useEffect(() => {
    if (hasHydratedCustomerSession) return;
    const shouldHydrate = hasCustomerSessionHint();
    if (!shouldHydrate) return;
    hasHydratedCustomerSession = true;
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (!authUser) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      refreshSession();
    }, 10 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [authUser, refreshSession]);

  useEffect(() => {
    const handleExpiredSession = () => expireCustomerSession();
    window.addEventListener("infibolt:customer-auth-expired", handleExpiredSession);
    return () => window.removeEventListener("infibolt:customer-auth-expired", handleExpiredSession);
  }, [expireCustomerSession]);

  return null;
}

function hasCustomerSessionHint() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("infibolt.customerSession") === "active";
}

