import { AnimatePresence, motion } from "framer-motion";
import { Download, Edit3, Eye, FileText, Plus, Search, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { uploadUrl } from "../../config/api";
import { AdminShell } from "../../layouts/AdminLayout";
import { manualService } from "../../services/manualService";
import { uploadService } from "../../services/uploadService";
import { useAdminStore } from "../../store/appStore";

const emptyForm = {
  productSlug: "",
  productName: "",
  category: "",
  description: "",
  pdfUrl: "",
  thumbnail: "",
  featured: false,
  isVisible: true,
};

export default function AdminManualsPage() {
  const products = useAdminStore((state) => state.products.items);
  const loadProducts = useAdminStore((state) => state.loadProducts);
  const productCategories = useAdminStore((state) => state.categories.items);
  const loadCategories = useAdminStore((state) => state.loadCategories);
  const [manuals, setManuals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [status, setStatus] = useState("loading");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadState, setUploadState] = useState({ status: "idle", fileName: "", error: "" });

  useEffect(() => {
    if (!products.length) loadProducts();
    if (!productCategories.length) loadCategories();
  }, [loadCategories, loadProducts, productCategories.length, products.length]);

  useEffect(() => {
    loadManuals();
  }, []);

  const mergedCategories = useMemo(() => {
    const names = new Set([...categories, ...productCategories.map((item) => item.name || item.slug || item.id).filter(Boolean)]);
    return [...names].sort();
  }, [categories, productCategories]);

  const filteredManuals = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return manuals.filter((manual) => {
      const haystack = [manual.productName, manual.category, manual.description].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = !needle || haystack.includes(needle);
      const matchesCategory = category === "all" || manual.category === category;
      const matchesVisibility = visibility === "all" || (visibility === "visible" ? manual.isVisible : !manual.isVisible);
      return matchesSearch && matchesCategory && matchesVisibility;
    });
  }, [manuals, query, category, visibility]);

  async function loadManuals(params = {}) {
    setStatus("loading");
    try {
      const result = await manualService.list({ limit: 120, sort: "latest", ...params });
      setManuals(result.items || []);
      setCategories(result.categories || []);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      toast.error("Manuals not loaded", { description: error.message || "Please try again." });
    }
  }

  function openCreate() {
    setEditing({ ...emptyForm });
    setUploadState({ status: "idle", fileName: "", error: "" });
    setFormOpen(true);
  }

  function openEdit(manual) {
    const matchedProduct = products.find((product) => product.name === manual.productName || product.category === manual.category);
    setEditing({
      _id: manual._id,
      productSlug: matchedProduct?.slug || "",
      productName: manual.productName || "",
      category: manual.category || "",
      description: manual.description || "",
      pdfUrl: manual.pdfUrl || "",
      thumbnail: manual.thumbnail || "",
      featured: Boolean(manual.featured),
      isVisible: manual.isVisible !== false,
    });
    setUploadState({ status: "idle", fileName: manual.pdfUrl?.split("/").pop() || "", error: "" });
    setFormOpen(true);
  }

  async function uploadManual(file) {
    if (!file) return;
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadState({ status: "error", fileName: file.name, error: "Upload a PDF manual only." });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadState({ status: "error", fileName: file.name, error: "Manual PDF must be 15 MB or smaller." });
      return;
    }
    setUploadState({ status: "loading", fileName: file.name, error: "" });
    try {
      const result = await uploadService.uploadManual(file);
      setEditing((current) => ({ ...current, pdfUrl: result.url || result.path }));
      setUploadState({ status: "success", fileName: result.originalName || file.name, error: "" });
      toast.success("Manual uploaded", { description: "PDF is ready to publish." });
    } catch (error) {
      setUploadState({ status: "error", fileName: file.name, error: error.message || "Upload failed." });
    }
  }

  async function saveManual(event) {
    event.preventDefault();
    if (!editing.productName.trim() || !editing.category.trim() || !editing.pdfUrl) {
      toast.error("Manual details required", { description: "Add product name, category, and a PDF file." });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        productName: editing.productName.trim(),
        category: editing.category.trim(),
        description: editing.description.trim(),
        pdfUrl: editing.pdfUrl,
        thumbnail: editing.thumbnail.trim(),
        featured: Boolean(editing.featured),
        isVisible: Boolean(editing.isVisible),
      };
      const saved = editing._id ? await manualService.update(editing._id, payload) : await manualService.create(payload);
      await loadManuals();
      setEditing({ ...emptyForm });
      setUploadState({ status: "idle", fileName: "", error: "" });
      setFormOpen(false);
      toast.success(editing._id ? "Manual updated" : "Manual published", { description: `${saved.productName} is ready in support.` });
    } catch (error) {
      toast.error("Manual not saved", { description: error.message || "Please check the fields." });
    } finally {
      setSaving(false);
    }
  }

  async function patchManual(manual, payload) {
    const previous = manuals;
    setManuals((current) => current.map((item) => (item._id === manual._id ? { ...item, ...payload } : item)));
    try {
      const saved = await manualService.patch(manual._id, payload);
      setManuals((current) => current.map((item) => (item._id === manual._id ? saved : item)));
    } catch (error) {
      setManuals(previous);
      toast.error("Manual not updated", { description: error.message || "Please try again." });
    }
  }

  async function removeManual(manual) {
    const confirmed = window.confirm(`Delete the manual for ${manual.productName}?`);
    if (!confirmed) return;
    try {
      await manualService.delete(manual._id);
      setManuals((current) => current.filter((item) => item._id !== manual._id));
      toast.success("Manual deleted", { description: "It is no longer visible to customers." });
    } catch (error) {
      toast.error("Manual not deleted", { description: error.message || "Please try again." });
    }
  }

  return (
    <AdminShell section="manuals" title="User Manuals" description="Upload, organize, preview, and publish product manual PDFs for the public support portal.">
      <div className="grid gap-5">
        <section className="sticky top-4 z-10 rounded-[1.15rem] border border-slate-900/8 bg-white/85 p-5 shadow-[0_18px_58px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
            <label className="flex min-h-[46px] items-center gap-3 rounded-full border border-slate-900/10 bg-white/75 px-5 dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400" placeholder="Search manuals by product or category" />
            </label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-[46px] rounded-full border border-slate-900/10 bg-white/75 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <option value="all">All categories</option>
              {mergedCategories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={visibility} onChange={(event) => setVisibility(event.target.value)} className="min-h-[46px] rounded-full border border-slate-900/10 bg-white/75 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <option value="all">All status</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
            <button type="button" onClick={openCreate} className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_16px_38px_rgba(15,23,42,0.16)] dark:bg-white dark:text-slate-950">
              <Plus className="h-4 w-4" />
              Add Manual
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.15rem] border border-slate-900/8 bg-white/72 shadow-[0_16px_48px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.035]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-900/8 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:border-white/10">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/6 dark:divide-white/8">
                {filteredManuals.map((manual) => (
                  <tr key={manual._id} className="transition hover:bg-slate-950/[0.025] dark:hover:bg-white/[0.035]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                          <FileText className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block font-semibold text-slate-950 dark:text-white">{manual.productName}</span>
                          <span className="mt-1 line-clamp-1 block max-w-md text-xs text-slate-500">{manual.description || "No description added."}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">{manual.category}</td>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => patchManual(manual, { isVisible: !manual.isVisible })} className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${manual.isVisible ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-slate-900/8 text-slate-500 dark:bg-white/8"}`}>
                        {manual.isVisible ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <a href={uploadUrl(manual.pdfUrl)} target="_blank" rel="noreferrer" className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200"><Eye className="h-4 w-4" />Preview</a>
                        <a href={uploadUrl(manual.pdfUrl)} download className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200"><Download className="h-4 w-4" />PDF</a>
                        <button type="button" onClick={() => openEdit(manual)} className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200"><Edit3 className="h-4 w-4" />Edit</button>
                        <button type="button" onClick={() => removeManual(manual)} className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-500/10 dark:text-rose-300"><Trash2 className="h-4 w-4" />Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {status === "loading" && <ManualSkeleton />}
          {status !== "loading" && !filteredManuals.length && <EmptyManuals onCreate={openCreate} />}
        </section>
      </div>

      <AnimatePresence>
        {formOpen && editing && (
          <ManualDrawer
            form={editing}
            products={products}
            saving={saving}
            uploadState={uploadState}
            onClose={() => setFormOpen(false)}
            onChange={setEditing}
            onUpload={uploadManual}
            onSubmit={saveManual}
          />
        )}
      </AnimatePresence>
    </AdminShell>
  );
}

function ManualDrawer({ form, products, saving, uploadState, onClose, onChange, onUpload, onSubmit }) {
  const uploadTone = uploadState.status === "error"
    ? "border-rose-400/60 bg-rose-50 text-rose-800"
    : form.pdfUrl
      ? "border-emerald-400/60 bg-emerald-50 text-emerald-800"
      : "border-slate-900/14 bg-white/70 text-slate-500 dark:border-white/10 dark:bg-white/[0.04]";
  const selectedProduct = products.find((product) => product.slug === form.productSlug);
  const productValue = form.productSlug || (form.productName ? "__current" : "");
  const selectProduct = (value) => {
    if (value === "__current") return;
    const product = products.find((item) => item.slug === value);
    if (!product) {
      onChange((current) => ({ ...current, productSlug: "", productName: "", category: "", thumbnail: "", description: "" }));
      return;
    }
    onChange((current) => ({
      ...current,
      productSlug: product.slug || "",
      productName: product.name || "",
      category: product.category || product.categorySlug || "Product",
      thumbnail: product.thumbnail || product.image || product.coverImage || "",
      description: product.summary || product.shortDescription || product.description || "",
    }));
  };

  return (
    <motion.div className="fixed inset-0 z-50 grid bg-slate-950/35 p-3 backdrop-blur-sm sm:p-6 lg:place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form onSubmit={onSubmit} className="ml-auto grid max-h-[calc(100svh-1.5rem)] w-full max-w-[720px] overflow-hidden rounded-[1.35rem] border border-white/70 bg-[#f8f6f1] shadow-[0_30px_100px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-950 sm:max-h-[calc(100svh-3rem)]" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.28 }}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 p-5 dark:border-white/10 sm:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{form._id ? "Edit manual" : "Add manual"}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Manual details</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-slate-900/10 bg-white/70 dark:border-white/10 dark:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-5 overflow-y-auto p-5 sm:p-6">
          <label className="grid gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Select Product</span>
            <select
              value={productValue}
              onChange={(event) => selectProduct(event.target.value)}
              required
              className="min-h-[52px] rounded-full border border-slate-900/10 bg-white/80 px-4 text-sm font-semibold outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">Choose a product</option>
              {form.productName && !form.productSlug && <option value="__current">{form.productName}</option>}
              {products.map((product) => (
                <option key={product.slug || product._id || product.name} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
            {(selectedProduct || form.productName) && (
              <span className="rounded-2xl border border-slate-900/8 bg-white/60 px-4 py-3 text-xs font-medium leading-5 text-slate-500 dark:border-white/10 dark:bg-white/5">
                {form.productName} {form.category ? `- ${form.category}` : ""}
              </span>
            )}
          </label>
          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onUpload(event.dataTransfer.files?.[0]);
            }}
            className={`grid min-h-[150px] cursor-pointer place-items-center rounded-[1.2rem] border border-dashed p-5 text-center text-sm transition ${uploadTone}`}
          >
            <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => { onUpload(event.target.files?.[0]); event.target.value = ""; }} />
            <span className="grid justify-items-center gap-2">
              <UploadCloud className="h-6 w-6" />
              <span className="font-semibold">{uploadState.status === "loading" ? "Uploading manual..." : form.pdfUrl ? "Manual PDF uploaded" : "Drop PDF here or browse"}</span>
              <span>{uploadState.fileName || "PDF only. Maximum file size 15 MB."}</span>
              {uploadState.error && <span className="font-semibold text-rose-700">{uploadState.error}</span>}
            </span>
          </label>
        </div>
        <div className="grid gap-3 border-t border-slate-900/8 p-5 dark:border-white/10 sm:grid-cols-[0.35fr_1fr] sm:p-6">
          <button type="button" onClick={onClose} className="min-h-[48px] rounded-full border border-slate-900/10 bg-white px-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">Cancel</button>
          <button type="submit" disabled={saving || uploadState.status === "loading"} className="min-h-[48px] rounded-full bg-slate-950 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">
            {saving ? "Saving..." : form._id ? "Update Manual" : "Publish Manual"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function ManualSkeleton() {
  return (
    <div className="grid gap-3 p-5">
      {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-900/5 dark:bg-white/8" />)}
    </div>
  );
}

function EmptyManuals({ onCreate }) {
  return (
    <div className="grid min-h-[260px] place-items-center px-6 py-10 text-center">
      <div>
        <FileText className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">No manuals found</p>
        <p className="mt-2 text-sm text-slate-500">Upload your first product manual PDF for the support portal.</p>
        <button type="button" onClick={onCreate} className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-slate-950">Add Manual</button>
      </div>
    </div>
  );
}
