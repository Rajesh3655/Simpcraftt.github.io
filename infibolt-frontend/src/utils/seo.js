export const SITE_URL = "https://infibolt.com";
export const SITE_NAME = "INFIBOLT";
export const DEFAULT_OG_IMAGE = "/images/Litemood-hero.webp";
export const DEFAULT_OG_IMAGE_ALT = "INFIBOLT premium electronics product experience";
export const PRIVATE_ROUTE_PATTERN = /^\/(admin|profile|settings|orders|warranty|support|auth|login|register|signup|checkout|cart)(\/|$)/;

export function canonicalUrl(pathname = "/") {
  const cleanPath = String(pathname || "/").split(/[?#]/)[0] || "/";
  const normalized = cleanPath === "/" ? "/" : cleanPath.replace(/\/+$/, "");
  return new URL(normalized || "/", SITE_URL).toString();
}

export function absoluteUrl(value) {
  if (!value) return "";
  try {
    return new URL(value, SITE_URL).toString();
  } catch {
    return "";
  }
}

export function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function breadcrumbSchema(items = []) {
  const cleanItems = items.filter((item) => item?.label);
  if (cleanItems.length < 2) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: cleanItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? canonicalUrl(item.href) : undefined,
    })),
  };
}

export function faqSchema(items = []) {
  const cleanItems = items.filter((item) => item?.question && item?.answer);
  if (!cleanItems.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cleanItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/images/apple-touch-icon.png"),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    sameAs: [SITE_URL],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["en"],
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
