import { ArrowLeft, Headphones, PackageCheck, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  BuyPanel,
  CommerceShell,
  MotionSection,
  ProductGallery,
  ProductGrid,
  SecondaryButton,
} from "../../../components/commerce/CommerceLayout";
import { getCategoryById, getProductBySlug, products } from "../../../store/commerce";
import { PageLoader, ErrorState } from "../../../components/AppStates";
import { productService } from "../../../services/productService";

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [remoteProduct, setRemoteProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const fallbackProduct = getProductBySlug(slug);
  const product = remoteProduct || fallbackProduct;

  useEffect(() => {
    let active = true;
    setStatus("loading");
    productService.detail(slug)
      .then((result) => {
        if (!active) return;
        setRemoteProduct(result);
        setStatus("success");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Unable to load product.");
        setStatus(fallbackProduct ? "success" : "error");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (status === "loading") {
    return (
      <CommerceShell eyebrow="Product" title="Loading product" description="Preparing product imagery, specifications, and purchase options.">
        <MotionSection className="px-4 pb-24 sm:px-5">
          <div className="mx-auto max-w-7xl">
            <PageLoader label="Loading product details" />
          </div>
        </MotionSection>
      </CommerceShell>
    );
  }

  if (status === "error") {
    return (
      <CommerceShell eyebrow="Product" title="Product unavailable" description="The product API could not return this item.">
        <MotionSection className="px-4 pb-24 sm:px-5">
          <div className="mx-auto max-w-7xl">
            <ErrorState description={error} onRetry={() => window.location.reload()} />
          </div>
        </MotionSection>
      </CommerceShell>
    );
  }

  if (!product) {
    return (
      <CommerceShell eyebrow="Product" title="Product not found" description="This product is not available in the active catalogue.">
        <MotionSection className="px-4 pb-24 sm:px-5">
          <div className="mx-auto max-w-7xl">
            <SecondaryButton href="/products">Back to Products</SecondaryButton>
          </div>
        </MotionSection>
      </CommerceShell>
    );
  }

  const category = getCategoryById(product.category);
  const related = products.filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 3);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.summary,
    image: product.gallery || [product.image].filter(Boolean),
    sku: product.sku,
    brand: { "@type": "Brand", name: "Infibolt" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: product.status === "Out of Stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: product.marketplace?.amazon || product.marketplace?.flipkart || `https://infibolt.com/products/${product.slug}`,
    },
  };

  return (
    <CommerceShell eyebrow={category?.name ?? "Product"} title={product.name} description={product.description}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex items-center justify-between border-t border-slate-900/10 pt-5 dark:border-white/10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-slate-900/10 bg-white/55 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 transition-colors hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 sm:block">
              {product.status}
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:gap-12">
            <ProductGallery product={product} />
            <div className="space-y-5">
              <div className="lux-panel rounded-[1.5rem] p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-blue-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">{product.badge}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/8 bg-white/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {product.rating} / {product.reviewCount}
                  </span>
                </div>
                <p className="mt-5 text-xl font-semibold leading-tight text-slate-950 sm:text-2xl dark:text-white">{product.summary}</p>
                <p className="mt-4 text-sm leading-7 text-black/68 dark:text-white/70">Available through selected launch partners. Ownership, warranty, device care, and support are managed through your INFIBOLT account after purchase.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <span key={variant} className="rounded-full border border-[var(--lux-border)] bg-[var(--lux-surface)] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em]">{variant}</span>
                  ))}
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Care ready", ShieldCheck],
                    ["Fast support", PackageCheck],
                    ["Tuned profile", Headphones],
                  ].map(([label, Icon]) => (
                    <div key={label} className="rounded-2xl border border-slate-900/8 bg-white/48 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <BuyPanel product={product} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="lux-panel rounded-[1.5rem] p-6 sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Experience</p>
              <h2 className="luxury-title mt-3 text-2xl sm:text-3xl">Designed around the moments you repeat.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">{product.description}</p>
              <div className="mt-7">
                <SecondaryButton href="/warranty">Warranty Coverage</SecondaryButton>
              </div>
            </div>
            <div className="lux-panel rounded-[1.5rem] p-6 sm:p-8">
              <h2 className="luxury-title text-2xl sm:text-3xl">Product highlights</h2>
              <div className="mt-5 grid gap-3">
                {product.features.map((feature) => (
                  <div key={feature} className="rounded-xl border border-[var(--lux-border)] bg-[var(--lux-surface)] px-4 py-3 text-sm font-semibold leading-6">{feature}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="lux-panel rounded-[1.5rem] p-6 sm:p-8">
              <h2 className="luxury-title text-2xl sm:text-3xl">Technical details</h2>
              <div className="mt-5 grid gap-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[108px_1fr] gap-4 border-b border-[var(--lux-border)] pb-3 text-sm">
                    <span className="font-black">{key}</span>
                    <span className="text-black/64 dark:text-white/64">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lux-panel rounded-[1.5rem] p-6 sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Ownership flow</p>
              <h2 className="luxury-title mt-3 text-2xl sm:text-3xl">From marketplace purchase to Infibolt care.</h2>
              <div className="mt-6 grid gap-4">
                {["Buy through Amazon, Flipkart, or selected retail partner", "Create account and register invoice with serial number", "Activate warranty, support, and ownership history"].map((step, index) => (
                  <div key={step} className="flex gap-4 border-t border-slate-900/8 pt-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:text-slate-400">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white dark:bg-white dark:text-slate-950">{index + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="lux-divider pt-12">
              <div className="mb-8">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300 sm:text-xs sm:tracking-[0.18em]">From the same category</p>
                <h2 className="luxury-title mt-3 text-2xl sm:text-3xl">Related products</h2>
              </div>
              <ProductGrid items={related} />
            </div>
          )}
        </div>
      </MotionSection>
    </CommerceShell>
  );
}




