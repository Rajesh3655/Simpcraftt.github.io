import { CollectionGrid, CommerceShell, ProductGrid } from "../components/commerce/CommerceLayout";
import { products } from "../data/commerce";

export default function CollectionsPage() {
  return (
    <CommerceShell eyebrow="Collections" title="Curated product systems for real workflows." description="Collections organize products by use-case, design intent, and listening context.">
      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-7xl space-y-14">
          <CollectionGrid />
          <div className="lux-divider pt-10">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300 sm:text-xs sm:tracking-[0.18em]">Complete catalogue</p>
            <h2 className="luxury-title mt-3 text-3xl sm:text-4xl">All products</h2>
            <div className="mt-8">
              <ProductGrid items={products} />
            </div>
          </div>
        </div>
      </section>
    </CommerceShell>
  );
}

