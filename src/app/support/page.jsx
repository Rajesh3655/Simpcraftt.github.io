import { CommerceShell, FAQList, SecondaryButton, SupportForm } from "../components/commerce/CommerceLayout";

export default function SupportPage() {
  return (
    <CommerceShell eyebrow="Support" title="Customer care that scales with the product ecosystem." description="Create a ticket, start WhatsApp support, or find quick answers.">
      <section className="px-5 pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.85fr]">
          <SupportForm />
          <div className="space-y-5">
            <SecondaryButton href="https://wa.me/1234567890" external>Start WhatsApp Chat</SecondaryButton>
            <FAQList />
          </div>
        </div>
      </section>
    </CommerceShell>
  );
}
