import { CommerceShell, ProductFilters, ProductGrid, useFilteredProducts } from "../components/commerce/CommerceLayout";

export default function ProductsPage() {
  const filterState = useFilteredProducts();

  return (
    <CommerceShell
      eyebrow="Product Catalogue"
      title="Engineered products, marketplace ready."
      description="Explore Simpcraftt devices by category, collection, rating, and price. Direct checkout is reserved for the next commerce phase."
    >
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-7xl">
          <ProductFilters {...filterState} />
          <ProductGrid items={filterState.filteredProducts} />
        </div>
      </section>
    </CommerceShell>
  );
}
