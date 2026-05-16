import { CommerceShell, MotionSection, SecondaryButton, SupportForm } from "../components/commerce/CommerceLayout";

export default function ContactPage() {
  return (
    <CommerceShell eyebrow="Contact" title="Talk to Simpcraftt." description="For launch access, partnerships, marketplace support, and product guidance.">
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lux-panel rounded-2xl p-7">
            <h2 className="text-2xl font-black">Customer channels</h2>
            <p className="mt-4 leading-7 text-black/64 dark:text-white/64">Email: hello@simpcraftt.com</p>
            <p className="leading-7 text-black/64 dark:text-white/64">Response window: 24-48 hours</p>
            <p className="mt-4 text-sm leading-7 text-black/68 dark:text-white/70">Include product name, serial number, and marketplace order details for faster support routing.</p>
            <div className="mt-6">
              <SecondaryButton href="https://wa.me/1234567890" external>WhatsApp Support</SecondaryButton>
            </div>
          </div>
          <SupportForm />
        </div>
      </MotionSection>
    </CommerceShell>
  );
}

