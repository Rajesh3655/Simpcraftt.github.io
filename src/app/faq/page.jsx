import { CommerceShell, FAQList } from "../components/commerce/CommerceLayout";

export default function FAQPage() {
  return (
    <CommerceShell eyebrow="FAQ" title="Common questions." description="Answers for marketplace purchases, warranty, direct checkout, and product launch timing.">
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-4xl">
          <FAQList />
        </div>
      </section>
    </CommerceShell>
  );
}
