import { FileText, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { uploadUrl } from "../../config/api";
import { AdminShell } from "../../layouts/AdminLayout";
import { uploadService } from "../../services/uploadService";
import { warrantyService } from "../../services/warrantyService";

export default function AdminWarrantyPolicyPage() {
  const [policy, setPolicy] = useState(null);
  const [policyUpload, setPolicyUpload] = useState({ status: "idle", error: "", fileName: "" });

  useEffect(() => {
    warrantyService.getPolicy().then(setPolicy).catch(() => setPolicy(null));
  }, []);

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
    </AdminShell>
  );
}
