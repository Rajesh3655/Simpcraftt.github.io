import { CommerceShell, EcommerceStepper, FutureCommerceNotice, ProductGrid } from "../components/commerce/CommerceLayout";
import { products } from "../data/commerce";

export default function CartPage() {
  return (
    <CommerceShell eyebrow="Cart" title="Cart architecture is ready." description="Direct shopping is disabled during the marketplace-first launch.">
      <section className="px-5 pb-24">
        <div className="mx-auto grid max-w-7xl gap-8">
          <EcommerceStepper current={0} />
          <FutureCommerceNotice />
          <ProductGrid items={products.slice(0, 3)} />
        </div>
      </section>
    </CommerceShell>
  );
}
