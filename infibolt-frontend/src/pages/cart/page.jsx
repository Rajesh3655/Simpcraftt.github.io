import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { CommerceShell, MotionSection, ProductGrid } from "../../components/commerce/CommerceLayout";
import { EmptyState } from "../../components/AppStates";
import { useAppStore } from "../../store/appStore";
import { products } from "../../store/commerce";

export default function CartPage() {
  const cart = useAppStore((state) => state.cart.items);
  return (
    <CommerceShell eyebrow="Checkout" title="Cart" description="Collect the products you are considering before purchase opens.">
      <MotionSection className="pb-10 md:pb-16 lg:pb-20">
        <div className="mx-auto w-full max-w-[1400px] space-y-10 px-6 md:px-8 lg:px-12">
          {cart.length === 0 ? <EmptyState title="Your cart is empty" description="Explore the collection and keep your purchase ideas in one place." action={<Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"><ShoppingCart className="h-4 w-4" /> Browse products</Link>} /> : <ProductGrid items={cart} />}
          <div className="border-t border-slate-200 pt-10"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Suggested products</p><div className="mt-8"><ProductGrid items={products.slice(0, 3)} /></div></div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}
