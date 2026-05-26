import { Eye, FileText, Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageLoader } from "../../components/AppStates";
import { uploadUrl } from "../../config/api";
import { AdminShell } from "../../layouts/AdminLayout";
import { useAdminStore } from "../../store/appStore";
import { formatIndiaDateTime } from "../../utils/time";

const warrantyActions = [
  { label: "Approve", status: "Active", note: "Invoice and serial confirmed.", tone: "green" },
  { label: "Pending", status: "Pending Verification", note: "Warranty registration needs additional review.", tone: "orange" },
  { label: "Reject", status: "Rejected", note: "Warranty registration could not be verified.", tone: "red" },
];

export default function AdminWarrantyPage() {
  const { claims, status, error } = useAdminStore((state) => state.warranty);
  const loadWarranty = useAdminStore((state) => state.loadWarranty);
  const updateWarrantyStatus = useAdminStore((state) => state.updateWarrantyStatus);
  const [updating, setUpdating] = useState("");
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    loadWarranty();
  }, [loadWarranty]);

  const visibleClaims = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = claims.filter((item) => {
      const itemStatus = getWarrantyStatus(item);
      const matchesStatus = statusFilter === "all" || itemStatus.toLowerCase().includes(statusFilter);
      if (!matchesStatus) return false;
      if (!needle) return true;
      return [
        item.id,
        item.product,
        item.productSlug,
        item.serial,
        item.customerName,
        item.email,
        item.phone,
        item.invoiceNumber,
        item.source,
        item.sourceDetail,
        itemStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") return dateValue(a.registeredAt || a.createdAt) - dateValue(b.registeredAt || b.createdAt);
      if (sortBy === "status") return getWarrantyStatus(a).localeCompare(getWarrantyStatus(b));
      if (sortBy === "product") return String(a.product || "").localeCompare(String(b.product || ""));
      return dateValue(b.registeredAt || b.createdAt) - dateValue(a.registeredAt || a.createdAt);
    });
  }, [claims, query, sortBy, statusFilter]);

  const updateStatus = async (item, action) => {
    setUpdating(`${item.id}-${action.status}`);
    try {
      const updated = await updateWarrantyStatus(item.id, { status: action.status, notes: action.note });
      setSelected((current) => (current?.id === item.id ? { ...current, ...updated } : current));
      toast.success("Registered warranty updated", { description: `${item.id} is now ${action.label}.` });
    } finally {
      setUpdating("");
    }
  };

  return (
    <AdminShell section="registeredWarranty" title="Registered Warranty" description="Review registered products, confirm ownership details, and keep warranty records accurate.">
      <div className="grid gap-5">
        {status === "loading" && <PageLoader label="Opening registered warranty queue" />}
        {status === "error" && <EmptyState title="Registered warranty unavailable" description={error} />}

        <section className="rounded-[1.25rem] border border-slate-900/8 bg-white/76 p-5 shadow-[0_18px_58px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/[0.035]">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight">Warranty Verification</h2>
          </div>

          {claims.length > 0 && (
            <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_200px_220px]">
              <label className="flex min-h-[46px] items-center gap-3 rounded-full border border-slate-900/10 bg-white px-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search product, serial, customer, invoice"
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="min-h-[46px] rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 outline-none shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="min-h-[46px] rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 outline-none shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="latest">Latest registered</option>
                <option value="oldest">Oldest registered</option>
                <option value="status">Status A-Z</option>
                <option value="product">Product name</option>
              </select>
            </div>
          )}

          {visibleClaims.length === 0 ? (
            <EmptyState title="No registered warranties" description="Customer warranty registrations will appear here." />
          ) : (
            <div className="-mx-2 overflow-x-auto px-2">
              <table className="w-full min-w-[940px] border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr>
                    {["Product", "Customer", "Invoice", "Purchase", "Status", "Details"].map((column) => (
                      <th key={column} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleClaims.map((item) => {
                    const currentStatus = getWarrantyStatus(item);
                    return (
                      <tr key={item.id} className="rounded-xl bg-slate-950/[0.025] transition hover:bg-slate-950/[0.045] dark:bg-white/[0.025] dark:hover:bg-white/[0.055]">
                        <td className="rounded-l-xl px-4 py-4 text-slate-700 dark:text-slate-300">
                          <span className="block font-semibold text-slate-950 dark:text-white">{item.product || "Product"}</span>
                          <span className="mt-1 block text-xs font-medium text-slate-500">{item.serial || "-"}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                          <span className="block font-medium">{item.customerName || item.email || "Customer"}</span>
                          <span className="mt-1 block text-xs font-medium text-slate-500">{item.email || item.phone || "-"}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                          <span className="block font-medium">{item.invoiceNumber || "Pending"}</span>
                          <span className="mt-1 block text-xs font-medium text-slate-500">{item.source || "Website"}{item.sourceDetail ? ` / ${item.sourceDetail}` : ""}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                          <span className="block font-medium">{formatDate(item.purchaseDate || item.registeredAt)}</span>
                          <span className="mt-1 block text-xs font-medium text-slate-500">Until {formatDate(item.warrantyUntil)}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                          <StatusBadge status={currentStatus} />
                        </td>
                        <td className="rounded-r-xl px-4 py-4 text-slate-700 dark:text-slate-300">
                          <button
                            type="button"
                            onClick={() => setSelected(item)}
                            className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white dark:hover:text-slate-950"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selected && <WarrantyDetailsModal item={selected} updating={updating} onUpdate={updateStatus} onClose={() => setSelected(null)} />}
      </div>
    </AdminShell>
  );
}

function WarrantyDetailsModal({ item, updating, onUpdate, onClose }) {
  const invoiceHref = uploadUrl(item.invoiceUrl || item.invoice);
  const invoiceIsImage = /\.(png|jpe?g|webp|gif)$/i.test(invoiceHref);
  const invoiceIsPdf = /\.pdf(?:$|\?)/i.test(invoiceHref);
  const currentStatus = getWarrantyStatus(item);

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-950/42 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl rounded-[1.25rem] border border-white/70 bg-white p-5 shadow-[0_30px_100px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-slate-950 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Warranty details</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.product || "Registered product"}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{item.id} / {item.serial || "No serial"}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-slate-900/10 bg-white text-slate-600 transition hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1rem] border border-slate-900/8 bg-slate-950/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.035]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Review decision</p>
            <div className="mt-2">
              <StatusBadge status={currentStatus} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {warrantyActions.map((action) => (
              <button
                key={action.status}
                type="button"
                disabled={updating === `${item.id}-${action.status}`}
                onClick={() => onUpdate(item, action)}
                className={`inline-flex min-h-[38px] items-center justify-center rounded-full px-5 text-[10px] font-bold uppercase tracking-[0.14em] transition disabled:opacity-50 ${actionClass(action.tone, currentStatus === action.status)}`}
              >
                {updating === `${item.id}-${action.status}` ? "Saving" : action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-3">
            <DetailGrid
              title="Registration"
              rows={[
                ["Status", item.warrantyStatus || item.status || "Pending Verification"],
                ["Customer", item.customerName || "Customer"],
                ["Email", item.email || "-"],
                ["Phone", item.phone || "-"],
                ["Source", [item.source, item.sourceDetail].filter(Boolean).join(" / ") || "-"],
                ["Registered", formatDate(item.registeredAt || item.createdAt)],
              ]}
            />
            <DetailGrid
              title="Product & Warranty"
              rows={[
                ["Product", item.product || "-"],
                ["Product slug", item.productSlug || "-"],
                ["Serial", item.serial || "-"],
                ["Purchase date", formatDate(item.purchaseDate)],
                ["Warranty start", formatDate(item.warrantyStart)],
                ["Warranty until", formatDate(item.warrantyUntil)],
              ]}
            />
            <DetailGrid
              title="Invoice"
              rows={[
                ["Invoice number", item.invoiceNumber || "-"],
                ["Invoice file", invoiceHref ? "Available" : "Not uploaded"],
                ["OTP verified", formatDate(item.otpVerifiedAt)],
                ["Approved at", formatDate(item.verifiedAt)],
                ["Rejected at", formatDate(item.rejectedAt)],
                ["Review note", item.reviewNote || "-"],
              ]}
            />
          </div>

          <div className="rounded-[1rem] border border-slate-900/8 bg-slate-950/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.035]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Invoice view</p>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{item.invoiceNumber || "No invoice number"}</p>
              </div>
              {invoiceHref && (
                <a href={invoiceHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-slate-950">
                  <FileText className="h-3.5 w-3.5" />
                  {invoiceIsPdf ? "Open PDF" : "Open invoice"}
                </a>
              )}
            </div>
            {invoiceHref ? (
              invoiceIsImage ? (
                <img src={invoiceHref} alt="Warranty invoice" className="max-h-[620px] w-full rounded-xl border border-slate-900/10 bg-white object-contain dark:border-white/10" />
              ) : invoiceIsPdf ? (
                <iframe title="Warranty PDF invoice" src={invoiceHref} className="h-[620px] w-full rounded-xl border border-slate-900/10 bg-white dark:border-white/10" />
              ) : (
                <div className="grid min-h-[420px] place-items-center rounded-xl border border-dashed border-slate-900/14 bg-white/70 p-6 text-center dark:border-white/10 dark:bg-white/[0.025]">
                  <div>
                    <FileText className="mx-auto h-9 w-9 text-slate-400" />
                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Preview unavailable for this file type</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Upload a PDF or image invoice to preview it inside this panel.</p>
                  </div>
                </div>
              )
            ) : (
              <div className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-slate-900/14 bg-white/70 text-center dark:border-white/10 dark:bg-white/[0.025]">
                <div>
                  <FileText className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">No invoice uploaded</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailGrid({ title, rows }) {
  return (
    <section className="rounded-[1rem] border border-slate-900/8 bg-white/72 p-4 dark:border-white/10 dark:bg-white/[0.025]">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <dl className="mt-3 grid gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 rounded-xl bg-slate-950/[0.025] p-3 sm:grid-cols-[130px_1fr] dark:bg-white/[0.035]">
            <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</dt>
            <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const tone = normalized.includes("reject")
    ? "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
    : normalized.includes("pending") || normalized.includes("review") || normalized.includes("verification")
      ? "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
      : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone}`}>{status}</span>;
}

function actionClass(tone, active) {
  const variants = {
    green: active ? "bg-emerald-600 text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white",
    orange: active ? "bg-amber-500 text-white" : "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-500 hover:text-white",
    red: active ? "bg-rose-600 text-white" : "border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-600 hover:text-white",
  };
  return variants[tone] || variants.orange;
}

function getWarrantyStatus(item) {
  return item?.warrantyStatus || item?.status || "Pending Verification";
}

function dateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDate(value) {
  return formatIndiaDateTime(value);
}
