import { motion } from "framer-motion";
import { CommerceShell, FutureCommerceNotice, MotionSection, ProductCard } from "../components/commerce/CommerceLayout";
import { products } from "../data/commerce";

export default function WishlistPage() {
  return (
    <CommerceShell eyebrow="Wishlist" title="Saved products for later." description="Wishlist UI is ready for authenticated customers once accounts are fully enabled.">
      <MotionSection className="pb-10 md:pb-16 lg:pb-20">
        <div className="mx-auto w-full max-w-[1400px] space-y-8 md:space-y-12 px-6 md:px-8 lg:px-12">
          <FutureCommerceNotice title="Wishlist sync launching soon" />
          
          {/* Standard Grid Layout */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12"
          >
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </motion.div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}
