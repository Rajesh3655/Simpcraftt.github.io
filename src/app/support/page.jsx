import { CommerceShell, FAQList, SecondaryButton, SupportForm } from "../components/commerce/CommerceLayout";

export default function SupportPage() {
  return (
    <CommerceShell eyebrow="Support" title="Care is part of the product." description="Premium customer assistance designed with the same calm and precision as the product experience.">
      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SupportForm />
          <div className="space-y-5">
            <div className="lux-panel rounded-2xl p-6 sm:p-7">
              <h2 className="text-2xl font-black">Priority channel</h2>
              <p className="mt-4 text-sm leading-7 text-black/68 dark:text-white/70">For quick resolutions, start with our WhatsApp queue and include your product serial and marketplace order details.</p>
              <div className="mt-6">
                <SecondaryButton href="https://wa.me/1234567890" external>Start WhatsApp Chat</SecondaryButton>
              </div>
            </div>
            <FAQList />
          </div>
        </div>
      </section>
    </CommerceShell>
  );
}

