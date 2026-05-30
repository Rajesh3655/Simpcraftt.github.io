import { motion } from "framer-motion";
import { ArrowRight, BatteryCharging, CheckCircle2, Gauge, Headphones, Layers3, ShieldCheck, Sparkles, Star, Waves, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  CinematicImage,
  CommerceShell,
  FAQList,
  MotionSection,
} from "../../components/commerce/CommerceLayout";
import { ProductPrice } from "../../components/commerce/pricing/ProductPrice";
import { categories as fallbackCategories, getCategoryById, products as fallbackProducts } from "../../store/commerce";
import { productService } from "../../services/productService";

const ease = [0.22, 1, 0.36, 1];
const container = "mx-auto w-full max-w-[1480px] px-5 sm:px-7 lg:px-10 xl:px-14";
const microLabel = "text-[10px] font-bold uppercase tracking-[0.26em] text-[#8B806F]";
const heading = "luxury-title text-[#0B1020]";

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.82, delay, ease },
  }),
};

export default function HomePage() {
  const [homepage, setHomepage] = useState(null);

  useEffect(() => {
    let active = true;
    const loadHomepage = () => {
      productService.homepage().then((result) => {
        if (active) setHomepage(result);
      }).catch(() => {
        if (active) setHomepage({ categories: fallbackCategories, featuredProducts: fallbackProducts, heroProducts: [] });
      });
    };
    const idleId = "requestIdleCallback" in window
      ? window.requestIdleCallback(loadHomepage, { timeout: 1300 })
      : window.setTimeout(loadHomepage, 180);
    return () => {
      active = false;
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  const featuredProducts = homepage?.featuredProducts?.length ? homepage.featuredProducts : fallbackProducts;
  const dynamicCategories = homepage?.categories?.length ? homepage.categories : fallbackCategories;
  const homepageSections = homepage?.sections || [];
  const categorySection = resolveHomepageSection(homepageSections, "home-categories", categorySectionDefaults);
  const visibleCategories = selectHomepageCategories(dynamicCategories, categorySection.categorySlugs);
  const showcaseProducts = featuredProducts.slice(0, 4);

  return (
    <CommerceShell
      seoTitle="Premium Consumer Technology"
      seoDescription="INFIBOLT builds cinematic audio, power, wearable, and connected technology with refined materials and premium ownership care."
    >
      <div className="relative isolate overflow-hidden bg-[#F6F3EE] text-[#0B1020]">
        <AmbientBackground />
        <HeroSection />
        <ProductShowcase products={showcaseProducts} categories={visibleCategories} categorySection={categorySection} />
        <WhyInfibolt />
        <ExperienceSection />
        <SpecificationSection />
        <Testimonials />
        <SupportFaq />
      </div>
    </CommerceShell>
  );
}

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      <div className="absolute inset-0 bg-[#F6F3EE]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(221,211,195,0.76),transparent_34%),radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.92),transparent_35%),linear-gradient(180deg,rgba(246,243,238,0)_0%,rgba(235,229,220,0.55)_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[calc(100svh-65px)] overflow-hidden lg:min-h-[calc(100svh-73px)]">
      <div className="absolute inset-0">
        <img
          src="/images/Litemood-hero.webp?v=20260530"
          alt="INFIBOLT premium headphones in a warm studio"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover object-[70%_50%] opacity-90"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,243,238,0.98)_0%,rgba(246,243,238,0.88)_34%,rgba(246,243,238,0.26)_68%,rgba(246,243,238,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(246,243,238,0.02)_42%,rgba(246,243,238,0.96)_100%)]" />
      </div>

      <div className={`${container} relative z-10 grid min-h-[calc(100svh-65px)] items-center gap-12 pb-14 pt-12 lg:min-h-[calc(100svh-73px)] lg:grid-cols-12 lg:pb-8`}>
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-4xl lg:col-span-7"
        >
          <motion.p variants={reveal} className={microLabel}>
            INFIBOLT Signature Series / Quiet Power Architecture
          </motion.p>
          <motion.h1
            variants={reveal}
            custom={0.08}
            className={`${heading} mt-6 max-w-[9.4ch] text-[3.5rem] font-semibold leading-[0.86] sm:text-[5.4rem] md:text-[6.4rem] lg:text-[7.15rem] xl:text-[8rem]`}
          >
            <span className="block">Where Sound</span>
            <span className="mt-2 block text-[#5E574C]">Meets</span>
            <span className="mt-2 block text-[#5E574C]">Stillness.</span>
          </motion.h1>
          <motion.p
            variants={reveal}
            custom={0.16}
            className="mt-7 max-w-2xl text-base font-light leading-8 text-[#3A4152] sm:text-lg"
          >
            Premium electronics shaped with cinematic sound, intelligent energy systems, tactile materials, and an ownership experience built to feel effortless.
          </motion.p>
          <motion.div variants={reveal} custom={0.24} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <PremiumButton href="/products" label="Explore Products" />
            <PremiumButton href="#experience" label="Experience" variant="light" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.36, ease }}
          className="grid gap-3 border-t border-[#0B1020]/10 pt-5 sm:grid-cols-3 lg:col-span-12"
        >
          {[
            ["Acoustic Core", "Low distortion spatial stage"],
            ["Material System", "Matte alloy and soft-touch finish"],
            ["Care Platform", "Warranty-first ownership"],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8B806F]">{label}</p>
              <p className="mt-2 text-sm leading-6 text-[#424958]">{value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ProductShowcase({ products, categories, categorySection }) {
  return (
    <MotionSection className="relative py-20 sm:py-24 lg:py-32">
      <div className={container}>
        <SectionIntro
          eyebrow="Product Universe"
          title={`${categorySection.settings.titleLine1} ${categorySection.settings.titleAccent}`}
          text="A connected family of audio, power, wearable, and home technology products with refined industrial design."
          action={<PremiumButton href="/products" label="View All Products" variant="light" />}
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductShowcaseCard key={product.slug} product={product} index={index} />
          ))}
        </div>
        <div className="mt-10 grid gap-3 rounded-[2rem] border border-[#0B1020]/8 bg-white/48 p-3 shadow-[0_24px_70px_rgba(11,16,32,0.06)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group flex min-h-[116px] items-center justify-between gap-4 rounded-[1.35rem] px-5 py-4 transition duration-300 hover:bg-white hover:shadow-[0_18px_42px_rgba(11,16,32,0.08)]"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A2947F]">Category</p>
                <h3 className="mt-2 text-xl font-semibold text-[#0B1020]">{category.name}</h3>
              </div>
              <ArrowRight className="h-5 w-5 text-[#8B806F] transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

function ProductShowcaseCard({ product, index }) {
  const category = getCategoryById(product.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.72, delay: index * 0.05, ease }}
      className="group relative overflow-hidden rounded-[1.35rem] border border-[#0B1020]/8 bg-white/64 p-1.5 shadow-[0_18px_52px_rgba(11,16,32,0.055)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-[0_34px_90px_rgba(11,16,32,0.12)] sm:rounded-[2rem] sm:p-2"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-[1.05rem] bg-[#ECE7DE] sm:aspect-[4/4.6] sm:rounded-[1.55rem]">
          <CinematicImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(11,16,32,0.35)_100%)] opacity-0 transition duration-500 group-hover:opacity-100" />
          <span className="absolute left-2.5 top-2.5 rounded-full border border-white/60 bg-white/62 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-[#0B1020] backdrop-blur-xl sm:left-4 sm:top-4 sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
            {product.badge}
          </span>
        </div>
        <div className="p-3 sm:p-5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <p className="truncate text-[8px] font-bold uppercase tracking-[0.16em] text-[#8B806F] sm:text-[10px] sm:tracking-[0.22em]">{category?.name || "INFIBOLT"}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B1020] sm:text-sm">
              <Star className="h-3 w-3 fill-[#BDAA82] text-[#BDAA82] sm:h-3.5 sm:w-3.5" />
              {product.rating || "4.8"}
            </span>
          </div>
          <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-tight text-[#0B1020] sm:mt-4 sm:text-2xl">{product.name}</h3>
          <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-[#5A6170] sm:mt-3 sm:min-h-[3.5rem] sm:text-sm sm:leading-6">{product.summary}</p>
          <div className="mt-4 flex items-end justify-between gap-2 sm:mt-6 sm:gap-4">
            <ProductPrice product={product} label="" variant="card" showOffer={false} className="min-w-0" />
            <span className="inline-flex items-center gap-1 text-[0] font-bold uppercase tracking-[0.18em] text-[#0B1020] sm:gap-2 sm:text-[11px]">
              <span className="hidden sm:inline">View Details</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function WhyInfibolt() {
  const stories = [
    {
      icon: Gauge,
      title: "Precision Engineering",
      text: "Every enclosure, control surface, and acoustic chamber is tuned for repeatable performance and a calmer ownership experience.",
      image: "/images/optimized/products/hero-sec.webp",
    },
    {
      icon: Headphones,
      title: "Premium Acoustics",
      text: "Low-distortion tuning, adaptive microphones, and immersive staging turn everyday listening into a composed cinematic field.",
      image: "/images/Litemood-hero.webp?v=20260530",
    },
    {
      icon: BatteryCharging,
      title: "Intelligent Battery",
      text: "Thermal awareness, reserve planning, and fast charging work quietly in the background so your devices stay ready.",
      image: "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&q=82&w=1400",
    },
    {
      icon: Sparkles,
      title: "Luxury Comfort",
      text: "Soft-touch finishes, balanced weight, and tactile details create products that look disciplined and feel effortless.",
      image: "/images/optimized/Darkmood-hero.webp",
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
      <div className={container}>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className={microLabel}>Why INFIBOLT</p>
            <h2 className={`${heading} mt-5 max-w-5xl text-[3rem] font-semibold leading-[0.92] sm:text-[4.5rem] lg:text-[5.8rem]`}>
              Designed with restraint. Built with obsession.
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="max-w-xl text-base leading-8 text-[#52596A]">
              A disciplined product language: fewer distractions, finer materials, and technology that feels calm before it feels powerful.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(250px,auto)]">
          {stories.map((story, index) => (
            <EditorialStory key={story.title} story={story} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialStory({ story, index }) {
  const Icon = story.icon;
  const featured = index === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.82, delay: index * 0.04, ease }}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/58 shadow-[0_28px_90px_rgba(11,16,32,0.075)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:bg-white/72 hover:shadow-[0_36px_110px_rgba(11,16,32,0.12)] ${
        featured ? "md:col-span-2 lg:col-span-6 lg:row-span-2" : "lg:col-span-6"
      }`}
    >
      <div className={featured ? "grid h-full min-h-[560px] grid-rows-[1fr_auto]" : "grid h-full min-h-[310px] lg:grid-cols-[0.92fr_1.08fr]"}>
        <div className={`relative overflow-hidden ${featured ? "min-h-[360px]" : "min-h-[240px] lg:min-h-full"}`}>
          <CinematicImage src={story.image} alt={story.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(11,16,32,0.18)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/45 bg-white/62 text-[#0B1020] shadow-[0_18px_42px_rgba(11,16,32,0.16)] backdrop-blur-xl">
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </div>
        </div>
        <div className={`relative flex flex-col justify-center ${featured ? "p-7 sm:p-9 lg:p-11" : "p-6 sm:p-8 lg:p-10"}`}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.74),rgba(246,243,238,0.5))]" />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9B8D78]">
              0{index + 1} / Design Pillar
            </p>
            <h3 className={`${featured ? "mt-5 text-[2.45rem] sm:text-[3.35rem]" : "mt-4 text-[2rem] sm:text-[2.55rem]"} max-w-xl font-semibold leading-[0.96] text-[#0B1020]`}>
              {story.title}
            </h3>
            <p className={`${featured ? "mt-6 text-base sm:text-lg" : "mt-5 text-sm sm:text-base"} max-w-xl leading-8 text-[#596070]`}>
              {story.text}
            </p>
            <div className="mt-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B806F]">
              <span className="h-px w-10 bg-[#BDAA82]" />
              <span>Production Ready Detail</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ExperienceSection() {
  return (
    <section id="experience" className="relative overflow-hidden bg-[#07090D] py-20 text-white sm:py-24 lg:py-32">
      <div className="absolute inset-0">
        <img
          src="/images/optimized/Darkmood-hero.webp"
          alt="Dark cinematic INFIBOLT product atmosphere"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-[70%_50%] opacity-38"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_28%,rgba(213,193,151,0.22),transparent_28%),linear-gradient(90deg,rgba(7,9,13,0.98)_0%,rgba(7,9,13,0.82)_45%,rgba(7,9,13,0.52)_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className={`${container} relative z-10`}>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.82, ease }}
            className="lg:col-span-6"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C9B992]">Immersive Experience</p>
            <h2 className="luxury-title mt-6 max-w-3xl text-[3.2rem] font-semibold leading-[0.9] text-white sm:text-[5rem] lg:text-[6rem]">
              Power you feel. Silence you notice.
            </h2>
            <p className="mt-7 max-w-xl text-base font-light leading-8 text-white/72">
              An experience layer where acoustic control, battery intelligence, and premium materials converge into one calm technology ecosystem.
            </p>
          </motion.div>

          <div className="lg:col-span-6">
            <SoundWave />
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["42 dB", "Adaptive noise control"],
                ["40 hr", "Long range playback"],
                ["12 mo", "Connected warranty care"],
              ].map(([value, label]) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.72, ease }}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl"
                >
                  <p className="text-4xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/58">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SoundWave() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 shadow-[0_34px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,185,146,0.18),transparent_58%)]" />
      <div className="relative flex h-72 items-center justify-center gap-2">
        {Array.from({ length: 36 }).map((_, index) => (
          <motion.span
            key={index}
            animate={{ scaleY: [0.22, 1, 0.35, 0.82, 0.22] }}
            transition={{ duration: 2.8 + (index % 5) * 0.16, repeat: Infinity, delay: index * 0.035, ease: "easeInOut" }}
            className="h-28 w-1 rounded-full bg-gradient-to-b from-white/20 via-[#D8C698] to-white/20"
            style={{ opacity: 0.32 + (index % 6) * 0.08 }}
          />
        ))}
      </div>
    </div>
  );
}

function SpecificationSection() {
  const specs = [
    ["Driver", "40mm graphene composite", Headphones],
    ["Charging", "USB-C fast charge", Zap],
    ["Protection", "Warranty-first care", ShieldCheck],
    ["Control", "Low-latency mode", Layers3],
  ];

  return (
    <MotionSection className="py-20 sm:py-24 lg:py-32">
      <div className={container}>
        <div className="rounded-[2.4rem] border border-[#0B1020]/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.76),rgba(230,223,211,0.52))] p-6 shadow-[0_34px_100px_rgba(11,16,32,0.08)] backdrop-blur-xl sm:p-9 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <p className={microLabel}>Luxury Specification</p>
              <h2 className={`${heading} mt-5 text-[2.8rem] font-semibold leading-[0.94] sm:text-[4.3rem]`}>
                Details engineered to disappear into use.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-[#596070] lg:col-span-6">
              From acoustic architecture to service coverage, every layer is designed to make the product feel quiet, capable, and complete.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {specs.map(([label, value, Icon]) => (
              <div key={label} className="rounded-[1.5rem] border border-[#0B1020]/8 bg-white/62 p-6">
                <Icon className="h-6 w-6 text-[#8B806F]" strokeWidth={1.8} />
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9A8D78]">{label}</p>
                <p className="mt-2 text-lg font-semibold text-[#0B1020]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MotionSection>
  );
}

function Testimonials() {
  const quotes = [
    ["The design language feels calm, technical, and unusually premium for the category.", "Retail launch partner"],
    ["INFIBOLT products have the kind of restraint that makes hardware feel more expensive.", "Industrial design advisor"],
    ["The warranty-first ownership layer is a serious advantage for marketplace-first electronics.", "Consumer tech analyst"],
  ];

  return (
    <section className="overflow-hidden py-20 sm:py-24">
      <div className={container}>
        <SectionIntro
          eyebrow="Early Signal"
          title="A brand system built for trust at first sight."
          text="Premium hardware is only part of the impression. The experience around the product has to feel just as refined."
        />
        <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none]">
          {quotes.map(([quote, author]) => (
            <article key={quote} className="min-w-[82%] snap-start rounded-[2rem] border border-[#0B1020]/8 bg-white/58 p-7 shadow-[0_24px_70px_rgba(11,16,32,0.06)] backdrop-blur-xl sm:min-w-[420px] lg:min-w-[31%]">
              <div className="flex gap-1 text-[#BDAA82]">
                {Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-8 text-xl font-semibold leading-8 text-[#0B1020]">"{quote}"</p>
              <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8B806F]">{author}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportFaq() {
  return (
    <MotionSection className="py-20 sm:py-24 lg:py-32">
      <div className={`${container} grid gap-10 lg:grid-cols-12 lg:items-start`}>
        <div className="lg:sticky lg:top-28 lg:col-span-5">
          <p className={microLabel}>Ownership Care</p>
          <h2 className={`${heading} mt-5 text-[2.9rem] font-semibold leading-[0.94] sm:text-[4.35rem]`}>
            Premium support, without the friction.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#596070]">
            Register products, activate warranty, and get connected support after marketplace or retail purchase.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PremiumButton href="/warranty" label="Register Product" />
            <PremiumButton href="/support" label="Get Support" variant="light" />
          </div>
        </div>
        <div className="lg:col-span-7">
          <FAQList />
        </div>
      </div>
    </MotionSection>
  );
}

function SectionIntro({ eyebrow, title, text, action }) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        <p className={microLabel}>{eyebrow}</p>
        <h2 className={`${heading} mt-5 max-w-5xl text-[2.9rem] font-semibold leading-[0.93] sm:text-[4.6rem] lg:text-[5.4rem]`}>
          {title}
        </h2>
      </div>
      <div className="lg:col-span-4">
        <p className="text-base leading-8 text-[#596070]">{text}</p>
        {action && <div className="mt-7">{action}</div>}
      </div>
    </div>
  );
}

function PremiumButton({ href, label, variant = "dark" }) {
  const dark = variant === "dark";
  return (
    <Link
      to={href}
      prefetch="intent"
      className={`group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full px-7 text-[11px] font-bold uppercase tracking-[0.18em] transition duration-300 hover:-translate-y-0.5 ${
        dark
          ? "bg-[#0B1020] text-white shadow-[0_18px_45px_rgba(11,16,32,0.22)] hover:shadow-[0_24px_58px_rgba(11,16,32,0.3)]"
          : "border border-[#0B1020]/12 bg-white/54 text-[#0B1020] shadow-[0_14px_34px_rgba(11,16,32,0.07)] backdrop-blur-xl hover:bg-white hover:shadow-[0_20px_48px_rgba(11,16,32,0.11)]"
      }`}
    >
      {label}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </Link>
  );
}

const categorySectionDefaults = {
  enabled: true,
  categorySlugs: [],
  settings: {
    titleLine1: "Instruments of",
    titleAccent: "Clarity",
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
  const selected = new Set(categorySlugs.map((slug) => String(slug).toLowerCase()));
  return categories
    .filter((category) => selected.has(String(category.slug || category.id).toLowerCase()))
    .sort((a, b) => categorySlugs.indexOf(a.slug || a.id) - categorySlugs.indexOf(b.slug || b.id))
    .slice(0, 4);
}
