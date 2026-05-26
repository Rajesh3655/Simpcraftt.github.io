import { CheckCircle2, FileText, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "../../layouts/AdminLayout";
import { useAdminStore } from "../../store/appStore";
import { formatIndiaDateTime } from "../../utils/time";

export default function AdminWarrantyClaimsPage() {
  const warranty = useAdminStore((state) => state.warranty);
  const loadWarranty = useAdminStore((state) => state.loadWarranty);
  const updateWarrantyStatus = useAdminStore((state) => state.updateWarrantyStatus);
  const [query, setQuery] = useState("");
  const [statusDrafts, setStatusDrafts] = useState({});
  const [notesDrafts, setNotesDrafts] = useState({});
  const [saving, setSaving] = useState("");

  useEffect(() => {
    if (warranty.status === "idle") loadWarranty();
  }, [loadWarranty, warranty.status]);

  const records = useMemo(() => {
    const rows = [
      ...(warranty.rmas || []).map((item) => ({ ...item, kind: "RMA" })),
      ...(warranty.claims || []).map((item) => ({ ...item, kind: "Warranty" })),
    ];
    const needle = query.trim().toLowerCase();
    return rows.filter((item) => {
      if (!needle) return true;
      return [item.id, item.customer, item.customerName, item.email, item.product, item.productName, item.serial, item.status, item.warrantyStatus]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, warranty.claims, warranty.rmas]);

  const save = async (item) => {
    const id = item.id;
    const payload = {
      status: statusDrafts[id] || item.status || item.warrantyStatus,
      notes: notesDrafts[id] || "",
      priority: item.kind === "RMA" ? item.priority : undefined,
    };
    setSaving(id);
    try {
      await updateWarrantyStatus(id, payload);
      toast.success("Warranty updated", { description: `${id} moved to ${payload.status}.` });
      setNotesDrafts((current) => ({ ...current, [id]: "" }));
    } finally {
      setSaving("");
    }
  };

  return (
    <AdminShell section="warrantyClaims" title="Warranty Claims" description="Review warranty care requests with clear customer, product, serial, and invoice context.">
      <div className="grid gap-5">
        <section className="grid gap-4 rounded-[1.15rem] border border-slate-900/8 bg-white/70 p-5 shadow-[0_14px_44px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.035] lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="flex min-h-[46px] items-center gap-3 rounded-full border border-slate-900/10 bg-white/75 px-5 dark:border-white/10 dark:bg-white/5">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400" placeholder="Search claim, serial, customer, product" />
          </label>
          <div className="grid gap-2 text-right">
            <p className="text-2xl font-semibold">{records.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Visible records</p>
          </div>
        </section>

        <div className="grid gap-4">
          {records.map((item) => {
            const currentStatus = item.status || item.warrantyStatus || "Pending Verification";
            return (
              <section key={`${item.kind}-${item.id}`} className="rounded-[1.15rem] border border-slate-900/8 bg-white/72 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.035]">
                <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-slate-950">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {item.kind}
                      </span>
                      <StatusPill status={currentStatus} />
                      {item.priority && <StatusPill status={item.priority} />}
                    </div>
                    <h2 className="mt-4 text-xl font-semibold tracking-tight">{item.id}</h2>
                    <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                      <Info label="Customer" value={item.customer || item.customerName || item.email || "Customer"} />
                      <Info label="Product" value={item.product || item.productName || item.productSlug || "Product"} />
                      <Info label="Serial" value={item.serial || item.serialNumber || "-"} />
                      <Info label="Submitted" value={formatDate(item.createdAt || item.registeredAt || item.updatedAt)} />
                    </div>
                    {(item.invoiceUrl || item.invoice) && (
                      <a href={item.invoiceUrl || item.invoice} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                        <FileText className="h-4 w-4" />
                        Invoice
                      </a>
                    )}
                  </div>

                  <div className="grid gap-3 rounded-[1rem] bg-slate-950/[0.025] p-4 dark:bg-white/[0.025]">
                    <label className="grid gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Move status</span>
                      <select value={statusDrafts[item.id] || currentStatus} onChange={(event) => setStatusDrafts((current) => ({ ...current, [item.id]: event.target.value }))} className="premium-control min-h-[44px] px-4 text-sm font-medium dark:bg-black/20">
                        {statusOptions.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Internal note</span>
                      <textarea value={notesDrafts[item.id] || ""} onChange={(event) => setNotesDrafts((current) => ({ ...current, [item.id]: event.target.value }))} rows={3} className="premium-control px-4 py-3 text-sm font-medium outline-none dark:bg-black/20" placeholder="Care note, invoice detail, serial confirmation" />
                    </label>
                    <button type="button" onClick={() => save(item)} disabled={saving === item.id} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(15,23,42,0.16)] disabled:opacity-60 dark:bg-white dark:text-slate-950">
                      <CheckCircle2 className="h-4 w-4" />
                      {saving === item.id ? "Saving..." : "Update"}
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}

const statusOptions = [
  "Pending Verification",
  "Verification",
  "Active",
  "Approved",
  "Rejected",
  "Claim Under Review",
  "Replacement Approved",
  "Repair Approved",
  "Repaired",
  "Replaced",
  "Resolved",
  "Closed",
];

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-950/[0.025] p-3 dark:bg-white/[0.025]">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || "").toLowerCase();
  const tone = normalized.includes("reject")
    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
    : normalized.includes("pending") || normalized.includes("review") || normalized.includes("verification")
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tone}`}>{status}</span>;
}

function formatDate(value) {
  return formatIndiaDateTime(value);
}
