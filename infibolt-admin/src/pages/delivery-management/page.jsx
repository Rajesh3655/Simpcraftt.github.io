import { CheckCircle2, MapPin, PackageCheck, Search, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageLoader } from "../../components/AppStates";
import { AdminShell } from "../../layouts/AdminLayout";
import { useAdminStore } from "../../store/appStore";
import { formatIndiaDateTime } from "../../utils/time";

const deliveryStatuses = ["Picked", "Received", "Processed", "Shipped", "Delivered"];
const deliveryEligibleStatuses = ["Approved", "Pickup Scheduled", "In Transit", "Inspection", "Repair Approved", "Replacement Approved", "Repaired", "Replaced", "Closed"];

export default function DeliveryManagementPage() {
  const warranty = useAdminStore((state) => state.warranty);
  const loadWarranty = useAdminStore((state) => state.loadWarranty);
  const updateWarrantyStatus = useAdminStore((state) => state.updateWarrantyStatus);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [deliveryDrafts, setDeliveryDrafts] = useState({});
  const [noteDrafts, setNoteDrafts] = useState({});
  const [saving, setSaving] = useState("");

  useEffect(() => {
    loadWarranty();
  }, [loadWarranty]);

  const records = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = (warranty.rmas || []).filter((item) => deliveryEligibleStatuses.includes(item.status));
    const filtered = rows.filter((item) => {
      if (!needle) return true;
      return [item.id, item.customerName, item.email, item.product, item.serial, item.status, item.deliveryStatus]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    return filtered.sort((a, b) => {
      if (sortBy === "oldest") return dateValue(a.updatedAt || a.createdAt) - dateValue(b.updatedAt || b.createdAt);
      if (sortBy === "delivery") return String(a.deliveryStatus || "Awaiting pickup").localeCompare(String(b.deliveryStatus || "Awaiting pickup"));
      if (sortBy === "product") return String(a.product || "").localeCompare(String(b.product || ""));
      return dateValue(b.updatedAt || b.createdAt) - dateValue(a.updatedAt || a.createdAt);
    });
  }, [query, sortBy, warranty.rmas]);

  const saveDelivery = async (item) => {
    const id = item.id;
    const payload = {
      deliveryStatus: deliveryDrafts[id] || item.deliveryStatus || "Picked",
      deliveryNotes: noteDrafts[id] || "",
    };
    setSaving(id);
    try {
      await updateWarrantyStatus(id, payload);
      toast.success("Delivery updated", { description: `${id} is ${payload.deliveryStatus}.` });
      setNoteDrafts((current) => ({ ...current, [id]: "" }));
    } finally {
      setSaving("");
    }
  };

  return (
    <AdminShell section="deliveryManagement" title="Delivery Management" description="Update pickup, received, processing, shipped, and delivered movement for approved warranty claims.">
      <div className="grid gap-5">
        {warranty.status === "loading" && <PageLoader label="Opening delivery queue" />}
        {warranty.status === "error" && <EmptyState title="Delivery queue unavailable" description={warranty.error} />}

        <section className="rounded-[1.25rem] border border-slate-900/8 bg-white/76 p-5 shadow-[0_18px_58px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/[0.035]">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-white">
              <Truck className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight">Approved Claim Deliveries</h2>
          </div>

          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-center">
            <label className="flex min-h-[46px] items-center gap-3 rounded-full border border-slate-900/10 bg-white px-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search delivery, serial, customer, product" className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />
            </label>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-h-[46px] rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 outline-none shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
              <option value="latest">Latest updated</option>
              <option value="oldest">Oldest updated</option>
              <option value="delivery">Delivery status</option>
              <option value="product">Product name</option>
            </select>
            <div className="grid gap-1 text-right">
              <p className="text-2xl font-semibold">{records.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Approved claims</p>
            </div>
          </div>

          {records.length === 0 ? (
            <EmptyState title="No approved deliveries" description="Approved warranty claims will appear here for pickup and delivery movement." />
          ) : (
            <div className="grid gap-4">
              {records.map((item) => {
                const address = item.customerAddress || {};
                const selectedStatus = deliveryDrafts[item.id] || item.deliveryStatus || "Picked";
                return (
                  <section key={item.id} className="rounded-[1rem] border border-slate-900/8 bg-slate-950/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.025]">
                    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill status={item.deliveryStatus || "Awaiting pickup"} />
                          <StatusPill status={item.status || "Approved"} />
                        </div>
                        <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.id}</h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <Info label="Customer" value={item.customerName || item.email || "Customer"} />
                          <Info label="Product" value={item.product || "Product"} />
                          <Info label="Serial" value={item.serial || "-"} />
                          <Info label="Updated" value={formatDate(item.updatedAt || item.createdAt)} />
                        </div>
                        <div className="mt-3 rounded-xl bg-white/72 p-4 dark:bg-white/[0.035]">
                          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500"><MapPin className="h-3.5 w-3.5" /> Pickup and delivery address</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{address.name || item.customerName || "Customer"} · {address.phone || "-"}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{[address.line1, address.line2, address.city, address.state, address.postalCode].filter(Boolean).join(", ") || "Address not available"}</p>
                        </div>
                      </div>

                      <div className="rounded-[1rem] border border-emerald-700/12 bg-emerald-50/70 p-4 dark:border-emerald-400/15 dark:bg-emerald-500/10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-200">Delivery update</p>
                        <label className="mt-4 grid gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Delivery status</span>
                          <select value={selectedStatus} onChange={(event) => setDeliveryDrafts((current) => ({ ...current, [item.id]: event.target.value }))} className="premium-control min-h-[44px] px-4 text-sm font-medium dark:bg-black/20">
                            {deliveryStatuses.map((status) => <option key={status}>{status}</option>)}
                          </select>
                        </label>
                        <label className="mt-3 grid gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Delivery note</span>
                          <textarea value={noteDrafts[item.id] || ""} onChange={(event) => setNoteDrafts((current) => ({ ...current, [item.id]: event.target.value }))} rows={4} className="premium-control px-4 py-3 text-sm font-medium outline-none dark:bg-black/20" placeholder="Pickup partner, tracking update, service desk note" />
                        </label>
                        <button type="button" onClick={() => saveDelivery(item)} disabled={saving === item.id} className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(16,185,129,0.16)] disabled:opacity-60">
                          <CheckCircle2 className="h-4 w-4" />
                          {saving === item.id ? "Saving..." : "Update delivery"}
                        </button>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white/72 p-3 dark:bg-white/[0.035]">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const normalized = String(status || "").toLowerCase();
  const tone = normalized.includes("delivered")
    ? "bg-emerald-600 text-white"
    : normalized.includes("await")
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
      : "bg-sky-500/10 text-sky-700 dark:text-sky-300";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tone}`}>{status}</span>;
}

function formatDate(value) {
  return formatIndiaDateTime(value);
}

function dateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
