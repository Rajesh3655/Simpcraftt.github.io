import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CreditCard,
  FileUp,
  Grid2X2,
  Heart,
  Headphones,
  Headset,
  Lock,
  Home,
  PackageCheck,
  Search,
  Send,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  TicketCheck,
  User,
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
} from "../../data/commerce";

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
  { label: "Support", href: "/support", icon: Headset },
];

const breadcrumbLabelMap = {
  admin: "Admin",
  analytics: "Analytics",
  cart: "Cart",
  checkout: "Checkout",
  cms: "CMS",
  collections: "Collections",
  contact: "Contact",
  customers: "Customers",
  ecommerce: "Ecommerce",
  faq: "FAQ",
  home: "Home",
  login: "Login",
  marketplace: "Marketplace",
  media: "Media",
  "privacy-policy": "Privacy",
  products: "Products",
  profile: "Profile",
  register: "Register",
  settings: "Settings",
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
  hidden: { opacity: 0, y: 18 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function MotionSection({ className = "", children }) {
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
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionStaggerItem({ children }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function CinematicImage({ src, alt, className = "", loading = "lazy" }) {
  const [isLoaded, setIsLoaded] = useState(false);

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
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        initial={{ opacity: 0.001, scale: 1.01 }}
        animate={{ opacity: isLoaded ? 1 : 0.001, scale: isLoaded ? 1 : 1.01 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={className}
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

    document.title = fullTitle;
    applyOrCreateMeta('meta[name="description"]', { name: "description", content: metaDescription });
    applyOrCreateMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    applyOrCreateMeta('meta[property="og:description"]', { property: "og:description", content: metaDescription });
    applyOrCreateMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    applyOrCreateMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    applyOrCreateMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    applyOrCreateMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    applyOrCreateMeta('meta[name="twitter:description"]', { name: "twitter:description", content: metaDescription });

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
  const hideMobileBottomNav = ["/login", "/register"].some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const [showMobileBottomNav, setShowMobileBottomNav] = useState(true);

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

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden font-sans selection:bg-slate-900 selection:text-white">
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

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/[0.04] bg-surface/92 backdrop-blur-xl transition-colors duration-200 lg:dark:border-white/[0.03] lg:dark:bg-surface-dark/90">
        <div className="mx-auto flex w-screen max-w-none items-center justify-between gap-3 overflow-hidden px-4 py-3 sm:px-6 lg:w-full lg:max-w-[1400px] lg:px-12 lg:py-4">
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

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                prefetch="intent"
                className={`relative text-sm font-medium tracking-wide transition-colors duration-300 ${
                  pathname === item.href
                    ? "text-slate-900 lg:dark:text-white"
                    : "text-slate-500 hover:text-slate-900 lg:dark:text-slate-400 lg:dark:hover:text-white"
                }`}
              >
                <span className="relative z-10 block">{item.label}</span>
                
                {pathname === item.href && (
                  <span className="absolute -bottom-2 left-0 right-0 h-[2px] rounded-full bg-slate-900 lg:dark:bg-white" />
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <IconLink href="/wishlist" label="Wishlist" active={pathname.startsWith("/wishlist")}>
              <Heart className="h-4 w-4" />
            </IconLink>
            <IconLink href="/cart" label="Cart" active={pathname.startsWith("/cart") || pathname.startsWith("/checkout")}>
              <ShoppingBag className="h-4 w-4" />
            </IconLink>
            <IconLink href="/profile" label="Profile" active={pathname.startsWith("/profile") || pathname.startsWith("/login") || pathname.startsWith("/register")}>
              <User className="h-4 w-4" />
            </IconLink>
          </div>

          <div className="relative z-[60] flex shrink-0 items-center gap-2 lg:hidden">
            <Link
              to="/cart"
              prefetch="intent"
              aria-label="Cart"
              className={`relative flex h-11 w-11 items-center justify-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl transition-transform duration-200 active:scale-95 sm:h-12 sm:w-12 ${
                pathname.startsWith("/cart") || pathname.startsWith("/checkout")
                  ? "border-slate-900/25 bg-slate-900 text-white"
                  : "border-slate-900/10 bg-white/55 text-slate-950"
              }`}
            >
              <ShoppingCart className="h-5 w-5 sm:h-5.5 sm:w-5.5" strokeWidth={1.9} />
              <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[10px] font-bold leading-none text-white">
                2
              </span>
            </Link>
            <Link
              to="/profile"
              prefetch="intent"
              aria-label="Profile"
              className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl transition-transform duration-200 active:scale-95 sm:h-12 sm:w-12 ${
                pathname.startsWith("/profile") || pathname.startsWith("/login") || pathname.startsWith("/register")
                  ? "border-slate-900/25 bg-slate-900 text-white"
                  : "border-slate-900/10 bg-white/55 text-slate-950"
              }`}
            >
              <UserRound className="h-5 w-5 sm:h-5.5 sm:w-5.5" strokeWidth={1.9} />
            </Link>
          </div>
        </div>
      </header>

      {!hideMobileBottomNav && <MobileBottomNav pathname={pathname} visible={showMobileBottomNav} />}

      <div className={`flex flex-col flex-1 pt-[65px] lg:pt-[73px] ${hideMobileBottomNav ? "pb-0" : "pb-24 lg:pb-0"}`}>
        {title && <PageHero eyebrow={eyebrow} title={title} description={description} />}
        <main className="relative z-10 flex-1">{children}</main>
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
      <div className="mx-auto grid w-full max-w-[720px] grid-cols-5 rounded-[1.35rem] border border-white/70 bg-white/86 p-1.5 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              prefetch="intent"
              className={`relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold no-underline transition-colors duration-200 sm:min-h-[62px] sm:text-[11px] ${
                isActive
                  ? "text-slate-950"
                  : "text-slate-500 active:text-slate-900"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-bottom-nav-active"
                  className="absolute inset-0 rounded-2xl bg-slate-950/[0.06]"
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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

function IconLink({ href, label, children, active = false }) {
  return (
    <Link
      to={href}
      prefetch="intent"
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${
        active
          ? "bg-slate-900 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]"
          : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 lg:dark:text-slate-400 lg:dark:hover:bg-white/10 lg:dark:hover:text-white"
      }`}
    >
      {children}
    </Link>
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
    <section className={`relative z-10 flex flex-col overflow-hidden ${isHome ? "min-h-[30vh] justify-end pb-12 pt-16 sm:pt-20 lg:min-h-[50vh] lg:pb-20 lg:pt-28" : "justify-end pb-6 pt-7 sm:pt-9 lg:pb-12 lg:pt-14"}`}>
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="max-w-5xl">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:mb-7 sm:text-[11px] dark:text-slate-300">{eyebrow}</p>
          {crumbs.length > 1 && <Breadcrumbs items={crumbs} />}
          <h1 className={`font-medium text-slate-900 dark:text-white ${isHome ? "text-4xl leading-[0.98] sm:text-5xl lg:text-[5.25rem] lg:leading-[0.94]" : "max-w-4xl text-[2.35rem] leading-[1.06] sm:text-[3.2rem] sm:leading-[1] lg:text-[4.35rem] lg:leading-[0.96]"}`}>
            {title}
          </h1>
          {description && <p className={`mt-5 max-w-3xl font-light leading-relaxed text-slate-500 sm:mt-6 dark:text-slate-400 ${isHome ? "text-base sm:text-lg lg:text-xl" : "text-base sm:text-lg lg:text-[1.18rem]"}`}>{description}</p>}
          {action && <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4 lg:mt-16 lg:gap-6">{action}</div>}
        </motion.div>
      </div>
    </section>
  );
}

export function PrimaryButton({ href, children, disabled = false, external = false }) {
  const MotionLink = motion.create(Link);
  const className =
    "group relative inline-flex min-h-[48px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-slate-900 px-6 py-3 sm:px-8 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all duration-500 hover:bg-slate-800 hover:shadow-[0_12px_34px_rgba(15,23,42,0.24)] disabled:pointer-events-none disabled:opacity-50 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:hover:shadow-[0_12px_34px_rgba(255,255,255,0.15)]";

  if (disabled) {
    return (
      <button type="button" disabled className={className}>
        {children}
      </button>
    );
  }

  return (
    external ? (
      <motion.a href={href} target="_blank" rel="noopener noreferrer" className={className} whileHover={{ y: -1 }} whileTap={{ y: 0, scale: 0.99 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.a>
    ) : (
      <MotionLink to={href} className={className} whileHover={{ y: -1 }} whileTap={{ y: 0, scale: 0.99 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </MotionLink>
    )
  );
}

export function SecondaryButton({ href, children, external = false }) {
  const MotionLink = motion.create(Link);
  const className = "group relative inline-flex min-h-[48px] items-center justify-center gap-3 rounded-xl border border-slate-900/20 bg-transparent px-6 py-3 sm:px-8 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900 transition-all duration-500 hover:bg-slate-900/5 hover:shadow-[0_10px_26px_rgba(15,23,42,0.12)] disabled:pointer-events-none disabled:opacity-50 dark:border-white/20 dark:text-white dark:hover:bg-white/5 dark:hover:shadow-[0_10px_26px_rgba(255,255,255,0.1)] sm:w-auto";
  return (
    external ? (
      <motion.a href={href} target="_blank" rel="noopener noreferrer" className={className} whileHover={{ y: -1 }} whileTap={{ y: 0, scale: 0.99 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.a>
    ) : (
      <MotionLink to={href} className={className} whileHover={{ y: -1 }} whileTap={{ y: 0, scale: 0.99 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>
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
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">Try a different category, collection, or search phrase. The catalogue is ready for backend product records when they are connected.</p>
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
      className={`grid grid-cols-2 gap-3 sm:gap-5 ${columnClass}`}
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
          className="animate-pulse overflow-hidden rounded-xl border border-black/5 bg-slate-50/85 p-1.5 dark:border-white/5 dark:bg-white/[0.02] sm:rounded-2xl sm:p-2"
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
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-slate-50/85 p-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] dark:bg-white/[0.02] dark:hover:bg-white/[0.05] dark:hover:shadow-[0_6px_20px_rgba(255,255,255,0.02)] border border-black/5 dark:border-white/5 sm:rounded-2xl sm:p-2"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[1/1] overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800/50 sm:aspect-[4/4.7] sm:rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10" />
          <CinematicImage src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025]" />
          <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
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
          <h3 className="line-clamp-2 text-[1.02rem] font-semibold leading-tight tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-slate-700 sm:text-[1.16rem] md:text-[1.25rem] dark:text-white dark:group-hover:text-slate-200">{product.name}</h3>
          <p className="mt-1.5 line-clamp-2 min-h-[2.25rem] text-[0.74rem] leading-5 text-slate-600 dark:text-slate-400 sm:mt-2.5 sm:min-h-[3rem] sm:text-[0.88rem] sm:leading-relaxed">{product.summary}</p>
          <div className="mt-3 flex items-center justify-between sm:mt-6">
            <span className="text-[0.95rem] font-semibold tracking-tight text-slate-900 dark:text-white sm:text-[1.08rem]">{formatPrice(product.price)}</span>
            <span className="inline-flex items-center gap-2 text-[0] font-bold uppercase tracking-widest text-slate-900 transition-colors duration-300 dark:text-white sm:gap-3 sm:text-[11px]">
              <span className="hidden sm:inline">Explore</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/5 transition-colors duration-300 group-hover:bg-slate-900 group-hover:text-white dark:bg-white/10 dark:group-hover:bg-white dark:group-hover:text-slate-900 sm:h-8 sm:w-8">
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function ProductFilters({ selectedCategory, onCategoryChange, query, onQueryChange, sort, onSortChange }) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortOptions = [
    ["featured", "Featured"],
    ["price-low", "Price: Low to High"],
    ["price-high", "Price: High to Low"],
    ["rating", "Top Rated"],
  ];
  const selectedSortLabel = sortOptions.find(([value]) => value === sort)?.[1] ?? "Featured";

  return (
    <div className="mb-8 flex flex-col gap-6 md:mb-10 rounded-2xl bg-slate-50 p-4 sm:p-6 dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
      {/* Top Row: Search & Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-3 rounded-full border border-slate-900/10 bg-white/70 px-5 py-3.5 transition-all focus-within:border-slate-900/25 focus-within:bg-white focus-within:shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 dark:focus-within:border-white/30 dark:focus-within:bg-white/10">
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
          className="flex w-full items-center gap-3 rounded-full border border-slate-900/10 bg-white/70 px-5 py-3.5 text-left transition-all hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:min-w-[230px]"
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
          {[{ id: "all", name: "All Products" }, ...categories].map((category) => (
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

export function FutureCommerceNotice({ title = "Direct purchase launching soon", description }) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-6 text-amber-900 dark:text-amber-100">
      <div className="flex items-start gap-4">
        <Lock className="mt-1 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed opacity-85">
            {description || "Cart, checkout, payments, coupons, orders, and address management are designed into the platform but disabled for public users in this launch phase."}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BuyPanel({ product }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 sm:p-8 dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Marketplace launch</p>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{formatPrice(product.price)}</p>
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-900/10 bg-transparent text-slate-600 transition-all hover:bg-slate-900/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10" aria-label="Add to wishlist">
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Choose your preferred marketplace channel while direct checkout is being prepared.</p>
      <div className="mt-8 grid gap-4">
        <SecondaryButton href={product.marketplace.amazon} external>Buy on Amazon</SecondaryButton>
        <SecondaryButton href={product.marketplace.flipkart} external>Buy on Flipkart</SecondaryButton>
        <PrimaryButton href={product.marketplace.custom} external>Buy Now</PrimaryButton>
      </div>
    </div>
  );
}

export function ProductGallery({ product }) {
  const [active, setActive] = useState(product.gallery?.[0] ?? product.image);

  return (
    <div>
      <div className="aspect-[5/4] overflow-hidden rounded-2xl border border-black/5 bg-slate-50 dark:border-white/5 dark:bg-white/[0.02]">
        <img src={active} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-4">
        {(product.gallery ?? [product.image]).map((image) => (
          <button key={image} type="button" onClick={() => setActive(image)} className={`aspect-square overflow-hidden rounded-2xl border transition-all duration-300 ${active === image ? "border-slate-900 dark:border-white" : "border-transparent hover:border-slate-900/20 dark:hover:border-white/20"}`}>
            <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function EcommerceStepper({ current = 0, onStepChange }) {
  const steps = [
    { label: "Cart", icon: ShoppingBag },
    { label: "Address", icon: PackageCheck },
    { label: "Payment", icon: CreditCard },
    { label: "Order", icon: TicketCheck },
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

export function AdminPanelPreview() {
  const capabilities = [
    "Add, edit, delete products",
    "Upload and organize product images",
    "Manage categories and visibility",
    "Update Amazon and Flipkart URLs per product",
    "Review warranty claims and support tickets",
    "Manage users, banners, and product content",
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {capabilities.map((capability) => (
        <div key={capability} className="rounded-2xl bg-slate-50 p-6 dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
          <BadgeCheck className="mb-4 h-5 w-5 text-slate-900 dark:text-white" />
          <p className="text-sm font-medium leading-relaxed">{capability}</p>
        </div>
      ))}
    </div>
  );
}

export function WarrantyForm() {
  const [submitted, setSubmitted] = useState(false);

  const submitWarranty = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    toast.info("Warranty verification system coming soon", {
      description: "The frontend is ready, but claims are not being submitted yet.",
    });
  };

  return (
    <form onSubmit={submitWarranty} className="grid gap-5 rounded-2xl bg-slate-50 p-5 sm:p-8 md:p-10 dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-5 text-amber-900 dark:text-amber-100">
        <div className="flex items-start gap-4">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
          <div>
            <h3 className="font-semibold">Warranty verification system coming soon</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-85">This form is API-ready, including user details, serial number, invoice upload, and OTP placeholder. Submissions are intentionally paused until backend verification is connected.</p>
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
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload invoice placeholder</span>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">PDF, JPG, or PNG support will connect with storage.</span>
          <input name="invoice" type="file" required disabled className="sr-only" />
        </span>
      </label>
      <div className="grid gap-5 md:grid-cols-[1fr_220px]">
        <Field name="otp" label="OTP verification" placeholder="Coming soon" disabled />
        <div className="rounded-xl border border-slate-900/10 bg-white/50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
          Mobile OTP verification is staged for backend integration.
        </div>
      </div>
      <label className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400 py-4">
        <input type="checkbox" required className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
        I confirm that the provided details are accurate.
      </label>
      <button type="submit" className="group relative inline-flex min-h-[48px] items-center justify-center gap-3 overflow-hidden bg-slate-900 px-6 py-3 sm:px-8 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
        <ShieldCheck className="h-4 w-4" />
        Preview Claim Flow
      </button>
      {submitted && (
        <div className="rounded-xl border border-slate-900/10 bg-white/70 p-5 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
          Warranty ticket placeholder: SCW-PENDING. No claim has been sent yet.
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
    toast.info("Support ticket system coming soon", {
      description: "The complaint form is ready, but ticket creation is disabled until backend integration.",
    });
  };

  return (
    <form onSubmit={submitSupport} className="grid gap-6 rounded-2xl bg-slate-50 p-5 sm:p-8 md:p-10 dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-5 text-amber-900 dark:text-amber-100">
        <div className="flex items-start gap-4">
          <AlertCircle className="mt-1 h-5 w-5 shrink-0" />
          <div>
            <h3 className="font-semibold">Support ticket system coming soon</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-85">Complaint submission, ticket IDs, admin replies, and status tracking are designed here and intentionally disabled until backend support queues are connected.</p>
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
        Preview Ticket Flow
      </button>
      {previewed && (
        <div className="rounded-xl border border-slate-900/10 bg-white/70 p-5 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-white">
          Complaint ticket placeholder: SCS-PENDING. No support ticket has been sent yet.
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
    { icon: ShoppingBag, title: "Commerce-ready", text: "Cart, checkout, coupons, payments, and orders are modeled for future activation." },
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

export function CollectionGrid() {
  const MotionLink = motion.create(Link);
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {collections.map((collection) => (
        <MotionLink
          key={collection.slug}
          to={`/products?collection=${collection.slug}`}
          whileHover={{ y: -3, scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-50 p-8 transition-colors duration-300 hover:bg-white dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border border-black/5 dark:border-white/5 min-h-[300px]"
        >
          
          <div className="relative z-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{collection.productSlugs.length} products</p>
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
    <nav aria-label="Breadcrumb" className="mb-5 hidden flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:mb-6 sm:text-xs sm:tracking-[0.16em] lg:flex dark:text-slate-300">
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
            A premium product ecosystem moving from marketplace-first
            launches into full direct commerce.
          </p>
        </div>

        <FooterColumn
          title="Shop"
          links={[
            ["Products", "/products"],
            ["Collections", "/collections"],
            ["Cart", "/cart"],
            ["Checkout", "/checkout"],
          ]}
        />

        <FooterColumn
          title="Care"
          links={[
            ["Warranty", "/warranty"],
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
            ["Admin", "/admin"],
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
