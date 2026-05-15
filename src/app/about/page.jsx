import { CommerceShell, FeatureBand } from "../components/commerce/CommerceLayout";

export default function AboutPage() {
  return (
    <CommerceShell eyebrow="About" title="A premium product house for modern device culture." description="Simpcraftt is building a marketplace-first launch platform that can evolve into direct ecommerce, service, warranty, and customer ownership.">
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-7xl space-y-12">
          <FeatureBand />
          <div className="rounded-lg border border-black/10 bg-white/70 p-8 dark:border-white/10 dark:bg-white/[0.045]">
            <h2 className="text-3xl font-black">Brand system</h2>
            <p className="mt-4 max-w-3xl leading-8 text-black/64 dark:text-white/64">
              The platform is designed around cinematic product storytelling, modular commerce flows, marketplace redirects, service ownership, and future admin control.
            </p>
          </div>
        </div>
      </section>
    </CommerceShell>
  );
}
