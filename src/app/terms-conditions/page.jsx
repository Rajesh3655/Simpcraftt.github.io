import { CommerceShell } from "../components/commerce/CommerceLayout";

export default function TermsConditionsPage() {
  return (
    <CommerceShell eyebrow="Legal" title="Terms & Conditions" description="Marketplace purchases are governed by the marketplace partner until direct checkout launches.">
      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-4xl lux-panel rounded-2xl p-7 leading-8 text-black/68 sm:p-8 dark:text-white/68">
          <p>Product information, pricing, availability, warranty eligibility, and marketplace links may change as launch inventory and partner listings are finalized.</p>
          <p className="mt-4">Direct checkout, coupons, payments, and order management are currently inactive public features and will be governed by updated terms when enabled.</p>
        </div>
      </section>
    </CommerceShell>
  );
}

