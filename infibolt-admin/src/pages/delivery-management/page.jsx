import { CheckCircle2, Clock3, Mail, MapPin, PackageCheck, Phone, Search, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageLoader } from "../../components/AppStates";
import { AdminShell } from "../../layouts/AdminLayout";
import { useAdminStore } from "../../store/appStore";
import { formatIndiaDateTime } from "../../utils/time";

const deliveryEligibleStatuses = [
  "Waiting for Customer Shipment",
  "Approved",
  "Tracking Submitted",
  "Product Received",
  "Inspection",
  "Inspection in Progress",
  "Final Approved",
  "Repair Approved",
  "Replacement Approved",
  "Rejected After Inspection",
  "Replacement Dispatched",
  "Return Dispatched",
  "Out for Delivery",
  "Repaired",
  "Replaced",
  "Closed",
];
const completedDeliveryStatuses = ["Delivered"];
const replacementDeliveryStatuses = ["Out for Delivery", "Delivered"];
const stageFilters = [
  { key: "all", label: "All" },
  { key: "waiting-customer", label: "Waiting" },
  { key: "tracking-submitted", label: "Receive" },
  { key: "inspection", label: "Inspect" },
  { key: "replacement-ready", label: "Dispatch" },
  { key: "return-ready", label: "Return" },
  { key: "replacement-delivery", label: "Delivery" },
];

export default function DeliveryManagementPage() {
  const warranty = useAdminStore((state) => state.warranty);
  const loadWarranty = useAdminStore((state) => state.loadWarranty);
  const updateWarrantyStatus = useAdminStore((state) => state.updateWarrantyStatus);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [stageFilter, setStageFilter] = useState("all");
  const [noteDrafts, setNoteDrafts] = useState({});
  const [replacementDrafts, setReplacementDrafts] = useState({});
  const [deliveryDrafts, setDeliveryDrafts] = useState({});
  const [saving, setSaving] = useState("");

  useEffect(() => {
    loadWarranty();
  }, [loadWarranty]);

  const records = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = (warranty.rmas || []).filter((item) => deliveryEligibleStatuses.includes(item.status) && !completedDeliveryStatuses.includes(item.deliveryStatus));
    const filtered = rows.filter((item) => {
      if (!needle) return true;
      return [item.id, item.customerName, item.email, item.customerPhone, item.customerAddress?.phone, item.product, item.serial, item.status, item.claimStatus, item.deliveryStatus, item.returnShipment?.trackingId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    return filtered.filter((item) => stageFilter === "all" || workflowStage(item).key === stageFilter).sort((a, b) => {
      if (sortBy === "oldest") return dateValue(a.updatedAt || a.createdAt) - dateValue(b.updatedAt || b.createdAt);
      if (sortBy === "stage") return workflowStage(a).label.localeCompare(workflowStage(b).label);
      if (sortBy === "product") return String(a.product || "").localeCompare(String(b.product || ""));
      return dateValue(b.updatedAt || b.createdAt) - dateValue(a.updatedAt || a.createdAt);
    });
  }, [query, sortBy, stageFilter, warranty.rmas]);

  const stageCounts = useMemo(() => {
    const rows = (warranty.rmas || []).filter((item) => deliveryEligibleStatuses.includes(item.status) && !completedDeliveryStatuses.includes(item.deliveryStatus));
    return rows.reduce((map, item) => {
      const key = workflowStage(item).key;
      return { ...map, all: (map.all || 0) + 1, [key]: (map[key] || 0) + 1 };
    }, {});
  }, [warranty.rmas]);

  const saveStatus = async (item, status, successLabel) => {
    const id = item.id;
    const note = noteDrafts[id] || "";
    setSaving(`${id}:${status}`);
    try {
      await updateWarrantyStatus(id, { status, notes: note, rejectionReason: status === "Rejected After Inspection" ? note : "" });
      toast.success(successLabel || "Warranty stage updated", { description: `${id} moved to ${status}.` });
      setNoteDrafts((current) => ({ ...current, [id]: "" }));
    } finally {
      setSaving("");
    }
  };

  const saveReplacement = async (item) => {
    const id = item.id;
    const draft = replacementDrafts[id] || {};
    if (!draft.courierName?.trim() || !draft.trackingId?.trim()) {
      toast.error("Replacement tracking required", { description: "Enter courier partner and replacement tracking ID." });
      return;
    }
    setSaving(`${id}:replacement`);
    try {
      await updateWarrantyStatus(id, {
        status: "Replacement Dispatched",
        replacementCourierName: draft.courierName.trim(),
        replacementTrackingId: draft.trackingId.trim(),
        deliveryNotes: noteDrafts[id] || "",
      });
      toast.success("Replacement dispatched", { description: `${id} replacement tracking is now visible to the customer.` });
      setReplacementDrafts((current) => ({ ...current, [id]: {} }));
      setNoteDrafts((current) => ({ ...current, [id]: "" }));
    } finally {
      setSaving("");
    }
  };

  const saveReturnShipment = async (item) => {
    const id = item.id;
    const draft = replacementDrafts[id] || {};
    if (!draft.courierName?.trim() || !draft.trackingId?.trim()) {
      toast.error("Return tracking required", { description: "Enter courier partner and return tracking ID." });
      return;
    }
    setSaving(`${id}:return`);
    try {
      await updateWarrantyStatus(id, {
        returnCourierName: draft.courierName.trim(),
        returnTrackingId: draft.trackingId.trim(),
        deliveryNotes: noteDrafts[id] || "",
      });
      toast.success("Product return dispatched", { description: `${id} return tracking is now visible to the customer.` });
      setReplacementDrafts((current) => ({ ...current, [id]: {} }));
      setNoteDrafts((current) => ({ ...current, [id]: "" }));
    } finally {
      setSaving("");
    }
  };

  const saveDelivery = async (item) => {
    const id = item.id;
    const deliveryStatus = deliveryDrafts[id] || item.deliveryStatus || "Out for Delivery";
    setSaving(`${id}:delivery`);
    try {
      await updateWarrantyStatus(id, {
        deliveryStatus,
        deliveryNotes: noteDrafts[id] || "",
      });
      toast.success("Replacement delivery updated", { description: `${id} is ${deliveryStatus}.` });
      setNoteDrafts((current) => ({ ...current, [id]: "" }));
    } finally {
      setSaving("");
    }
  };

  return (
    <AdminShell section="deliveryManagement" title="Delivery Management" description="Move approved warranty claims through customer shipment, receiving, inspection, replacement dispatch, and delivery.">
      <div className="grid gap-5">
        {warranty.status === "loading" && <PageLoader label="Opening delivery queue" />}
        {warranty.status === "error" && <EmptyState title="Delivery queue unavailable" description={warranty.error} />}

        <section className="rounded-[1.25rem] border border-slate-900/8 bg-white/76 p-5 shadow-[0_18px_58px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/[0.035]">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-white">
                <Truck className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Warranty Delivery Queue</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pick a stage, open a claim, and complete the next action.</p>
              </div>
            </div>
            <div className="grid gap-1 lg:text-right">
              <p className="text-2xl font-semibold">{stageCounts.all || 0}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Open delivery claims</p>
            </div>
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {stageFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStageFilter(filter.key)}
                className={`inline-flex min-h-[38px] shrink-0 items-center gap-2 rounded-full border px-4 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                  stageFilter === filter.key
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-900/10 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                }`}
              >
                {filter.label}
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${stageFilter === filter.key ? "bg-white/16 text-white dark:bg-slate-950/10 dark:text-slate-950" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}>
                  {stageCounts[filter.key] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px] lg:items-center">
            <label className="flex min-h-[46px] items-center gap-3 rounded-full border border-slate-900/10 bg-white px-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search delivery, serial, customer, tracking ID" className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />
            </label>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-h-[46px] rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 outline-none shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
              <option value="latest">Latest updated</option>
              <option value="oldest">Oldest updated</option>
              <option value="stage">Workflow stage</option>
              <option value="product">Product name</option>
            </select>
          </div>

          {records.length === 0 ? (
            <EmptyState title="No approved deliveries" description="Approved warranty claims will appear here after claim approval." />
          ) : (
            <div className="grid gap-4">
              {records.map((item) => {
                const address = item.customerAddress || {};
                const customerPhone = item.customerPhone || address.phone || "";
                const customerEmail = item.email || "";
                const stage = workflowStage(item);
                return (
                  <section key={item.id} className="rounded-[1rem] border border-slate-900/8 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.025]">
                    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                      <div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusPill status={stage.label} tone={stage.tone} />
                              <StatusPill status={item.status || "Approved"} />
                            </div>
                            <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.id}</h3>
                            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{nextActionText(stage, item)}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-white/[0.04]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Updated</p>
                            <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{formatDate(item.updatedAt || item.createdAt)}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <Info label="Customer" value={item.customerName || item.email || "Customer"} />
                          <Info label="Product" value={item.product || "Product"} />
                          <Info label="Serial" value={item.serial || "-"} />
                          <Info label="Tracking" value={item.returnShipment?.trackingId || (item.replacementShipment || item.returnToCustomerShipment)?.trackingId || "Pending"} />
                        </div>

                        <details className="mt-3 rounded-xl border border-slate-900/8 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                          <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Contact and shipment details</summary>
                          <div className="mt-4 grid gap-3">
                            <div>
                              <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500"><MapPin className="h-3.5 w-3.5" /> Customer pickup address</p>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{address.name || item.customerName || "Customer"}</p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <ContactOption icon={Phone} label="Phone" value={customerPhone} />
                                <ContactOption icon={Mail} label="Email" value={customerEmail} />
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{[address.line1, address.line2, address.city, address.state, address.postalCode].filter(Boolean).join(", ") || "Address not available"}</p>
                            </div>
                            <div className="rounded-xl bg-white/72 p-4 dark:bg-white/[0.035]">
                              <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500"><PackageCheck className="h-3.5 w-3.5" /> Customer return shipment</p>
                              <div className="grid gap-3 md:grid-cols-2">
                                <Info label="Courier" value={item.returnShipment?.courierName || "Waiting for customer"} />
                                <Info label="Tracking ID" value={item.returnShipment?.trackingId || "Not submitted yet"} />
                                <Info label="Shipped at" value={formatDate(item.returnShipment?.shippedAt)} />
                                <Info label="Notes" value={item.returnShipment?.notes || "-"} />
                              </div>
                            </div>
                            {(item.replacementShipment?.trackingId || item.returnToCustomerShipment?.trackingId) && (
                              <div className="rounded-xl bg-white/72 p-4 dark:bg-white/[0.035]">
                                <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500"><Truck className="h-3.5 w-3.5" /> {item.returnToCustomerShipment?.trackingId ? "Return to customer tracking" : "Replacement tracking"}</p>
                                <div className="grid gap-3 md:grid-cols-2">
                                  <Info label="Courier" value={(item.returnToCustomerShipment || item.replacementShipment)?.courierName || "-"} />
                                  <Info label="Tracking ID" value={(item.returnToCustomerShipment || item.replacementShipment)?.trackingId || "-"} />
                                  <Info label="Dispatched at" value={formatDate((item.returnToCustomerShipment || item.replacementShipment)?.dispatchedAt)} />
                                </div>
                              </div>
                            )}
                          </div>
                        </details>
                      </div>

                      <StageAction
                        item={item}
                        stage={stage}
                        note={noteDrafts[item.id] || ""}
                        replacementDraft={replacementDrafts[item.id] || {}}
                        deliveryStatus={deliveryDrafts[item.id] || (replacementDeliveryStatuses.includes(item.deliveryStatus) ? item.deliveryStatus : "Out for Delivery")}
                        saving={saving}
                        onNoteChange={(value) => setNoteDrafts((current) => ({ ...current, [item.id]: value }))}
                        onReplacementChange={(next) => setReplacementDrafts((current) => ({ ...current, [item.id]: { ...(current[item.id] || {}), ...next } }))}
                        onDeliveryStatusChange={(value) => setDeliveryDrafts((current) => ({ ...current, [item.id]: value }))}
                        onSaveStatus={saveStatus}
                        onSaveReplacement={saveReplacement}
                        onSaveReturnShipment={saveReturnShipment}
                        onSaveDelivery={saveDelivery}
                      />
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

function StageAction({ item, stage, note, replacementDraft, deliveryStatus, saving, onNoteChange, onReplacementChange, onDeliveryStatusChange, onSaveStatus, onSaveReplacement, onSaveReturnShipment, onSaveDelivery }) {
  const isSaving = saving.startsWith(`${item.id}:`);
  if (stage.key === "waiting-customer") {
    return (
      <StagePanel title="Waiting for Customer Shipment" tone="amber">
        <p className="text-sm font-medium leading-6 text-amber-900 dark:text-amber-100">
          The customer side is showing the return address and shipment form. No admin action is needed until courier and AWB details are submitted.
        </p>
        <GuideList items={["Customer packs the product and invoice copy.", "Customer enters courier partner and tracking ID.", "This record will then unlock product received confirmation."]} />
      </StagePanel>
    );
  }

  if (stage.key === "tracking-submitted") {
    return (
      <StagePanel title="Receive Product">
        <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">Customer shipment details are available. Confirm once the product physically reaches the service center.</p>
        <NoteBox value={note} onChange={onNoteChange} placeholder="Example: Package received at Bangalore service center." />
        <button type="button" onClick={() => onSaveStatus(item, "Product Received", "Product received")} disabled={isSaving} className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60">
          <CheckCircle2 className="h-4 w-4" />
          {isSaving ? "Saving..." : "Mark Product Received"}
        </button>
      </StagePanel>
    );
  }

  if (stage.key === "inspection") {
    return (
      <StagePanel title="Inspection Decision" tone="amber">
        <p className="text-sm font-medium leading-6 text-amber-900 dark:text-amber-100">Update the technical inspection result. These updates are visible in the customer workflow.</p>
        <NoteBox value={note} onChange={onNoteChange} placeholder="Inspection note or rejection reason visible to customer." />
        <div className="mt-4 grid gap-2">
          <ActionButton disabled={isSaving} onClick={() => onSaveStatus(item, "Inspection in Progress", "Inspection started")}>Inspection in Progress</ActionButton>
          <ActionButton disabled={isSaving} onClick={() => onSaveStatus(item, "Replacement Approved", "Replacement approved")}>Approve Replacement</ActionButton>
          <ActionButton tone="danger" disabled={isSaving} onClick={() => onSaveStatus(item, "Rejected After Inspection", "Claim rejected after inspection")}>Reject After Inspection</ActionButton>
        </div>
      </StagePanel>
    );
  }

  if (stage.key === "replacement-ready") {
    return (
      <StagePanel title="Replacement Dispatch">
        <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">Add replacement shipment details. The customer will see courier, tracking ID, dispatch date, and estimated delivery.</p>
        <label className="mt-4 grid gap-2">
          <span className="field-label">Courier partner</span>
          <input value={replacementDraft.courierName || ""} onChange={(event) => onReplacementChange({ courierName: event.target.value })} className="premium-control min-h-[44px] px-4 text-sm font-medium dark:bg-black/20" placeholder="Blue Dart, Delhivery, DTDC" />
        </label>
        <label className="mt-3 grid gap-2">
          <span className="field-label">Replacement tracking ID</span>
          <input value={replacementDraft.trackingId || ""} onChange={(event) => onReplacementChange({ trackingId: event.target.value })} className="premium-control min-h-[44px] px-4 text-sm font-medium dark:bg-black/20" placeholder="AWB / tracking number" />
        </label>
        <NoteBox value={note} onChange={onNoteChange} placeholder="Dispatch note for customer." />
        <button type="button" onClick={() => onSaveReplacement(item)} disabled={isSaving} className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60">
          <Truck className="h-4 w-4" />
          {isSaving ? "Saving..." : "Dispatch Replacement"}
        </button>
      </StagePanel>
    );
  }

  if (stage.key === "return-ready") {
    return (
      <StagePanel title="Return Product to Customer" tone="rose">
        <p className="text-sm font-medium leading-6 text-rose-900 dark:text-rose-100">Inspection rejected the claim. Reclaim is disabled for the customer. Add courier details to return the same product back.</p>
        <label className="mt-4 grid gap-2">
          <span className="field-label">Courier partner</span>
          <input value={replacementDraft.courierName || ""} onChange={(event) => onReplacementChange({ courierName: event.target.value })} className="premium-control min-h-[44px] px-4 text-sm font-medium dark:bg-black/20" placeholder="Blue Dart, Delhivery, DTDC" />
        </label>
        <label className="mt-3 grid gap-2">
          <span className="field-label">Return tracking ID</span>
          <input value={replacementDraft.trackingId || ""} onChange={(event) => onReplacementChange({ trackingId: event.target.value })} className="premium-control min-h-[44px] px-4 text-sm font-medium dark:bg-black/20" placeholder="AWB / tracking number" />
        </label>
        <NoteBox value={note} onChange={onNoteChange} placeholder="Return shipment note for customer." />
        <button type="button" onClick={() => onSaveReturnShipment(item)} disabled={isSaving} className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60">
          <Truck className="h-4 w-4" />
          {isSaving ? "Saving..." : "Dispatch Return"}
        </button>
      </StagePanel>
    );
  }

  return (
    <StagePanel title={item.returnToCustomerShipment?.trackingId ? "Return Delivery" : "Replacement Delivery"}>
      <p className="text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">{item.returnToCustomerShipment?.trackingId ? "Move the returned product through final delivery updates." : "Move the replacement shipment through final delivery updates."}</p>
      <label className="mt-4 grid gap-2">
        <span className="field-label">Delivery status</span>
        <select value={deliveryStatus} onChange={(event) => onDeliveryStatusChange(event.target.value)} className="premium-control min-h-[44px] px-4 text-sm font-medium dark:bg-black/20">
          {replacementDeliveryStatuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>
      <NoteBox value={note} onChange={onNoteChange} placeholder="Courier delivery note or customer update." />
      <button type="button" onClick={() => onSaveDelivery(item)} disabled={isSaving} className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60">
        <CheckCircle2 className="h-4 w-4" />
        {isSaving ? "Saving..." : "Update Delivery"}
      </button>
    </StagePanel>
  );
}

function StagePanel({ title, tone = "green", children }) {
  const toneClass = tone === "amber"
    ? "border-amber-500/20 bg-amber-50/80 dark:border-amber-400/15 dark:bg-amber-500/10"
    : tone === "rose"
      ? "border-rose-500/20 bg-rose-50/80 dark:border-rose-400/15 dark:bg-rose-500/10"
      : "border-emerald-700/12 bg-emerald-50/70 dark:border-emerald-400/15 dark:bg-emerald-500/10";
  const textClass = tone === "amber" ? "text-amber-800 dark:text-amber-200" : tone === "rose" ? "text-rose-800 dark:text-rose-200" : "text-emerald-800 dark:text-emerald-200";
  return (
    <div className={`rounded-[1rem] border p-4 ${toneClass}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${textClass}`}>{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function GuideList({ items }) {
  return (
    <ul className="mt-4 grid gap-2 text-xs font-semibold leading-5 text-amber-900/85 dark:text-amber-100/85">
      {items.map((item) => (
        <li key={item} className="flex gap-2"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />{item}</li>
      ))}
    </ul>
  );
}

function NoteBox({ value, onChange, placeholder }) {
  return (
    <label className="mt-3 grid gap-2">
      <span className="field-label">Customer-visible note</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="premium-control px-4 py-3 text-sm font-medium outline-none dark:bg-black/20" placeholder={placeholder} />
    </label>
  );
}

function ActionButton({ children, tone = "primary", disabled, onClick }) {
  const toneClass = tone === "danger" ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex min-h-[40px] items-center justify-center rounded-full px-4 text-[10px] font-bold uppercase tracking-[0.14em] transition disabled:opacity-60 ${toneClass}`}>
      {children}
    </button>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white/72 p-3 dark:bg-white/[0.035]">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-700 dark:text-slate-200">{value || "-"}</p>
    </div>
  );
}

function ContactOption({ icon: Icon, label, value }) {
  return (
    <div className="flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-900/8 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-black/15">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{value || "Not available"}</p>
      </div>
    </div>
  );
}

function StatusPill({ status, tone }) {
  const normalized = String(status || "").toLowerCase();
  const pillTone = tone || (normalized.includes("delivered")
    ? "green"
    : normalized.includes("waiting")
      ? "amber"
      : "blue");
  const toneClass = {
    green: "bg-emerald-600 text-white",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    blue: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  }[pillTone];
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${toneClass}`}>{status}</span>;
}

function nextActionText(stage, item = {}) {
  return {
    "waiting-customer": "Waiting for customer to ship the product and submit courier tracking.",
    "tracking-submitted": "Confirm product received when the package reaches the service center.",
    inspection: "Start inspection, approve replacement, or reject after inspection.",
    "replacement-ready": "Add courier and tracking details to dispatch the replacement.",
    "return-ready": "Add courier and tracking details to return the original product.",
    "replacement-delivery": item.deliveryStatus === "Out for Delivery" ? "Mark delivered after final handover." : "Update shipment movement for the customer.",
  }[stage.key] || "Review this claim and update the next warranty movement.";
}

function workflowStage(item = {}) {
  if (item.status === "Waiting for Customer Shipment" || item.status === "Approved") return { key: "waiting-customer", label: "Waiting for customer shipment", tone: "amber" };
  if (["Product Received", "Inspection", "Inspection in Progress"].includes(item.status)) return { key: "inspection", label: "Inspection in progress", tone: "amber" };
  if (["Final Approved", "Repair Approved", "Replacement Approved", "Repaired", "Replaced"].includes(item.status)) return { key: "replacement-ready", label: "Replacement approved", tone: "green" };
  if (item.status === "Rejected After Inspection") return { key: "return-ready", label: "Return required", tone: "rose" };
  if (["Replacement Dispatched", "Return Dispatched", "Out for Delivery"].includes(item.status) || ["Replacement Dispatched", "Return Dispatched", "Out for Delivery"].includes(item.deliveryStatus)) return { key: "replacement-delivery", label: item.deliveryStatus || item.status, tone: "blue" };
  if (item.status === "Tracking Submitted" || item.returnShipment?.trackingId) return { key: "tracking-submitted", label: "Tracking submitted", tone: "blue" };
  return { key: "waiting-customer", label: item.status || "Waiting", tone: "slate" };
}

function formatDate(value) {
  return formatIndiaDateTime(value);
}

function dateValue(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
