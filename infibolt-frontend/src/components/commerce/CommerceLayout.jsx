import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CircleHelp,
  CreditCard,
  FileUp,
  Grid2X2,
  Heart,
  Headphones,
  Lock,
  Home,
  PackageCheck,
  Search,
  Send,
  Shield,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  TicketCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { toast } from "sonner";
import {
  categories,
  collections,
  faqs,
  formatPrice,
  getCategoryById,
  products
} from "../../store/commerce";
import { useAppStore } from "../../store/appStore";
import { productService } from "../../services/productService";
import { uploadUrl } from "../../config/api";
import { request } from "../../services/api";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "Warranty", href: "/warranty" },
  { label: "Support", href: "/support" },
];

const bottomNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Products", href: "/products", icon: Headphones },
  { label: "Collections", href: "/collections", icon: Grid2X2 },
  { label: "Warranty", href: "/warranty", icon: Shield },
  { label: "Help", href: "/support", icon: CircleHelp },
];

const breadcrumbLabelMap = {
  cart: "Launch partners",
  checkout: "Products",
  collections: "Collections",
  contact: "Contact",
  faq: "FAQ",
  home: "Home",
  login: "Login",
  "privacy-policy": "Privacy",
  products: "Products",
  profile: "Profile",
  register: "Register",
  support: "Support",
  "terms-conditions": "Terms",
  warranty: "Warranty",
  wishlist: "Wishlist",
  "launch-edition": "Launch",
  "desk-essentials": "Desk",
  "mobility-kit": "Mobility",
  "aura-audio-pro": "Aura",
  "nova-watch-x": "Nova",
  "echo-charge-max": "Echo",
  "lumen-hub-studio": "Lumen",
  "pulse-pack-slim": "Pulse",
};

const sectionReveal = {
  hidden: { opacity: 0, y: 14 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function MotionSection({ className = "", children }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
      variants={sectionReveal}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function MotionStagger({ className = "", children }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionStaggerItem({ children }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function CinematicImage({ src, alt, className = "", loading = "lazy", sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const resolvedSrc = uploadUrl(src);

  if (!resolvedSrc) {
    return (
      <div className={`${className} grid place-items-center bg-slate-100 text-slate-400 dark:bg-white/[0.04] dark:text-slate-500`}>
        <PackageCheck className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-10 bg-slate-200/60 dark:bg-slate-700/35"
      >
        <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/35 to-transparent dark:via-white/10" />
      </motion.div>
      <motion.img
        src={resolvedSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        sizes={sizes}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        initial={{ opacity: 0.001, scale: 1.01 }}
        animate={{ opacity: isLoaded ? 1 : 0.001, scale: isLoaded ? 1 : 1.01 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`${className} block`}
      />
    </div>
  );
}

function CustomCursor() {
  return null;
}

function applyOrCreateMeta(selector, attributes) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
}

function SEOHead({ title, description, pathname }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const baseTitle = "INFIBOLT";
    const fullTitle = title ? `${baseTitle} | ${title}` : `${baseTitle} | Official Website`;
    const fallbackDescription =
      "INFIBOLT builds premium electronics with cinematic design, refined performance, and modern ownership support.";
    const metaDescription = description || fallbackDescription;
    const canonical = `${window.location.origin}${pathname || "/"}`;
    const privatePath = /^\/(profile|settings|orders|warranty|support|auth|login|register|signup|checkout|cart)(\/|$)/.test(pathname || "");

    document.title = fullTitle;
    applyOrCreateMeta('meta[name="description"]', { name: "description", content: metaDescription });
    applyOrCreateMeta('meta[name="robots"]', { name: "robots", content: privatePath ? "noindex,nofollow" : "index,follow" });
    applyOrCreateMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    applyOrCreateMeta('meta[property="og:description"]', { property: "og:description", content: metaDescription });
    applyOrCreateMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    applyOrCreateMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    applyOrCreateMeta('meta[property="og:image"]', { property: "og:image", content: `${window.location.origin}/images/Litemood-hero.png` });
    applyOrCreateMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    applyOrCreateMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    applyOrCreateMeta('meta[name="twitter:description"]', { name: "twitter:description", content: metaDescription });
    applyOrCreateMeta('meta[name="twitter:image"]', { name: "twitter:image", content: `${window.location.origin}/images/Litemood-hero.png` });

    let canonicalNode = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalNode) {
      canonicalNode = document.createElement("link");
      canonicalNode.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalNode);
    }
    canonicalNode.setAttribute("href", canonical);
  }, [title, description, pathname]);

  return null;
}

export function CommerceShell({
  children,
  eyebrow = "INFIBOLT Commerce",
  title,
  description,
  seoTitle,
  seoDescription,
}) {
  const { pathname } = useLocation();
  const authUser = useAppStore((state) => state.auth.user);
  const profile = useAppStore((state) => state.profile);
  const profileInitial = getProfileInitial(authUser || profile);
  const hideMobileBottomNav = ["/login", "/register"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const [showMobileBottomNav, setShowMobileBottomNav] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState(null);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    localStorage.setItem("theme", "light");
  }, []);

  useEffect(() => {
    setShowMobileBottomNav(true);

    if (typeof window === "undefined") return undefined;
    if (window.innerWidth >= 1024 || hideMobileBottomNav) return undefined;

    let previousY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY <= 10) {
        setShowMobileBottomNav(true);
      } else if (currentY > previousY + 6) {
        setShowMobileBottomNav(false);
      } else if (currentY < previousY - 6) {
        setShowMobileBottomNav(true);
      }
      previousY = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, hideMobileBottomNav]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setActiveMega(null);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden font-sans selection:bg-slate-900 selection:text-white">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-slate-950 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white">
        Skip to content
      </a>
      <SEOHead
        title={seoTitle ?? title}
        description={seoDescription ?? description}
        pathname={pathname}
      />
      <CustomCursor />
      {/* Cinematic Atmospheric Background with TE-inspired Grain */}
      <div className="fixed inset-0 pointer-events-none mix-blend-normal z-[-1]">
        <div className="absolute inset-0 bg-surface lg:dark:bg-surface-dark transition-colors duration-1000" />
        <div 
          className="absolute inset-0 opacity-[0.025] lg:dark:opacity-[0.04] mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
        />
      </div>

      <header
        onMouseLeave={() => setActiveMega(null)}
        className={`fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-2xl transition-all duration-300 ${
          isScrolled || activeMega
            ? "border-slate-900/10 bg-white/94 shadow-[0_18px_55px_rgba(15,23,42,0.08)] lg:dark:border-white/[0.08] lg:dark:bg-[#08090b]/84"
            : "border-slate-900/8 bg-white/90 lg:dark:border-white/[0.03] lg:dark:bg-surface-dark/72"
        }`}
      >
        <div className={`mx-auto flex w-screen max-w-none items-center justify-between gap-3 overflow-hidden px-4 transition-all duration-300 sm:px-6 lg:w-full lg:max-w-[1400px] lg:px-12 ${
          isScrolled ? "py-2.5 lg:py-3" : "py-3 lg:py-4"
        }`}>
          <Link to="/" className="group flex min-w-0 items-center gap-2">
            <img
              src="/images/favicon.svg"
              alt="INFIBOLT logo"
              className="h-[22px] w-[22px] shrink-0 object-contain dark:invert"
            />
            <span className="truncate text-[13px] font-bold uppercase leading-none tracking-[0.22em] text-[#111827] dark:text-white">
              INFIBOLT
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                prefetch="intent"
                onMouseEnter={() => setActiveMega(item.href === "/products" || item.href === "/collections" ? item.href : null)}
                className={`relative rounded-full px-1.5 py-1 text-sm font-semibold tracking-normal transition-colors duration-300 ${
                  pathname === item.href
                    ? "text-slate-950 lg:dark:text-white"
                    : "text-slate-600 hover:text-slate-950 lg:dark:text-slate-300 lg:dark:hover:text-white"
                }`}
              >
                <span className="relative z-10 block">{item.label}</span>
                
                {pathname === item.href && (
                  <span className="absolute -bottom-2 left-1.5 right-1.5 h-[2px] rounded-full bg-slate-950 lg:dark:bg-white" />
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <IconLink href="/profile" label="Profile" active={pathname.startsWith("/profile") || pathname.startsWith("/login") || pathname.startsWith("/register")}>
              <ProfileAvatar initial={profileInitial} signedIn={Boolean(authUser)} desktop />
            </IconLink>
          </div>

          <div className="relative z-[60] flex shrink-0 items-center gap-2 lg:hidden">
            <Link
              to="/profile"
              prefetch="intent"
              aria-label="Profile"
              className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_10px_24px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl transition-transform duration-200 active:scale-95 sm:h-12 sm:w-12 ${
                pathname.startsWith("/profile") || pathname.startsWith("/login") || pathname.startsWith("/register")
                  ? "border-slate-900/25 bg-slate-900 text-white"
                  : "border-slate-900/12 bg-white/90 text-slate-950"
              }`}
            >
              <ProfileAvatar initial={profileInitial} signedIn={Boolean(authUser)} />
            </Link>
          </div>
        </div>
        <MegaMenu active={activeMega} />
      </header>

      {!hideMobileBottomNav && <MobileBottomNav pathname={pathname} visible={showMobileBottomNav} />}

      <div className={`flex flex-col flex-1 pt-[65px] lg:pt-[73px] ${hideMobileBottomNav ? "pb-0" : "pb-24 lg:pb-0"}`}>
        {title && <PageHero eyebrow={eyebrow} title={title} description={description} />}
        <main id="main-content" className="relative z-10 flex-1">{children}</main>
        <CommerceFooter />
      </div>
    </div>
  );
}

function MobileBottomNav({ pathname, visible = true }) {
  return (
    <nav
      aria-label="Primary mobile navigation"
      className={`fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(0.55rem+env(safe-area-inset-bottom))] transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-[120%]"
      }`}
    >
      <div className="mx-auto grid w-full max-w-[720px] grid-cols-5 rounded-[1.2rem] border border-white/70 bg-white/90 p-1 shadow-[0_14px_42px_rgba(15,23,42,0.13)] backdrop-blur-2xl">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              prefetch="intent"
              className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[1rem] text-[10px] font-semibold no-underline transition-colors duration-200 sm:min-h-[60px] sm:text-[11px] ${
                isActive
                  ? "text-slate-950"
                  : "text-slate-500 active:text-slate-900"
              }`}
            >
              {isActive && (
              <motion.span
                  layoutId="mobile-bottom-nav-active"
                  className="absolute inset-0 rounded-[1rem] bg-slate-950/[0.06]"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <Icon
                className="relative z-10 h-5 w-5 shrink-0 sm:h-[22px] sm:w-[22px]"
                strokeWidth={isActive ? 2.25 : 1.8}
              />
              <span className="relative z-10 leading-none">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function ProfileAvatar({ initial, signedIn, desktop = false }) {
  if (!signedIn) {
    return <UserRound className={desktop ? "h-4.5 w-4.5" : "h-5 w-5 sm:h-5.5 sm:w-5.5"} strokeWidth={2} />;
  }

  return (
    <span className={`inline-flex items-center justify-center rounded-full font-semibold leading-none ${desktop ? "text-sm" : "text-[15px] sm:text-base"}`}>
      {initial}
    </span>
  );
}

function getProfileInitial(user) {
  const source = user?.name || user?.fullName || user?.email || user?.phone || "I";
  return String(source).trim().charAt(0).toUpperCase() || "I";
}

function IconLink({ href, label, children, active = false }) {
  return (
    <Link
      to={href}
      prefetch="intent"
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-[0_10px_24px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.76)] transition-all duration-300 ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-900/12 bg-white/90 text-slate-800 hover:border-slate-900/20 hover:bg-white hover:text-slate-950 lg:dark:border-white/12 lg:dark:bg-white/8 lg:dark:text-slate-200 lg:dark:hover:bg-white/12 lg:dark:hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function MegaMenu({ active }) {
  const isOpen = active === "/products" || active === "/collections";
  const [menuData, setMenuData] = useState({ products, categories, collections });
  const featured = (menuData.products.filter((product) => product.featured || product.homepageVisible).length
    ? menuData.products.filter((product) => product.featured || product.homepageVisible)
    : menuData.products).slice(0, 3);

  useEffect(() => {
    if (!isOpen) return undefined;
    let alive = true;
    Promise.all([productService.list(), productService.categories(), productService.collections()]).then(([productResult, categoryResult, collectionResult]) => {
      if (!alive) return;
      setMenuData({
        products: productResult.items?.length ? productResult.items : products,
        categories: categoryResult.items?.length ? categoryResult.items : categories,
        collections: collectionResult.items?.length ? collectionResult.items : collections,
      });
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, [isOpen]);

  return (
    <div
      className={`hidden overflow-hidden border-t border-slate-900/[0.06] bg-white/92 shadow-[0_34px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-all duration-300 lg:block dark:border-white/10 dark:bg-[#08090b]/92 ${
        isOpen ? "max-h-[430px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-[0.85fr_1.15fr] gap-12 px-12 py-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            {active === "/collections" ? "Curated ecosystems" : "Product universe"}
          </p>
          <div className="mt-5 grid gap-2">
            {(active === "/collections" ? menuData.collections : menuData.categories).map((item) => {
              const href = active === "/collections" ? `/products?collection=${item.slug}` : `/products?category=${item.id}`;
              return (
                <Link
                  key={item.slug ?? item.id}
                  to={href}
                  prefetch="intent"
                  className="group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 transition duration-200 hover:border-slate-900/10 hover:bg-slate-950/[0.035] dark:hover:border-white/10 dark:hover:bg-white/[0.06]"
                >
                  <span>
                    <span className="block text-sm font-semibold text-slate-950 dark:text-white">{item.name}</span>
                    <span className="mt-1 block max-w-[22rem] text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition duration-200 group-hover:translate-x-0.5 group-hover:text-slate-950 dark:group-hover:text-white" />
                </Link>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {featured.map((product) => (
            <Link
              key={product.slug}
              to={`/products/${product.slug}`}
              prefetch="intent"
              className="group overflow-hidden rounded-2xl border border-slate-900/8 bg-slate-50/80 p-2 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_48px_rgba(15,23,42,0.11)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-white/[0.05]">
                <CinematicImage src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
              </div>
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{product.badge}</p>
                <h3 className="mt-2 text-sm font-semibold leading-tight text-slate-950 dark:text-white">{product.name}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{formatPrice(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PageHero({ eyebrow, title, description, action }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const items = [{ label: "Home", href: "/" }];
    let current = "";
    segments.forEach((segment) => {
      current += `/${segment}`;
      const humanized = breadcrumbLabelMap[segment] ?? segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      items.push({
        label: humanized,
        href: current,
      });
    });
    return items;
  }, [pathname]);

  return (
    <section className={`relative z-10 flex flex-col overflow-hidden ${isHome ? "min-h-[30vh] justify-end pb-12 pt-16 sm:pt-20 lg:min-h-[50vh] lg:pb-20 lg:pt-28" : "border-b border-slate-900/[0.06] bg-white/35 pb-7 pt-7 sm:pt-9 lg:pb-10 lg:pt-12 dark:border-white/10 dark:bg-white/[0.02]"}`}>
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }} className="max-w-4xl">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:mb-4 sm:text-[11px] dark:text-slate-300">{eyebrow}</p>
          {crumbs.length > 1 && <Breadcrumbs items={crumbs} />}
          <h1 className={`font-semibold text-slate-900 dark:text-white ${isHome ? "text-4xl leading-[0.98] sm:text-5xl lg:text-[5.25rem] lg:leading-[0.94]" : "max-w-3xl text-[2rem] leading-[1.12] sm:text-[2.55rem] sm:leading-[1.08] lg:text-[3.25rem]"}`}>
            {title}
          </h1>
          {description && <p className={`mt-4 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400 ${isHome ? "text-base font-light sm:text-lg lg:text-xl" : "text-[0.95rem] font-normal sm:text-base"}`}>{description}</p>}
          {action && <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4 lg:mt-16 lg:gap-6">{action}</div>}
        </motion.div>
      </div>
    </section>
  );
}

export function PrimaryButton({ href, children, disabled = false, external = false }) {
  const MotionLink = motion.create(Link);
  const className =
    "premium-button group relative inline-flex min-h-[48px] items-center justify-center gap-3 overflow-hidden rounded-full bg-slate-950 px-6 py-3 sm:px-8 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] transition-all duration-300 hover:bg-slate-800 hover:shadow-[0_18px_44px_rgba(17,24,39,0.2)] disabled:pointer-events-none disabled:opacity-50 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:hover:shadow-[0_14px_34px_rgba(255,255,255,0.12)]";

  if (disabled) {
    return (
      <button type="button" disabled className={className}>
        {children}
      </button>
    );
  }

  return (
    external ? (
      <motion.a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </motion.a>
    ) : (
      <MotionLink to={href} className={className}>
        {children}
      </MotionLink>
    )
  );
}

export function SecondaryButton({ href, children, external = false }) {
  const MotionLink = motion.create(Link);
  const className = "premium-button group relative inline-flex min-h-[48px] items-center justify-center gap-3 rounded-full border border-slate-900/14 bg-white/42 px-6 py-3 sm:px-8 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900 transition-all duration-300 hover:border-slate-900/24 hover:bg-white/78 hover:shadow-[0_12px_28px_rgba(17,24,39,0.08)] disabled:pointer-events-none disabled:opacity-50 dark:border-white/16 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.07] dark:hover:shadow-[0_10px_26px_rgba(255,255,255,0.08)] sm:w-auto";
  return (
    external ? (
      <motion.a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </motion.a>
    ) : (
      <MotionLink to={href} className={className}>
        {children}
      </MotionLink>
    )
  );
}

function SubmitButton({ children }) {
  return (
    <button type="submit" className="group relative inline-flex min-h-[48px] items-center justify-center gap-3 overflow-hidden bg-slate-900 px-6 py-3 sm:px-8 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
      {children}
    </button>
  );
}

export function ProductGrid({ items = products, columns = "default" }) {
  const columnClass = columns === "featured" ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4";

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-slate-900/10 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
        <Search className="mx-auto h-6 w-6 text-slate-400" />
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">No products match this view</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">Try a different category, collection, or search phrase. New product stories will appear here as the catalogue grows.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: {
          transition: { staggerChildren: 0.1 }
        }
      }}
      className={`grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6 ${columnClass}`}
    >
      {items.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </motion.div>
  );
}

export function ProductGridSkeleton({ count = 6, columns = "default" }) {
  const columnClass = columns === "featured" ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4";
  const rows = Array.from({ length: count });

  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-5 ${columnClass}`}>
      {rows.map((_, index) => (
        <article
          key={`product-skeleton-${index}`}
          className="premium-shimmer overflow-hidden rounded-2xl border border-black/5 bg-slate-50/85 p-1.5 dark:border-white/5 dark:bg-white/[0.02] sm:p-2"
        >
          <div className="aspect-[1/1] rounded-lg bg-slate-200 dark:bg-slate-700/60 sm:aspect-[4/4.7] sm:rounded-xl" />
          <div className="space-y-2.5 p-3 sm:space-y-4 sm:p-6">
            <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-5 w-4/5 rounded bg-slate-200 dark:bg-slate-700 sm:h-7" />
            <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3.5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="pt-1.5 sm:pt-2">
              <div className="h-5 w-24 rounded bg-slate-300 dark:bg-slate-600 sm:h-6" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProductCard({ product }) {
  const category = getCategoryById(product.category);

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-black/5 bg-white/72 p-1.5 shadow-[0_10px_34px_rgba(17,24,39,0.045)] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_60px_rgba(17,24,39,0.12)] dark:border-white/5 dark:bg-white/[0.025] dark:hover:bg-white/[0.055] dark:hover:shadow-[0_12px_34px_rgba(0,0,0,0.18)] sm:p-2"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[1/1] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800/50 sm:aspect-[4/4.7]">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/32 via-black/0 to-white/8 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <CinematicImage src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.018]" />
          <div className="absolute left-3 top-3 z-20 rounded-full border border-white/45 bg-white/72 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-black/38 dark:text-white sm:left-4 sm:top-4 sm:text-[10px]">
            {product.badge}
          </div>
          <div className="pointer-events-none absolute inset-0 z-20 rounded-xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
        </div>
        <div className="relative z-10 flex flex-col p-3 sm:p-6">
          <div className="mb-2 flex items-center justify-between gap-2 sm:mb-4 sm:gap-3">
            <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300 sm:text-[10px] sm:tracking-[0.2em]">
              {category?.name}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-400 sm:gap-1.5 sm:text-xs">
              {product.rating} <Star className="h-3 w-3 fill-current text-amber-400 sm:h-3.5 sm:w-3.5" />
            </span>
          </div>
          <h3 className="line-clamp-2 text-[1.02rem] font-semibold leading-tight tracking-normal text-slate-900 transition-colors duration-200 group-hover:text-slate-700 sm:text-[1.16rem] md:text-[1.25rem] dark:text-white dark:group-hover:text-slate-200">{product.name}</h3>
          <p className="mt-1.5 line-clamp-2 min-h-[2.25rem] text-[0.74rem] leading-5 text-slate-600 dark:text-slate-400 sm:mt-2.5 sm:min-h-[3rem] sm:text-[0.88rem] sm:leading-relaxed">{product.summary}</p>
          <div className="mt-3 flex items-center justify-between sm:mt-6">
            <span className="text-[0.95rem] font-semibold tracking-tight text-slate-900 dark:text-white sm:text-[1.08rem]">{formatPrice(product.price)}</span>
            <span className="inline-flex items-center gap-2 text-[0] font-bold uppercase tracking-[0.16em] text-slate-900 transition-colors duration-300 dark:text-white sm:gap-3 sm:text-[11px]">
              <span className="hidden sm:inline">Explore</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/5 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-slate-900 group-hover:text-white dark:bg-white/10 dark:group-hover:bg-white dark:group-hover:text-slate-900 sm:h-8 sm:w-8">
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function ProductFilters({ selectedCategory, onCategoryChange, query, onQueryChange, sort, onSortChange, categoryItems = categories }) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortOptions = [
    ["featured", "Featured"],
    ["price-low", "Price: Low to High"],
    ["price-high", "Price: High to Low"],
    ["rating", "Top Rated"],
  ];
  const selectedSortLabel = sortOptions.find(([value]) => value === sort)?.[1] ?? "Featured";

  return (
    <div className="premium-surface sticky top-[76px] z-30 mb-8 flex flex-col gap-6 p-4 backdrop-blur-2xl md:mb-10 sm:p-5 dark:bg-white/[0.03]">
      {/* Top Row: Search & Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="premium-control flex flex-1 items-center gap-3 rounded-full px-5 py-3.5 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-white/30 dark:focus-within:bg-white/10">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search for products or features..."
            autoComplete="off"
            spellCheck="false"
            className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-sm font-medium text-slate-900 caret-slate-950 placeholder:text-slate-400 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 dark:text-white"
          />
        </label>
        <div className="relative">
        <button
          type="button"
          onClick={() => setSortOpen((value) => !value)}
          onBlur={() => window.setTimeout(() => setSortOpen(false), 120)}
          className="premium-control flex w-full items-center gap-3 rounded-full px-5 py-3.5 text-left hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:min-w-[230px]"
        >
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <span className="flex-1 text-sm font-medium text-slate-700 dark:text-white">{selectedSortLabel}</span>
          <span className={`h-1.5 w-1.5 rotate-45 border-b border-r border-slate-400 transition-transform ${sortOpen ? "rotate-[-135deg]" : ""}`} />
        </button>
        {sortOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-slate-900/10 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-[#12151b]">
            {sortOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSortChange(value);
                  setSortOpen(false);
                }}
                className={`flex w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  sort === value
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Bottom Row: Sliding Category Pills */}
      <div className="relative -mx-4 sm:mx-0">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {[{ id: "all", name: "All Products" }, ...categoryItems].map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`relative snap-start whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {selectedCategory === category.id && (
                <motion.div
                  layoutId="active-category-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-sm border border-slate-200 dark:bg-white/10 dark:border-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FutureCommerceNotice({ title = "Direct purchase is opening in phases", description }) {
  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white/54 p-6 text-slate-800 shadow-[0_12px_34px_rgba(17,24,39,0.06)] dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-100">
      <div className="flex items-start gap-4">
        <Lock className="mt-1 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed opacity-85">
            {description || "Infibolt currently launches through selected marketplace partners. Ownership, warranty registration, and support stay connected here after purchase."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BuyPanel({ product }) {
  const [notifyValue, setNotifyValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const marketplace = product.marketplace || {};
  const priority = marketplace.priority || "Amazon";
  const channels = marketplace.visible === false ? [] : [
    ["Amazon", marketplace.amazon || product.amazonLink, "Preferred launch partner"],
    ["Flipkart", marketplace.flipkart || product.flipkartLink, "Marketplace purchase"],
    ["Croma", marketplace.croma, "Retail partner"],
    ["Reliance Digital", marketplace.relianceDigital, "Retail partner"],
    ["Official retail", marketplace.retail || marketplace.custom, "Selected stores"],
  ].filter(([, href]) => Boolean(href)).sort(([a], [b]) => (a === priority ? -1 : b === priority ? 1 : 0));
  const primaryChannels = channels.length ? channels : [["Notify Me", "", "Launch updates"]];
  const submitNotify = async (event) => {
    event.preventDefault();
    const value = notifyValue.trim();
    if (!value) return;
    setSubmitting(true);
    try {
      await productService.notify({
        product: product.name,
        productSlug: product.slug,
        source: "Product purchase card",
        ...(value.includes("@") ? { email: value } : { phone: value }),
      });
      toast.success("Launch updates enabled", { description: "We will alert you when partner availability changes." });
      setNotifyValue("");
    } catch (error) {
      toast.error("Could not save notification", { description: error.message || "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="premium-surface p-6 shadow-[0_18px_54px_rgba(15,23,42,0.08)] sm:p-8 lg:sticky lg:top-28 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Launch partner purchase</p>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{formatPrice(product.price)}</p>
          {product.comparePrice > product.price && <p className="mt-1 text-sm text-slate-400 line-through">{formatPrice(product.comparePrice)}</p>}
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-900/10 bg-transparent text-slate-600 transition-all hover:bg-slate-900/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10" aria-label="Add to wishlist">
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-5 rounded-2xl border border-emerald-500/18 bg-emerald-500/8 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">{marketplace.launchStatus || product.status || "Available through selected launch partners"}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Choose your preferred purchase channel. Ownership, warranty, and support are managed through Infibolt after delivery.</p>
      </div>
      <div className="mt-6 grid gap-3">
        {primaryChannels.map(([label, href, description], index) =>
          href ? (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className={`group inline-flex min-h-[54px] items-center justify-between gap-3 rounded-full px-5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                index === 0
                  ? "bg-slate-950 text-white shadow-[0_18px_44px_rgba(15,23,42,0.18)] hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                  : "border border-slate-900/12 bg-white/60 text-slate-900 hover:bg-white dark:border-white/12 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
              }`}
            >
              <span>Buy on {label}</span>
              <span className="hidden text-[10px] font-semibold normal-case tracking-normal opacity-60 sm:inline">{description}</span>
            </a>
          ) : null
        )}
        <SecondaryButton href="/warranty">Register Product</SecondaryButton>
      </div>
      <form onSubmit={submitNotify} className="mt-5 grid gap-3 rounded-2xl border border-slate-900/8 bg-white/48 p-3 dark:border-white/10 dark:bg-white/[0.035]">
        <label className="sr-only" htmlFor={`notify-${product.slug}`}>Email or mobile for launch updates</label>
        <input
          id={`notify-${product.slug}`}
          value={notifyValue}
          onChange={(event) => setNotifyValue(event.target.value)}
          placeholder="Email or mobile for availability alerts"
          className="min-h-[46px] rounded-full border border-slate-900/10 bg-white px-4 text-sm font-medium outline-none focus:border-slate-950 dark:border-white/10 dark:bg-slate-950 dark:text-white"
        />
        <button type="submit" disabled={submitting || !notifyValue.trim()} className="min-h-[46px] rounded-full bg-slate-950 px-5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950">
          {submitting ? "Saving..." : "Notify Me"}
        </button>
      </form>
      <div className="mt-7 grid grid-cols-3 gap-3 border-t border-slate-900/8 pt-5 text-center dark:border-white/10">
        {[
          `${product.warrantyMonths || 12} month warranty`,
          `${product.replacementDays || 7} day support`,
          "Ownership profile",
        ].map((item) => (
          <span key={item} className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{item}</span>
        ))}
      </div>
    </div>
  );
}

export function ProductGallery({ product }) {
  const gallery = (product.gallery?.length ? product.gallery : [product.image || product.coverImage || product.thumbnail]).filter(Boolean);
  const [active, setActive] = useState(gallery[0]);
  const activeSrc = uploadUrl(active);
  useEffect(() => {
    setActive(gallery[0]);
  }, [product.slug]);

  return (
    <div className="lg:sticky lg:top-28">
      <div className="aspect-[5/4] overflow-hidden rounded-[1.6rem] border border-black/5 bg-white/60 shadow-[0_18px_54px_rgba(17,24,39,0.07)] dark:border-white/5 dark:bg-white/[0.02]">
        {activeSrc ? (
          <motion.img
            key={active}
            src={activeSrc}
            alt={product.name}
            loading="lazy"
            decoding="async"
            initial={{ opacity: 0.25, scale: 1.012 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-slate-100 text-slate-400">
            <PackageCheck className="h-8 w-8" />
          </div>
        )}
      </div>
      {gallery.length > 1 && <div className="mt-4 grid grid-cols-4 gap-4">
        {gallery.map((image, index) => (
          <button key={image} type="button" onClick={() => setActive(image)} aria-label={`View ${product.name} image ${index + 1}`} className={`aspect-square overflow-hidden rounded-2xl border bg-white/60 transition-all duration-300 ${active === image ? "border-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.1)] dark:border-white" : "border-transparent opacity-72 hover:border-slate-900/20 hover:opacity-100 dark:hover:border-white/20"}`}>
            <img src={uploadUrl(image)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>}
    </div>
  );
}

export function EcommerceStepper({ current = 0, onStepChange }) {
  const steps = [
    { label: "Discover", icon: ShoppingBag },
    { label: "Partner", icon: PackageCheck },
    { label: "Register", icon: CreditCard },
    { label: "Care", icon: TicketCheck },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === current;
        const isCompleted = index < current;
        const isHighlighted = isActive || isCompleted;
        
        return (
          <motion.button
            key={step.label}
            onClick={() => onStepChange?.(index)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative flex w-full flex-col items-start overflow-hidden rounded-[1.5rem] border p-6 text-left transition-all duration-500 ${
              isHighlighted
                ? "border-slate-900/20 bg-white shadow-sm dark:border-white/20 dark:bg-white/10"
                : "border-slate-900/5 bg-slate-50 opacity-70 hover:opacity-100 dark:border-white/5 dark:bg-white/[0.02]"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="stepper-active-bg"
                className="absolute inset-0 z-0 bg-slate-50 dark:bg-white/5"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className={`relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 ${
              isHighlighted 
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                : "bg-slate-900/5 text-slate-500 group-hover:bg-slate-900/10 dark:bg-white/10 dark:text-slate-400 dark:group-hover:bg-white/20"
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className={`relative z-10 text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${
              isHighlighted 
                ? "text-slate-900 dark:text-white" 
                : "text-slate-500 dark:text-slate-300"
            }`}>
              {step.label}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}

export function AccountShell({ title, description, children }) {
  return (
    <CommerceShell eyebrow="Account" title={title} description={description}>
      <section className="pb-10 md:pb-16 lg:pb-20">
        <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-6 md:px-8 lg:grid-cols-[280px_1fr] lg:px-12">
          <aside className="rounded-2xl bg-slate-50 p-6 dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
            {["Profile", "Addresses", "Orders", "Wishlist", "Registered Products"].map((item) => (
              item === "Profile" ? (
                <Link to="/profile" prefetch="intent" key={item} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">
                  {item}
                </Link>
              ) : (
                <button key={item} type="button" disabled className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-400 opacity-75 dark:text-slate-500">
                  <span>{item}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em]">Soon</span>
                </button>
              )
            ))}
          </aside>
          <div>{children}</div>
        </div>
      </section>
    </CommerceShell>
  );
}

export function WarrantyForm() {
  const [submitted, setSubmitted] = useState(false);

  const submitWarranty = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    toast.info("Warranty verification system ready", {
      description: "The frontend is ready, but claims are not being submitted yet.",
    });
  };

  return (
    <form onSubmit={submitWarranty} className="grid gap-5 rounded-2xl bg-slate-50 p-5 sm:p-8 md:p-10 dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-5 text-amber-900 dark:text-amber-100">
        <div className="flex items-start gap-4">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
          <div>
            <h3 className="font-semibold">Warranty verification system ready</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-85">Use this flow for product details, serial number, invoice upload, and OTP verification.</p>
          </div>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Field name="name" label="Full name" required />
        <Field name="email" type="email" label="Email" required />
        <Field name="phone" label="Phone" required />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Select name="productSlug" label="Product" options={products.map((product) => [product.slug, product.name])} />
        <Field name="serialNumber" label="Serial number" required />
        <Field name="purchaseDate" label="Purchase date" type="date" required />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Field name="invoiceNumber" label="Invoice number" required />
        <Field name="dealer" label="Dealer / store" required />
        <Field name="pincode" label="Pincode" required />
      </div>
      <Field name="address" label="Address" required />
      <label className="grid gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Invoice upload</span>
        <span className="flex min-h-[116px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-900/20 bg-white/50 px-5 py-6 text-center dark:border-white/20 dark:bg-white/[0.03]">
          <FileUp className="mb-3 h-6 w-6 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload invoice</span>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">PDF, JPG, or PNG up to the supported limit.</span>
          <input name="invoice" type="file" required disabled className="sr-only" />
        </span>
      </label>
      <div className="grid gap-5 md:grid-cols-[1fr_220px]">
        <Field name="otp" label="OTP verification" placeholder="6-digit code" disabled />
        <div className="rounded-xl border border-slate-900/10 bg-white/50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
          Mobile OTP verification protects every warranty claim.
        </div>
      </div>
      <label className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400 py-4">
        <input type="checkbox" required className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
        I confirm that the provided details are accurate.
      </label>
      <button type="submit" className="group relative inline-flex min-h-[48px] items-center justify-center gap-3 overflow-hidden bg-slate-900 px-6 py-3 sm:px-8 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
        <ShieldCheck className="h-4 w-4" />
        Submit Claim
      </button>
      {submitted && (
        <div className="rounded-xl border border-slate-900/10 bg-white/70 p-5 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
          Warranty claim received. Verification details will appear in your claim history.
        </div>
      )}
    </form>
  );
}

export function SupportForm() {
  const [previewed, setPreviewed] = useState(false);

  const submitSupport = async (event) => {
    event.preventDefault();
    setPreviewed(true);
    toast.info("Support ticket system ready", {
      description: "Your message has been captured for the care timeline.",
    });
  };

  return (
    <form onSubmit={submitSupport} className="grid gap-6 rounded-2xl bg-slate-50 p-5 sm:p-8 md:p-10 dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-5 text-amber-900 dark:text-amber-100">
        <div className="flex items-start gap-4">
          <AlertCircle className="mt-1 h-5 w-5 shrink-0" />
          <div>
            <h3 className="font-semibold">Support ticket system ready</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-85">Complaint submission, ticket IDs, care-team replies, and status tracking are handled through the secure support workflow.</p>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field name="name" label="Full name" required />
        <Field name="email" type="email" label="Email" required />
      </div>
      <Select name="topic" label="Topic" options={[["marketplace", "Marketplace purchase"], ["warranty", "Warranty"], ["product", "Product information"], ["partnership", "Partnership"]]} />
      <Field name="message" label="Message" textarea required />
      <button type="submit" className="group relative inline-flex min-h-[48px] items-center justify-center gap-3 overflow-hidden bg-slate-900 px-6 py-3 sm:px-8 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
        <Send className="h-4 w-4" />
        Submit Ticket
      </button>
      {previewed && (
        <div className="rounded-xl border border-slate-900/10 bg-white/70 p-5 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
          Complaint ticket created. Replies and status updates will stay attached to this case.
        </div>
      )}
    </form>
  );
}

function Field({ label, name, type = "text", textarea = false, required = false, disabled = false, placeholder }) {
  const className = "w-full rounded-xl border border-slate-900/10 bg-transparent px-5 py-4 text-sm font-medium focus:border-slate-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-white dark:focus:border-white transition-colors";
  return (
    <label className="grid gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{label}</span>
      {textarea ? <textarea name={name} required={required} disabled={disabled} placeholder={placeholder} rows={5} className={className} /> : <input name={name} type={type} required={required} disabled={disabled} placeholder={placeholder} className={className} />}
    </label>
  );
}

function Select({ label, name, options }) {
  return (
    <label className="grid gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{label}</span>
      <select name={name} className="w-full rounded-xl border border-slate-900/10 bg-transparent px-5 py-4 text-sm font-medium focus:border-slate-900 focus:outline-none dark:border-white/10 dark:text-white dark:focus:border-white transition-colors">
        {options.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </label>
  );
}

export function FAQList() {
  return (
    <div className="flex flex-col border-t border-slate-200 dark:border-white/10">
      {faqs.map((faq) => (
        <details key={faq.question} className="group border-b border-slate-200 py-8 dark:border-white/10">
          <summary className="cursor-pointer list-none text-lg font-medium tracking-tight text-slate-900 md:text-xl transition-colors group-open:text-slate-500 dark:text-white dark:group-open:text-slate-400 flex items-center justify-between">
            {faq.question}
            <span className="ml-6 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-transform duration-500 group-open:rotate-45 dark:border-white/10">
              +
            </span>
          </summary>
          <p className="mt-6 text-base font-light leading-relaxed text-slate-600 dark:text-slate-400 pr-12">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function FeatureBand() {
  const features = [
    { icon: ShieldCheck, title: "Warranty-ready", text: "Registration, claims, serial details, invoice upload, and ticket tracking." },
    { icon: Sparkles, title: "Marketplace-first", text: "Every product supports editable Amazon, Flipkart, and custom purchase links." },
    { icon: PackageCheck, title: "Ownership platform", text: "Buy through launch partners, then return to Infibolt for warranty, support, and device care." },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={sectionReveal}
            custom={index}
            className="rounded-2xl bg-slate-50 p-8 dark:bg-white/[0.02] border border-black/5 dark:border-white/10"
          >
            <Icon className="mb-6 h-6 w-6 text-slate-900 dark:text-white" />
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl dark:text-white">{feature.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feature.text}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

export function CollectionGrid({ items = collections }) {
  const MotionLink = motion.create(Link);
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((collection) => (
        <MotionLink
          key={collection.slug}
          to={`/products?collection=${collection.slug}`}
          whileHover={{ y: -3, scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-50 p-8 transition-colors duration-300 hover:bg-white dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border border-black/5 dark:border-white/5 min-h-[300px]"
        >
          
          <div className="relative z-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{collection.productSlugs?.length || 0} products</p>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">{collection.name}</h3>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{collection.description}</p>
          </div>
          <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-transform duration-500 group-hover:translate-x-1 text-slate-900 dark:text-white">
            Explore <ArrowRight className="h-4 w-4" />
          </div>
        </MotionLink>
      ))}
    </div>
  );
}

function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 hidden flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:mb-5 sm:text-[11px] sm:tracking-[0.16em] lg:flex dark:text-slate-300">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.href}-${item.label}`} className="inline-flex items-center gap-2">
            {isLast ? (
              <span className="text-slate-900 dark:text-white">{item.label}</span>
            ) : (
              <Link to={item.href} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                {item.label}
              </Link>
            )}
            {!isLast && <span className="opacity-50">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

export function useFilteredProducts() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("featured");

  const filteredProducts = useMemo(() => {
    const collectionFilter = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("collection") : null;
    const normalizedQuery = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const categoryMatches = selectedCategory === "all" || product.category === selectedCategory;
      const textMatches = !normalizedQuery || `${product.name} ${product.summary} ${product.features.join(" ")}`.toLowerCase().includes(normalizedQuery);
      const collectionMatches = !collectionFilter || product.collection === collectionFilter;
      return categoryMatches && textMatches && collectionMatches;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [query, selectedCategory, sort]);

  return {
    filteredProducts,
    query,
    setQuery,
    onQueryChange: setQuery,
    selectedCategory,
    setSelectedCategory,
    onCategoryChange: setSelectedCategory,
    sort,
    setSort,
    onSortChange: setSort,
  };
}

function CommerceFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const subscribe = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email", { description: "We need a proper email address for launch updates." });
      return;
    }
    setStatus("loading");
    try {
      await request.post("/newsletter", { email: email.trim(), source: "Footer" }, { skipGlobalErrorToast: true });
      setStatus("success");
      setEmail("");
      toast.success("Subscribed", { description: "You will receive curated Infibolt launch updates." });
    } catch (error) {
      setStatus("error");
      toast.error("Subscription failed", { description: error.message || "Please try again." });
    }
  };

  return (
    <footer className="relative z-10 mt-12 border-t border-slate-900/5 py-8 md:mt-24 md:py-20 dark:border-white/5">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-x-6 gap-y-8 px-5 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8 lg:px-12">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="/images/favicon.svg"
              alt="INFIBOLT logo"
              className="h-7 w-7 shrink-0 object-contain dark:invert"
            />
            <span className="text-sm font-bold uppercase tracking-[0.22em] text-slate-900 dark:text-white">
              INFIBOLT
            </span>
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 md:mt-6 dark:text-slate-400">
            A premium product ecosystem for marketplace-first launches,
            ownership, warranty, and connected support.
          </p>
          <form onSubmit={subscribe} className="mt-5 flex max-w-sm gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Launch updates email"
              className="min-h-[42px] min-w-0 flex-1 rounded-full border border-slate-900/10 bg-white/70 px-4 text-sm font-medium outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              aria-label="Email for Infibolt launch updates"
            />
            <button type="submit" disabled={status === "loading"} className="min-h-[42px] rounded-full bg-slate-950 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">
              {status === "loading" ? "Saving" : "Join"}
            </button>
          </form>
        </div>

        <FooterColumn
          title="Shop"
          links={[
            ["Products", "/products"],
            ["Collections", "/collections"],
            ["Warranty Registration", "/warranty"],
            ["Launch Support", "/support"],
          ]}
        />

        <FooterColumn
          title="Care"
          links={[
            ["Warranty", "/warranty"],
            ["Warranty Policy", "/warranty-policy"],
            ["Support", "/support"],
            ["FAQ", "/faq"],
            ["Contact", "/contact"],
          ]}
        />

        <FooterColumn
          title="Company"
          links={[
            ["About", "/about"],
            ["Privacy", "/privacy-policy"],
            ["Terms", "/terms-conditions"],
          ]}
        />
      </div>
      
      <div className="mx-auto mt-8 flex w-full max-w-[1400px] flex-col items-start justify-between gap-2 border-t border-slate-900/5 px-5 pt-5 md:mt-20 md:flex-row md:items-center md:gap-4 md:px-8 md:pt-8 lg:px-12 dark:border-white/5">
        <p className="text-xs text-slate-500 md:text-sm dark:text-slate-400">
          &copy; {new Date().getFullYear()} INFIBOLT. All rights reserved.
        </p>
        <p className="text-xs text-slate-500 md:text-sm dark:text-slate-400">
          Developed by <a href="https://www.softsitesolution.in" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 hover:underline dark:text-white transition-colors">SoftSiteSolutions</a>
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 md:text-[11px] md:tracking-[0.2em] dark:text-slate-300">
        {title}
      </p>

      <div className="mt-4 grid gap-2.5 md:mt-6 md:flex md:flex-col md:gap-4">
        {links.map(([label, href]) => (
          <Link
            key={href}
            to={href}
            prefetch="intent"
            className="text-sm text-slate-600 transition-colors duration-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}




