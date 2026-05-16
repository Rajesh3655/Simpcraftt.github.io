import { CommerceShell, FutureCommerceNotice, ProductCard } from "../components/commerce/CommerceLayout";
import { products } from "../data/commerce";

export default function WishlistPage() {
  return (
    <CommerceShell eyebrow="Wishlist" title="Saved products for later." description="Wishlist UI is ready for authenticated customers once accounts are fully enabled.">
      <section className="px-6 pb-32 lg:px-24">
        <div className="mx-auto max-w-[1400px] space-y-12">
          <FutureCommerceNotice title="Wishlist sync launching soon" />
          
          {/* Standard Grid Layout */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {products.slice(0, 6).map((product, index) => (
              <div 
                key={product.slug}
                className="flex justify-center transition-all duration-700"
              >
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </CommerceShell>
  );
}
