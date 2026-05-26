import { AlertTriangle, Check, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function DeleteProductDialog({ product, open, deleting = false, onCancel, onConfirm }) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirmed(false);
  }, [open, product?.slug]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !deleting) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleting, onCancel, open]);

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="delete-product-title" className="w-full max-w-lg overflow-hidden rounded-[1.25rem] border border-rose-500/20 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.25)] dark:border-rose-400/25 dark:bg-[#0d0e13]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 p-5 dark:border-white/10">
          <div className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 dark:text-rose-300">Destructive action</p>
              <h2 id="delete-product-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Delete product</h2>
            </div>
          </div>
          <button type="button" onClick={onCancel} disabled={deleting} className="grid h-9 w-9 place-items-center rounded-full border border-slate-900/10 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5" aria-label="Close delete confirmation">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 p-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-rose-500/35 bg-rose-50/70 p-4 transition hover:border-rose-500 dark:border-rose-400/40 dark:bg-rose-950/20">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={deleting} className="sr-only" />
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition ${confirmed ? "border-rose-600 bg-rose-600 text-white" : "border-rose-500 bg-white text-transparent dark:bg-transparent"}`} aria-hidden="true">
              <Check className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-950 dark:text-white">Delete {product.name}</span>
              <span className="mt-1 block text-xs text-slate-500">{product.slug}</span>
            </span>
          </label>

          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            This will permanently remove the product from the admin catalogue and storefront data. Uploaded product media may remain on disk, but the product record will be deleted.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onCancel} disabled={deleting} className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-slate-900/10 px-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 disabled:opacity-50 dark:border-white/10 dark:text-slate-200">
              Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={!confirmed || deleting} className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-rose-600 px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition disabled:cursor-not-allowed disabled:opacity-45">
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Confirm delete"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
