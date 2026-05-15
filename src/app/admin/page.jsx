import { AdminPanelPreview, CommerceShell, FutureCommerceNotice } from "../components/commerce/CommerceLayout";

export default function AdminPage() {
  return (
    <CommerceShell eyebrow="Admin" title="Admin operations blueprint." description="The admin module is prepared as a capability map before secure role-based access and database models are connected.">
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-7xl space-y-8">
          <FutureCommerceNotice title="Admin access will require authentication" />
          <AdminPanelPreview />
        </div>
      </section>
    </CommerceShell>
  );
}
