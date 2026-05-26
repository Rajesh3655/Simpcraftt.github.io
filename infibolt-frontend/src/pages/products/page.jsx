import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CommerceShell, MotionSection, ProductFilters, ProductGrid, ProductGridSkeleton } from "../../components/commerce/CommerceLayout";
import { ErrorState } from "../../components/AppStates";
import { useAppStore } from "../../store/appStore";

export default function ProductsPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { items, categories, status, error } = useAppStore((state) => state.products);
  const loadProducts = useAppStore((state) => state.loadProducts);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const selectedCategoryItem = useMemo(() => {
    if (selectedCategory === "all") return null;
    return categories.find((category) => [category.id, category.slug, category.name].filter(Boolean).map((value) => String(value).toLowerCase()).includes(String(selectedCategory).toLowerCase()));
  }, [categories, selectedCategory]);
  const breadcrumbItems = useMemo(() => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
    ];
    if (selectedCategoryItem) {
      items.push({
        label: selectedCategoryItem.name,
        href: `/products?category=${selectedCategoryItem.slug || selectedCategoryItem.id}`,
      });
    }
    return items;
  }, [selectedCategoryItem]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const category = new URLSearchParams(search).get("category");
    setSelectedCategory(category || "all");
  }, [search]);

  const changeCategory = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(search);
    if (category && category !== "all") params.set("category", category);
    else params.delete("category");
    const nextSearch = params.toString();
    navigate(nextSearch ? `/products?${nextSearch}` : "/products", { replace: false });
  };

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedCategoryValues = selectedCategory === "all"
      ? []
      : [
        selectedCategory,
        selectedCategoryItem?.id,
        selectedCategoryItem?.slug,
        selectedCategoryItem?.name,
      ].filter(Boolean).map(normalizeCategoryValue);
    const result = items.filter((product) => {
      const productCategoryValues = [
        product.category,
        product.categorySlug,
        product.categoryId,
        product.collection,
        product.collectionSlug,
      ].filter(Boolean).map(normalizeCategoryValue);
      const categoryMatches = selectedCategory === "all" || productCategoryValues.some((value) => selectedCategoryValues.includes(value));
      const textMatches = !normalizedQuery || `${product.name} ${product.summary || ""} ${(product.features || []).join(" ")}`.toLowerCase().includes(normalizedQuery);
      return categoryMatches && textMatches;
    });
    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      return 0;
    });
  }, [items, query, selectedCategory, selectedCategoryItem, sort]);

  return (
    <CommerceShell
      eyebrow="Catalogue"
      title="Product universe"
      description="Explore premium electronics through focused filters, cinematic product cards, and fast paths into purchase, warranty, and support."
      breadcrumbItems={breadcrumbItems}
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
              <ProductFilters query={query} onQueryChange={setQuery} selectedCategory={selectedCategory} onCategoryChange={changeCategory} sort={sort} onSortChange={setSort} categoryItems={categories} />
              <ProductGrid items={filteredProducts} />
            </>
          )}
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

function normalizeCategoryValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
