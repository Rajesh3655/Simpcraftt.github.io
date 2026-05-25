import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";

export default function TermsConditionsPage() {
  return (
    <CommerceShell eyebrow="Legal" title="Terms & Conditions" description="Marketplace purchases are governed by the selected launch partner. Infibolt manages warranty, ownership registration, and support.">
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-4xl lux-panel rounded-2xl p-7 leading-8 text-black/68 sm:p-8 dark:text-white/68">
          <p>Product information, pricing, availability, warranty eligibility, and marketplace links may change as launch inventory and partner listings are finalized.</p>
          <p className="mt-4">Infibolt account services include product registration, warranty review, support requests, ownership records, policy updates, and launch notifications.</p>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}



