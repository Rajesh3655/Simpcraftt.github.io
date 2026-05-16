import { useParams } from "react-router";
import {
  BuyPanel,
  CommerceShell,
  PrimaryButton,
  ProductGallery,
  ProductGrid,
  SecondaryButton,
} from "../../components/commerce/CommerceLayout";
import { getCategoryById, getProductBySlug, products } from "../../data/commerce";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <CommerceShell eyebrow="Product" title="Product not found" description="This product is not available in the active catalogue.">
        <section className="px-4 pb-24 sm:px-5">
          <div className="mx-auto max-w-7xl">
            <SecondaryButton href="/products">Back to Products</SecondaryButton>
          </div>
        </section>
      </CommerceShell>
    );
  }

  const category = getCategoryById(product.category);
  const related = products.filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 3);

  return (
    <CommerceShell eyebrow={category?.name ?? "Product"} title={product.name} description={product.description}>
      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            <ProductGallery product={product} />
            <div className="space-y-5">
              <div className="lux-panel rounded-2xl p-6 sm:p-7">
                <span className="rounded-full bg-blue-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">{product.badge}</span>
                <p className="mt-5 text-xl font-black leading-tight sm:text-2xl">{product.summary}</p>
                <p className="mt-4 text-sm leading-7 text-black/68 dark:text-white/70">{product.rating} rating from {product.reviewCount} verified reviews</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <span key={variant} className="rounded-full border border-[var(--lux-border)] bg-[var(--lux-surface)] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em]">{variant}</span>
                  ))}
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href={product.marketplace.custom} external>Buy Now</PrimaryButton>
                  <SecondaryButton href="/warranty">Warranty Coverage</SecondaryButton>
                </div>
              </div>
              <BuyPanel product={product} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lux-panel rounded-2xl p-6 sm:p-7">
              <h2 className="luxury-title text-3xl">Product highlights</h2>
              <div className="mt-5 grid gap-3">
                {product.features.map((feature) => (
                  <div key={feature} className="rounded-xl border border-[var(--lux-border)] bg-[var(--lux-surface)] px-4 py-3 text-sm font-semibold leading-6">{feature}</div>
                ))}
              </div>
            </div>
            <div className="lux-panel rounded-2xl p-6 sm:p-7">
              <h2 className="luxury-title text-3xl">Technical details</h2>
              <div className="mt-5 grid gap-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[108px_1fr] gap-4 border-b border-[var(--lux-border)] pb-3 text-sm">
                    <span className="font-black">{key}</span>
                    <span className="text-black/64 dark:text-white/64">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="lux-divider pt-12">
              <div className="mb-8">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300 sm:text-xs sm:tracking-[0.18em]">From the same category</p>
                <h2 className="luxury-title mt-3 text-3xl sm:text-4xl">Related products</h2>
              </div>
              <ProductGrid items={related} />
            </div>
          )}
        </div>
      </section>
    </CommerceShell>
  );
}

