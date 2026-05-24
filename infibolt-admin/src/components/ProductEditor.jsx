import { Image, Package, Save } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { AdminShell } from "../layouts/AdminLayout";
import { useAdminStore } from "../store/appStore";
import { products } from "../store/commerce";

const emptyProduct = {
  name: "",
  slug: "",
  category: "audio",
  price: "",
  status: "Draft",
  badge: "New",
  summary: "",
  image: "",
};

export function ProductEditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const existing = products.find((product) => product.slug === slug);
  const saveProduct = useAdminStore((state) => state.saveProduct);
  const [form, setForm] = useState(existing ? { ...existing, price: String(existing.price) } : emptyProduct);
  const [saving, setSaving] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    await saveProduct({ ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), price: Number(form.price || 0) });
    setSaving(false);
    toast.success(existing ? "Product updated" : "Product created", { description: "The product workspace saved your changes." });
    navigate("/products");
  };

  return (
    <AdminShell title={existing ? "Edit Product" : "Add Product"} description="Create and update product records with structured content, pricing, status, and media.">
      <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="premium-surface grid gap-5 p-6 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3"><Package className="h-5 w-5" /><h2 className="text-xl font-semibold">Product details</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} />
            <Field label="Slug" value={form.slug} onChange={(slug) => setForm((current) => ({ ...current, slug }))} placeholder="auto-generated if blank" />
            <Field label="Price" type="number" value={form.price} onChange={(price) => setForm((current) => ({ ...current, price }))} />
            <label className="grid gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="premium-control min-h-[48px] px-4 text-sm font-medium dark:bg-black/20"><option>Draft</option><option>Preview</option><option>Ready</option><option>Published</option></select></label>
          </div>
          <Field label="Summary" value={form.summary} onChange={(summary) => setForm((current) => ({ ...current, summary }))} textarea />
          <button disabled={saving} className="premium-button inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-[0_14px_34px_rgba(17,24,39,0.16)] disabled:opacity-60 dark:bg-white dark:text-slate-900"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save product"}</button>
        </section>
        <aside className="premium-surface p-6 dark:bg-white/[0.03]">
          <Image className="h-5 w-5" />
          <h2 className="mt-4 text-xl font-semibold">Media preview</h2>
          <Field label="Image URL" value={form.image} onChange={(image) => setForm((current) => ({ ...current, image }))} />
          <div className="mt-5 overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/10">{form.image ? <img src={form.image} alt="" className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center text-sm text-slate-500">No image selected</div>}</div>
        </aside>
      </form>
    </AdminShell>
  );
}

function Field({ label, value, onChange, type = "text", textarea = false, placeholder }) {
  return <label className="grid gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>{textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} className="premium-control px-4 py-3 text-sm font-medium outline-none dark:bg-black/20" /> : <input placeholder={placeholder} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="premium-control min-h-[48px] px-4 text-sm font-medium outline-none dark:bg-black/20" />}</label>;
}

