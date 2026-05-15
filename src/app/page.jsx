import { motion } from "motion/react";
import { ArrowRight, BadgeCheck, Box, Headphones, ShieldCheck, Sparkles, Watch, Zap } from "lucide-react";
import {
  CollectionGrid,
  CommerceShell,
  FAQList,
  FeatureBand,
  FutureCommerceNotice,
  PrimaryButton,
  ProductGrid,
  SecondaryButton,
} from "./components/commerce/CommerceLayout";
import { categories, products } from "./data/commerce";

const heroProduct = products[0];

export default function HomePage() {
  return (
    <CommerceShell>
      <section className="relative min-h-[calc(100vh-76px)] overflow-hidden px-5 py-8 md:py-10">
        <div className="absolute inset-0">
          <img
            src={heroProduct.image}
            alt={heroProduct.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,7,0.92),rgba(5,6,7,0.62),rgba(5,6,7,0.24))]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f6f7f4] to-transparent dark:from-[#050607]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-140px)] max-w-7xl items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl py-20 text-white"
          >
            <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
              Marketplace-first ecommerce platform
            </p>
            <h1 className="luxury-heading text-5xl md:text-7xl lg:text-8xl">
              Simpcraftt
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/76">
              Premium electronics, warranty care, customer accounts, and future-ready ecommerce architecture built around cinematic product storytelling.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/products">
                Explore Products <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
              <SecondaryButton href="/warranty">Register Warranty</SecondaryButton>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {categories.map((category, index) => {
            const icons = [Headphones, Watch, Zap, Box];
            const Icon = icons[index] ?? Sparkles;

            return (
              <a
                key={category.id}
                href={`/products?category=${category.id}`}
                className="rounded-lg border border-black/10 bg-white/72 p-6 transition hover:-translate-y-1 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:hover:bg-white/10"
              >
                <Icon className="mb-5 h-6 w-6 text-emerald-700 dark:text-emerald-300" />
                <h2 className="text-xl font-black">{category.name}</h2>
                <p className="mt-3 text-sm leading-6 text-black/62 dark:text-white/62">{category.description}</p>
              </a>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                Launch products
              </p>
              <h2 className="luxury-title text-4xl md:text-6xl">Built to be discovered, bought, and supported.</h2>
            </div>
            <SecondaryButton href="/products">View Catalogue</SecondaryButton>
          </div>
          <ProductGrid items={products.slice(0, 3)} />
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              Commerce roadmap
            </p>
            <h2 className="luxury-title text-4xl md:text-6xl">Marketplace now. Direct ecommerce next.</h2>
            <p className="mt-6 leading-8 text-black/64 dark:text-white/64">
              Product pages already support Amazon, Flipkart, and custom marketplace links. Cart, checkout, coupons, payments, orders, addresses, and tracking are visually staged for the future direct-commerce release.
            </p>
            <div className="mt-7">
              <FutureCommerceNotice />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Marketplace redirects", "Per-product Amazon, Flipkart, and Buy Now links."],
              ["Warranty ownership", "Registration, claim tickets, invoice upload, and status flow."],
              ["Customer accounts", "Profile, addresses, order history, wishlist, and registered products."],
              ["Admin control", "Products, categories, banners, visibility, users, and claims."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.045]">
                <BadgeCheck className="mb-5 h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/62 dark:text-white/62">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              Collections
            </p>
            <h2 className="luxury-title text-4xl md:text-6xl">Product families for real workflows.</h2>
          </div>
          <CollectionGrid />
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <FeatureBand />
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              Support ecosystem
            </p>
            <h2 className="luxury-title text-4xl md:text-6xl">Care is part of the product.</h2>
            <p className="mt-6 leading-8 text-black/64 dark:text-white/64">
              Warranty registration, claim tickets, WhatsApp support, FAQs, and contact flows are all ready for customer engagement from day one.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/support">
                Get Support <ShieldCheck className="h-4 w-4" />
              </PrimaryButton>
              <SecondaryButton href="/warranty">Warranty Registration</SecondaryButton>
            </div>
          </div>
          <FAQList />
        </div>
      </section>
    </CommerceShell>
  );
}
