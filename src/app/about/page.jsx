import { CommerceShell, MotionSection } from "../components/commerce/CommerceLayout";

export default function AboutPage() {
  return (
    <CommerceShell
      eyebrow="About"
      title="A premium product house for modern device culture."
      description="INFIBOLT designs a cinematic product ecosystem: launch-ready marketplace commerce today, direct ownership and service infrastructure tomorrow."
    >
      <MotionSection className="px-6 pb-32 lg:px-24">
        <div className="mx-auto max-w-[1400px] space-y-12">
          <div className="rounded-[2rem] bg-white/50 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-xl dark:bg-white/[0.02] border border-white/60 dark:border-white/5 sm:rounded-[2.5rem] sm:p-16 lg:p-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Brand story</p>
            <h2 className="mt-8 text-[1.9rem] font-medium leading-tight text-slate-900 sm:text-[3rem] lg:text-[3.8rem] dark:text-white">We build technology objects, <br className="hidden sm:block"/> not crowded storefronts.</h2>
            <p className="mt-8 max-w-3xl text-base font-light leading-relaxed text-slate-600 dark:text-slate-400 sm:mt-10 sm:text-lg">
              Our visual language is calm, technical, and emotionally precise. Every product narrative balances sensory design with engineered restraint. We prioritize silence in an era of noise.
            </p>
          </div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}
