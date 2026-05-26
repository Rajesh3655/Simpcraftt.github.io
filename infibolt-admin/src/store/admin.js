import { products } from "./commerce";

export const adminUser = {
  name: "INFIBOLT Admin",
  role: "Owner",
  permissions: ["products:write", "claims:write", "customers:read", "settings:write"],
};

export const adminStats = [
  { label: "Products", value: products.length, trend: "+5 launch SKUs", status: "live" },
  { label: "Owners", value: 1248, trend: "+82 this month", status: "growth" },
  { label: "Warranty Queue", value: 9, trend: "Needs review", status: "attention" },
  { label: "Support Open", value: 6, trend: "2 priority cases", status: "attention" },
];

export const marketplaceRows = products.map((product, index) => ({
  product: product.name,
  amazon: product.marketplace.amazon,
  flipkart: product.marketplace.flipkart,
  custom: product.marketplace.custom,
  preferred: index % 2 === 0 ? "Amazon" : "Flipkart",
  clicks: 1200 - index * 142,
  enabled: true,
}));

export const warrantyClaims = [
  {
    id: "SCW-MAY-1001",
    customer: "Aarav Mehta",
    product: "Aura Audio Pro",
    serial: "AAP-26-IND-4410",
    invoice: "INV-88231.pdf",
    status: "Verification",
    priority: "High",
    submitted: "2026-05-14",
  },
  {
    id: "SCW-MAY-1002",
    customer: "Nisha Kapoor",
    product: "Echo Charge Max",
    serial: "ECM-26-IND-1180",
    invoice: "INV-88244.pdf",
    status: "Approved",
    priority: "Normal",
    submitted: "2026-05-13",
  },
  {
    id: "SCW-MAY-1003",
    customer: "Rahul Nair",
    product: "Nova Watch X",
    serial: "NWX-26-IND-9102",
    invoice: "INV-88302.pdf",
    status: "Pending Invoice",
    priority: "Normal",
    submitted: "2026-05-12",
  },
];

export const customers = [
  { name: "Aarav Mehta", email: "aarav@example.com", phone: "9876543210", products: 2, tickets: 1, status: "Verified", source: "Amazon" },
  { name: "Nisha Kapoor", email: "nisha@example.com", phone: "9988776655", products: 1, tickets: 0, status: "Verified", source: "Flipkart" },
  { name: "Rahul Nair", email: "rahul@example.com", phone: "9123456780", products: 1, tickets: 2, status: "Review", source: "Retail" },
  { name: "Isha Rao", email: "isha@example.com", phone: "", products: 0, tickets: 1, status: "Subscriber", source: "Newsletter" },
];

export const newsletterSubscribers = [
  { email: "isha@example.com", source: "Footer", status: "Subscribed", createdAt: "2026-05-18" },
  { email: "launch@studio.example", source: "Launch page", status: "Subscribed", createdAt: "2026-05-20" },
  { email: "care@example.com", source: "Support", status: "Unsubscribed", createdAt: "2026-05-21" },
];

export const launchLeads = [
  { product: "Aura Audio Pro", email: "audio@example.com", phone: "", status: "Subscribed" },
  { product: "Nova Watch X", email: "", phone: "9876500000", status: "Contacted" },
  { product: "Echo Charge Max", email: "power@example.com", phone: "", status: "Converted" },
];

export const supportTickets = [
  { id: "SCS-2041", customer: "Isha Rao", topic: "Marketplace purchase", status: "Open", channel: "Email" },
  { id: "SCS-2042", customer: "Rohan Shah", topic: "Warranty", status: "In Progress", channel: "WhatsApp" },
  { id: "SCS-2043", customer: "Meera Iyer", topic: "Product information", status: "Resolved", channel: "Email" },
];

export const ecommerceModules = [
  { name: "Launch partner routing", description: "Marketplace-first purchase paths for INFIBOLT products.", enabled: true },
  { name: "Availability leads", description: "Notify Me records by product, region, and preferred channel.", enabled: true },
  { name: "Ownership conversion", description: "Marketplace buyers register serials and invoices for care.", enabled: true },
  { name: "Retail partners", description: "Regional partner availability and official-store readiness.", enabled: true },
  { name: "Inventory context", description: "Stock levels, SKU movement, and launch availability signals.", enabled: true },
];

export const cmsBlocks = [
  { name: "Homepage hero", owner: "Marketing", status: "Draft Ready", updated: "2026-05-15" },
  { name: "Product highlights", owner: "Product", status: "Published", updated: "2026-05-14" },
  { name: "Testimonials", owner: "Community", status: "Needs Review", updated: "2026-05-12" },
  { name: "Footer links", owner: "Operations", status: "Published", updated: "2026-05-11" },
  { name: "FAQ library", owner: "Support", status: "Published", updated: "2026-05-10" },
];

export const activityLog = [
  "Marketplace links updated for Aura Audio Pro",
  "Warranty claim SCW-MAY-1001 moved to Verification",
  "Launch partner routing reviewed",
  "Homepage hero content aligned for launch preview",
  "Support ticket SCS-2042 assigned to care team",
];

export const featureToggles = [
  { key: "launchPartners", label: "Marketplace launch partners", enabled: true },
  { key: "availabilityLeads", label: "Availability lead capture", enabled: true },
  { key: "ownershipConversion", label: "Ownership conversion", enabled: true },
  { key: "marketplaceRedirects", label: "Marketplace redirect buttons", enabled: true },
  { key: "warrantyClaims", label: "Warranty claim submission", enabled: true },
  { key: "adminAlerts", label: "Admin alert notifications", enabled: true },
];

export const databaseCollections = [
  "products",
  "categories",
  "users",
  "marketplace_links",
  "marketplace_clicks",
  "warranty_claims",
  "support_tickets",
  "newsletter_subscribers",
  "launch_leads",
  "partner_availability",
  "ownership_conversion",
  "media_assets",
  "activity_logs",
  "feature_toggles",
];


