import { CommerceShell, MotionSection, ProductFilters, ProductGrid, useFilteredProducts } from "../components/commerce/CommerceLayout";

export default function ProductsPage() {
  const filterState = useFilteredProducts();

  return (
    <CommerceShell
      eyebrow="Catalogue"
      title="Products"
      description="Each product is presented as a premium object with calm storytelling, technical clarity, and marketplace-ready purchase access."
    >
      <MotionSection className="lux-divider px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-7xl">
          <ProductFilters {...filterState} />
          <ProductGrid items={filterState.filteredProducts} />
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

    
