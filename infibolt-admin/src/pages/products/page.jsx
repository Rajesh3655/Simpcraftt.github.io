import { Edit3, ExternalLink, PackagePlus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import DeleteProductDialog from "../../components/DeleteProductDialog";
import { uploadUrl } from "../../config/api";
import { AdminShell } from "../../layouts/AdminLayout";
import { productService } from "../../services/productService";
import { useAdminStore } from "../../store/appStore";
import { formatPrice } from "../../store/commerce";

const productStatuses = ["Draft", "Preview", "Ready", "Published", "Prototype", "Hidden", "Out of Stock", "Upcoming", "Discontinued"];

export default function AdminProductsPage() {
  const products = useAdminStore((state) => state.products);
  const categories = useAdminStore((state) => state.categories.items);
  const loadProducts = useAdminStore((state) => state.loadProducts);
  const loadCategories = useAdminStore((state) => state.loadCategories);
  const deleteProduct = useAdminStore((state) => state.deleteProduct);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [deleting, setDeleting] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState("");

  useEffect(() => {
    loadProducts();
    if (!categories.length) loadCategories();
  }, [categories.length, loadCategories, loadProducts]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.items.filter((product) => {
      const matchesSearch = !needle || [product.name, product.slug, product.sku, product.category, product.summary].filter(Boolean).join(" ").toLowerCase().includes(needle);
      const matchesStatus = status === "all" || product.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [products.items, query, status]);

  const counts = useMemo(() => ({
    all: products.items.length,
    Published: products.items.filter((product) => product.status === "Published").length,
    Draft: products.items.filter((product) => product.status === "Draft").length,
    Hidden: products.items.filter((product) => product.status === "Hidden").length,
    Upcoming: products.items.filter((product) => product.status === "Upcoming").length,
  }), [products.items]);

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.slug);
    try {
      await deleteProduct(deleteTarget.slug);
      toast.success("Product deleted", { description: `${deleteTarget.name} was removed from the catalogue.` });
      setDeleteTarget(null);
    } finally {
      setDeleting("");
    }
  };

  const updateStatus = async (product, nextStatus) => {
    if (!nextStatus || nextStatus === product.status) return;
    setUpdatingStatus(product.slug);
    try {
      await productService.update(product.slug, { status: nextStatus });
      await loadProducts();
      toast.success("Product status updated", { description: `${product.name} is now ${nextStatus}.` });
    } finally {
      setUpdatingStatus("");
    }
  };

  return (
    <AdminShell section="products" title="Product Management" description="Create, update, publish, and retire catalogue records from one operational product desk.">
      <div className="grid gap-5">
        <section className="rounded-[1.15rem] border border-slate-900/8 bg-white/70 p-5 shadow-[0_14px_44px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.035]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex min-h-[46px] flex-1 items-center gap-3 rounded-full border border-slate-900/10 bg-white/75 px-5 dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400" placeholder="Search products, SKU, slug, category" />
            </label>
            <div className="flex flex-wrap gap-2">
              {["all", "Published", "Draft", "Hidden", "Upcoming"].map((item) => (
                <button key={item} type="button" onClick={() => setStatus(item)} className={`min-h-[40px] rounded-full px-4 text-[10px] font-bold uppercase tracking-[0.14em] transition ${status === item ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "border border-slate-900/10 bg-white/60 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"}`}>
                  {item} {counts[item] ?? 0}
                </button>
              ))}
            </div>
            <Link to="/products/add" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(15,23,42,0.16)] dark:bg-white dark:text-slate-950">
              <PackagePlus className="h-4 w-4" />
              Add
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.15rem] border border-slate-900/8 bg-white/72 shadow-[0_16px_48px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.035]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-900/8 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:border-white/10 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Visibility</th>
                  <th className="px-5 py-4 text-right">CRUD Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/6 dark:divide-white/8">
                {filteredProducts.map((product) => (
                  <tr key={product.slug} className="transition hover:bg-slate-950/[0.025] dark:hover:bg-white/[0.035]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 dark:bg-white/10">
                          {product.image || product.coverImage ? <img src={mediaSrc(product.image || product.coverImage)} alt="" className="h-full w-full object-cover" /> : <PackagePlus className="h-5 w-5 text-slate-400" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-white">{product.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{product.slug}{product.sku ? ` · ${product.sku}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">{categoryName(product, categories)}</td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(product.price || 0)}</td>
                    <td className="px-5 py-4">{product.stock ?? 0}</td>
                    <td className="px-5 py-4">
                      <select
                        value={product.status || "Draft"}
                        onChange={(event) => updateStatus(product, event.target.value)}
                        disabled={updatingStatus === product.slug}
                        className={`min-h-[34px] rounded-full border px-3 text-[10px] font-bold uppercase tracking-[0.12em] outline-none transition disabled:opacity-60 ${
                          product.status === "Published"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        }`}
                        aria-label={`Change status for ${product.name}`}
                      >
                        {productStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <a href={`http://localhost:3000/products/${product.slug}`} target="_blank" rel="noreferrer" className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </a>
                        <Link to={`/products/edit/${product.slug}`} className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200" aria-label={`Edit ${product.name}`}>
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </Link>
                        <button type="button" onClick={() => setDeleteTarget(product)} disabled={deleting === product.slug} className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-500/10 disabled:opacity-50 dark:text-rose-300" aria-label={`Delete ${product.name}`}>
                          <Trash2 className="h-4 w-4" />
                          {deleting === product.slug ? "Deleting" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filteredProducts.length && (
            <div className="grid min-h-[220px] place-items-center px-6 py-10 text-center">
              <div>
                <p className="text-lg font-semibold">No products found</p>
                <p className="mt-2 text-sm text-slate-500">Adjust filters or add your first catalogue product.</p>
              </div>
            </div>
          )}
        </section>
      </div>
      <DeleteProductDialog product={deleteTarget} open={Boolean(deleteTarget)} deleting={Boolean(deleting)} onCancel={() => setDeleteTarget(null)} onConfirm={remove} />
    </AdminShell>
  );
}

function categoryName(product, categories) {
  const key = product.categorySlug || product.category;
  return categories.find((category) => category.slug === key || category.id === key || category.name === product.category)?.name || product.category || "Product";
}

function mediaSrc(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("/images/")) return path;
  return uploadUrl(path);
}
