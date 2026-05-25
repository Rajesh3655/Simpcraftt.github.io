import { AnimatePresence, motion } from "framer-motion";
import { Layers, LayoutGrid, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { CommerceShell, MotionSection, ProductGrid, ProductGridSkeleton } from "../../components/commerce/CommerceLayout";
import { productService } from "../../services/productService";
import { collections, products } from "../../store/commerce";

export default function CollectionsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPreparing, setIsPreparing] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [remoteProducts, setRemoteProducts] = useState(products);
  const [remoteCollections, setRemoteCollections] = useState(collections);
  const activeCollection = remoteCollections[activeIndex] || remoteCollections[0];
  const collectionProducts = remoteProducts.filter((product) =>
    activeCollection?.productSlugs?.length
      ? activeCollection.productSlugs.includes(product.slug)
      : product.collection === activeCollection?.slug || product.collectionSlug === activeCollection?.slug
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPreparing(false), 520);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([productService.list(), productService.collections()]).then(([productResult, collectionResult]) => {
      if (!active) return;
      if (productResult.items?.length) setRemoteProducts(productResult.items);
      if (collectionResult.items?.length) setRemoteCollections(collectionResult.items);
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isPreparing) return;
    setIsSwitching(true);
    const timer = window.setTimeout(() => setIsSwitching(false), 260);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isPreparing]);

  return (
    <CommerceShell 
      eyebrow="Ecosystems" 
      title="Curated for context." 
      description="Explore our product families, designed to work together seamlessly across different environments."
    >
      <MotionSection className="pb-10 md:pb-16 lg:pb-20">
        <div className="mx-auto w-full max-w-[1400px] space-y-8 md:space-y-12 px-6 md:px-8 lg:px-12">
          
          {/* Interactive Ecosystem Map / Selector */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {remoteCollections.map((collection, index) => {
              const isActive = index === activeIndex;
              const icons = [Sparkles, LayoutGrid, Layers];
              const Icon = icons[index] ?? Sparkles;

              return (
                <motion.button
                  key={collection.slug}
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex w-full flex-col items-start overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 sm:p-6 md:p-8 ${
                    isActive
                      ? "border-slate-900/20 bg-white dark:border-white/20 dark:bg-white/10"
                      : "border-slate-900/5 bg-slate-50 opacity-70 hover:opacity-100 dark:border-white/5 dark:bg-white/[0.02]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="collection-active-bg"
                      className="absolute inset-0 z-0 bg-slate-50 dark:bg-white/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className={`relative z-10 mb-4 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 sm:mb-6 sm:h-12 sm:w-12 ${
                    isActive 
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                      : "bg-slate-900/5 text-slate-500 group-hover:bg-slate-900/10 dark:bg-white/10 dark:text-slate-400 dark:group-hover:bg-white/20"
                  }`}>
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="mb-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300 sm:mb-3 sm:text-[10px] sm:tracking-[0.2em]">
                      {collection.productSlugs?.length || remoteProducts.filter((product) => product.collection === collection.slug || product.collectionSlug === collection.slug).length} products
                    </p>
                    <h3 className={`text-sm font-bold leading-tight tracking-tight transition-colors duration-300 sm:text-lg md:text-xl ${
                      isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-400"
                    }`}>
                      {collection.name}
                    </h3>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic Collection Content */}
          <div className="pt-4 md:pt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCollection?.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mb-8 flex flex-col items-start justify-between gap-6 md:mb-12 md:flex-row md:items-end rounded-2xl bg-slate-50 p-6 md:p-8 dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
                  <div className="max-w-2xl">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">{activeCollection?.name}</h2>
                    <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">{activeCollection?.description}</p>
                  </div>
                </div>
                
                {isPreparing || isSwitching ? <ProductGridSkeleton count={4} /> : <ProductGrid items={collectionProducts} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}


