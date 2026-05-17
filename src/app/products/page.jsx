import { useEffect, useState } from "react";
import { CommerceShell, MotionSection, ProductFilters, ProductGrid, ProductGridSkeleton, useFilteredProducts } from "../components/commerce/CommerceLayout";

export default function ProductsPage() {
  const filterState = useFilteredProducts();
  const [isPreparing, setIsPreparing] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPreparing(false), 520);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <CommerceShell
      eyebrow="Catalogue"
      title="Products"
      description="Each product is presented as a premium object with calm storytelling, technical clarity, and marketplace-ready purchase access."
    >
      <MotionSection className="lux-divider px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-7xl">
          {isPreparing ? (
            <>
              <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-black/5 bg-slate-50 p-4 md:mb-10 dark:border-white/10 dark:bg-white/[0.02] sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="h-12 flex-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-12 w-full rounded-full bg-slate-200 dark:bg-slate-700 sm:w-[230px]" />
                </div>
                <div className="flex gap-2 overflow-hidden">
                  <div className="h-10 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-10 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-10 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
              <ProductGridSkeleton count={6} />
            </>
          ) : (
            <>
              <ProductFilters {...filterState} />
              <ProductGrid items={filterState.filteredProducts} />
            </>
          )}
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

    
