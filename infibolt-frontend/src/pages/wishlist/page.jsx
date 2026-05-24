import { Heart } from "lucide-react";
import { Link } from "react-router";
import { CommerceShell, MotionSection, ProductGrid } from "../../components/commerce/CommerceLayout";
import { EmptyState } from "../../components/AppStates";
import { useAppStore } from "../../store/appStore";
import { products } from "../../store/commerce";

export default function WishlistPage() {
  const wishlist = useAppStore((state) => state.wishlist.items);
  return (
    <CommerceShell eyebrow="Wishlist" title="Saved products for later." description="Wishlist state is ready for authenticated customer sync and personalized product reminders.">
      <MotionSection className="pb-10 md:pb-16 lg:pb-20">
        <div className="mx-auto w-full max-w-[1400px] space-y-10 px-6 md:px-8 lg:px-12">
          {wishlist.length === 0 ? <EmptyState title="No saved products yet" description="Products you save will appear here with account sync once backend persistence is connected." action={<Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"><Heart className="h-4 w-4" /> Explore products</Link>} /> : <ProductGrid items={wishlist} />}
          <div className="border-t border-slate-200 pt-10"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Popular saves</p><div className="mt-8"><ProductGrid items={products.slice(0, 3)} /></div></div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}
