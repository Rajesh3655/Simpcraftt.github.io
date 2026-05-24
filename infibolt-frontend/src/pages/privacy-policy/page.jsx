import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";

export default function PrivacyPolicyPage() {
  return (
    <CommerceShell eyebrow="Legal" title="Privacy Policy" description="A production legal policy should be reviewed before launch.">
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-4xl lux-panel rounded-2xl p-7 leading-8 text-black/68 sm:p-8 dark:text-white/68">
          <p>INFIBOLT collects customer details submitted through newsletter, contact, support, warranty, and account forms for service, communication, warranty verification, and future ecommerce operations.</p>
          <p className="mt-4">Payment, order, address, and authentication data flows are planned but disabled until the direct commerce release is activated.</p>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}



