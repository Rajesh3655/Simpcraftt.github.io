import { CommerceShell, EcommerceStepper, FutureCommerceNotice, MotionSection } from "../../components/commerce/CommerceLayout";

export default function CheckoutPage() {
  return (
    <CommerceShell eyebrow="Checkout" title="Checkout, quietly prepared." description="Addressing, payment, coupon logic, and order confirmation are organized for the direct commerce rollout.">
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-7xl space-y-8">
          <EcommerceStepper current={1} />
          <FutureCommerceNotice title="Checkout modules are visually ready, activation pending" />
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              ["Shipping address", "Saved addresses, pincode checks, and delivery timelines."],
              ["Coupon & offers", "Selective discounts and campaign-level eligibility logic."],
              ["Payment routing", "Secure UPI, cards, wallets, and post-purchase confirmation."],
            ].map(([title, copy]) => (
              <article key={title} className="lux-panel rounded-2xl p-6 sm:p-7">
                <h2 className="text-xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-black/66 dark:text-white/70">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}



