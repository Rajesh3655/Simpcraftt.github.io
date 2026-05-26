import { motion } from "framer-motion";
import { BadgeCheck, Box, FileCheck2, Headphones, LifeBuoy, MailCheck, Shield, ShieldCheck, ShoppingCart, SlidersHorizontal, Sparkles, UserRound, Watch, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  CommerceShell,
  FAQList,
  FutureCommerceNotice,
  MotionSection,
  MotionStagger,
  MotionStaggerItem,
  ProductGrid,
  SecondaryButton,
} from "../../components/commerce/CommerceLayout";
import { productService } from "../../services/productService";

const sectionKickerClass = "mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300";
const sectionHeadingClass = "luxury-title text-[2rem] font-semibold leading-[1.02] text-slate-900 sm:text-[2.65rem] md:text-[3.15rem] lg:text-[3.8rem] dark:text-white";
const sectionHeadingAccentClass = "mt-1 block text-[0.88em] font-medium tracking-normal text-slate-500 dark:text-slate-400";

export default function HomePage() {
  const [homepage, setHomepage] = useState(null);

  useEffect(() => {
    let active = true;
    productService.homepage().then((result) => {
      if (active) setHomepage(result);
    }).catch(() => {
      if (active) setHomepage({ categories: [], featuredProducts: [], heroProducts: [] });
    });
    return () => {
      active = false;
    };
  }, []);

  const dynamicCategories = homepage?.categories || [];
  const featuredProducts = homepage?.featuredProducts || [];
  const homepageSections = homepage?.sections || [];
  const heroSection = resolveHomepageSection(homepageSections, "home-hero", heroSectionDefaults);
  const categorySection = resolveHomepageSection(homepageSections, "home-categories", categorySectionDefaults);
  const featuredSection = resolveHomepageSection(homepageSections, "home-featured", featuredSectionDefaults);
  const visibleCategories = selectHomepageCategories(dynamicCategories, categorySection.categorySlugs);
  const heroProduct = useMemo(() => homepage?.heroProducts?.[0] || featuredProducts[0] || null, [featuredProducts, homepage]);

  return (
    <CommerceShell
      seoTitle="Technology for the Quiet Future"
      seoDescription="Premium electronics engineered for deep focus, cinematic sound, and long-term ownership."
    >
      {/* Cinematic Hero - Full Bleed Editorial Entrance */}
      {heroSection.enabled !== false && <section className="relative overflow-hidden bg-[#f4eee3] lg:min-h-[88vh] lg:dark:bg-[#090805]">
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-65px)] w-screen max-w-none flex-col overflow-hidden px-5 pb-28 pt-7 sm:min-h-[88vh] sm:px-8 sm:pb-32 sm:pt-9 lg:hidden">
          <img
            src={heroSection.settings.mobileImage || heroSection.settings.lightImage}
            alt="Aura Audio Pro in a bright luxury studio setting"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-[63%_50%] sm:object-[68%_50%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,238,227,0.92)_0%,rgba(244,238,227,0.78)_43%,rgba(244,238,227,0.2)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,238,227,0.5)_0%,rgba(244,238,227,0.12)_38%,rgba(244,238,227,0.92)_100%)]" />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex-1"
          >
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-900/50 sm:text-[11px]">
              {heroSection.settings.eyebrow || `${heroProduct?.badge || "INFIBOLT Edition 01"} / ${heroProduct?.category || "Audio Object"}`}
            </p>
            <h1 className="max-w-[8.8ch] text-[3rem] font-medium leading-[0.94] tracking-normal text-slate-950 min-[390px]:text-[3.35rem] sm:text-[4.5rem]">
              {heroSection.settings.titleLine1}
              <br />
              <span className="font-medium text-slate-900/58">{heroSection.settings.titleAccent}</span>
              <br />
              {heroSection.settings.titleLine3}
            </h1>
            <p className="mt-5 w-full max-w-[20.5rem] text-[0.95rem] font-light leading-[1.65] text-slate-700 sm:mt-7 sm:max-w-[34rem] sm:text-[1.05rem]">
              {heroSection.subtitle || heroProduct?.shortDescription || heroProduct?.summary}
            </p>
          </motion.div>

          <div className="relative z-10 mt-7 grid w-full max-w-[22rem] gap-3 sm:mt-10 sm:max-w-[360px]">
            <Link
              to={heroSection.settings.primaryHref || "/products"}
              prefetch="intent"
              className="inline-flex min-h-[58px] items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_44px_rgba(15,23,42,0.18)] transition-transform duration-200 active:scale-[0.98]"
            >
              {heroSection.settings.primaryLabel || "Explore Products"}
            </Link>
            <Link
              to={heroSection.settings.secondaryHref || "/about"}
              prefetch="intent"
              className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-slate-950/38 bg-white/14 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950/88 backdrop-blur-sm transition-transform duration-200 active:scale-[0.98]"
            >
              {heroSection.settings.secondaryLabel || "Our Philosophy"}
            </Link>
          </div>

          <div className="relative z-10 mt-10 w-full max-w-[22rem] divide-y divide-slate-950/10 sm:mt-14 sm:max-w-[520px]">
            {[
              [heroSection.settings.stat1Label, heroSection.settings.stat1Value, Sparkles],
              [heroSection.settings.stat2Label, heroSection.settings.stat2Value, Headphones],
              [heroSection.settings.stat3Label, heroSection.settings.stat3Value, Shield],
            ].filter(([label, value]) => label && value).map(([label, value, Icon]) => (
              <div key={label} className="flex items-center gap-5 py-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8ded0]/86 text-slate-950">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-950">{label}</span>
                  <span className="mt-1 block text-base font-light leading-6 text-slate-700">{value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0.96, scale: 1.01 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 hidden lg:block">
          <img
            src={heroSection.settings.lightImage}
            alt="Aura Audio Pro in a bright luxury studio setting"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[68%_50%] opacity-100 transition-opacity duration-500 lg:dark:opacity-0"
          />
          <img
            src={heroSection.settings.darkImage}
            alt="Aura Audio Pro in a dark cinematic studio setting"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[68%_50%] opacity-0 transition-opacity duration-500 lg:dark:opacity-100"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,244,236,0.9)_0%,rgba(248,244,236,0.72)_27%,rgba(248,244,236,0.18)_54%,rgba(248,244,236,0.08)_100%)] lg:dark:bg-[radial-gradient(circle_at_76%_44%,rgba(255,255,255,0.1),transparent_30%),radial-gradient(circle_at_68%_70%,rgba(188,155,89,0.12),transparent_34%),linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.82)_34%,rgba(0,0,0,0.38)_62%,rgba(0,0,0,0.58)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,transparent_35%,rgba(244,238,227,0.9)_100%)] lg:dark:bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,transparent_34%,rgba(0,0,0,0.9)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#f4eee3] to-transparent lg:dark:from-[#090805]" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(20,20,20,0.35)_0.6px,transparent_0.7px)] [background-size:3px_3px] lg:dark:opacity-[0.08] lg:dark:[background-image:radial-gradient(rgba(255,255,255,0.42)_0.6px,transparent_0.7px)]" />
        </motion.div>

        <div className="relative z-10 mx-auto hidden min-h-[88vh] w-full max-w-[1440px] grid-rows-[1fr_auto] px-14 pb-8 pt-28 lg:grid">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-w-5xl flex-col justify-center self-center pt-4 md:pt-0"
          >
            <MotionStagger className="space-y-0">
              <MotionStaggerItem>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900/52 lg:dark:text-white/78 sm:mb-6 sm:text-[11px] sm:tracking-[0.24em]">
                  {heroSection.settings.eyebrow || `${heroProduct?.badge || "INFIBOLT Edition 01"} / ${heroProduct?.category || "Audio Object"}`}
                </p>
              </MotionStaggerItem>
              <MotionStaggerItem>
                <h1 className="max-w-[9.6ch] text-[5.7rem] font-medium leading-[0.94] tracking-normal text-slate-950 xl:text-[6.35rem] 2xl:text-[6.8rem] lg:dark:text-white">
                  {heroSection.settings.titleLine1}
                  <br />
                  <span className="font-medium text-slate-900/62 lg:dark:text-white/86">{heroSection.settings.titleAccent}</span>
                  <br />
                  {heroSection.settings.titleLine3}
                </h1>
              </MotionStaggerItem>
              <MotionStaggerItem>
                <p className="mt-7 max-w-[31rem] text-[1.05rem] font-light leading-[1.7] text-slate-800/78 lg:dark:text-white/88">
                  {heroSection.subtitle || heroProduct?.shortDescription || heroProduct?.summary}
                </p>
              </MotionStaggerItem>
            </MotionStagger>
            <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3">
              <Link
                to={heroSection.settings.primaryHref || "/products"}
                prefetch="intent"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-slate-950 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 lg:dark:bg-white lg:dark:text-slate-950 lg:dark:shadow-[0_18px_48px_rgba(255,255,255,0.18)] lg:dark:hover:bg-[#f4f1e8] lg:dark:hover:shadow-[0_22px_60px_rgba(255,255,255,0.24)]"
              >
                {heroSection.settings.primaryLabel || "Explore Products"}
              </Link>
              <Link
                to={heroSection.settings.secondaryHref || "/about"}
                prefetch="intent"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-slate-950/20 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950/82 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-950/45 hover:bg-white/30 lg:dark:border-white/28 lg:dark:text-white/88 lg:dark:hover:border-white/55 lg:dark:hover:bg-white/10"
              >
                {heroSection.settings.secondaryLabel || "Our Philosophy"}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4 border-t border-slate-950/12 pt-5 text-slate-900/62 lg:grid-cols-3 lg:dark:border-white/22 lg:dark:text-white/76"
          >
            {[
              [heroSection.settings.stat1Label, heroSection.settings.stat1Value],
              [heroSection.settings.stat2Label, heroSection.settings.stat2Value],
              [heroSection.settings.stat3Label, heroSection.settings.stat3Value],
            ].filter(([label, value]) => label && value).map(([label, value]) => (
              <div key={label} className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-900/40 lg:dark:text-white/55">{label}</p>
                <p className="mt-2 text-sm font-light leading-6 text-slate-800/72 lg:dark:text-white/84">{value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>}

      {/* Categories - Minimal Split */}
      {categorySection.enabled !== false && <MotionSection className="py-10 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-8 lg:px-12">
           <div className="mb-6 text-center md:mb-12">
              <h2 className={`${sectionHeadingClass} text-center`}>
                {categorySection.settings.titleLine1}
                <span className={sectionHeadingAccentClass}>{categorySection.settings.titleAccent}</span>
              </h2>
           </div>
           
           <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8 lg:gap-12">
            {visibleCategories.map((category) => {
              const Icon = categoryIcon(category.icon || category.slug || category.id || category.name);

              return (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  prefetch="intent"
                  className="group flex flex-col items-center text-center transition-opacity duration-300 hover:opacity-80"
                >
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-white/[0.02]">
                    <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-slate-900 dark:text-white">{category.name}</h3>
                  <p className="mt-3 max-w-[220px] text-sm font-light leading-relaxed text-slate-500 opacity-100 transition-opacity duration-300 dark:text-slate-400 md:max-w-[200px] md:opacity-0 md:group-hover:opacity-100">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </MotionSection>}

      {/* Featured Products - Editorial Image First */}
      {featuredSection.enabled !== false && <MotionSection className="bg-slate-50/50 py-10 dark:bg-white/[0.01] md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-8 lg:px-12">
          <div className="mb-6 flex flex-col items-start justify-between gap-6 md:mb-12 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className={sectionKickerClass}>
                {featuredSection.settings.kicker}
              </p>
              <h2 className={sectionHeadingClass}>
                {featuredSection.settings.titleLine1}
                <span className={sectionHeadingAccentClass}>
                  {featuredSection.settings.titleAccent}
                </span>
              </h2>
            </div>
            <Link
              to="/products"
              prefetch="intent"
              className="group inline-flex min-h-[54px] items-center justify-center rounded-full border border-slate-900/18 bg-white/70 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-900/35 hover:bg-white hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)] dark:border-white/25 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/45 dark:hover:bg-white/[0.09]"
            >
              View All Products
            </Link>
          </div>
          <ProductGrid items={featuredProducts.slice(0, 4)} />
        </div>
      </MotionSection>}

      {/* Ownership Platform */}
      <MotionSection className="py-10 md:py-16 lg:py-20">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-6 md:gap-12 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16 lg:px-12">
          <div className="lg:sticky lg:top-40">
            <p className={sectionKickerClass}>
              Ownership Platform
            </p>
            <h2 className={sectionHeadingClass}>
              Buy anywhere.
              <span className={sectionHeadingAccentClass}>
                Stay protected here.
              </span>
            </h2>
            <p className="mt-8 max-w-md text-base font-light leading-relaxed text-slate-600 dark:text-slate-400">
              Infibolt is built for the real buying journey: discover products here, purchase through trusted marketplace partners, then return to Infibolt to verify ownership, store warranty details, and track support.
            </p>
            <div className="mt-10 grid gap-3 rounded-[1.4rem] border border-slate-900/10 bg-white/72 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.035]">
              {[
                ["Email OTP secured", "Warranty registration and ownership verification use email OTP, not phone OTP.", MailCheck],
                ["Invoice-linked care", "Every approved record keeps serial, invoice, source, and warranty dates together.", FileCheck2],
                ["Support continuity", "Complaints and claims stay attached to the customer profile for faster decisions.", LifeBuoy],
              ].map(([title, text, Icon]) => (
                <div key={title} className="flex gap-3 rounded-2xl bg-slate-950/[0.025] p-4 dark:bg-white/[0.035]">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950 dark:text-white">{title}</span>
                    <span className="mt-1 block text-sm font-light leading-6 text-slate-600 dark:text-slate-400">{text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid gap-4 pt-4 sm:grid-cols-2 md:pt-8">
            {[
              ["Marketplace purchase", "Amazon, Flipkart, retail, and custom partner paths remain cleanly separated from post-purchase care.", ShoppingCart],
              ["Verified ownership", "Serial number, invoice proof, account email, and product identity are reviewed before warranty activation.", BadgeCheck],
              ["Warranty details", "Approved, pending, and rejected warranty records are visible to operations with invoice context.", ShieldCheck],
              ["Claim readiness", "RMA and warranty claims can be sorted, exported, and reviewed with customer history.", FileCheck2],
              ["Customer profile", "Email and mobile stay mapped to the account so login, warranty, and support remain connected.", UserRound],
              ["Admin control", "Products, homepage focus, warranty policy, complaints, and contact channels are managed from Admin OS.", SlidersHorizontal],
            ].map(([title, text, Icon]) => (
              <div key={title} className="group rounded-[1.2rem] border border-slate-900/8 bg-white/64 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_70px_rgba(15,23,42,0.09)] dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.06]">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold tracking-tight text-slate-900 md:text-lg dark:text-white">{title}</h3>
                <p className="mt-3 text-[0.92rem] font-light leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Support & FAQ - Clean Layout */}
      <MotionSection className="border-t border-slate-100 py-10 dark:border-white/5 md:py-16 lg:py-20">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-6 md:gap-12 md:px-8 lg:grid-cols-[1fr_1.5fr] lg:items-start lg:gap-16 lg:px-12">
          <div className="sticky top-40">
            <p className={sectionKickerClass}>
              Assistance
            </p>
            <h2 className={sectionHeadingClass}>
              Common
              <span className="mt-1.5 block">
                <span className={sectionHeadingAccentClass.replace("mt-1.5 block ", "")}>
                  queries
                </span>{" "}
                answered.
              </span>
            </h2>
            <p className="mt-8 max-w-sm text-base font-light leading-relaxed text-slate-600 dark:text-slate-400">
              We believe in transparent policies, clear warranty terms, and accessible customer care.
            </p>
            <div className="mt-12">
              <SecondaryButton href="/support">Contact support</SecondaryButton>
            </div>
          </div>
          <div className="pt-4 md:pt-8">
            <FAQList />
          </div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

const heroSectionDefaults = {
  enabled: true,
  subtitle: "Premium electronics engineered for deep focus: cinematic sound, refined materials, and modern rituals shaped around silence.",
  settings: {
    eyebrow: "INFIBOLT Edition 01 / Audio Object",
    titleLine1: "Where Sound",
    titleAccent: "Meets",
    titleLine3: "Stillness.",
    lightImage: "/images/Litemood-hero.png",
    darkImage: "/images/Darkmood-hero.png",
    mobileImage: "/images/Litemood-hero.png",
    primaryLabel: "Explore Products",
    primaryHref: "/products",
    secondaryLabel: "Our Philosophy",
    secondaryHref: "/about",
    stat1Label: "Material",
    stat1Value: "Soft-touch acoustic finish",
    stat2Label: "Sound",
    stat2Value: "Low-distortion cinematic stage",
    stat3Label: "Care",
    stat3Value: "Warranty-first ownership",
  },
};

const categorySectionDefaults = {
  enabled: true,
  categorySlugs: [],
  settings: {
    titleLine1: "Instruments of",
    titleAccent: "Clarity",
  },
};

const featuredSectionDefaults = {
  enabled: true,
  productSlugs: [],
  settings: {
    kicker: "Signature Objects",
    titleLine1: "Engineered for",
    titleAccent: "modern silence.",
  },
};

function resolveHomepageSection(sections, key, defaults) {
  const section = sections.find((item) => item.key === key) || {};
  return {
    ...defaults,
    ...section,
    settings: { ...defaults.settings, ...plainSettings(section.settings) },
    categorySlugs: section.categorySlugs || defaults.categorySlugs || [],
    productSlugs: section.productSlugs || defaults.productSlugs || [],
  };
}

function plainSettings(settings) {
  if (!settings) return {};
  return typeof settings === "object" ? settings : {};
}

function selectHomepageCategories(categories, categorySlugs = []) {
  if (!categorySlugs.length) return categories.slice(0, 4);
  const allowed = new Set(categorySlugs);
  return categories.filter((category) => allowed.has(category.slug || category.id)).slice(0, 4);
}

const categoryIconMap = {
  audio: Headphones,
  headphones: Headphones,
  sound: Headphones,
  speaker: Headphones,
  wearables: Watch,
  wearable: Watch,
  watch: Watch,
  charging: Zap,
  charger: Zap,
  power: Zap,
  zap: Zap,
  "home-tech": Box,
  home: Box,
  box: Box,
  device: Box,
  product: Box,
  package: Box,
  warranty: ShieldCheck,
  shield: Shield,
  premium: Sparkles,
  sparkles: Sparkles,
};

function categoryIcon(value) {
  return categoryIconMap[iconKey(value)] || Sparkles;
}

function iconKey(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
