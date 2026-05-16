import { CommerceShell, FAQList } from "../components/commerce/CommerceLayout";

export default function FAQPage() {
  return (
    <CommerceShell eyebrow="FAQ" title="Common questions, calmly answered." description="Guidance for marketplace orders, warranty claims, service coverage, and direct checkout timelines.">
      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-5xl">
          <FAQList />
        </div>
      </section>
    </CommerceShell>
  );
}

