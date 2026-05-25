import { CheckCircle2, FileSearch, PackageCheck, ShieldCheck, TicketCheck, Truck, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageLoader } from "../../components/AppStates";
import { uploadUrl } from "../../config/api";
import { AdminShell } from "../../layouts/AdminLayout";
import { uploadService } from "../../services/uploadService";
import { warrantyService } from "../../services/warrantyService";
import { useAdminStore } from "../../store/appStore";

const ownershipStatuses = ["Active", "Rejected", "Pending Verification"];
const rmaStatuses = ["Approved", "Rejected", "Pickup Scheduled", "Inspection", "Replacement Approved", "Repaired", "Replaced", "Closed"];

export default function AdminWarrantyPage() {
  const { claims, rmas, units, status, error } = useAdminStore((state) => state.warranty);
  const loadWarranty = useAdminStore((state) => state.loadWarranty);
  const updateWarrantyStatus = useAdminStore((state) => state.updateWarrantyStatus);
  const [updating, setUpdating] = useState("");
  const [policy, setPolicy] = useState(null);
  const [policyUpload, setPolicyUpload] = useState({ status: "idle", error: "", fileName: "" });

  useEffect(() => {
    loadWarranty();
    warrantyService.getPolicy().then(setPolicy).catch(() => setPolicy(null));
  }, [loadWarranty]);

  const uploadPolicy = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setPolicyUpload({ status: "error", error: "Upload the warranty policy as a PDF file.", fileName: file.name });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPolicyUpload({ status: "error", error: "Warranty policy PDF must be 5 MB or smaller.", fileName: file.name });
      return;
    }
    setPolicyUpload({ status: "loading", error: "", fileName: file.name });
    try {
      const upload = await uploadService.uploadWarrantyPolicy(file);
      const saved = await warrantyService.updatePolicy({
        title: "INFIBOLT Warranty Policy",
        url: upload.url || upload.path,
        filename: upload.filename,
        originalName: upload.originalName || file.name,
      });
      setPolicy(saved);
      setPolicyUpload({ status: "success", error: "", fileName: file.name });
      toast.success("Warranty policy published", { description: "Customers must acknowledge this PDF before registration." });
    } catch (error) {
      setPolicyUpload({ status: "error", error: error.message || "Policy upload failed.", fileName: file.name });
    }
  };

  const updateStatus = async (id, nextStatus, notes) => {
    setUpdating(id);
    try {
      await updateWarrantyStatus(id, { status: nextStatus, notes });
      toast.success("Warranty updated", { description: `${id} moved to ${nextStatus}.` });
    } finally {
      setUpdating("");
    }
  };

  return (
    <AdminShell title="Warranty Ownership OS" description="Verify product ownership, approve warranty activation, review invoices, and manage RMA replacement workflows.">
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={PackageCheck} label="Ownership Records" value={claims.length} />
          <MetricCard icon={ShieldCheck} label="Pending Review" value={claims.filter((item) => item.status === "Pending Verification").length} />
          <MetricCard icon={TicketCheck} label="Active RMAs" value={rmas.filter((item) => !["Closed", "Rejected"].includes(item.status)).length} />
          <MetricCard icon={FileSearch} label="Serial Units" value={units.length} />
        </section>

        {status === "loading" && <PageLoader label="Opening warranty operations" />}
        {status === "error" && <EmptyState title="Warranty queue unavailable" description={error} />}

        <AdminPanel title="Warranty Policy PDF" icon={UploadCloud}>
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Upload the latest INFIBOLT warranty policy. Customers must open and acknowledge this policy before OTP registration.
              </p>
              {policy?.url ? (
                <a href={uploadUrl(policy.url)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-semibold text-slate-950 underline dark:text-white">
                  View current policy PDF
                </a>
              ) : (
                <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-300">No warranty policy is published yet.</p>
              )}
            </div>
            <label className={`flex min-h-[112px] cursor-pointer items-center justify-center rounded-2xl border border-dashed px-5 text-center text-sm transition ${
              policyUpload.status === "error"
                ? "border-rose-400/60 bg-rose-50 text-rose-800"
                : policyUpload.status === "success"
                  ? "border-emerald-400/60 bg-emerald-50 text-emerald-800"
                  : "border-slate-900/14 bg-white/54 text-slate-500 hover:bg-white dark:border-white/10 dark:bg-white/[0.04]"
            }`}>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(event) => {
                  uploadPolicy(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <span className="grid justify-items-center gap-2">
                <UploadCloud className="h-5 w-5" />
                <span className="font-semibold">{policyUpload.status === "loading" ? "Uploading policy..." : "Upload warranty policy PDF"}</span>
                <span>{policyUpload.fileName || "PDF only. Maximum file size 5 MB."}</span>
                {policyUpload.error && <span className="font-medium text-rose-700">{policyUpload.error}</span>}
              </span>
            </label>
          </div>
        </AdminPanel>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <AdminPanel title="Ownership Verification Queue" icon={ShieldCheck}>
            <div className="grid gap-4">
              {claims.length === 0 && <EmptyState title="No ownership records" description="Customer registrations and website purchase activations will appear here." />}
              {claims.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-900/5 bg-white/50 p-4 dark:border-white/5 dark:bg-white/[0.03]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="rounded-xl bg-slate-900 p-2 text-white dark:bg-white dark:text-slate-950">
                          <PackageCheck className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{item.product}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.id} · {item.serial}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
                        <span>{item.customerName || item.email}</span>
                        <span>{item.source} {item.sourceDetail ? `· ${item.sourceDetail}` : ""}</span>
                        <span>Invoice: {item.invoiceNumber || "Pending"}</span>
                        <span>Warranty until: {formatDate(item.warrantyUntil)}</span>
                      </div>
                    </div>
                    <StatusPill status={item.warrantyStatus || item.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ownershipStatuses.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        type="button"
                        disabled={updating === item.id}
                        onClick={() => updateStatus(item.id, nextStatus, nextStatus === "Active" ? "Invoice and serial approved by admin." : "Admin warranty review updated.")}
                        className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-950 hover:text-white disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                      >
                        {nextStatus}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel title="RMA Replacement Flow" icon={Truck}>
            <div className="grid gap-4">
              {rmas.length === 0 && <EmptyState title="No RMA requests" description="Customer warranty claims will appear here with repair and replacement actions." />}
              {rmas.map((rma) => (
                <div key={rma.id} className="rounded-2xl border border-slate-900/5 bg-white/50 p-4 dark:border-white/5 dark:bg-white/[0.03]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{rma.id}</p>
                      <p className="mt-1 text-sm text-slate-500">{rma.product} · {rma.serial}</p>
                    </div>
                    <StatusPill status={rma.status} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{rma.issueType}: {rma.issueDescription}</p>
                  {rma.policyDecision && <p className="mt-3 rounded-xl bg-slate-900/5 p-3 text-sm font-medium text-slate-700 dark:bg-white/5 dark:text-slate-300">{rma.policyDecision}</p>}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {rmaStatuses.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        type="button"
                        disabled={updating === rma.id}
                        onClick={() => updateStatus(rma.id, nextStatus, `RMA moved to ${nextStatus}.`)}
                        className="min-h-[38px] rounded-full border border-slate-900/10 bg-white/70 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-950 hover:text-white disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                      >
                        {nextStatus}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>
        </section>

        <AdminPanel title="Warranty Decision System" icon={CheckCircle2}>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Serial validation", "INF serial format, duplicate checks, blocked units, and product matching."],
              ["Invoice review", "Marketplace, Flipkart, Amazon, retail, and offline purchase evidence."],
              ["Policy decision", "7-day replacement, 6-12 month warranty, exclusions, and RMA timeline."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-900/5 bg-white/50 p-5 dark:border-white/5 dark:bg-white/[0.03]">
                <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="premium-surface p-5 dark:bg-white/[0.03]">
      <Icon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
      <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{label}</p>
    </div>
  );
}

function AdminPanel({ title, icon: Icon, children }) {
  return (
    <section className="premium-surface p-5 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-xl bg-slate-900/5 p-2 text-slate-900 dark:bg-white/10 dark:text-white">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || "").toLowerCase();
  const tone =
    normalized.includes("active") || normalized.includes("approved") || normalized.includes("repaired") || normalized.includes("replaced")
      ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      : normalized.includes("rejected") || normalized.includes("expired")
        ? "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
        : "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tone}`}>{status}</span>;
}

function formatDate(value) {
  if (!value) return "After approval";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
