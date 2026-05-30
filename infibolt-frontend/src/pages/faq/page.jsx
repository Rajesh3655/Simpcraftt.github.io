import { CommerceShell, FAQList, MotionSection } from "../../components/commerce/CommerceLayout";
import { faqs } from "../../store/commerce";
import { faqSchema, safeJsonLd } from "../../utils/seo";

export default function FAQPage() {
  const structuredData = faqSchema(faqs);

  return (
    <CommerceShell eyebrow="FAQ" title="Common questions, calmly answered." description="Guidance for marketplace purchases, warranty claims, ownership registration, service coverage, and support.">
      {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />}
      <MotionSection className="px-4 pb-24 sm:px-5">
        <div className="mx-auto max-w-5xl">
          <FAQList />
        </div>
      </MotionSection>
    </CommerceShell>
  );
}



