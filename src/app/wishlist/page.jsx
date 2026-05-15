import { CommerceShell, FutureCommerceNotice, ProductGrid } from "../components/commerce/CommerceLayout";
import { products } from "../data/commerce";

export default function WishlistPage() {
  return (
    <CommerceShell eyebrow="Wishlist" title="Saved products for later." description="Wishlist UI is ready for authenticated customers once accounts are fully enabled.">
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-7xl space-y-8">
          <FutureCommerceNotice title="Wishlist sync launching soon" />
          <ProductGrid items={products.slice(0, 4)} />
        </div>
      </section>
    </CommerceShell>
  );
}
