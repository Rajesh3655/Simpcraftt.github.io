import { CommerceShell, WarrantyForm } from "../components/commerce/CommerceLayout";

export default function WarrantyPage() {
  return (
    <CommerceShell eyebrow="Warranty" title="Ownership support built for long-term trust." description="Register your product or submit a claim with a clean, premium workflow designed for clarity and speed.">
      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="lux-panel rounded-2xl p-6 sm:p-7">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300 sm:text-xs sm:tracking-[0.18em]">Before you submit</p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-black/68 dark:text-white/70">Keep your invoice, serial number, purchase date, and seller information ready. Once submitted, you will receive a claim ticket for status tracking.</p>
          </div>
          <WarrantyForm />
        </div>
      </section>
    </CommerceShell>
  );
}

