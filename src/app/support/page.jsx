import { CommerceShell, FAQList, MotionSection, SecondaryButton, SupportForm } from "../components/commerce/CommerceLayout";

export default function SupportPage() {
  return (
    <CommerceShell eyebrow="Support" title="Care is part of the product." description="Premium customer assistance designed with the same calm and precision as the product experience.">
      <MotionSection className="pb-10 md:pb-16 lg:pb-20">
        <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
          <SupportForm />
          <div className="space-y-5">
            <div className="lux-panel rounded-2xl p-6 sm:p-7 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/10">
              <h2 className="text-2xl font-black">Priority channel</h2>
              <p className="mt-4 text-sm leading-7 text-black/68 dark:text-white/70">For quick resolutions, start with our WhatsApp queue and include your product serial and marketplace order details.</p>
              <div className="mt-6">
                <SecondaryButton href="https://wa.me/1234567890" external>Start WhatsApp Chat</SecondaryButton>
              </div>
            </div>
            <FAQList />
          </div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}
