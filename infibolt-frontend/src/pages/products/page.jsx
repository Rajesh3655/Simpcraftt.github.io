import { useEffect, useMemo, useState } from "react";
import { CommerceShell, MotionSection, ProductFilters, ProductGrid, ProductGridSkeleton } from "../../components/commerce/CommerceLayout";
import { ErrorState } from "../../components/AppStates";
import { useAppStore } from "../../store/appStore";

export default function ProductsPage() {
  const { items, status, error } = useAppStore((state) => state.products);
  const loadProducts = useAppStore((state) => state.loadProducts);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = items.filter((product) => {
      const categoryMatches = selectedCategory === "all" || product.category === selectedCategory;
      const textMatches = !normalizedQuery || `${product.name} ${product.summary || ""} ${(product.features || []).join(" ")}`.toLowerCase().includes(normalizedQuery);
      return categoryMatches && textMatches;
    });
    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [items, query, selectedCategory, sort]);

  return (
    <CommerceShell
      eyebrow="Catalogue"
      title="Products"
      description="A focused catalogue of premium electronics with refined filters, fast discovery, and quiet product storytelling."
    >
      <MotionSection className="lux-divider px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-7xl">
          {status === "loading" || status === "idle" ? (
            <>
              <div className="premium-surface mb-8 flex flex-col gap-6 p-4 md:mb-10 dark:bg-white/[0.03] sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="premium-shimmer h-12 flex-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="premium-shimmer h-12 w-full rounded-full bg-slate-200 dark:bg-slate-700 sm:w-[230px]" />
                </div>
              </div>
              <ProductGridSkeleton count={6} />
            </>
          ) : status === "error" ? (
            <ErrorState description={error} onRetry={loadProducts} />
          ) : (
            <>
              <ProductFilters query={query} onQueryChange={setQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} sort={sort} onSortChange={setSort} />
              <ProductGrid items={filteredProducts} />
            </>
          )}
        </div>
      </MotionSection>
    </CommerceShell>
  );
}
