import { Link } from "react-router";
import { CommerceShell } from "../../components/commerce/CommerceLayout";

const policySections = [
  {
    title: "1. About This Policy",
    paragraphs: [
      'This Privacy Policy explains how INFIBOLT(TM), a brand owned and operated by Simpcraftt Sphere Innovation & Technology Pvt Ltd (hereinafter "we", "us", or "our"), collects, uses, stores, and protects your personal information when you visit or use our platform at infibolt.com, purchase our products, register your warranty, or contact our support team.',
      "We take your privacy seriously. This document is written in plain language because we believe you deserve to understand exactly what we do with your data. If you ever have a question about anything in here, write to us and we will reply.",
      "By using the INFIBOLT platform or services, you agree to the practices described in this Privacy Policy. If you do not agree, please stop using the platform. This Policy is compliant with the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000, and applicable rules thereunder.",
    ],
  },
  {
    title: "2. Who We Are",
    paragraphs: ["INFIBOLT is a premium electronics brand. The legal entity behind the brand is Simpcraftt Sphere Innovation & Technology Pvt Ltd."],
    details: [
      ["Company Name", "Simpcraftt Sphere Innovation & Technology Pvt Ltd"],
      ["Brand Name", "INFIBOLT"],
      ["Registered Address", "No 32 Kaluvehalli Kolala Koratagere (T) Tumkur (D) Karnataka, 572140, India"],
      ["Privacy Contact", "support@infibolt.com"],
      ["Website", "www.infibolt.com"],
    ],
    closing: "We sell premium electronics, audio products, focus accessories, and connected lifestyle devices through our platform and through authorised marketplace partners such as Amazon India and Flipkart.",
  },
  {
    title: "3. What Information We Collect",
    groups: [
      {
        heading: "3.1 Information You Give Us Directly",
        items: [
          "Your name, email address, and mobile number when you create an account.",
          "Your delivery address and billing details when you place an order.",
          "Your product serial number and purchase invoice when you register a warranty.",
          "Any messages, queries, or complaints you send our support team.",
          "Your feedback, reviews, or survey responses if you choose to share them.",
          "Information you submit during contests, promotions, or loyalty programmes.",
        ],
      },
      {
        heading: "3.2 Information We Collect Automatically",
        items: [
          "Device information: model, operating system, browser type, and IP address.",
          "How you use our platform: pages visited, products viewed, time spent, and clicks.",
          "Approximate location based on your IP address. We do not track precise GPS location without your explicit consent.",
          "Cookies and similar tracking data.",
          "Transaction logs: purchase history, payment status, and delivery tracking.",
        ],
      },
      {
        heading: "3.3 Information from Third Parties",
        items: [
          "If you log in via Google or another social account, we receive basic profile information as permitted by your settings on that platform.",
          "Payment confirmation and fraud-risk signals from our payment gateway partners.",
          "Delivery and courier tracking updates from our logistics partners.",
        ],
      },
    ],
  },
  {
    title: "4. How We Use Your Information",
    groups: [
      {
        heading: "4.1 To Run Our Services",
        items: [
          "Process your orders, payments, deliveries, returns, and refunds.",
          "Create and manage your account and ownership profile.",
          "Activate and manage your product warranty.",
          "Respond to your support tickets and customer queries.",
          "Issue invoices, receipts, and warranty certificates.",
        ],
      },
      {
        heading: "4.2 To Improve Your Experience",
        items: [
          "Personalise your product recommendations and browsing experience.",
          "Analyse how people use the platform so we can improve it.",
          "Develop new features and product categories based on customer needs.",
        ],
      },
      {
        heading: "4.3 For Communication",
        items: [
          "Send you order updates, shipping notifications, and account alerts.",
          "Send promotional offers, product launches, and news only if you have opted in.",
          "Conduct optional user research and satisfaction surveys.",
        ],
        note: 'You can opt out of marketing emails at any time by clicking "Unsubscribe" in any email or by writing to support@infibolt.com.',
      },
      {
        heading: "4.4 For Legal and Security Purposes",
        items: [
          "Detect and prevent fraud, unauthorised access, and abuse.",
          "Comply with applicable laws, court orders, and government requests.",
          "Enforce our Terms and Conditions and protect our legal rights.",
        ],
      },
    ],
  },
  {
    title: "5. Cookies",
    paragraphs: ["Cookies are small text files placed on your device. We use them to keep the platform working correctly and to understand how it is being used."],
    details: [
      ["Essential Cookies", "Keep the platform functional, including cart, login session, and preferences."],
      ["Performance Cookies", "Anonymous data about how people navigate the site so we can improve it."],
      ["Functional Cookies", "Remember preferences like language or region."],
      ["Marketing Cookies", "Placed only with your consent, used to show relevant ads and measure effectiveness."],
    ],
    closing: "You can manage or disable cookies through your browser settings. Disabling essential cookies may limit how the platform functions. For more, visit www.allaboutcookies.org.",
  },
  {
    title: "6. Who We Share Your Data With",
    paragraphs: ["We do not sell your personal information. We share data only when needed to provide a service or comply with law."],
    details: [
      ["Delivery Partners", "Name and address details needed to deliver your orders."],
      ["Payment Gateways", "Order details needed to complete transactions. We never store your full card number."],
      ["Cloud & IT Providers", "Infrastructure providers under confidentiality obligations."],
      ["Analytics Tools", "Anonymous, aggregated usage data only."],
      ["Legal Authorities", "Data shared only when legally required and only to the required extent."],
      ["Business Transfers", "If INFIBOLT is acquired or merges, data may transfer to the new entity with advance notice."],
    ],
    closing: "Third-party partners are bound by data processing agreements and are prohibited from using your data for their own marketing or commercial purposes.",
  },
  {
    title: "7. How Long We Keep Your Data",
    details: [
      ["Account information", "For the life of your account, and up to 3 years after account deletion."],
      ["Order and transaction records", "7 years, as required by Indian tax and accounting law."],
      ["Warranty registration records", "For the warranty period plus 1 year."],
      ["Customer support communications", "2 years from the date the issue was resolved."],
      ["Marketing preferences", "Until you opt out, or 3 years of account inactivity, whichever comes first."],
    ],
    closing: "When the retention period ends, your data is securely deleted or anonymised so it can no longer be linked back to you.",
  },
  {
    title: "8. International Data Transfers",
    paragraphs: [
      "Simpcraftt Sphere Innovation & Technology Pvt Ltd is an Indian company and our primary data infrastructure is based in India. In some cases, such as cloud services or analytics tools, your data may be processed in other countries.",
      "Whenever this happens, we make sure appropriate legal safeguards are in place, including data processing agreements that require the receiving party to protect your data to the same standard as Indian law requires. Where the DPDP Act 2023 requires explicit consent for cross-border transfers, we will seek that consent.",
    ],
  },
  {
    title: "9. How We Protect Your Information",
    items: [
      "All data transmitted between your device and our servers is encrypted using SSL/TLS.",
      "Access to personal data is restricted to authorised employees and contractors on a strict need-to-know basis.",
      "We conduct regular security audits and vulnerability assessments.",
      "All third-party processors are vetted and bound by confidentiality agreements.",
      "Our team undergoes data protection training.",
    ],
    closing: "No system is 100% immune to breaches. If a data breach occurs that is likely to harm you, we will notify you and the relevant regulatory authority promptly, as required by law.",
  },
  {
    title: "10. Children's Privacy",
    paragraphs: [
      "INFIBOLT products and services are intended for adults aged 18 years and above. We do not knowingly collect personal data from children under the age of 14 without verifiable parental or guardian consent.",
      "If a minor between 14 and 18 years uses our platform, they must do so with the active consent and supervision of a parent or legal guardian. That guardian accepts this Privacy Policy on the minor's behalf.",
      "We do not use data from minors for advertising or profiling purposes. If you believe we have inadvertently collected a child's data without proper consent, contact support@infibolt.com and we will delete it promptly.",
    ],
  },
  {
    title: "11. Your Rights",
    paragraphs: ["Under the DPDP Act 2023 and applicable Indian law, you have the following rights. We will respond within 30 days of your request."],
    details: [
      ["Right to Access", "You can ask us what personal data we hold about you."],
      ["Right to Correction", "You can ask us to fix inaccurate or incomplete data."],
      ["Right to Erasure", "You can ask us to delete your data, subject to legal retention requirements."],
      ["Right to Withdraw Consent", "You can withdraw consent at any time where processing is based on consent."],
      ["Right to Grievance Redressal", "You can raise a complaint and have it addressed promptly."],
      ["Right to Nominate", "You can nominate another person to exercise your data rights in case of death or incapacity."],
    ],
    closing: "To exercise these rights, write to support@infibolt.com. We may need to verify your identity before processing the request. If you are unhappy with how we handle your complaint, you may approach the Data Protection Board of India once constituted under the DPDP Act 2023, or a competent court.",
  },
  {
    title: "12. Updates to This Policy",
    paragraphs: [
      'We may update this Privacy Policy from time to time to reflect changes in our business, the law, or best practices. When we make meaningful changes, we will notify you by email where possible or by placing a prominent notice on the platform.',
      'The "Last Updated" date at the top of this document reflects the most recent version. Your continued use of the platform after the effective date means you accept the updated Policy.',
    ],
  },
  {
    title: "13. Contact Us",
    paragraphs: ["This is not just legal boilerplate. If you have a genuine question or concern about your privacy, we want to hear from you."],
    details: [
      ["Company", "Simpcraftt Sphere Innovation & Technology Pvt Ltd"],
      ["Brand", "INFIBOLT"],
      ["Privacy Email", "support@infibolt.com"],
      ["Address", "No 32 Kaluvehalli Kolala Koratagere (T) Tumkur (D) Karnataka, 572140, India"],
      ["Website", "www.infibolt.com"],
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <CommerceShell
      seoTitle="Privacy Policy"
      seoDescription="INFIBOLT Privacy Policy for account, warranty, support, newsletter, and platform data."
    >
      <LegalBreadcrumb current="Privacy Policy" />
      <section className="px-4 pb-24 pt-10 sm:px-5">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[1.5rem] border border-black/8 bg-white/86 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-9">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">INFIBOLT</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">Privacy Policy</h1>
            <p className="mt-4 max-w-3xl text-sm font-light leading-7 text-slate-600">
              How we collect, use, and protect your personal information.
            </p>
            <div className="mt-6 grid gap-3 text-xs font-semibold text-slate-600 sm:grid-cols-2">
              <span className="rounded-2xl bg-slate-950/[0.035] px-4 py-3">Effective Date: 25 May 2026</span>
              <span className="rounded-2xl bg-slate-950/[0.035] px-4 py-3">Last Updated: 25 May 2026</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {policySections.map((section) => (
              <PolicySection key={section.title} section={section} />
            ))}
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-black/8 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
            <p className="text-sm font-semibold">© 2026 INFIBOLT. All rights reserved.</p>
            <p className="mt-2 text-sm font-light leading-7 text-white/70">
              A brand of Simpcraftt Sphere Innovation & Technology Pvt Ltd. Feel the Power, Hear the Difference.
            </p>
          </div>
        </div>
      </section>
    </CommerceShell>
  );
}

function LegalBreadcrumb({ current }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-black/[0.06] bg-white/86 px-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex min-h-[40px] max-w-[1400px] items-center gap-2 overflow-x-auto whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.22em] text-[#111316] sm:min-h-[42px] lg:px-12">
        <Link to="/" className="transition hover:text-slate-500">Home</Link>
        <span className="text-slate-400">/</span>
        <span>{current}</span>
      </div>
    </nav>
  );
}

function PolicySection({ section }) {
  return (
    <article className="rounded-[1.25rem] border border-black/8 bg-white/82 p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
      <h2 className="text-xl font-semibold tracking-normal text-slate-950">{section.title}</h2>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-sm font-light leading-7 text-slate-600">
          {paragraph}
        </p>
      ))}
      {section.items && <PolicyList items={section.items} />}
      {section.groups?.map((group) => (
        <div key={group.heading} className="mt-5 rounded-2xl bg-slate-950/[0.025] p-4">
          <h3 className="text-sm font-semibold text-slate-950">{group.heading}</h3>
          <PolicyList items={group.items} compact />
          {group.note && <p className="mt-3 text-sm font-light leading-7 text-slate-600">{group.note}</p>}
        </div>
      ))}
      {section.details && (
        <dl className="mt-5 grid gap-2">
          {section.details.map(([label, value]) => (
            <div key={label} className="grid gap-2 rounded-2xl bg-slate-950/[0.025] p-4 sm:grid-cols-[190px_1fr]">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</dt>
              <dd className="text-sm font-light leading-6 text-slate-700">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {section.closing && <p className="mt-5 text-sm font-light leading-7 text-slate-600">{section.closing}</p>}
    </article>
  );
}

function PolicyList({ items, compact = false }) {
  return (
    <ul className={`grid list-disc gap-2 pl-5 ${compact ? "mt-3" : "mt-5"}`}>
      {items.map((item) => (
        <li key={item} className="text-sm font-light leading-7 text-slate-600">
          {item}
        </li>
      ))}
    </ul>
  );
}
