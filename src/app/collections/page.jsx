import { CollectionGrid, CommerceShell, ProductGrid } from "../components/commerce/CommerceLayout";
import { products } from "../data/commerce";

export default function CollectionsPage() {
  return (
    <CommerceShell
      eyebrow="Collections"
      title="Curated product systems."
      description="Collections group Simpcraftt products by lifestyle, launch phase, and user workflow."
    >
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-7xl">
          <CollectionGrid />
          <h2 className="mb-6 mt-16 text-3xl font-black">All Products</h2>
          <ProductGrid items={products} />
        </div>
      </section>
    </CommerceShell>
  );
}
