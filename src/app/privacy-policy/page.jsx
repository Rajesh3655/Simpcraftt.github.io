import { CommerceShell } from "../components/commerce/CommerceLayout";

export default function PrivacyPolicyPage() {
  return (
    <CommerceShell eyebrow="Legal" title="Privacy Policy" description="A production legal policy should be reviewed before launch.">
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-4xl rounded-lg border border-black/10 bg-white/70 p-8 leading-8 text-black/68 dark:border-white/10 dark:bg-white/[0.045] dark:text-white/68">
          <p>Simpcraftt collects customer details submitted through newsletter, contact, support, warranty, and account forms for service, communication, warranty verification, and future ecommerce operations.</p>
          <p className="mt-4">Payment, order, address, and authentication data flows are planned but disabled until the direct commerce release is activated.</p>
        </div>
      </section>
    </CommerceShell>
  );
}
