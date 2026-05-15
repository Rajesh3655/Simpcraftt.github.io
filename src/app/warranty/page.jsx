import { CommerceShell, WarrantyForm } from "../components/commerce/CommerceLayout";

export default function WarrantyPage() {
  return (
    <CommerceShell eyebrow="Warranty" title="Register a product or submit a claim." description="Submit serial, invoice, purchase, dealer, and customer details to generate a warranty ticket.">
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-7xl">
          <WarrantyForm />
        </div>
      </section>
    </CommerceShell>
  );
}
