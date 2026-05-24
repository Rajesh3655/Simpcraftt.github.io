import { FileUp, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { EmptyState, PageLoader } from "../../components/AppStates";
import { useAppStore } from "../../store/appStore";

export default function WarrantyPage() {
  const { claims, status, error } = useAppStore((state) => state.warranty);
  const loadWarrantyClaims = useAppStore((state) => state.loadWarrantyClaims);
  const createWarrantyClaim = useAppStore((state) => state.createWarrantyClaim);
  const [form, setForm] = useState({ name: "", email: "", product: "Aura Audio Pro", serial: "", purchaseDate: "", invoiceNumber: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWarrantyClaims();
  }, [loadWarrantyClaims]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const claim = await createWarrantyClaim(form);
    setSubmitting(false);
    setForm({ name: "", email: "", product: "Aura Audio Pro", serial: "", purchaseDate: "", invoiceNumber: "" });
    toast.success("Warranty claim submitted", { description: `${claim.id} is ready for OTP verification.` });
  };

  return (
    <CommerceShell eyebrow="Warranty" title="Ownership support built for long-term trust." description="Register products, upload invoices, and track warranty claims through a secure ownership workflow.">
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={submit} className="premium-surface grid gap-5 p-6">
            <div><ShieldCheck className="h-6 w-6" /><h2 className="mt-4 text-2xl font-semibold tracking-tight">Submit warranty claim</h2></div>
            <div className="grid gap-4 md:grid-cols-2">{["name", "email", "serial", "purchaseDate", "invoiceNumber"].map((key) => <Field key={key} label={key} type={key === "purchaseDate" ? "date" : key === "email" ? "email" : "text"} value={form[key]} onChange={(value) => setForm((current) => ({ ...current, [key]: value }))} />)}</div>
            <label className="grid gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Product</span><select value={form.product} onChange={(event) => setForm((current) => ({ ...current, product: event.target.value }))} className="premium-control min-h-[48px] px-4 text-sm font-medium"><option>Aura Audio Pro</option><option>Nova Watch X</option><option>Echo Charge Max</option><option>Lumen Hub Studio</option></select></label>
            <div className="flex min-h-[112px] items-center justify-center rounded-2xl border border-dashed border-slate-900/16 bg-slate-50/70 text-center text-sm font-medium text-slate-500"><FileUp className="mr-2 h-5 w-5" /> Upload invoice for verification</div>
            <button disabled={submitting} className="premium-button inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] disabled:opacity-60"><ShieldCheck className="h-4 w-4" />{submitting ? "Submitting..." : "Submit claim"}</button>
          </form>
          <section className="premium-surface p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Claim status</h2>
            <div className="mt-5 grid gap-3">
              {status === "loading" && <PageLoader label="Loading claims" />}
              {status === "error" && <EmptyState title="Claims unavailable" description={error} />}
              {status === "success" && claims.length === 0 && <EmptyState title="No claims yet" description="Submitted warranty claims will appear here with tracking status." />}
              {claims.map((claim) => <div key={claim.id} className="rounded-xl border border-slate-900/10 bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-900">{claim.id}</p><span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">{claim.status}</span></div><p className="mt-2 text-sm text-slate-500">{claim.product} · {claim.serial}</p></div>)}
            </div>
          </section>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return <label className="grid gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span><input required type={type} value={value} onChange={(event) => onChange(event.target.value)} className="premium-control min-h-[48px] px-4 text-sm font-medium outline-none" /></label>;
}
