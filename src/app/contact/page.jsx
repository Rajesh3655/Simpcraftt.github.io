import { CommerceShell, SecondaryButton, SupportForm } from "../components/commerce/CommerceLayout";

export default function ContactPage() {
  return (
    <CommerceShell eyebrow="Contact" title="Talk to Simpcraftt." description="For launch access, partnerships, marketplace support, and product questions.">
      <section className="px-5 pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1fr]">
          <div className="rounded-lg border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.045]">
            <h2 className="text-2xl font-black">Customer channels</h2>
            <p className="mt-4 leading-7 text-black/64 dark:text-white/64">Email: hello@simpcraftt.com</p>
            <p className="leading-7 text-black/64 dark:text-white/64">Response window: 24-48 hours</p>
            <div className="mt-6">
              <SecondaryButton href="https://wa.me/1234567890" external>WhatsApp Support</SecondaryButton>
            </div>
          </div>
          <SupportForm />
        </div>
      </section>
    </CommerceShell>
  );
}
