import { Link } from "react-router";
import { CommerceShell } from "../../components/commerce/CommerceLayout";

const termsSections = [
  {
    title: "1. A Plain-English Introduction",
    paragraphs: [
      'These Terms and Conditions ("Terms") are a legal agreement between you and Simpcraftt Sphere Innovation & Technology Pvt Ltd, the company that owns and operates the INFIBOLT brand and the platform at www.infibolt.com.',
      "We have tried to write these Terms in clear and easy-to-understand language. Every section has a heading that tells you what it covers. If something is unclear, please ask us before using the platform.",
      "By creating an account, registering a product, or using any part of the platform, you agree to these Terms in full. If you do not agree, please do not use the platform.",
      "These Terms should be read alongside our Privacy Policy, which is incorporated by reference.",
    ],
  },
  {
    title: "2. Who We Are",
    details: [
      ["Legal Entity", "Simpcraftt Sphere Innovation & Technology Pvt Ltd"],
      ["Brand", "INFIBOLT"],
      ["Platform", "www.infibolt.com"],
      ["Contact", "support@infibolt.com"],
      ["Address", "No 32 Kaluvehalli Kolala Koratagere (T) Tumkur (D) Karnataka, 572140, India"],
    ],
    closing: "INFIBOLT is a premium electronics brand offering audio products, focus accessories, and connected lifestyle devices. We currently launch through authorised marketplace partners such as Amazon India and Flipkart, and manage ownership, warranty, and support through our platform. Direct purchase is being introduced in phases.",
  },
  {
    title: "3. Who Can Use the Platform",
    intro: "To use the INFIBOLT platform, you must:",
    items: [
      "Be at least 18 years old. If you are between 13 and 18, you may use the platform only with active parental or guardian consent and supervision.",
      "Have the legal capacity to enter into a binding contract under Indian law.",
      "Not be prohibited from using our platform under any applicable law.",
      "Provide accurate, truthful information when creating your account.",
    ],
    closing: "By using the platform, you confirm that all of the above apply to you. If we discover otherwise, we reserve the right to close your account immediately.",
  },
  {
    title: "4. Your Account",
    groups: [
      {
        heading: "4.1 Creating an Account",
        paragraphs: ["You need an account to register products, track warranties, and access support. When you create one, please give us accurate information and keep it updated. Your account is personal and is not for sharing."],
      },
      {
        heading: "4.2 Keeping It Secure",
        paragraphs: ["You are responsible for keeping your password safe and for everything that happens under your account. If you think someone else has accessed your account, contact support@infibolt.com immediately. We are not liable for losses caused by unauthorised access resulting from your failure to protect your credentials."],
      },
      {
        heading: "4.3 Closing or Suspending Accounts",
        paragraphs: ["You can close your account at any time by contacting support. We reserve the right to suspend or permanently close accounts that violate these Terms, engage in fraud, or pose a risk to other users or our platform. Where legally required, we will give you notice before doing so."],
      },
    ],
  },
  {
    title: "5. Products, Pricing, and Orders",
    groups: [
      {
        heading: "5.1 Product Information",
        paragraphs: ["We work hard to make sure every product description, photograph, and specification on the INFIBOLT platform is accurate. Errors can happen, and we reserve the right to correct mistakes and update product information at any time."],
      },
      {
        heading: "5.2 Buying Through Marketplace Partners",
        paragraphs: ["Most INFIBOLT products are currently sold through Amazon India and Flipkart. When you click through to buy, that transaction is governed by the marketplace's own terms and conditions, not ours. We are not a party to that sale.", "Please purchase from INFIBOLT-authorised sellers only. Products bought from unauthorised sources are not eligible for warranty registration or official support."],
      },
      {
        heading: "5.3 Direct Purchase (Where Available)",
        items: [
          "All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise.",
          "Prices may change at any time. The price you pay is fixed at the moment your order is confirmed.",
          "Payment is processed by secure third-party gateways. We do not store your full payment card details.",
          "An order confirmation email means we have accepted your order. We reserve the right to cancel orders due to pricing errors, stock issues, or suspected fraud, with a full refund issued promptly.",
        ],
      },
      {
        heading: "5.4 Stock Availability",
        paragraphs: ["Products are subject to availability. If something becomes unavailable after you have ordered, we will notify you and issue a full refund without delay."],
      },
    ],
  },
  {
    title: "6. Warranty",
    groups: [
      {
        heading: "6.1 Registering Your Warranty",
        paragraphs: ["To activate your warranty, register your product on the platform within the timeframe specified in your product documentation. You will need your INFIBOLT account, product serial number, and original purchase invoice. Once registered, you will receive a warranty tracking ticket."],
      },
      {
        heading: "6.2 What the Warranty Covers",
        paragraphs: ["Our warranty covers manufacturing defects in materials and workmanship under normal use. It does not cover:"],
        items: [
          "Damage from accidents, misuse, or neglect.",
          "Cosmetic damage such as scratches, dents, or broken parts from physical impact.",
          "Damage caused by use outside the product's intended purpose.",
          "Repairs or modifications carried out by anyone other than authorised INFIBOLT service personnel.",
          "Products with missing or tampered serial numbers.",
          "Products purchased from unauthorised sellers.",
        ],
      },
      {
        heading: "6.3 Making a Warranty Claim",
        paragraphs: [
          "Log into your account, go to your registered devices, and raise a support ticket. Include your warranty tracking number, a clear description of the defect, and photographs or a video where possible.",
          "INFIBOLT will review the claim and respond within the timelines stated in the Support Policy.",
          "Unless otherwise stated by INFIBOLT, customers are responsible for securely packaging and shipping the product to the designated service location for warranty inspection. Shipping, courier pickup, transportation, or related logistics charges incurred while sending the product to INFIBOLT are the responsibility of the customer.",
          "If the warranty claim is approved, INFIBOLT may, at its discretion, cover the return shipping cost for the repaired or replacement product. Pickup and reverse-logistics services may be offered only in selected locations or for selected product categories.",
          "If the claim is outside warranty coverage, the customer may be responsible for diagnostic charges, return shipping costs, repair costs, or applicable service fees, which will be communicated before proceeding.",
          "If your warranty claim is approved, INFIBOLT may repair the product, replace it with the same or an equivalent model, or provide a pro-rated refund where applicable. These remedies are your sole and exclusive remedies under this warranty.",
        ],
      },
    ],
  },
  {
    title: "7. Returns and Refunds",
    groups: [
      {
        heading: "7.1 Marketplace Purchases",
        paragraphs: ["Returns for marketplace purchases follow that marketplace's return policy. We cannot process marketplace returns directly. Please raise your return on Amazon, Flipkart, or the relevant platform."],
      },
      {
        heading: "7.2 Direct Purchases",
        items: [
          "You may return a product within 7 days of delivery if it is unused, in its original packaging, with all accessories and documentation included.",
          "Defective products can be returned under the warranty process described in Section 6.",
          "We cannot accept returns for products that have been used, damaged by the buyer, or returned outside the return window.",
          "Approved refunds are processed to your original payment method within 7 to 15 business days of us receiving and inspecting the returned product.",
        ],
      },
    ],
  },
  {
    title: "8. Intellectual Property",
    groups: [
      {
        heading: "8.1 What Belongs to Us",
        paragraphs: ['Everything on the INFIBOLT platform, including the name, trademark, tagline "Feel the Power, Hear the Difference", product names, photographs, videos, written content, logos, software, and platform design, belongs to Simpcraftt Sphere Innovation & Technology Pvt Ltd or our licensors. It is protected by Indian and international intellectual property law.', "You may not copy, reproduce, distribute, or commercially exploit any of our content without our prior written consent."],
      },
      {
        heading: "8.2 What You Can Do",
        paragraphs: ["We give you a limited, personal, non-transferable licence to use the platform for your own non-commercial purposes. This does not include scraping our site, using our trademarks, framing our pages on other websites, or creating derivative works from our content."],
      },
      {
        heading: "8.3 Your Content",
        paragraphs: ["If you submit content to the platform, such as reviews, messages, or photos, you give us a non-exclusive, royalty-free licence to use it to operate and improve our services. You confirm that you own the content or have the right to share it, and that it does not infringe anyone else's rights."],
      },
    ],
  },
  {
    title: "9. Things You Must Not Do",
    intro: "When using the INFIBOLT platform, you agree that you will not:",
    items: [
      "Provide false, misleading, or fraudulent information, especially during warranty registration.",
      "Impersonate any person or entity.",
      "Attempt to access any part of the platform or other users' accounts without authorisation.",
      "Introduce malware, viruses, or harmful code.",
      "Use the platform for commercial purposes without our written permission.",
      "Scrape, crawl, or systematically extract data from the platform.",
      "Reverse engineer any software or technology underlying the platform.",
      "Engage in conduct that harms, disrupts, or interferes with other users' access to the platform.",
      "Violate any applicable law or regulation.",
    ],
  },
  {
    title: "10. Third-Party Platforms and Links",
    paragraphs: ["Our platform contains links to third-party websites and marketplaces. We include these for your convenience, but we do not control those platforms and are not responsible for their content, policies, or practices.", "Your dealings with third-party platforms are entirely subject to their own terms and conditions. We recommend reviewing those terms before making a purchase or sharing your data there."],
  },
  {
    title: "11. Our Liability to You",
    groups: [
      {
        heading: "11.1 What We Cannot Promise",
        paragraphs: ['The platform is provided on an "as is" and "as available" basis. While INFIBOLT strives to maintain reliable, secure, and high-quality products and services, we cannot guarantee that the platform, products, or services will always be error-free, uninterrupted, completely secure, or free from defects or unforeseen issues.'],
      },
      {
        heading: "11.2 Limits on Our Liability",
        paragraphs: ["To the maximum extent permitted by Indian law, we are not liable for:"],
        items: [
          "Indirect, incidental, or consequential losses arising from your use of the platform.",
          "Loss of data, revenue, or goodwill.",
          "Issues arising from third-party marketplace transactions.",
          "Unauthorised access to your account resulting from your failure to keep credentials secure.",
        ],
        note: "Our total aggregate liability for any claim relating to a specific product, order, or service shall not exceed the amount paid by you for the specific product, order, or service giving rise to the claim, to the maximum extent permitted under applicable law.",
      },
      {
        heading: "11.3 Your Statutory Consumer Rights",
        paragraphs: ["Nothing in these Terms limits or takes away the rights you have as a consumer under the Consumer Protection Act, 2019, or any other applicable Indian consumer law."],
      },
    ],
  },
  {
    title: "12. Indemnity",
    paragraphs: ["You agree to defend and hold harmless Simpcraftt Sphere Innovation & Technology Pvt Ltd, its directors, employees, and agents from any claims, losses, or expenses, including legal fees, arising from your violation of these Terms, your use of the platform, or your infringement of any third-party rights."],
  },
  {
    title: "13. Governing Law and Disputes",
    details: [
      ["Governing Law", "These Terms are governed by the laws of India, including the Consumer Protection Act 2019, the IT Act 2000, and the DPDP Act 2023."],
      ["Dispute Resolution", "If you have a dispute with us, please contact us first. We will try to resolve it directly and in good faith within 30 days. If that fails, disputes may be referred to consumer redressal forums under the Consumer Protection Act 2019, or to courts of competent jurisdiction in India."],
    ],
  },
  {
    title: "14. Changes to These Terms",
    paragraphs: ["We may update these Terms occasionally to reflect legal changes, new features, or shifts in how we operate. When we do, we will update the date at the top and notify you by email or prominent notice on the platform. Continued use of the platform after changes take effect means you accept the updated Terms."],
  },
  {
    title: "15. Contact",
    details: [
      ["Legal Queries", "legal@infibolt.com"],
      ["General Support", "app.infibolt.com/support"],
      ["Warranty", "app.infibolt.com/warranty"],
      ["Address", "No 32 Kaluvehalli Kolala Koratagere (T) Tumkur (D) Karnataka, 572140, India"],
      ["Company", "Simpcraftt Sphere Innovation & Technology Pvt Ltd"],
    ],
  },
];

export default function TermsConditionsPage() {
  return (
    <CommerceShell
      seoTitle="Terms & Conditions"
      seoDescription="INFIBOLT Terms and Conditions for accounts, marketplace purchases, warranty, support, returns, and platform use."
    >
      <LegalBreadcrumb current="Terms & Conditions" />
      <section className="px-4 pb-24 pt-10 sm:px-5">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[1.5rem] border border-black/8 bg-white/86 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-9">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">INFIBOLT</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">Terms & Conditions</h1>
            <p className="mt-4 max-w-3xl text-sm font-light leading-7 text-slate-600">
              The rules that govern your use of INFIBOLT products and services.
            </p>
            <div className="mt-6 grid gap-3 text-xs font-semibold text-slate-600 sm:grid-cols-2">
              <span className="rounded-2xl bg-slate-950/[0.035] px-4 py-3">Effective Date: 25 May 2026</span>
              <span className="rounded-2xl bg-slate-950/[0.035] px-4 py-3">Last Updated: 25 May 2026</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {termsSections.map((section) => (
              <TermsSection key={section.title} section={section} />
            ))}
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-black/8 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
            <p className="text-sm font-semibold">(c) 2026 INFIBOLT. All rights reserved.</p>
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

function TermsSection({ section }) {
  return (
    <article className="rounded-[1.25rem] border border-black/8 bg-white/82 p-6 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
      <h2 className="text-xl font-semibold tracking-normal text-slate-950">{section.title}</h2>
      {section.intro && <p className="mt-4 text-sm font-light leading-7 text-slate-600">{section.intro}</p>}
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-sm font-light leading-7 text-slate-600">
          {paragraph}
        </p>
      ))}
      {section.items && <TermsList items={section.items} />}
      {section.groups?.map((group) => (
        <div key={group.heading} className="mt-5 rounded-2xl bg-slate-950/[0.025] p-4">
          <h3 className="text-sm font-semibold text-slate-950">{group.heading}</h3>
          {group.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm font-light leading-7 text-slate-600">
              {paragraph}
            </p>
          ))}
          {group.items && <TermsList items={group.items} compact />}
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

function TermsList({ items, compact = false }) {
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
