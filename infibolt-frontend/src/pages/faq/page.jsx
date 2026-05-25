import { CommerceShell, FAQList, MotionSection } from "../../components/commerce/CommerceLayout";

export default function FAQPage() {
  return (
    <CommerceShell eyebrow="FAQ" title="Common questions, calmly answered." description="Guidance for marketplace purchases, warranty claims, ownership registration, service coverage, and support.">
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-5xl">
          <FAQList />
        </div>
      </MotionSection>
    </CommerceShell>
  );
}



