import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { CommerceShell, MotionSection, ProductFilters, ProductGrid, ProductGridSkeleton } from "../../components/commerce/CommerceLayout";
import { ErrorState } from "../../components/AppStates";
import { useAppStore } from "../../store/appStore";

export default function ProductsPage() {
  const { search } = useLocation();
  const { items, categories, status, error } = useAppStore((state) => state.products);
  const loadProducts = useAppStore((state) => state.loadProducts);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const selectedCollection = useMemo(() => new URLSearchParams(search).get("collection"), [search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const category = new URLSearchParams(search).get("category");
    setSelectedCategory(category || "all");
  }, [search]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = items.filter((product) => {
      const categoryMatches = selectedCategory === "all" || product.category === selectedCategory || product.categorySlug === selectedCategory;
      const collectionMatches = !selectedCollection || product.collection === selectedCollection || product.collectionSlug === selectedCollection;
      const textMatches = !normalizedQuery || `${product.name} ${product.summary || ""} ${(product.features || []).join(" ")}`.toLowerCase().includes(normalizedQuery);
      return categoryMatches && collectionMatches && textMatches;
    });
    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [items, query, selectedCategory, selectedCollection, sort]);

  return (
    <CommerceShell
      eyebrow="Catalogue"
      title={selectedCollection ? "Curated collection" : "Product universe"}
      description="Explore premium electronics through focused filters, cinematic product cards, and fast paths into purchase, warranty, and support."
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
              <ProductFilters query={query} onQueryChange={setQuery} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} sort={sort} onSortChange={setSort} categoryItems={categories} />
              <ProductGrid items={filteredProducts} />
            </>
          )}
        </div>
      </MotionSection>
    </CommerceShell>
  );
}
