import { motion } from "framer-motion";
import { Box, Headphones, Shield, ShieldCheck, ShoppingCart, SlidersHorizontal, Sparkles, UserRound, Watch, Zap } from "lucide-react";
import { Link } from "react-router";
import {
  CollectionGrid,
  CommerceShell,
  FAQList,
  FutureCommerceNotice,
  MotionSection,
  MotionStagger,
  MotionStaggerItem,
  ProductGrid,
  SecondaryButton,
} from "./components/commerce/CommerceLayout";
import { categories, products } from "./data/commerce";

const sectionKickerClass = "mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300";
const sectionHeadingClass = "luxury-title text-[2.25rem] font-semibold leading-[0.98] tracking-[-0.02em] text-slate-900 sm:text-[3rem] md:text-[3.7rem] lg:text-[4.6rem] dark:text-white";
const sectionHeadingAccentClass = "mt-1.5 block font-luxury text-[0.9em] italic font-normal tracking-[0.01em] text-slate-500 dark:text-slate-400";

export default function HomePage() {
  return (
    <CommerceShell
      seoTitle="Technology for the Quiet Future"
      seoDescription="Premium electronics engineered for deep focus, cinematic sound, and long-term ownership."
    >
      {/* Cinematic Hero - Full Bleed Editorial Entrance */}
      <section className="relative overflow-hidden bg-[#f4eee3] lg:min-h-[88vh] lg:dark:bg-[#090805]">
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-65px)] w-screen max-w-none flex-col overflow-hidden px-5 pb-28 pt-7 sm:min-h-[88vh] sm:px-8 sm:pb-32 sm:pt-9 lg:hidden">
          <img
            src="/images/Litemood-hero.png"
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
              Simpcraftt Edition 01 / Audio Object
            </p>
            <h1 className="max-w-[8.8ch] text-[3.35rem] font-medium leading-[0.88] tracking-normal text-slate-950 min-[390px]:text-[3.9rem] sm:text-[5.75rem]">
              Where Sound
              <br />
              <span className="font-luxury italic font-normal text-slate-900/58">Meets</span>
              <br />
              Stillness.
            </h1>
            <p className="mt-5 w-full max-w-[20.5rem] text-[0.95rem] font-light leading-[1.7] text-slate-700 sm:mt-7 sm:max-w-[34rem] sm:text-lg">
              Premium electronics engineered for deep focus: cinematic sound, refined materials, and modern rituals shaped around silence.
            </p>
          </motion.div>

          <div className="relative z-10 mt-7 grid w-full max-w-[22rem] gap-3 sm:mt-10 sm:max-w-[360px]">
            <Link
              to="/products"
              prefetch="intent"
              className="inline-flex min-h-[58px] items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_44px_rgba(15,23,42,0.18)] transition-transform duration-200 active:scale-[0.98]"
            >
              Explore Collection
            </Link>
            <Link
              to="/about"
              prefetch="intent"
              className="inline-flex min-h-[58px] items-center justify-center rounded-full border border-slate-950/38 bg-white/14 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950/88 backdrop-blur-sm transition-transform duration-200 active:scale-[0.98]"
            >
              Our Philosophy
            </Link>
          </div>

          <div className="relative z-10 mt-10 w-full max-w-[22rem] divide-y divide-slate-950/10 sm:mt-14 sm:max-w-[520px]">
            {[
              ["Material", "Soft-touch acoustic finish", Sparkles],
              ["Sound", "Low-distortion cinematic stage", Headphones],
              ["Care", "Warranty-first ownership", Shield],
            ].map(([label, value, Icon]) => (
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
            src="/images/Litemood-hero.png"
            alt="Aura Audio Pro in a bright luxury studio setting"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[68%_50%] opacity-100 transition-opacity duration-500 lg:dark:opacity-0"
          />
          <img
            src="/images/Darkmood-hero.png"
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
                  Simpcraftt Edition 01 / Audio Object
                </p>
              </MotionStaggerItem>
              <MotionStaggerItem>
                <h1 className="max-w-[9.8ch] text-[8.6rem] font-medium leading-[0.9] tracking-normal text-slate-950 lg:dark:text-white">
                  Where Sound
                  <br />
                  <span className="font-luxury italic font-normal text-slate-900/62 lg:dark:text-white/86">Meets</span>
                  <br />
                  Stillness.
                </h1>
              </MotionStaggerItem>
              <MotionStaggerItem>
                <p className="mt-7 max-w-[31rem] text-lg font-light leading-[1.75] text-slate-800/78 lg:dark:text-white/88">
                  Premium electronics engineered for deep focus: cinematic sound, refined materials, and modern rituals shaped around silence.
                </p>
              </MotionStaggerItem>
            </MotionStagger>
            <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3">
              <Link
                to="/products"
                prefetch="intent"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-slate-950 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_18px_48px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 lg:dark:bg-white lg:dark:text-slate-950 lg:dark:shadow-[0_18px_48px_rgba(255,255,255,0.18)] lg:dark:hover:bg-[#f4f1e8] lg:dark:hover:shadow-[0_22px_60px_rgba(255,255,255,0.24)]"
              >
                Explore Collection
              </Link>
              <Link
                to="/about"
                prefetch="intent"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-slate-950/20 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950/82 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-950/45 hover:bg-white/30 lg:dark:border-white/28 lg:dark:text-white/88 lg:dark:hover:border-white/55 lg:dark:hover:bg-white/10"
              >
                Our Philosophy
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
              ["Material", "Soft-touch acoustic finish"],
              ["Sound", "Low-distortion cinematic stage"],
              ["Care", "Warranty-first ownership"],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-900/40 lg:dark:text-white/55">{label}</p>
                <p className="mt-2 text-sm font-light leading-6 text-slate-800/72 lg:dark:text-white/84">{value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories - Minimal Split */}
      <MotionSection className="py-10 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-8 lg:px-12">
           <div className="mb-6 text-center md:mb-12">
              <h2 className={`${sectionHeadingClass} text-center`}>
                Instruments of
                <span className={sectionHeadingAccentClass}>Clarity</span>
              </h2>
           </div>
           
           <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8 lg:gap-12">
            {categories.map((category, index) => {
              const icons = [Headphones, Watch, Zap, Box];
              const Icon = icons[index] ?? Sparkles;

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
      </MotionSection>

      {/* Featured Products - Editorial Image First */}
      <MotionSection className="bg-slate-50/50 py-10 dark:bg-white/[0.01] md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-8 lg:px-12">
          <div className="mb-6 flex flex-col items-start justify-between gap-6 md:mb-12 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className={sectionKickerClass}>
                Signature Objects
              </p>
              <h2 className={sectionHeadingClass}>
                Engineered for
                <span className={sectionHeadingAccentClass}>
                  modern silence.
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
          <ProductGrid items={products.slice(0, 3)} />
        </div>
      </MotionSection>

      {/* Platform Features - Minimalist List */}
      <MotionSection className="py-10 md:py-16 lg:py-20">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-6 md:gap-12 md:px-8 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16 lg:px-12">
          <div className="sticky top-40">
            <p className={sectionKickerClass}>
              Platform Architecture
            </p>
            <h2 className={sectionHeadingClass}>
              A foundation
              <span className={sectionHeadingAccentClass}>
                built for ownership.
              </span>
            </h2>
            <p className="mt-8 max-w-md text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">
              Our ecosystem bridges the gap between third-party marketplaces and direct relationships. Register your product, claim warranty, and prepare for a unified checkout experience.
            </p>
            <div className="mt-12">
              <FutureCommerceNotice />
            </div>
          </div>
          
          <div className="flex flex-col gap-8 pt-4 md:gap-12 md:pt-8">
            {[
              ["Marketplace routing", "Seamlessly transition from discovery to purchase with intelligent routing to preferred partners like Amazon and Flipkart, or prepare for our upcoming direct checkout.", ShoppingCart],
              ["Warranty ownership", "A streamlined digital vault for your product registrations, secure invoice uploads, and real-time support ticket tracking.", ShieldCheck],
              ["Unified customer profiles", "Your personal ecosystem hub. Manage secure addresses, comprehensive order histories, curated wishlists, and registered devices.", UserRound],
              ["Centralized admin control", "A powerful command center for governing product lifecycles, dynamic storefront visibility, customer engagement, and warranty claims.", SlidersHorizontal],
            ].map(([title, text, Icon]) => (
              <div key={title} className="group border-t border-slate-200 pt-8 dark:border-white/10">
                <Icon className="mb-6 h-6 w-6 text-slate-400 dark:text-slate-400" />
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 md:text-xl dark:text-white">{title}</h3>
                <p className="mt-4 text-base font-light leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Collections - Cinematic Full Bleed */}
      <MotionSection className="py-10 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-8 lg:px-12">
          <div className="mb-6 text-center md:mb-12">
            <p className={sectionKickerClass}>
              Curated Sets
            </p>
            <h2 className={sectionHeadingClass}>
              Ecosystems for
              <span className={sectionHeadingAccentClass}>
                creative professionals.
              </span>
            </h2>
          </div>
          <CollectionGrid />
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
            <p className="mt-8 max-w-sm text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">
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
