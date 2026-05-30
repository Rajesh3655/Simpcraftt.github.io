import { motion } from "framer-motion";
import { Download, Eye, FileText, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { uploadUrl } from "../../../config/api";
import { CommerceShell, MotionSection } from "../../../components/commerce/CommerceLayout";
import { AccountAtmosphere, AccountCard, SoftStatus } from "../../../components/customer/PremiumAccount";
import { manualService } from "../../../services/manualService";

const fallbackCategories = ["Audio", "Charging", "Wearables"];

export default function ManualsPage() {
  const [manuals, setManuals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    manualService.list({ limit: 80, sort: "latest" })
      .then((result) => {
        if (!active) return;
        setManuals(result.items || []);
        setCategories(result.categories || []);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setManuals([]);
        setCategories([]);
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const names = categories.length ? categories : fallbackCategories;
    return [...new Set(names.filter(Boolean))].sort();
  }, [categories]);

  const filteredManuals = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const items = manuals.filter((manual) => {
      const haystack = [manual.productName, manual.category, manual.description].filter(Boolean).join(" ").toLowerCase();
      return (!needle || haystack.includes(needle)) && (category === "all" || manual.category === category);
    });
    if (sort === "name") return [...items].sort((a, b) => String(a.productName).localeCompare(String(b.productName)));
    return [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [category, manuals, query, sort]);

  return (
    <CommerceShell seoTitle="User Manuals" seoDescription="Search, view, and download INFIBOLT product manuals from the official support portal.">
      <AccountAtmosphere>
        <MotionSection className="px-4 pb-16 pt-6 sm:px-6 md:px-8 md:pb-20 lg:pt-10">
          <div className="mx-auto grid w-full max-w-[1220px] gap-5">
            <section className="relative overflow-hidden rounded-[1.45rem] border border-slate-900/8 bg-white/78 p-5 shadow-[0_24px_76px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-7 lg:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_8%,rgba(203,184,143,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.72))]" />
              <div className="relative grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
                <div>
                  <SoftStatus>Support Library</SoftStatus>
                  <h1 className="mt-4 max-w-3xl text-[2.15rem] font-semibold leading-[1.04] tracking-normal text-slate-950 sm:text-[3.2rem]">
                    Manuals, setup guides, and product care in one place.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm font-light leading-7 text-slate-600 sm:text-base">
                    Find the official PDF manual for your INFIBOLT product, open it instantly, or download it for offline reference.
                  </p>
                </div>
                <div className="relative min-h-[176px] overflow-hidden rounded-[1.25rem] border border-white/70 bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                  <Sparkles className="h-5 w-5 text-amber-200" strokeWidth={1.8} />
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">Official PDFs</p>
                  <p className="mt-2 max-w-[14rem] text-xl font-semibold leading-tight">Always controlled by INFIBOLT support admins.</p>
                  <FileText className="absolute bottom-4 right-4 h-20 w-20 text-white/12" strokeWidth={1.2} />
                </div>
              </div>
            </section>

            <section className="sticky top-[88px] z-10 rounded-[1.2rem] border border-slate-900/8 bg-white/82 p-4 shadow-[0_18px_58px_rgba(15,23,42,0.07)] backdrop-blur-xl">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <label className="flex min-h-[48px] items-center gap-3 rounded-full border border-slate-900/10 bg-white/80 px-5">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400" placeholder="Search by product name or category" />
                </label>
                <label className="flex min-h-[48px] items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-4">
                  <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                  <select value={category} onChange={(event) => setCategory(event.target.value)} className="bg-transparent text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 outline-none">
                    <option value="all">All categories</option>
                    {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-[48px] rounded-full border border-slate-900/10 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 outline-none">
                  <option value="latest">Latest uploads</option>
                  <option value="name">Product name</option>
                </select>
              </div>
            </section>

            <AccountCard className="overflow-hidden p-0">
              <div className="hidden border-b border-slate-900/8 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:grid md:grid-cols-[1.4fr_0.7fr_0.9fr]">
                <span>Product Name</span>
                <span>Category</span>
                <span className="text-right">View PDF</span>
              </div>
              <div className="divide-y divide-slate-900/7">
                {status === "loading" && <ManualLoading />}
                {status !== "loading" && filteredManuals.map((manual, index) => (
                  <motion.div
                    key={manual._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.22) }}
                    className="grid gap-4 px-5 py-5 transition hover:bg-slate-950/[0.025] md:grid-cols-[1.4fr_0.7fr_0.9fr] md:items-center"
                  >
                    <div className="flex gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-950 text-white">
                        <FileText className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-base font-semibold text-slate-950">{manual.productName}</span>
                        <span className="mt-1 line-clamp-2 block text-xs font-medium leading-5 text-slate-500">{manual.description || "Official INFIBOLT product manual."}</span>
                      </span>
                    </div>
                    <div>
                      <span className="inline-flex rounded-full border border-slate-900/8 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">{manual.category}</span>
                    </div>
                    <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                      <a href={uploadUrl(manual.pdfUrl)} target="_blank" rel="noreferrer" className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-800">
                        <Eye className="h-4 w-4" />
                        View Manual
                      </a>
                      <a href={uploadUrl(manual.pdfUrl)} download className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-white">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </a>
                    </div>
                  </motion.div>
                ))}
                {status !== "loading" && !filteredManuals.length && <ManualEmpty errored={status === "error"} />}
              </div>
            </AccountCard>
          </div>
        </MotionSection>
      </AccountAtmosphere>
    </CommerceShell>
  );
}

function ManualLoading() {
  return (
    <div className="grid gap-3 p-5">
      {[0, 1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-900/5" />)}
    </div>
  );
}

function ManualEmpty({ errored }) {
  return (
    <div className="grid min-h-[260px] place-items-center px-6 py-12 text-center">
      <div>
        <FileText className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-4 text-lg font-semibold text-slate-950">{errored ? "Manuals could not load" : "No manuals found"}</p>
        <p className="mt-2 max-w-sm text-sm font-light leading-7 text-slate-500">
          {errored ? "Please refresh the page or contact support." : "Try another product name or category filter."}
        </p>
      </div>
    </div>
  );
}
