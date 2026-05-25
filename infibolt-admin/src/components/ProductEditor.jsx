import { Image, Package, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { AdminShell } from "../layouts/AdminLayout";
import { productService } from "../services/productService";

const emptyProduct = {
  name: "",
  slug: "",
  category: "audio",
  price: "",
  status: "Draft",
  badge: "New",
  summary: "",
  image: "",
  stock: "",
  featured: false,
  newLaunch: false,
  homepageVisible: false,
  heroVisible: false,
  marketplace: {
    amazon: "",
    flipkart: "",
    croma: "",
    relianceDigital: "",
    custom: "",
    visible: true,
    priority: "Amazon",
    launchStatus: "Available through selected launch partners",
    regionalAvailability: [],
  },
};

export function ProductEditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [existing, setExisting] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (!slug) return undefined;
    productService.list().then((result) => {
      if (!active) return;
      const product = (result.items || []).find((item) => item.slug === slug);
      if (product) {
        setExisting(product);
        setForm({ ...emptyProduct, ...product, marketplace: { ...emptyProduct.marketplace, ...(product.marketplace || {}) }, price: String(product.price || 0), stock: String(product.stock || 0), image: product.image || product.coverImage || "" });
      }
    });
    return () => {
      active = false;
    };
  }, [slug]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      shortDescription: form.summary,
      coverImage: form.image,
      thumbnail: form.image,
    };
    if (existing) await productService.update(existing.slug, payload);
    else await productService.create(payload);
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
            <Field label="Stock" type="number" value={form.stock} onChange={(stock) => setForm((current) => ({ ...current, stock }))} />
            <label className="grid gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="premium-control min-h-[48px] px-4 text-sm font-medium dark:bg-black/20"><option>Draft</option><option>Published</option><option>Hidden</option><option>Out of Stock</option><option>Upcoming</option><option>Discontinued</option></select></label>
          </div>
          <Field label="Summary" value={form.summary} onChange={(summary) => setForm((current) => ({ ...current, summary }))} textarea />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Amazon link" value={form.marketplace?.amazon || ""} onChange={(amazon) => setForm((current) => ({ ...current, marketplace: { ...current.marketplace, amazon } }))} />
            <Field label="Flipkart link" value={form.marketplace?.flipkart || ""} onChange={(flipkart) => setForm((current) => ({ ...current, marketplace: { ...current.marketplace, flipkart } }))} />
            <Field label="Croma link" value={form.marketplace?.croma || ""} onChange={(croma) => setForm((current) => ({ ...current, marketplace: { ...current.marketplace, croma } }))} />
            <Field label="Reliance Digital link" value={form.marketplace?.relianceDigital || ""} onChange={(relianceDigital) => setForm((current) => ({ ...current, marketplace: { ...current.marketplace, relianceDigital } }))} />
            <label className="grid gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Marketplace priority</span><select value={form.marketplace?.priority || "Amazon"} onChange={(event) => setForm((current) => ({ ...current, marketplace: { ...current.marketplace, priority: event.target.value } }))} className="premium-control min-h-[48px] px-4 text-sm font-medium dark:bg-black/20"><option>Amazon</option><option>Flipkart</option><option>Croma</option><option>Reliance Digital</option><option>Retail</option><option>Custom</option></select></label>
            <Field label="Launch status" value={form.marketplace?.launchStatus || ""} onChange={(launchStatus) => setForm((current) => ({ ...current, marketplace: { ...current.marketplace, launchStatus } }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {["featured", "newLaunch", "homepageVisible", "heroVisible"].map((key) => (
              <label key={key} className="flex min-h-[44px] items-center gap-3 rounded-xl border border-slate-900/10 px-4 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">
                <input type="checkbox" checked={Boolean(form[key])} onChange={() => setForm((current) => ({ ...current, [key]: !current[key] }))} />
                {key.replace(/([A-Z])/g, " $1")}
              </label>
            ))}
          </div>
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

