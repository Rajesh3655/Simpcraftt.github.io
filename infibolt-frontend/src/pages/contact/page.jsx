import { CommerceShell, MotionSection, SecondaryButton, SupportForm } from "../../components/commerce/CommerceLayout";
import { useEffect, useState } from "react";
import { defaultContactSettings, siteService } from "../../services/siteService";

export default function ContactPage() {
  const [contact, setContact] = useState(defaultContactSettings);

  useEffect(() => {
    let mounted = true;
    siteService.settings().then((result) => {
      if (mounted) setContact(result.contactSettings);
    }).catch(() => {
      if (mounted) setContact(defaultContactSettings);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <CommerceShell eyebrow="Contact" title="Talk to INFIBOLT." description="For launch access, partnerships, marketplace support, and product guidance.">
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lux-panel rounded-2xl p-7">
            <h2 className="text-2xl font-black">Customer channels</h2>
            <p className="mt-4 leading-7 text-black/64 dark:text-white/64">Email: {contact.helpEmail}</p>
            {(contact.mobileNumber || contact.phone) && <p className="leading-7 text-black/64 dark:text-white/64">Mobile: {contact.mobileNumber || contact.phone}</p>}
            <p className="leading-7 text-black/64 dark:text-white/64">Response window: 24-48 hours</p>
            <p className="mt-4 text-sm leading-7 text-black/68 dark:text-white/70">Include product name, serial number, and marketplace order details for faster support routing.</p>
            <div className="mt-6">
              <SecondaryButton href={contact.whatsapp || defaultContactSettings.whatsapp} external>WhatsApp Support</SecondaryButton>
            </div>
          </div>
          <SupportForm />
        </div>
      </MotionSection>
    </CommerceShell>
  );
}



