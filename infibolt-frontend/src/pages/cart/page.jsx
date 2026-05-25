import { ArrowRight, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";

export default function CartPage() {
  return (
    <CommerceShell
      eyebrow="Marketplace Launch"
      title="Choose a launch partner."
      description="Infibolt products are currently purchased through selected marketplace partners. Your ownership, warranty, and support continue here after delivery."
    >
      <MotionSection className="px-5 pb-24">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.8fr]">
          <section className="lux-panel rounded-[1.5rem] p-6 sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Purchase flow</p>
            <h2 className="luxury-title mt-3 text-2xl sm:text-3xl">Product discovery on Infibolt. Purchase through launch partners.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Explore products, choose Amazon or Flipkart from each product page, then register your device on Infibolt for warranty and support.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/products" className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-white">
                Explore products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/warranty" className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-slate-900/10 bg-white/60 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900">
                Register product
              </Link>
            </div>
          </section>
          <aside className="grid gap-3">
            {[
              [Sparkles, "Marketplace purchase", "Buy from selected launch partners."],
              [ShieldCheck, "Warranty activation", "Upload invoice and serial after delivery."],
              [PackageCheck, "Support ecosystem", "Care history stays connected to your account."],
            ].map(([Icon, title, copy]) => (
              <div key={title} className="rounded-2xl border border-slate-900/8 bg-white/58 p-5">
                <Icon className="h-5 w-5 text-slate-500" />
                <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
              </div>
            ))}
          </aside>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}
