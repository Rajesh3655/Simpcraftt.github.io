import { PackageCheck } from "lucide-react";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { EmptyState, ProtectedRoute } from "../../components/AppStates";

export default function OrdersPage() {
  return (
    <CommerceShell eyebrow="Account" title="Orders" description="Order history is prepared for future direct checkout, invoices, and shipment tracking.">
      <MotionSection className="px-6 pb-16 md:px-8 md:pb-24">
        <ProtectedRoute>
          <div className="mx-auto max-w-4xl">
            <EmptyState
              title="No direct INFIBOLT orders yet"
              description="Marketplace-first purchases currently happen outside INFIBOLT. When direct checkout launches, order timelines, invoices, refunds, and shipment tracking will appear here."
              action={<span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"><PackageCheck className="h-4 w-4" /> Order system ready</span>}
            />
          </div>
        </ProtectedRoute>
      </MotionSection>
    </CommerceShell>
  );
}
