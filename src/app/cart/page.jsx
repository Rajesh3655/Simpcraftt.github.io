import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CommerceShell, EcommerceStepper, FutureCommerceNotice, MotionSection, ProductGrid } from "../components/commerce/CommerceLayout";
import { products } from "../data/commerce";

export default function CartPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const stepNotices = [
    { title: "Cart syncing launching soon", description: "The cart flow is intentionally paused during marketplace-first launch while the direct commerce infrastructure is finalized." },
    { title: "Address management disabled", description: "Saved addresses and delivery zone validations will be activated in the next commerce phase." },
    { title: "Payment gateway paused", description: "Card, UPI, and wallet reconciliations are modeled but disabled for public users." },
    { title: "Order processing staged", description: "Order lifecycle, invoices, and tracking links will be available when direct checkout goes live." }
  ];

  return (
    <CommerceShell eyebrow="Checkout Flow" title="Direct checkout is staged with premium restraint." description="Experience the interactive architecture of our upcoming direct-to-consumer purchase flow.">
      <MotionSection className="pb-10 md:pb-16 lg:pb-20">
        <div className="mx-auto w-full max-w-[1400px] space-y-8 md:space-y-12 px-6 md:px-8 lg:px-12">
          <EcommerceStepper current={currentStep} onStepChange={setCurrentStep} />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <FutureCommerceNotice 
                title={stepNotices[currentStep].title} 
                description={stepNotices[currentStep].description}
              />
            </motion.div>
          </AnimatePresence>

          <div className="border-t border-slate-200 dark:border-white/10 pt-10 mt-10 md:pt-16 md:mt-16">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Suggested products</p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-4xl">Continue exploring</h2>
            <div className="mt-8 md:mt-10">
              <ProductGrid items={products.slice(0, 3)} />
            </div>
          </div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}
