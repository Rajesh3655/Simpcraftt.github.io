import { motion } from "framer-motion";
import { Box, FileCheck2, Headphones, LifeBuoy, MailCheck, Shield, ShieldCheck, ShoppingCart, Sparkles, Watch, Zap } from "lucide-react";
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
} from "../../components/commerce/CommerceLayout";
import { productService } from "../../services/productService";

const sectionKickerClass = "mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300";
const sectionHeadingClass = "luxury-title text-[2rem] font-semibold leading-[0.98] tracking-normal text-slate-900 sm:text-[2.65rem] md:text-[3.15rem] lg:text-[3.8rem] dark:text-white";
const sectionHeadingAccentClass = "editorial-italic mt-1.5 block text-[0.58em] leading-[0.95] text-slate-500 dark:text-slate-400";

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
  const heroTitle = splitHeroTitle(heroSection.settings.titleLine1);

  return (
    <CommerceShell
      seoTitle="Technology for the Quiet Future"
      seoDescription="Premium electronics engineered for deep focus, cinematic sound, and long-term ownership."
    >
      {/* Cinematic Hero - Full Bleed Editorial Entrance */}
      {heroSection.enabled !== false && <section className="relative overflow-hidden bg-[#f4eee3] lg:min-h-[88vh] lg:dark:bg-[#090805]">
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-65px)] w-full flex-col overflow-hidden px-5 pb-28 pt-7 sm:min-h-[88vh] sm:px-8 sm:pb-32 sm:pt-9 lg:hidden">
          <img
            src={heroSection.settings.mobileImage || heroSection.settings.lightImage}
            alt="Aura Audio Pro in a bright luxury studio setting"
            fetchpriority="high"
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
            <h1 className="luxury-title max-w-[7.6ch] text-[3.35rem] font-normal leading-[0.84] tracking-normal text-slate-950 min-[390px]:text-[3.75rem] sm:text-[5rem]">
              <span className="block">{heroTitle.first}</span>
              <span className="block">{heroTitle.second}</span>
              <span className="editorial-italic mt-[0.08em] block text-[0.5em] leading-[0.95] text-slate-900/68">
                {heroSection.settings.titleAccent}
              </span>
              <span className="mt-[0.02em] block">{heroSection.settings.titleLine3}</span>
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
            fetchpriority="high"
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
                <h1 className="luxury-title max-w-[7.5ch] text-[6rem] font-normal leading-[0.84] tracking-normal text-slate-950 xl:text-[6.75rem] 2xl:text-[7.25rem] lg:dark:text-white">
                  <span className="block">{heroTitle.first}</span>
                  <span className="block">{heroTitle.second}</span>
                  <span className="editorial-italic mt-[0.08em] block text-[0.5em] leading-[0.95] text-slate-900/68 lg:dark:text-white/78">
                    {heroSection.settings.titleAccent}
                  </span>
                  <span className="mt-[0.02em] block">{heroSection.settings.titleLine3}</span>
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
              const description = String(category.description || "").trim();

              return (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  prefetch="intent"
                  className="group flex min-h-[190px] flex-col items-center text-center"
                >
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-white group-hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-white/[0.02] dark:group-hover:bg-white/[0.06]">
                    <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-slate-900 dark:text-white">{category.name}</h3>
                  {description && (
                    <p className="mt-3 max-w-[220px] text-sm font-light leading-relaxed text-slate-500 opacity-100 transition-all duration-300 dark:text-slate-400 md:max-w-[220px] md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                      {description}
                    </p>
                  )}
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

      {/* Premium Ownership Ecosystem */}
      <MotionSection className="relative overflow-hidden py-12 md:py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[2rem] border border-slate-900/[0.07] bg-gradient-to-br from-white/88 via-[#f8f6f1]/82 to-slate-100/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] dark:border-white/10 dark:from-white/[0.07] dark:via-white/[0.035] dark:to-white/[0.02] sm:p-8 lg:p-12"
          >
            <div className="relative grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
              <div className="max-w-2xl">
                <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                  Ownership Ecosystem
                </p>
                <h2 className="luxury-title text-[2.35rem] font-semibold leading-[0.98] tracking-normal text-slate-950 dark:text-white sm:text-[3rem] md:text-[3.6rem] lg:text-[4.4rem]">
                  Buy anywhere.
                  <span className="editorial-italic mt-2 block text-[0.58em] leading-[0.95] text-slate-500 dark:text-slate-400">
                    Own everything here.
                  </span>
                </h2>
                <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                  Register your devices, activate warranty coverage, and keep support, ownership, and product care connected in one secure space.
                </p>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-[0.98rem]">
                  INFIBOLT is designed around long-term ownership. Whether purchased through Amazon, Flipkart, retail stores, or launch partners, every product can be securely linked to your account for warranty, support, and future services.
                </p>
              </div>

              <MotionStagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Secure ownership", "Each registered device is linked to your INFIBOLT account with protected ownership verification and support continuity.", ShieldCheck],
                  ["Warranty activation", "Activate coverage using your invoice and serial number to unlock warranty services and future product care.", FileCheck2],
                  ["Unified support", "Support conversations, ownership records, and warranty activity remain connected across your products.", LifeBuoy],
                  ["Marketplace ready", "Purchase through trusted launch partners including Amazon, Flipkart, and retail channels while managing ownership directly through INFIBOLT.", ShoppingCart],
                  ["Email-secured verification", "Ownership verification and account recovery use secure email authentication designed for long-term account protection.", MailCheck],
                  ["Care beyond purchase", "From setup to support, INFIBOLT remains connected to your devices throughout their ownership journey.", Sparkles],
                ].map(([title, text, Icon]) => (
                  <MotionStaggerItem key={title}>
                    <div className="group h-full rounded-[1.4rem] border border-slate-900/[0.07] bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-900/14 hover:bg-white hover:shadow-[0_26px_70px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-white/18 dark:hover:bg-white/[0.075] sm:p-6">
                      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-900/[0.06] bg-slate-950 text-white shadow-[0_14px_32px_rgba(15,23,42,0.16)] transition duration-300 group-hover:scale-[1.03] dark:border-white/12 dark:bg-white dark:text-slate-950">
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      <h3 className="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">
                        {title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {text}
                      </p>
                    </div>
                  </MotionStaggerItem>
                ))}
              </MotionStagger>
            </div>
          </motion.div>
        </div>
      </MotionSection>

      {/* Premium Support & Assistance */}
      <MotionSection className="relative overflow-hidden border-t border-slate-900/[0.06] bg-[#f7f5f0]/55 py-12 dark:border-white/5 dark:bg-white/[0.015] md:py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_78%_0%,rgba(148,163,184,0.11),transparent_42%)] opacity-70 dark:bg-[radial-gradient(circle_at_78%_0%,rgba(255,255,255,0.06),transparent_42%)]" />
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-6 md:gap-12 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.32 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[2rem] border border-slate-900/[0.07] bg-white/78 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.075)] dark:border-white/10 dark:bg-white/[0.045] sm:p-8 lg:sticky lg:top-36"
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-slate-100 blur-3xl dark:bg-white/[0.06]" />
            <div className="relative">
              <p className={sectionKickerClass}>
                Support & Assistance
              </p>
              <h2 className="luxury-title text-[2.1rem] font-semibold leading-[0.98] tracking-normal text-slate-950 dark:text-white sm:text-[2.75rem] lg:text-[3.5rem]">
                Answers designed
                <span className="editorial-italic mt-1.5 block text-[0.58em] leading-[0.95] text-slate-500 dark:text-slate-400">
                  around ownership.
                </span>
              </h2>
              <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300">
                From warranty activation to marketplace purchases, INFIBOLT keeps support simple, connected, and accessible.
              </p>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400">
                Explore the most common questions about ownership, warranty coverage, support requests, and marketplace purchases.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/support"
                  prefetch="intent"
                  className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-slate-950 px-6 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_16px_38px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_22px_52px_rgba(15,23,42,0.2)] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Contact Support
                </Link>
                <Link
                  to="/warranty"
                  prefetch="intent"
                  className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-slate-900/12 bg-white/68 px-6 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-900 shadow-[0_10px_26px_rgba(15,23,42,0.055)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_38px_rgba(15,23,42,0.09)] dark:border-white/14 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.09]"
                >
                  Register Product
                </Link>
              </div>

              <div className="mt-8 rounded-[1.4rem] border border-slate-900/[0.06] bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white shadow-[0_22px_58px_rgba(15,23,42,0.18)] dark:border-white/10">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white">
                    <LifeBuoy className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Premium care stays connected.</p>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      Your products, warranty coverage, and support history remain close to your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="relative pt-1 lg:pt-6">
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

function splitHeroTitle(value) {
  const words = String(value || "Where Sound").trim().split(/\s+/).filter(Boolean);
  return {
    first: words[0] || "Where",
    second: words.slice(1).join(" ") || "Sound",
  };
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
