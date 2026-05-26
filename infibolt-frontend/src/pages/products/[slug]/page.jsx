import {
  BatteryCharging,
  Bluetooth,
  ChevronDown,
  Cpu,
  ExternalLink,
  Headphones,
  ImageOff,
  PackageCheck,
  Radio,
  ShieldCheck,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ErrorState, PageLoader } from "../../../components/AppStates";
import { CommerceShell, MotionSection, ProductGrid } from "../../../components/commerce/CommerceLayout";
import { uploadUrl } from "../../../config/api";
import { productService } from "../../../services/productService";
import { formatPrice } from "../../../store/commerce";

const iconMap = {
  anc: Headphones,
  audio: Headphones,
  battery: BatteryCharging,
  bluetooth: Bluetooth,
  charge: Zap,
  chip: Cpu,
  connectivity: Radio,
  spatial: Waves,
  sparkles: Sparkles,
  warranty: ShieldCheck,
};

const specGroups = ["Audio", "Battery", "Connectivity", "Build", "Compatibility"];
const defaultHighlightLabels = new Set([
  "marketplace-ready purchase",
  "warranty support",
  "premium industrial design",
]);
const marketplacePartners = [
  ["Amazon", "amazon"],
  ["Flipkart", "flipkart"],
  ["Reliance Digital", "relianceDigital"],
  ["Croma", "croma"],
];

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    Promise.all([productService.detail(slug), productService.list()])
      .then(([details, productList]) => {
        if (!active) return;
        const items = productList.items || [];
        const selectedRelated = selectRelatedProducts(details, items);
        setProduct(details);
        setRelatedProducts(selectedRelated);
        setStatus("success");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Unable to load product.");
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (status === "loading") {
    return (
      <CommerceShell seoTitle="Loading product" seoDescription="Preparing Infibolt product details.">
        <MotionSection className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <PageLoader label="Loading product details" />
          </div>
        </MotionSection>
      </CommerceShell>
    );
  }

  if (status === "error" || !product) {
    return (
      <CommerceShell seoTitle="Product unavailable" seoDescription="This Infibolt product is not available.">
        <MotionSection className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <ErrorState description={error || "Product not found."} onRetry={() => window.location.reload()} />
          </div>
        </MotionSection>
      </CommerceShell>
    );
  }

  const metadata = resolveMetadata(product);
  const structuredData = buildProductSchema(product, metadata);

  return (
    <CommerceShell seoTitle={metadata.title} seoDescription={metadata.description}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(structuredData) }} />
      <div className="bg-[#f5f5f3] text-[#111316]">
        <ProductBreadcrumbs product={product} />
        <HeroProductSection product={product} />
        <QuickHighlights product={product} />
        <PremiumStory product={product} />
        <FeatureBlocks product={product} />
        <Specifications product={product} />
        <MarketplaceSection product={product} />
        <WarrantyOwnership product={product} />
        <RelatedProducts product={product} products={relatedProducts} />
        <FaqSection product={product} />
      </div>
    </CommerceShell>
  );
}

function ProductBreadcrumbs({ product }) {
  const categorySlug = product.categorySlug || slugify(product.category);
  const categoryLabel = product.category || "Products";
  const items = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    ...(categorySlug ? [{ label: categoryLabel, href: `/products?category=${categorySlug}` }] : []),
    { label: product.name },
  ];

  return (
    <nav aria-label="Breadcrumb" className="border-b border-black/[0.06] bg-white/86 px-4 backdrop-blur-xl sm:px-6">
      <ol className="mx-auto flex h-10 max-w-[1360px] items-center gap-2 overflow-x-auto whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.16em] text-black/42">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {item.href && !isLast ? (
                <Link to={item.href} prefetch="intent" className="transition hover:text-[#111316]">
                  {item.label}
                </Link>
              ) : (
                <span className={`truncate ${isLast ? "max-w-[48vw] text-[#111316] sm:max-w-none" : ""}`}>{item.label}</span>
              )}
              {!isLast && <span className="text-black/24">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function HeroProductSection({ product }) {
  const channels = getMarketplaceChannels(product);
  const isOutOfStock = isProductOutOfStock(product);
  const isComingSoon = isProductComingSoon(product);
  const isUnavailable = isOutOfStock || isComingSoon;

  return (
    <section className="border-b border-black/[0.06] bg-[#f5f5f3] px-4 pb-12 pt-8 sm:px-6 lg:pb-20 lg:pt-9">
      <div className="mx-auto grid max-w-[1360px] gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.78fr)] lg:gap-16">
        <ProductMediaGallery product={product} />
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="py-2 lg:py-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black/52">
                {product.category || "Infibolt"}
              </span>
              {(product.newLaunch || product.badge) && (
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white ${isOutOfStock ? "bg-rose-700" : "bg-[#111316]"}`}>
                  {isOutOfStock ? "Out of Stock" : isComingSoon ? "Coming Soon" : product.badge || "Launch"}
                </span>
              )}
            </div>

            <h1 className="mt-6 text-[2.8rem] font-semibold leading-[0.94] tracking-normal text-[#111316] sm:text-6xl lg:text-[5.25rem]">
              {product.name}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-black/62 sm:text-xl sm:leading-8">
              {product.subtitle || product.summary}
            </p>

            <div className="mt-8 border-y border-black/[0.08] py-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">Launch price</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <p className="text-4xl font-semibold tracking-normal text-[#111316]">{formatPrice(product.price || 0)}</p>
                {product.comparePrice > product.price && <p className="pb-1 text-sm text-black/35 line-through">{formatPrice(product.comparePrice)}</p>}
              </div>
            </div>

            <div className="mt-6 border-l-2 border-[#111316] py-1 pl-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#111316]">
                {isOutOfStock ? "Currently out of stock" : isComingSoon ? "Coming soon" : product.marketplace?.launchStatus || "Available through trusted launch partners"}
              </p>
              <p className="mt-2 text-sm leading-6 text-black/58">
                {isOutOfStock
                  ? "This product is temporarily unavailable through launch partners. Marketplace links will return when availability is restored."
                  : isComingSoon
                  ? "This product is not available for purchase yet. Marketplace partner links will appear when the launch opens."
                  : warrantySupportCopy(product)}
              </p>
            </div>

            {getHighlights(product).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {getHighlights(product).map((highlight) => (
                  <span key={highlight.label} className="rounded-full border border-black/10 bg-white/70 px-3 py-2 text-xs font-semibold text-black/66">
                    {highlight.label}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 grid gap-3">
              {!isUnavailable && channels.map((channel, index) => (
                <MarketplaceButton key={channel.label} channel={channel} product={product} primary={index === 0} context="hero" />
              ))}
              <div className="grid gap-3">
                <Link to={`/warranty?product=${product.slug}`} prefetch="intent" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-black/12 bg-white/85 px-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111316] transition hover:bg-white">
                  <PackageCheck className="h-4 w-4" />
                  Register Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductMediaGallery({ product }) {
  const gallery = useMemo(() => {
    const images = product.gallery?.length ? product.gallery : product.galleryImages?.length ? product.galleryImages : [product.image || product.coverImage];
    return [...new Set(images.filter(Boolean))];
  }, [product]);
  const [active, setActive] = useState(gallery[0] || "");

  useEffect(() => {
    setActive(gallery[0] || "");
  }, [gallery, product.slug]);

  return (
    <div className="min-w-0">
      <div className="group relative hidden aspect-[1.04/1] overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-[radial-gradient(circle_at_50%_38%,#ffffff_0%,#eeeeea_52%,#deded8_100%)] shadow-[0_28px_90px_rgba(17,19,22,0.08)] md:block">
        <ResponsiveImage
          key={active}
          src={active}
          alt={`${product.name} premium product view`}
          loading="eager"
          className="h-full w-full object-contain p-8 transition duration-700 group-hover:scale-[1.035] lg:p-12"
        />
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:hidden">
        {(gallery.length ? gallery : [""]).map((image, index) => (
          <div key={`${image}-${index}`} className="aspect-[0.92/1] w-[84vw] shrink-0 snap-center overflow-hidden rounded-[1.45rem] border border-black/[0.06] bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#eeeeea_58%,#ddddda_100%)]">
            <ResponsiveImage src={image} alt={`${product.name} image ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-contain p-7" />
          </div>
        ))}
      </div>
      {gallery.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3">
          {gallery.slice(0, 4).map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(image)}
              aria-label={`View ${product.name} image ${index + 1}`}
              className={`aspect-square overflow-hidden rounded-[1rem] border bg-white/70 transition ${active === image ? "border-[#111316] shadow-[0_10px_28px_rgba(17,19,22,0.10)]" : "border-black/[0.07] opacity-70 hover:opacity-100"}`}
            >
              <ResponsiveImage src={image} alt="" className="h-full w-full object-contain p-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickHighlights({ product }) {
  const highlights = getHighlights(product);
  if (!highlights.length) return null;

  return (
    <MotionSection className="border-b border-black/[0.06] bg-white px-4 py-8 sm:px-6 lg:py-10">
      <div className="mx-auto grid max-w-6xl divide-y divide-black/[0.08] overflow-hidden rounded-[1.25rem] border border-black/[0.08] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {highlights.slice(0, 5).map((highlight) => {
          const Icon = iconMap[highlight.icon] || Sparkles;
          return (
            <div key={highlight.label} className="flex min-h-[88px] items-center gap-4 bg-[#fbfbfa] p-4 sm:p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#111316] text-white">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <p className="text-sm font-semibold leading-5 text-black/76">{highlight.label}</p>
            </div>
          );
        })}
      </div>
    </MotionSection>
  );
}

function PremiumStory({ product }) {
  const story = product.storySection || {};
  const image = story.backgroundImage || product.coverImage || product.image;
  const alignClass = story.alignment === "center" ? "mx-auto text-center" : story.alignment === "right" ? "ml-auto text-right" : "";

  return (
    <MotionSection className="bg-white px-0 py-0">
      <div className="relative min-h-[82vh] overflow-hidden bg-[#111316]">
        <ResponsiveImage src={image} alt={`${product.name} story image`} className="absolute inset-0 h-full w-full object-cover opacity-86" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/22 to-black/18" />
        <div className="relative mx-auto flex min-h-[82vh] max-w-[1360px] items-end px-5 py-14 sm:px-8 lg:px-10 lg:py-24">
          <div className={`max-w-2xl text-white ${alignClass}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/68">Infibolt design story</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-[4.75rem]">
              {story.title || product.name}
            </h2>
            <p className="mt-5 text-base leading-7 text-white/78 sm:text-xl sm:leading-8">
              {story.subtitle || product.description || product.summary}
            </p>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}

function FeatureBlocks({ product }) {
  const blocks = (product.featureBlocks || []).slice(0, 4);
  if (!blocks.length) return null;

  return (
    <section className="bg-[#f5f5f3] px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-[1200px] gap-16 lg:gap-24">
        {blocks.map((block, index) => (
          <MotionSection key={`${block.title}-${index}`} className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${index % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}>
            <div className="aspect-[4/3] overflow-hidden rounded-[1.35rem] border border-black/[0.06] bg-[radial-gradient(circle_at_50%_36%,#ffffff_0%,#efefec_58%,#dfdfd9_100%)] shadow-[0_22px_70px_rgba(17,19,22,0.07)]">
              <ResponsiveImage src={block.image} alt={block.title || `${product.name} feature`} className="h-full w-full object-contain p-7 sm:p-9" />
            </div>
            <div className="max-w-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/45">Feature {index + 1}</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-[#111316] sm:text-5xl">{block.title}</h2>
              <p className="mt-5 text-base leading-8 text-black/62">{block.description || block.body}</p>
            </div>
          </MotionSection>
        ))}
      </div>
    </section>
  );
}

function Specifications({ product }) {
  const groups = groupSpecifications(product);
  if (!Object.values(groups).some((items) => items.length)) return null;

  return (
    <section className="border-y border-black/[0.06] bg-white px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 sm:mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/45">Specifications</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#111316] sm:text-5xl">Built for the details.</h2>
        </div>
        <div className="hidden overflow-hidden rounded-[1.15rem] border border-black/[0.08] bg-white sm:block">
          {specGroups.map((group) => groups[group]?.length ? (
            <div key={group} className="grid grid-cols-[190px_1fr] border-b border-black/[0.08] last:border-b-0">
              <div className="bg-[#f5f5f3] p-5 text-sm font-bold text-[#111316]">{group}</div>
              <div>
                {groups[group].map((item) => (
                  <div key={`${group}-${item.label}`} className="grid grid-cols-[0.42fr_1fr] gap-5 border-b border-black/[0.06] p-5 text-sm last:border-b-0">
                    <span className="font-semibold text-[#111316]">{item.label}</span>
                    <span className="leading-6 text-black/62">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null)}
        </div>
        <div className="grid gap-3 sm:hidden">
          {specGroups.map((group) => groups[group]?.length ? (
            <details key={group} className="group rounded-[1rem] border border-black/[0.08] bg-[#fbfbfa] p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold">
                {group}
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </summary>
              <div className="mt-4 grid gap-3">
                {groups[group].map((item) => (
                  <div key={`${group}-${item.label}`} className="border-t border-black/[0.08] pt-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/45">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-black/68">{item.value}</p>
                  </div>
                ))}
              </div>
            </details>
          ) : null)}
        </div>
      </div>
    </section>
  );
}

function MarketplaceSection({ product }) {
  const channels = getMarketplaceChannels(product, true);
  const isOutOfStock = isProductOutOfStock(product);
  const isComingSoon = isProductComingSoon(product);
  const isUnavailable = isOutOfStock || isComingSoon;

  return (
    <section className="bg-[#f5f5f3] px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.35rem] bg-[#111316] text-white shadow-[0_26px_90px_rgba(17,19,22,0.14)]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end lg:p-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/52">Trusted launch partners</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-normal sm:text-5xl">
              {isOutOfStock ? "Availability updates from trusted launch partners." : isComingSoon ? "Coming soon to trusted launch partners." : "Purchase through trusted launch partners."}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 sm:text-base">
              {isOutOfStock
                ? "Marketplace purchase is temporarily paused for this product. Join availability alerts and return to register ownership after purchase."
                : isComingSoon
                  ? "This product is not open for purchase yet. Partner buttons will appear here when launch availability begins."
                : "Buy from your preferred marketplace, then link your product to INFIBOLT for warranty coverage, support, and long-term care."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {isUnavailable ? (
              <div className="rounded-[1rem] border border-white/14 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">{isComingSoon ? "Coming soon" : "Out of stock"}</p>
                <p className="mt-2 text-sm leading-6 text-white/66">{isComingSoon ? "Marketplace buttons will appear once the product launches." : "Buy buttons will return when partner availability is restored."}</p>
              </div>
            ) : channels.map((channel) => (
              <MarketplaceButton key={channel.label} channel={channel} product={product} dark context="purchase-section" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WarrantyOwnership({ product }) {
  const steps = ["Purchase through a trusted partner", "Link your product serial number", "Add invoice details securely", "Activate warranty coverage", "Keep support connected to your account"];

  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.86fr_1.14fr]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/45">Warranty & ownership</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-normal text-[#111316] sm:text-5xl">Your product stays connected after purchase.</h2>
          <p className="mt-5 text-base leading-8 text-black/62">
            Link your device with a serial number and invoice so warranty coverage, support, and product care stay connected to your INFIBOLT account.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={`/warranty?product=${product.slug}`} prefetch="intent" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#111316] px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-white">
              <PackageCheck className="h-4 w-4" />
              Register Product
            </Link>
            <Link to="/warranty-policy" prefetch="intent" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-black/12 bg-white px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111316]">
              <ShieldCheck className="h-4 w-4" />
              Warranty Terms
            </Link>
          </div>
        </div>
        <div className="grid overflow-hidden rounded-[1.15rem] border border-black/[0.08] bg-[#fbfbfa]">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-4 border-b border-black/[0.08] p-4 last:border-b-0 sm:p-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#111316] text-sm font-semibold text-white">{index + 1}</span>
              <p className="text-sm font-semibold leading-6 text-black/76">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedProducts({ product, products }) {
  if (!products.length) return null;
  const categoryLabel = product.category || "this category";

  return (
    <section className="border-y border-black/[0.06] bg-[#f5f5f3] px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/45">Same category</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#111316] sm:text-5xl">More from {categoryLabel}</h2>
        </div>
        <ProductGrid items={products.slice(0, 4)} />
      </div>
    </section>
  );
}

function FaqSection({ product }) {
  const faqs = product.faqs?.length ? product.faqs : defaultFaqs(product);

  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 sm:mb-9">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/45">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#111316] sm:text-5xl">Before you buy</h2>
        </div>
        <div className="divide-y divide-black/[0.08] rounded-[1.15rem] border border-black/[0.08] bg-white">
          {faqs.map((faq) => (
            <details key={faq.question} className="group p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-[#111316] sm:text-lg">
                {faq.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-black/42 transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-black/62 sm:text-base">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketplaceButton({ channel, product, primary = false, dark = false, context }) {
  if (!channel.href) {
    return (
      <button type="button" disabled className={`inline-flex min-h-[52px] items-center justify-between gap-3 rounded-full px-5 text-[11px] font-bold uppercase tracking-[0.15em] opacity-45 ${dark ? "border border-white/14 text-white" : "border border-black/10 text-black/45"}`}>
        <span>{channel.label}</span>
        <span>Soon</span>
      </button>
    );
  }

  return (
    <a
      href={channel.href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackMarketplaceClick(product, channel.label, context)}
      className={`inline-flex min-h-[52px] items-center justify-between gap-3 rounded-full px-5 text-[11px] font-bold uppercase tracking-[0.15em] transition ${
        dark
          ? "border border-white/14 bg-white/8 text-white hover:bg-white/14"
          : primary
            ? "bg-[#111316] text-white shadow-[0_16px_42px_rgba(17,19,22,0.18)] hover:bg-black"
            : "border border-black/12 bg-white/85 text-[#111316] hover:bg-white"
      }`}
    >
      <span>Buy on {channel.label}</span>
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}

function ResponsiveImage({ src, alt, className = "", loading = "lazy" }) {
  const [failed, setFailed] = useState(false);
  const resolved = uploadUrl(src);

  if (!resolved || failed) {
    return (
      <div className={`${className} grid place-items-center bg-slate-200 text-slate-400`}>
        <ImageOff className="h-7 w-7" />
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      loading={loading}
      decoding="async"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 720px"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function getHighlights(product) {
  const source = product.premiumHighlights?.length
    ? product.premiumHighlights
    : (product.highlights?.length ? product.highlights : product.features || []).map((label, index) => ({ label, icon: inferIcon(label), order: index }));
  return source
    .filter((item) => item?.label)
    .filter((item) => !defaultHighlightLabels.has(String(item.label).trim().toLowerCase()))
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 5);
}

function getMarketplaceChannels(product, includeUnavailable = false) {
  const marketplace = product.marketplace || {};
  const channels = marketplacePartners.map(([label, key]) => ({ label, key, href: marketplace[key] || "" }));
  if (marketplace.custom || marketplace.customLabel) {
    channels.push({
      label: marketplace.customLabel || "Custom partner",
      key: "custom",
      href: marketplace.custom || "",
    });
  }
  const visible = includeUnavailable ? channels : channels.filter((channel) => channel.href);
  const priority = marketplace.priority || "Amazon";
  const sorted = [...visible].sort((a, b) => (a.label === priority ? -1 : b.label === priority ? 1 : 0));
  return sorted.length ? sorted : includeUnavailable ? channels : [];
}

function groupSpecifications(product) {
  const normalized = product.specifications?.length
    ? product.specifications
    : Object.entries(product.specs || {}).map(([label, value], index) => ({ label, value, group: inferSpecGroup(label), order: index }));

  return normalized.reduce((groups, item, index) => {
    const group = specGroups.includes(item.group) ? item.group : inferSpecGroup(item.label);
    if (!groups[group]) groups[group] = [];
    if (item.label && item.value) groups[group].push({ ...item, order: item.order ?? index });
    groups[group].sort((a, b) => (a.order || 0) - (b.order || 0));
    return groups;
  }, Object.fromEntries(specGroups.map((group) => [group, []])));
}

function inferIcon(label = "") {
  const value = label.toLowerCase();
  if (value.includes("battery") || value.includes("hour")) return "battery";
  if (value.includes("charge")) return "charge";
  if (value.includes("noise") || value.includes("audio") || value.includes("sound")) return "audio";
  if (value.includes("spatial")) return "spatial";
  if (value.includes("bluetooth") || value.includes("wireless")) return "bluetooth";
  return "sparkles";
}

function inferSpecGroup(label = "") {
  const value = label.toLowerCase();
  if (/(driver|audio|anc|noise|sound|mic)/.test(value)) return "Audio";
  if (/(battery|charge|playback|power)/.test(value)) return "Battery";
  if (/(bluetooth|wireless|codec|range|usb|connect)/.test(value)) return "Connectivity";
  if (/(weight|material|finish|dimension|water|ip)/.test(value)) return "Build";
  return "Compatibility";
}

function selectRelatedProducts(product, items) {
  const categoryKey = slugify(product.categorySlug || product.category);
  const byCategory = items.filter((item) => {
    if (item.slug === product.slug) return false;
    const itemCategoryKey = slugify(item.categorySlug || item.category);
    return itemCategoryKey && itemCategoryKey === categoryKey;
  });
  return uniqueBySlug(byCategory).slice(0, 4);
}

function warrantySupportCopy(product) {
  return "Infibolt warranty support after serial and invoice registration.";
}

function uniqueBySlug(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.slug || seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

function defaultFaqs(product) {
  return [
    { question: `Where can I buy ${product.name}?`, answer: "Infibolt products are purchased through trusted marketplace and retail launch partners listed on this page." },
    { question: "How do I activate warranty?", answer: "Create or open your INFIBOLT account, register the product serial number, and add your invoice details to activate warranty coverage." },
    { question: "Can I get support after marketplace purchase?", answer: "Yes. Once your product is registered, warranty care and product support stay connected to your INFIBOLT account." },
  ];
}

function buildProductSchema(product, metadata) {
  const channels = getMarketplaceChannels(product);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: metadata.description,
    image: product.gallery?.length ? product.gallery.map((image) => uploadUrl(image)) : [uploadUrl(product.image)].filter(Boolean),
    sku: product.sku || product.slug,
    brand: { "@type": "Brand", name: "Infibolt" },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price || 0,
      priceCurrency: "INR",
      availability: isProductOutOfStock(product) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: channels[0]?.href || `https://infibolt.com/products/${product.slug}`,
    },
  };
}

function resolveMetadata(product) {
  return {
    title: product.seo?.title || `${product.name} | Infibolt`,
    description: product.seo?.description || product.subtitle || product.summary || "Official INFIBOLT product details, trusted partner availability, warranty coverage, and ownership care.",
  };
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function isProductOutOfStock(product) {
  return String(product?.status || "").toLowerCase() === "out of stock";
}

function isProductComingSoon(product) {
  const status = String(product?.status || "").toLowerCase();
  return status === "upcoming" || status === "coming soon";
}

function trackMarketplaceClick(product, marketplace, context) {
  window.dataLayer?.push?.({
    event: "marketplace_click",
    product_slug: product.slug,
    product_name: product.name,
    marketplace,
    context,
  });
}
