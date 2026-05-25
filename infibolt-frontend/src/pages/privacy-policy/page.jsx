import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";

export default function PrivacyPolicyPage() {
  return (
    <CommerceShell eyebrow="Legal" title="Privacy Policy" description="How Infibolt handles account, ownership, warranty, support, and launch notification data.">
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-4xl lux-panel rounded-2xl p-7 leading-8 text-black/68 sm:p-8 dark:text-white/68">
          <p>INFIBOLT collects customer details submitted through newsletter, contact, support, warranty, launch notification, and account forms for service, communication, warranty verification, and ownership support.</p>
          <p className="mt-4">Marketplace purchases are completed with the selected partner. Infibolt stores only the account, support, product registration, invoice, policy, and care-context data needed to operate the ownership ecosystem.</p>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}



