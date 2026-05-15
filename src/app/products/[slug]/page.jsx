import { useParams } from "react-router";
import {
  BuyPanel,
  CommerceShell,
  ProductGallery,
  ProductGrid,
  SecondaryButton,
} from "../../components/commerce/CommerceLayout";
import { formatPrice, getCategoryById, getProductBySlug, products } from "../../data/commerce";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <CommerceShell eyebrow="Product" title="Product not found" description="This product is not available in the current catalogue.">
        <section className="px-5 pb-24">
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
      <section className="px-5 pb-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <ProductGallery product={product} />
          <div className="space-y-6">
            <div className="rounded-lg border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.045]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">{product.badge}</span>
                <span className="text-sm font-bold text-black/55 dark:text-white/55">{product.rating} rating from {product.reviewCount} reviews</span>
              </div>
              <p className="mt-5 text-3xl font-black">{formatPrice(product.price)}</p>
              <p className="mt-4 leading-7 text-black/64 dark:text-white/64">{product.summary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <span key={variant} className="rounded-md border border-black/10 px-3 py-2 text-sm font-bold dark:border-white/10">{variant}</span>
                ))}
              </div>
            </div>
            <BuyPanel product={product} />
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-7xl gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.045]">
            <h2 className="text-2xl font-black">Product Features</h2>
            <div className="mt-5 grid gap-3">
              {product.features.map((feature) => (
                <div key={feature} className="rounded-md bg-black/[0.035] px-4 py-3 text-sm font-bold dark:bg-white/[0.05]">{feature}</div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.045]">
            <h2 className="text-2xl font-black">Specifications</h2>
            <div className="mt-5 grid gap-3">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[120px_1fr] gap-4 border-b border-black/10 pb-3 text-sm dark:border-white/10">
                  <span className="font-black">{key}</span>
                  <span className="text-black/64 dark:text-white/64">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mx-auto mt-16 max-w-7xl">
            <h2 className="mb-6 text-3xl font-black">Related Products</h2>
            <ProductGrid items={related} />
          </div>
        )}
      </section>
    </CommerceShell>
  );
}
