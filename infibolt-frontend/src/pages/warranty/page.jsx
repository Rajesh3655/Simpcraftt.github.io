import { FileUp, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { EmptyState, PageLoader } from "../../components/AppStates";
import {
  AccountAtmosphere,
  AccountCard,
  PremiumButton,
  PremiumField,
  PremiumNotice,
  PremiumSelect,
  SoftStatus,
} from "../../components/customer/PremiumAccount";
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
    try {
      const claim = await createWarrantyClaim(form);
      setForm({ name: "", email: "", product: "Aura Audio Pro", serial: "", purchaseDate: "", invoiceNumber: "" });
      toast.success("Warranty record opened", { description: `${claim.id} is ready for verification.` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CommerceShell
      eyebrow="Warranty"
      title="Care for the life of the product."
      description="Register ownership, attach purchase details, and follow warranty movement in one quiet space."
    >
      <AccountAtmosphere>
        <MotionSection className="px-5 pb-16 sm:px-6 md:px-8 md:pb-20">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.06fr_0.94fr]">
            <AccountCard className="p-5 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <SoftStatus>Ownership care</SoftStatus>
                  <h2 className="mt-4 text-2xl font-semibold tracking-normal text-slate-950">Submit warranty details</h2>
                  <p className="mt-2 max-w-xl text-sm font-light leading-7 text-slate-600">Add the product, purchase date, invoice reference, and serial number so the care record starts cleanly.</p>
                </div>
                <ShieldCheck className="h-5 w-5 text-slate-400" strokeWidth={1.8} />
              </div>
              <form onSubmit={submit} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <PremiumField label="Full name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
                  <PremiumField label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} required />
                  <PremiumField label="Serial number" value={form.serial} onChange={(value) => setForm((current) => ({ ...current, serial: value }))} required />
                  <PremiumField label="Purchase date" type="date" value={form.purchaseDate} onChange={(value) => setForm((current) => ({ ...current, purchaseDate: value }))} required />
                  <PremiumField label="Invoice number" value={form.invoiceNumber} onChange={(value) => setForm((current) => ({ ...current, invoiceNumber: value }))} required />
                  <PremiumSelect label="Product" value={form.product} onChange={(product) => setForm((current) => ({ ...current, product }))} options={["Aura Audio Pro", "Nova Watch X", "Echo Charge Max", "Lumen Hub Studio"]} />
                </div>
                <div className="flex min-h-[118px] items-center justify-center rounded-2xl border border-dashed border-slate-900/14 bg-white/48 px-5 text-center text-sm font-light leading-6 text-slate-500">
                  <FileUp className="mr-2 h-5 w-5 shrink-0 text-slate-400" />
                  Attach the invoice when upload verification is enabled.
                </div>
                <PremiumButton loading={submitting} type="submit">
                  <ShieldCheck className="h-4 w-4" />
                  {submitting ? "Opening..." : "Open care record"}
                </PremiumButton>
              </form>
            </AccountCard>

            <div className="space-y-5">
              <AccountCard className="p-6 sm:p-7">
                <div className="mb-5">
                  <SoftStatus>Claim movement</SoftStatus>
                  <h2 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">Warranty timeline</h2>
                </div>
                <div className="grid gap-3">
                  {status === "loading" && <PageLoader label="Opening warranty timeline" />}
                  {status === "error" && <EmptyState title="Warranty timeline unavailable" description={error} />}
                  {status === "success" && claims.length === 0 && <EmptyState title="No warranty records yet" description="Submitted warranty claims will appear here with tracking status." />}
                  {claims.map((claim) => <ClaimCard key={claim.id} claim={claim} />)}
                </div>
              </AccountCard>
              <PremiumNotice title="Keep this nearby">A clear invoice number and product serial make warranty verification smoother.</PremiumNotice>
            </div>
          </div>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}

function ClaimCard({ claim }) {
  return (
    <div className="rounded-2xl border border-slate-900/8 bg-white/56 p-4 shadow-[0_12px_34px_rgba(17,24,39,0.045)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold tracking-normal text-slate-950">{claim.id}</p>
        <span className="rounded-full border border-amber-700/10 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">{claim.status}</span>
      </div>
      <p className="mt-2 text-sm font-light leading-6 text-slate-500">{claim.product} · {claim.serial}</p>
    </div>
  );
}
