import { FileText, MapPin, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { uploadUrl } from "../../config/api";
import { AdminShell } from "../../layouts/AdminLayout";
import { uploadService } from "../../services/uploadService";
import { warrantyService } from "../../services/warrantyService";

const defaultReturnAddress = {
  name: "INFIBOLT Service Center",
  line1: "#45 Tech Park Road",
  line2: "",
  city: "Bangalore",
  state: "Karnataka",
  postalCode: "560001",
  phone: "+91 XXXXX XXXXX",
};

export default function AdminWarrantyPolicyPage() {
  const [policy, setPolicy] = useState(null);
  const [addressDraft, setAddressDraft] = useState(defaultReturnAddress);
  const [policyUpload, setPolicyUpload] = useState({ status: "idle", error: "", fileName: "" });
  const [savingAddress, setSavingAddress] = useState(false);
  const [confirmingAddressSave, setConfirmingAddressSave] = useState(false);

  useEffect(() => {
    warrantyService.getPolicy().then(setPolicy).catch(() => setPolicy(null));
  }, []);

  useEffect(() => {
    setAddressDraft({ ...defaultReturnAddress, ...(policy?.returnAddress || {}) });
  }, [policy?.returnAddress]);

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

  const confirmReturnAddressSave = () => {
    setConfirmingAddressSave(true);
  };

  const saveReturnAddress = async () => {
    setSavingAddress(true);
    try {
      const saved = await warrantyService.updatePolicy({
        title: policy?.title || "INFIBOLT Warranty Policy",
        url: policy?.url || "",
        filename: policy?.filename || "",
        originalName: policy?.originalName || "",
        returnAddress: addressDraft,
      });
      setPolicy(saved);
      toast.success("Pickup address updated", { description: "Approved claims will show this address in the customer warranty workflow." });
    } catch (error) {
      toast.error("Pickup address update failed", { description: error.message || "Could not save pickup address." });
    } finally {
      setSavingAddress(false);
      setConfirmingAddressSave(false);
    }
  };

  return (
    <AdminShell section="warrantyPolicy" title="Warranty Policy" description="Publish and maintain the customer-facing warranty policy PDF used before warranty OTP registration.">
      <div className="space-y-6">
        <section className="premium-surface p-5 dark:bg-white/[0.03] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-xl bg-slate-900/5 p-2 text-slate-900 dark:bg-white/10 dark:text-white">
              <UploadCloud className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Warranty Policy PDF</h2>
          </div>
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
        </section>

        <section className="premium-surface p-5 dark:bg-white/[0.03] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Warranty Pickup Address</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Update the service-center address shown to customers after a claim is approved.</p>
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-[1fr_0.82fr]">
            <div className="grid gap-4 md:grid-cols-2">
              <AddressField label="Service center name" value={addressDraft.name} onChange={(name) => setAddressDraft((current) => ({ ...current, name }))} />
              <AddressField label="Phone" value={addressDraft.phone} onChange={(phone) => setAddressDraft((current) => ({ ...current, phone }))} />
              <AddressField label="Address line 1" value={addressDraft.line1} onChange={(line1) => setAddressDraft((current) => ({ ...current, line1 }))} />
              <AddressField label="Address line 2" value={addressDraft.line2} onChange={(line2) => setAddressDraft((current) => ({ ...current, line2 }))} />
              <AddressField label="City" value={addressDraft.city} onChange={(city) => setAddressDraft((current) => ({ ...current, city }))} />
              <AddressField label="State" value={addressDraft.state} onChange={(state) => setAddressDraft((current) => ({ ...current, state }))} />
              <AddressField label="PIN code" value={addressDraft.postalCode} onChange={(postalCode) => setAddressDraft((current) => ({ ...current, postalCode }))} />
            </div>
            <PickupAddressPreview address={addressDraft} />
          </div>
          <button type="button" onClick={confirmReturnAddressSave} disabled={savingAddress} className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-950 px-6 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(15,23,42,0.14)] transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950">
            {savingAddress ? "Saving pickup address..." : "Save pickup address"}
          </button>
        </section>

        <section className="premium-surface p-5 dark:bg-white/[0.03] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-xl bg-slate-900/5 p-2 text-slate-900 dark:bg-white/10 dark:text-white">
              <FileText className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Policy Rules</h2>
          </div>
          <div className="grid gap-3 text-sm leading-6 text-slate-600 dark:text-slate-400 md:grid-cols-3">
            <p className="rounded-2xl border border-slate-900/8 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.03]">Only PDF files are accepted.</p>
            <p className="rounded-2xl border border-slate-900/8 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.03]">Maximum file size is 5 MB.</p>
            <p className="rounded-2xl border border-slate-900/8 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.03]">Customers must view and acknowledge this PDF before registration.</p>
          </div>
        </section>
      </div>
      {confirmingAddressSave && (
        <PickupAddressConfirmDialog
          address={addressDraft}
          saving={savingAddress}
          onCancel={() => setConfirmingAddressSave(false)}
          onConfirm={saveReturnAddress}
        />
      )}
    </AdminShell>
  );
}

function AddressField({ label, value, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</span>
      <input value={value || ""} onChange={(event) => onChange(event.target.value)} className="premium-control min-h-[44px] px-4 text-sm font-medium dark:bg-black/20" />
    </label>
  );
}

function PickupAddressPreview({ address }) {
  const cityLine = [address.city, address.state].filter(Boolean).join(", ");
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium leading-5 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-50">
      <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200">Customer Preview</span>
      <span className="mt-3 block text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200">Return Address</span>
      <span className="mt-2 block font-semibold">{address.name || "Service center name"}</span>
      <span className="block">{address.line1 || "Address line 1"}</span>
      {address.line2 && <span className="block">{address.line2}</span>}
      <span className="block">{cityLine || "City, State"}</span>
      <span className="block">{address.postalCode || "PIN code"}</span>
      <span className="block">Phone: {address.phone || "Phone number"}</span>
      <div className="mt-4 rounded-xl border border-emerald-300/70 bg-white/55 px-3 py-2 text-[11px] leading-5 text-emerald-950 dark:border-emerald-300/20 dark:bg-black/10 dark:text-emerald-50">
        This is the address customers will see in the warranty workflow before submitting courier tracking.
      </div>
    </div>
  );
}

function PickupAddressConfirmDialog({ address, saving, onCancel, onConfirm }) {
  const cityLine = [address.city, address.state].filter(Boolean).join(", ");
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/70 bg-white p-5 shadow-[0_28px_80px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-950">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Confirm pickup address update</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              This address will be shown to customers after their warranty claim is approved.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium leading-5 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-50">
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200">Return Address</span>
          <span className="mt-2 block font-semibold">{address.name || "-"}</span>
          <span className="block">{address.line1 || "-"}</span>
          {address.line2 && <span className="block">{address.line2}</span>}
          <span className="block">{cityLine || "-"}</span>
          <span className="block">{address.postalCode || "-"}</span>
          <span className="block">Phone: {address.phone || "-"}</span>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={saving} className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-slate-200 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={saving} className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-slate-950 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950">
            {saving ? "Updating..." : "Confirm and update"}
          </button>
        </div>
      </div>
    </div>
  );
}
