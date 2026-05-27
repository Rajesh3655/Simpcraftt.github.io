import { CheckCircle2, Eye, FileText, Image as ImageIcon, Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageLoader } from "../../components/AppStates";
import { uploadUrl } from "../../config/api";
import { AdminShell } from "../../layouts/AdminLayout";
import { useAdminStore } from "../../store/appStore";
import { formatIndiaDateTime } from "../../utils/time";

const statusOptions = ["Requested", "In Progress", "Approved", "Rejected"];

export default function AdminWarrantyClaimsPage() {
  const warranty = useAdminStore((state) => state.warranty);
  const loadWarranty = useAdminStore((state) => state.loadWarranty);
  const updateWarrantyStatus = useAdminStore((state) => state.updateWarrantyStatus);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [statusDrafts, setStatusDrafts] = useState({});
  const [notesDrafts, setNotesDrafts] = useState({});
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState("");

  useEffect(() => {
    loadWarranty();
  }, [loadWarranty]);

  const ownershipById = useMemo(() => {
    return (warranty.claims || []).reduce((map, item) => ({ ...map, [item.id]: item }), {});
  }, [warranty.claims]);

  const records = useMemo(() => {
    const rows = (warranty.rmas || [])
      .map((item) => ({ ...item, ownership: ownershipById[item.ownershipId] }))
      .filter((item) => item.ownership?.status === "Active");
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter((item) => {
      if (!needle) return true;
      return [item.id, item.customerName, item.email, item.product, item.serial, item.status, item.issueType, item.ownership?.invoiceNumber]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    return filtered.sort((a, b) => {
      if (sortBy === "oldest") return dateValue(a.createdAt || a.updatedAt) - dateValue(b.createdAt || b.updatedAt);
      if (sortBy === "status") return currentStatus(a).localeCompare(currentStatus(b));
      if (sortBy === "product") return String(a.product || "").localeCompare(String(b.product || ""));
      return dateValue(b.createdAt || b.updatedAt) - dateValue(a.createdAt || a.updatedAt);
    });
  }, [ownershipById, query, sortBy, warranty.rmas]);

  const save = async (item) => {
    const id = item.id;
    const payload = {
      status: statusDrafts[id] || item.status || "Requested",
      notes: notesDrafts[id] || "",
    };
    setSaving(id);
    try {
      const updated = await updateWarrantyStatus(id, payload);
      setSelected((current) => (current?.id === id ? { ...current, ...updated, ownership: current.ownership } : current));
      toast.success("Claim updated", { description: `${id} moved to ${payload.status}.` });
      setNotesDrafts((current) => ({ ...current, [id]: "" }));
    } finally {
      setSaving("");
    }
  };

  return (
    <AdminShell section="warrantyClaims" title="Warranty Claims" description="Review approved-registration care requests with customer photo, invoice, serial, and decision context.">
      <div className="grid gap-5">
        {warranty.status === "loading" && <PageLoader label="Opening warranty claim queue" />}
        {warranty.status === "error" && <EmptyState title="Warranty claims unavailable" description={warranty.error} />}

        <section className="rounded-[1.25rem] border border-slate-900/8 bg-white/76 p-5 shadow-[0_18px_58px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/[0.035]">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight">Claim Review</h2>
          </div>

          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-center">
            <label className="flex min-h-[46px] items-center gap-3 rounded-full border border-slate-900/10 bg-white px-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search claim, serial, customer, product" className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />
            </label>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-h-[46px] rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 outline-none shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
              <option value="latest">Latest submitted</option>
              <option value="oldest">Oldest submitted</option>
              <option value="status">Status A-Z</option>
              <option value="product">Product name</option>
            </select>
            <div className="grid gap-1 text-right">
              <p className="text-2xl font-semibold">{records.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Approved warranty claims</p>
            </div>
          </div>

          {records.length === 0 ? (
            <EmptyState title="No approved warranty claims" description="Only care requests from approved warranty registrations appear here." />
          ) : (
            <div className="-mx-2 overflow-x-auto px-2">
              <table className="w-full min-w-[940px] border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr>
                    {["Claim", "Customer", "Product", "Issue", "Status", "Details"].map((column) => (
                      <th key={column} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((item) => (
                    <tr key={item.id} className="rounded-xl bg-slate-950/[0.025] transition hover:bg-slate-950/[0.045] dark:bg-white/[0.025] dark:hover:bg-white/[0.055]">
                      <td className="rounded-l-xl px-4 py-4">
                        <span className="block font-semibold text-slate-950 dark:text-white">{item.id}</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500">{formatDate(item.createdAt || item.updatedAt)}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        <span className="block font-medium">{item.customerName || item.email || "Customer"}</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500">{item.email || "-"}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        <span className="block font-medium">{item.product || "Product"}</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500">{item.serial || "-"}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{item.issueType || "-"}</td>
                      <td className="px-4 py-4"><StatusPill status={currentStatus(item)} /></td>
                      <td className="rounded-r-xl px-4 py-4">
                        <button type="button" onClick={() => setSelected(item)} className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white dark:hover:text-slate-950">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selected && (
          <ClaimDetailsModal
            item={selected}
            saving={saving}
            statusDraft={statusDrafts[selected.id] || currentStatus(selected)}
            noteDraft={notesDrafts[selected.id] || ""}
            onStatusChange={(value) => setStatusDrafts((current) => ({ ...current, [selected.id]: value }))}
            onNoteChange={(value) => setNotesDrafts((current) => ({ ...current, [selected.id]: value }))}
            onSaveStatus={() => save(selected)}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </AdminShell>
  );
}

function ClaimDetailsModal({ item, saving, statusDraft, noteDraft, onStatusChange, onNoteChange, onSaveStatus, onClose }) {
  const ownership = item.ownership || {};
  const claimPhoto = item.attachments?.[0];
  const claimPhotoHref = uploadUrl(claimPhoto?.url);
  const invoiceHref = uploadUrl(ownership.invoiceUrl || ownership.invoice);
  const invoiceIsPdf = /\.pdf(?:$|\?)/i.test(invoiceHref);
  const invoiceIsImage = /\.(png|jpe?g|webp|gif)$/i.test(invoiceHref);

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-950/42 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl rounded-[1.25rem] border border-white/70 bg-white p-5 shadow-[0_30px_100px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-slate-950 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Warranty claim</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.id}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{item.product || "Product"} / {item.serial || "No serial"}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-slate-900/10 bg-white text-slate-600 transition hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-3">
            <DetailGrid
              title="Claim details"
              rows={[
                ["Status", item.status || "Requested"],
                ["Customer", item.customerName || item.email || "Customer"],
                ["Email", item.email || "-"],
                ["Product", item.product || "-"],
                ["Serial", item.serial || "-"],
                ["Issue", item.issueType || "-"],
                ["Submitted", formatDate(item.createdAt || item.updatedAt)],
                ["Customer note", item.issueDescription || "-"],
                ["Admin update", item.notes || "-"],
              ]}
            />
            <DetailGrid
              title="Approved registration"
              rows={[
                ["Ownership", ownership.id || item.ownershipId || "-"],
                ["Invoice number", ownership.invoiceNumber || "-"],
                ["Purchase date", formatDate(ownership.purchaseDate)],
                ["Warranty until", formatDate(ownership.warrantyUntil)],
              ]}
            />
            <section className="rounded-[1rem] border border-slate-900/8 bg-slate-950/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.035]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Claim decision</p>
              <label className="mt-4 grid gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Move status</span>
                <select value={statusDraft} onChange={(event) => onStatusChange(event.target.value)} className="premium-control min-h-[44px] px-4 text-sm font-medium dark:bg-black/20">
                  {statusOptions.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label className="mt-3 grid gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Customer-visible update</span>
                <textarea value={noteDraft} onChange={(event) => onNoteChange(event.target.value)} rows={4} className="premium-control px-4 py-3 text-sm font-medium outline-none dark:bg-black/20" placeholder="Reason for approval, rejection, or in-progress update" />
              </label>
              <button type="button" onClick={onSaveStatus} disabled={saving === item.id} className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(15,23,42,0.16)] disabled:opacity-60 dark:bg-white dark:text-slate-950">
                <CheckCircle2 className="h-4 w-4" />
                {saving === item.id ? "Saving..." : "Update claim"}
              </button>
            </section>
          </div>

          <div className="grid gap-4">
            <PreviewPanel title="Customer photo" href={claimPhotoHref} empty="No customer photo uploaded" icon={ImageIcon} />
            <PreviewPanel title="Invoice" href={invoiceHref} isPdf={invoiceIsPdf} isImage={invoiceIsImage} empty="No invoice uploaded" icon={FileText} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({ title, href, isPdf = false, isImage = true, empty, icon: Icon }) {
  return (
    <section className="rounded-[1rem] border border-slate-900/8 bg-slate-950/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.035]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{title}</p>
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-slate-950">
            <Icon className="h-3.5 w-3.5" />
            Open
          </a>
        )}
      </div>
      {href ? (
        isPdf ? (
          <iframe title={title} src={href} className="h-[420px] w-full rounded-xl border border-slate-900/10 bg-white dark:border-white/10" />
        ) : isImage ? (
          <img src={href} alt={title} className="max-h-[420px] w-full rounded-xl border border-slate-900/10 bg-white object-contain dark:border-white/10" />
        ) : (
          <div className="grid min-h-[220px] place-items-center rounded-xl border border-dashed border-slate-900/14 bg-white/70 p-6 text-center dark:border-white/10 dark:bg-white/[0.025]">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Preview unavailable</p>
          </div>
        )
      ) : (
        <div className="grid min-h-[220px] place-items-center rounded-xl border border-dashed border-slate-900/14 bg-white/70 p-6 text-center dark:border-white/10 dark:bg-white/[0.025]">
          <div>
            <Icon className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{empty}</p>
          </div>
        </div>
      )}
    </section>
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

function StatusPill({ status }) {
  const normalized = String(status || "").toLowerCase();
  const tone = normalized.includes("reject")
    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
    : normalized.includes("request") || normalized.includes("progress")
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tone}`}>{status}</span>;
}

function formatDate(value) {
  return formatIndiaDateTime(value);
}

function currentStatus(item) {
  return item.status || "Requested";
}

function dateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
