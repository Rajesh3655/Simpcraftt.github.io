import { useEffect, useState } from "react";
import { CommerceShell, MotionSection, WarrantyForm } from "../components/commerce/CommerceLayout";

function WarrantyContentSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="rounded-2xl border border-black/5 bg-slate-50/85 p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-7">
        <div className="h-3.5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 h-3.5 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-3 h-3.5 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="rounded-2xl border border-black/5 bg-slate-50/85 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-8 md:p-10">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-5 h-28 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="mt-6 h-11 w-44 rounded-xl bg-slate-300 dark:bg-slate-600" />
      </div>
    </div>
  );
}

export default function WarrantyPage() {
  const [isPreparing, setIsPreparing] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPreparing(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <CommerceShell eyebrow="Warranty" title="Ownership support built for long-term trust." description="Register your product or submit a claim with a clean, premium workflow designed for clarity and speed.">
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-7xl space-y-5">
          {isPreparing ? (
            <WarrantyContentSkeleton />
          ) : (
            <>
              <div className="lux-panel rounded-2xl p-6 sm:p-7">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300 sm:text-xs sm:tracking-[0.18em]">Before you submit</p>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-black/68 dark:text-white/70">Keep your invoice, serial number, purchase date, and seller information ready. Once submitted, you will receive a claim ticket for status tracking.</p>
              </div>
              <WarrantyForm />
            </>
          )}
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

