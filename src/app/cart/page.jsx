import { CommerceShell, EcommerceStepper, FutureCommerceNotice, ProductGrid } from "../components/commerce/CommerceLayout";
import { products } from "../data/commerce";

export default function CartPage() {
  return (
    <CommerceShell eyebrow="Cart" title="Direct checkout is staged with premium restraint." description="The cart flow is intentionally paused during marketplace-first launch while the direct commerce infrastructure is finalized.">
      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-7xl space-y-8">
          <EcommerceStepper current={0} />
          <FutureCommerceNotice title="Cart flow will activate in the next commerce phase" />
          <div className="lux-divider pt-10">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300 sm:text-xs sm:tracking-[0.18em]">Suggested products</p>
            <h2 className="luxury-title mt-3 text-3xl sm:text-4xl">Continue exploring</h2>
            <div className="mt-8">
              <ProductGrid items={products.slice(0, 3)} />
            </div>
          </div>
        </div>
      </section>
    </CommerceShell>
  );
}

