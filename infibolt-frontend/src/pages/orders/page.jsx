import { PackageCheck } from "lucide-react";
import { Link } from "react-router";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { EmptyState, ProtectedRoute } from "../../components/AppStates";

export default function OrdersPage() {
  return (
    <CommerceShell eyebrow="Account" title="Marketplace purchases" description="Purchases currently happen through selected launch partners. Infibolt manages ownership records, warranty, and support after delivery.">
      <MotionSection className="px-6 pb-16 md:px-8 md:pb-24">
        <ProtectedRoute>
          <div className="mx-auto max-w-4xl">
            <EmptyState
              title="Register your marketplace purchase"
              description="After buying from Amazon, Flipkart, or a retail partner, register the product serial and invoice to activate the Infibolt ownership ecosystem."
              action={<Link to="/warranty" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"><PackageCheck className="h-4 w-4" /> Register product</Link>}
            />
          </div>
        </ProtectedRoute>
      </MotionSection>
    </CommerceShell>
  );
}
