import { Download, Search, ShieldCheck, TicketCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, PageLoader } from "../../components/AppStates";
import { uploadUrl } from "../../config/api";
import { AdminShell } from "../../layouts/AdminLayout";
import { useAdminStore } from "../../store/appStore";
import { formatIndiaDate, formatIndiaDateTime } from "../../utils/time";

const statusTabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const modeTabs = [
  { key: "registered", label: "Registered Warranty", icon: ShieldCheck },
  { key: "claims", label: "Claims", icon: TicketCheck },
];

export default function AdminClaimStatusPage() {
  const { claims, rmas, status, error } = useAdminStore((state) => state.warranty);
  const loadWarranty = useAdminStore((state) => state.loadWarranty);
  const [mode, setMode] = useState("registered");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("status");
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadWarranty();
  }, [loadWarranty]);

  const ownershipById = useMemo(() => {
    return new Map((claims || []).map((item) => [item.id, item]));
  }, [claims]);

  const rows = useMemo(() => {
    const source = mode === "claims" ? rmas || [] : claims || [];
    const needle = query.trim().toLowerCase();
    const filtered = source
      .map((item) => normalizeWarrantyRow(item, mode, ownershipById.get(item.ownershipId)))
      .filter((item) => {
        if (statusFilter !== "all" && item.statusBucket !== statusFilter) return false;
        if (!needle) return true;
        return [
          item.id,
          item.customerName,
          item.email,
          item.phone,
          item.product,
          item.productSlug,
          item.serial,
          item.status,
          item.invoiceNumber,
          item.invoiceUrl,
          item.issueType,
          item.issueDescription,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
      });

    return filtered.sort((a, b) => {
      if (sortBy === "newest") return dateValue(b.updatedAt || b.registeredAt || b.createdAt) - dateValue(a.updatedAt || a.registeredAt || a.createdAt);
      if (sortBy === "oldest") return dateValue(a.updatedAt || a.registeredAt || a.createdAt) - dateValue(b.updatedAt || b.registeredAt || b.createdAt);
      if (sortBy === "product") return a.product.localeCompare(b.product);
      if (sortBy === "customer") return a.customerName.localeCompare(b.customerName);
      return statusRank(a.statusBucket) - statusRank(b.statusBucket) || a.status.localeCompare(b.status);
    });
  }, [claims, mode, ownershipById, query, rmas, sortBy, statusFilter]);

  const exportRows = () => {
    const filename = `infibolt-${mode === "claims" ? "claims" : "registered-warranty"}-${statusFilter}.csv`;
    const csv = toCsv([
      [
        "type",
        "id",
        "status",
        "statusGroup",
        "customerName",
        "email",
        "phone",
        "product",
        "productSlug",
        "serial",
        "source",
        "sourceDetail",
        "invoiceNumber",
        "invoiceUrl",
        "purchaseDate",
        "registeredAt",
        "warrantyStart",
        "warrantyUntil",
        "ownershipId",
        "issueType",
        "issueDescription",
        "priority",
        "notes",
        "updatedAt",
        "createdAt",
      ],
      ...rows.map((item) => [
        item.type,
        item.id,
        item.status,
        item.statusBucket,
        item.customerName,
        item.email,
        item.phone,
        item.product,
        item.productSlug,
        item.serial,
        item.source,
        item.sourceDetail,
        item.invoiceNumber,
        item.invoiceUrl,
        formatDateOnly(item.purchaseDate),
        formatDate(item.registeredAt),
        formatDateOnly(item.warrantyStart),
        formatDateOnly(item.warrantyUntil),
        item.ownershipId,
        item.issueType,
        item.issueDescription,
        item.priority,
        item.notes,
        formatDate(item.updatedAt),
        formatDate(item.createdAt),
      ]),
    ]);
    downloadCsv(filename, csv);
  };

  return (
    <AdminShell section="claimStatus" title="Warranty Details" description="Review registered warranties and warranty claims with clean status sorting and export-ready invoice details.">
      <section className="rounded-[1.25rem] border border-slate-900/8 bg-white/76 p-5 shadow-[0_18px_58px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/[0.035]">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {modeTabs.map((tab) => {
              const Icon = tab.icon;
              const active = mode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setMode(tab.key)}
                  className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 text-[10px] font-bold uppercase tracking-[0.14em] transition ${
                    active
                      ? "bg-slate-950 text-white shadow-[0_12px_26px_rgba(15,23,42,0.15)] dark:bg-white dark:text-slate-950"
                      : "border border-slate-900/10 bg-white text-slate-700 hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={exportRows}
            disabled={!rows.length}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <div className="mb-5 grid gap-3 xl:grid-cols-[1fr_220px_220px]">
          <label className="flex min-h-[46px] items-center gap-3 rounded-full border border-slate-900/10 bg-white px-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customer, serial, product, invoice"
              className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-h-[46px] rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 outline-none shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
          >
            {statusTabs.map((tab) => <option key={tab.key} value={tab.key}>{tab.label}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="min-h-[46px] rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 outline-none shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="status">Sort by status</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="product">Product name</option>
            <option value="customer">Customer name</option>
          </select>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`inline-flex min-h-[34px] items-center justify-center rounded-full px-4 text-[10px] font-bold uppercase tracking-[0.14em] transition ${
                statusFilter === tab.key
                  ? statusButtonClass(tab.key, true)
                  : statusButtonClass(tab.key, false)
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {status === "loading" && <PageLoader label="Opening warranty records" />}
        {status === "error" && <EmptyState title="Claim status unavailable" description={error} />}
        {status !== "loading" && status !== "error" && (
          rows.length ? <WarrantyStatusTable rows={rows} /> : <EmptyState title="No records match this view" description="Try another status, search term, or list type." />
        )}
      </section>
    </AdminShell>
  );
}

function WarrantyStatusTable({ rows }) {
  return (
    <div className="-mx-2 overflow-x-auto px-2">
      <table className="w-full min-w-[1120px] border-separate border-spacing-y-2 text-left text-sm">
        <thead>
          <tr>
            {["ID", "Customer", "Product", "Serial", "Invoice URL", "Date", "Status"].map((column) => (
              <th key={column} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={`${item.type}-${item.id}`} className="rounded-xl bg-slate-950/[0.025] transition hover:bg-slate-950/[0.045] dark:bg-white/[0.025] dark:hover:bg-white/[0.055]">
              <td className="rounded-l-xl px-4 py-4 text-slate-700 dark:text-slate-300">
                <span className="block font-semibold text-slate-950 dark:text-white">{item.id}</span>
                <span className="mt-1 block text-xs font-medium text-slate-500">{item.type}</span>
              </td>
              <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                <span className="block font-medium">{item.customerName || "Customer"}</span>
                <span className="mt-1 block text-xs font-medium text-slate-500">{item.email || item.phone || "-"}</span>
              </td>
              <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                <span className="block font-medium">{item.product || "-"}</span>
                <span className="mt-1 block text-xs font-medium text-slate-500">{item.productSlug || item.issueType || "-"}</span>
              </td>
              <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">{item.serial || "-"}</td>
              <td className="max-w-[300px] px-4 py-4 text-slate-700 dark:text-slate-300">
                {item.invoiceUrl ? (
                  <a href={item.invoiceUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-xs font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white">
                    {item.invoiceUrl}
                  </a>
                ) : (
                  <span className="text-xs font-medium text-slate-400">Not available</span>
                )}
              </td>
              <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                <span className="block font-medium">{formatDate(item.registeredAt || item.createdAt)}</span>
                <span className="mt-1 block text-xs font-medium text-slate-500">{formatDate(item.updatedAt)}</span>
              </td>
              <td className="rounded-r-xl px-4 py-4">
                <StatusBadge status={item.status} bucket={item.statusBucket} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeWarrantyRow(item, mode, ownership = null) {
  const status = mode === "claims" ? item.status || "Requested" : item.warrantyStatus || item.status || "Pending Verification";
  const invoiceUrl = uploadUrl(item.invoiceUrl || ownership?.invoiceUrl || item.invoice);
  return {
    type: mode === "claims" ? "Claim" : "Registered Warranty",
    id: item.id || item._id || "-",
    status,
    statusBucket: statusBucket(status),
    customerName: item.customerName || item.customer || ownership?.customerName || "",
    email: item.email || ownership?.email || "",
    phone: item.phone || ownership?.phone || "",
    product: item.product || ownership?.product || "",
    productSlug: item.productSlug || ownership?.productSlug || "",
    serial: item.serial || ownership?.serial || "",
    source: item.source || ownership?.source || "",
    sourceDetail: item.sourceDetail || ownership?.sourceDetail || "",
    invoiceNumber: item.invoiceNumber || ownership?.invoiceNumber || "",
    invoiceUrl,
    purchaseDate: item.purchaseDate || ownership?.purchaseDate || "",
    registeredAt: item.registeredAt || ownership?.registeredAt || "",
    warrantyStart: item.warrantyStart || ownership?.warrantyStart || "",
    warrantyUntil: item.warrantyUntil || ownership?.warrantyUntil || "",
    ownershipId: item.ownershipId || ownership?.id || "",
    issueType: item.issueType || "",
    issueDescription: item.issueDescription || "",
    priority: item.priority || "",
    notes: item.notes || item.reviewNote || "",
    updatedAt: item.updatedAt || "",
    createdAt: item.createdAt || "",
  };
}

function statusBucket(status) {
  const value = String(status || "").toLowerCase();
  if (value.includes("reject")) return "rejected";
  if (value.includes("active") || value.includes("approved") || value.includes("repaired") || value.includes("replaced") || value.includes("closed")) return "approved";
  return "pending";
}

function statusRank(bucket) {
  return { pending: 1, approved: 2, rejected: 3 }[bucket] || 0;
}

function statusButtonClass(key, active) {
  const tones = {
    all: active ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "border border-slate-900/10 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
    pending: active ? "bg-amber-500 text-white" : "border border-amber-200 bg-amber-50 text-amber-800",
    approved: active ? "bg-emerald-600 text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-800",
    rejected: active ? "bg-rose-600 text-white" : "border border-rose-200 bg-rose-50 text-rose-800",
  };
  return tones[key] || tones.all;
}

function StatusBadge({ status, bucket }) {
  const tone = {
    pending: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    approved: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    rejected: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  }[bucket] || "bg-slate-500/10 text-slate-700 dark:bg-white/10 dark:text-slate-200";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone}`}>{status}</span>;
}

function toCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value) {
  const normalized = value === undefined || value === null ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

function dateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDate(value) {
  return formatIndiaDateTime(value);
}

function formatDateOnly(value) {
  return formatIndiaDate(value);
}
