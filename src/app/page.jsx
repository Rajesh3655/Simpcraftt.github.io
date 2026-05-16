import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router";
import { BadgeCheck, Box, Headphones, Sparkles, Watch, Zap } from "lucide-react";
import {
  CollectionGrid,
  CommerceShell,
  FAQList,
  FutureCommerceNotice,
  PrimaryButton,
  ProductGrid,
  SecondaryButton
} from "./components/commerce/CommerceLayout";
import { categories, products } from "./data/commerce";

const heroProduct = products[0];

export default function HomePage() {
  const { scrollY } = useScroll();
  const textY = useTransform(scrollY, [0, 800], [0, 200]);
  const textOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const imageY = useTransform(scrollY, [0, 1000], [0, -100]);
  const imageScale = useTransform(scrollY, [0, 800], [1, 1.05]);

  return (
    <CommerceShell>
      {/* Cinematic Hero - Editorial Layout */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-24 md:pt-40 lg:px-24">
        <div className="mx-auto w-full max-w-[1400px] flex flex-col items-center text-center">
          <motion.div
            style={{ y: textY, opacity: textOpacity }}
            className="relative z-20 flex flex-col items-center pt-12 lg:pt-0 max-w-5xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Simpcraftt Edition 01
              </p>
              <h1 className="text-6xl font-normal leading-[1.05] tracking-tight text-slate-900 sm:text-7xl md:text-8xl lg:text-[9rem] dark:text-white">
                Technology <br />
                <span className="font-luxury italic text-slate-500 dark:text-slate-400">for the</span> <br />
                Quiet Future.
              </h1>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero Image - Cinematic Layering */}
        <motion.div
          style={{ y: imageY, scale: imageScale }}
          className="relative z-10 mx-auto w-full max-w-6xl mt-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[16/9] w-full overflow-hidden shadow-none lg:aspect-[21/9] bg-transparent rounded-none"
          >
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface dark:from-surface-dark to-transparent z-10" />
            <img
              src={heroProduct.image}
              alt="Aura Audio Pro"
              className="h-full w-full object-cover transition-transform duration-[3s] hover:scale-[1.02] ease-[cubic-bezier(0.16,1,0.3,1)] opacity-95 dark:opacity-80 mix-blend-multiply dark:mix-blend-screen"
            />
          </motion.div>
        </motion.div>

        {/* Hero Bottom Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="mx-auto mt-16 max-w-2xl text-center z-20"
        >
          <p className="text-lg font-light leading-relaxed text-slate-600 sm:text-xl dark:text-slate-400">
            Premium electronics engineered for deep focus. Cinematic sound, refined materials, and an interface built around modern rituals.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <PrimaryButton href="/products">Explore collection</PrimaryButton>
            <SecondaryButton href="/about">Our philosophy</SecondaryButton>
          </div>
        </motion.div>
      </section>

      {/* Categories - Minimal Split */}
      <section className="px-6 py-32 lg:px-24 lg:py-48">
        <div className="mx-auto max-w-[1400px]">
           <div className="mb-24 text-center">
              <h2 className="text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Instruments of <span className="font-luxury italic text-slate-500">Clarity</span>
              </h2>
           </div>
           
           <div className="grid gap-12 md:grid-cols-4">
            {categories.map((category, index) => {
              const icons = [Headphones, Watch, Zap, Box];
              const Icon = icons[index] ?? Sparkles;

              return (
                <a
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="group flex flex-col items-center text-center transition-all duration-700 hover:-translate-y-1"
                >
                  <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 dark:bg-white/[0.02] transition-colors duration-500 group-hover:bg-slate-100 dark:group-hover:bg-white/[0.05]">
                    <Icon className="h-8 w-8 text-slate-400 transition-transform duration-700 group-hover:scale-110 dark:text-slate-500" />
                  </div>
                  <h3 className="text-sm font-medium tracking-widest uppercase text-slate-900 dark:text-white">{category.name}</h3>
                  <p className="mt-3 max-w-[200px] text-sm font-light leading-relaxed text-slate-500 dark:text-slate-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100">{category.description}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products - Editorial Image First */}
      <section className="px-6 py-32 bg-slate-50/50 dark:bg-white/[0.01] lg:px-24 lg:py-48">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-24 flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Signature Objects
              </p>
              <h2 className="text-5xl font-normal tracking-tight text-slate-900 md:text-6xl lg:text-7xl dark:text-white">
                Engineered for <br />
                <span className="font-luxury italic text-slate-500">modern silence.</span>
              </h2>
            </div>
            <SecondaryButton href="/products">View all products</SecondaryButton>
          </div>
          <ProductGrid items={products.slice(0, 3)} />
        </div>
      </section>

      {/* Platform Features - Minimalist List */}
      <section className="px-6 py-32 lg:px-24 lg:py-48">
        <div className="mx-auto grid max-w-[1400px] gap-20 lg:grid-cols-[1fr_1fr] lg:gap-32 lg:items-start">
          <div className="sticky top-40">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Platform Architecture
            </p>
            <h2 className="text-4xl font-normal tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white">
              A foundation <br />
              <span className="font-luxury italic text-slate-500">built for ownership.</span>
            </h2>
            <p className="mt-8 max-w-md text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">
              Our ecosystem bridges the gap between third-party marketplaces and direct relationships. Register your product, claim warranty, and prepare for a unified checkout experience.
            </p>
            <div className="mt-12">
              <FutureCommerceNotice />
            </div>
          </div>
          
          <div className="flex flex-col gap-16 pt-8">
            {[
              ["Marketplace redirects", "Per-product Amazon, Flipkart, and Buy Now links."],
              ["Warranty ownership", "Registration, claim tickets, invoice upload, and status flow."],
              ["Customer accounts", "Profile, addresses, order history, wishlist, and registered products."],
              ["Admin control", "Products, categories, banners, visibility, users, and claims."],
            ].map(([title, text]) => (
              <div key={title} className="group border-t border-slate-200 pt-8 dark:border-white/10 transition-colors hover:border-slate-400 dark:hover:border-white/30">
                <BadgeCheck className="mb-6 h-6 w-6 text-slate-400 dark:text-slate-500" />
                <h3 className="text-xl font-normal tracking-tight text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-4 text-base font-light leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections - Cinematic Full Bleed */}
      <section className="px-6 py-32 lg:px-24 lg:py-48">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-24 text-center">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Curated Sets
            </p>
            <h2 className="text-5xl font-normal tracking-tight text-slate-900 md:text-6xl lg:text-7xl dark:text-white">
              Ecosystems for <br />
              <span className="font-luxury italic text-slate-500">creative professionals.</span>
            </h2>
          </div>
          <CollectionGrid />
        </div>
      </section>

      {/* Support & FAQ - Clean Layout */}
      <section className="px-6 py-32 border-t border-slate-100 dark:border-white/5 lg:px-24 lg:py-48">
        <div className="mx-auto grid max-w-[1400px] gap-20 lg:grid-cols-[1fr_1.5fr] lg:gap-32 lg:items-start">
          <div className="sticky top-40">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Assistance
            </p>
            <h2 className="text-4xl font-normal tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white">
              Common <br />
              <span className="font-luxury italic text-slate-500">queries</span> answered.
            </h2>
            <p className="mt-8 max-w-sm text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">
              We believe in transparent policies, clear warranty terms, and accessible customer care.
            </p>
            <div className="mt-12">
              <SecondaryButton href="/support">Contact support</SecondaryButton>
            </div>
          </div>
          <div className="pt-8">
            <FAQList />
          </div>
        </div>
      </section>
    </CommerceShell>
  );
}
