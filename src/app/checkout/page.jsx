import { CommerceShell, EcommerceStepper, FutureCommerceNotice } from "../components/commerce/CommerceLayout";

export default function CheckoutPage() {
  return (
    <CommerceShell eyebrow="Checkout" title="Checkout flow staged for activation." description="Address, coupon, payment, and order confirmation screens are planned into the platform.">
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-7xl space-y-8">
          <EcommerceStepper current={1} />
          <FutureCommerceNotice />
          <div className="grid gap-5 lg:grid-cols-3">
            {["Shipping address", "Coupon code", "Payment method"].map((item) => (
              <div key={item} className="rounded-lg border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.045]">
                <h2 className="text-xl font-black">{item}</h2>
                <p className="mt-3 text-sm leading-6 text-black/62 dark:text-white/62">This module is visually prepared and will connect to backend services when direct ecommerce launches.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </CommerceShell>
  );
}
