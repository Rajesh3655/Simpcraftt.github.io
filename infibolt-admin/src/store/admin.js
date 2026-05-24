import { products } from "./commerce";

export const adminUser = {
  name: "INFIBOLT Admin",
  role: "Owner",
  permissions: ["products:write", "claims:write", "customers:read", "settings:write"],
};

export const adminStats = [
  { label: "Products", value: products.length, trend: "+5 launch SKUs", status: "live" },
  { label: "Warranty Claims", value: 38, trend: "9 pending review", status: "attention" },
  { label: "Complaints", value: 26, trend: "6 high priority", status: "attention" },
  { label: "Future Orders", value: 0, trend: "Checkout staged", status: "staged" },
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
  { name: "Aarav Mehta", email: "aarav@example.com", products: 2, tickets: 1, status: "Verified" },
  { name: "Nisha Kapoor", email: "nisha@example.com", products: 1, tickets: 0, status: "Verified" },
  { name: "Rahul Nair", email: "rahul@example.com", products: 1, tickets: 2, status: "Review" },
  { name: "Isha Rao", email: "isha@example.com", products: 0, tickets: 1, status: "Subscriber" },
];

export const supportTickets = [
  { id: "SCS-2041", customer: "Isha Rao", topic: "Marketplace purchase", status: "Open", channel: "Email" },
  { id: "SCS-2042", customer: "Rohan Shah", topic: "Warranty", status: "In Progress", channel: "WhatsApp" },
  { id: "SCS-2043", customer: "Meera Iyer", topic: "Product information", status: "Resolved", channel: "Email" },
];

export const ecommerceModules = [
  { name: "Direct Checkout", description: "Native cart-to-order flow for INFIBOLT purchases.", enabled: false },
  { name: "Payment Gateway", description: "Card, UPI, wallet, and payment reconciliation layer.", enabled: false },
  { name: "Orders", description: "Order lifecycle, invoices, refunds, cancellations, and tracking.", enabled: false },
  { name: "Coupons", description: "Campaign codes, limits, eligibility, and discount rules.", enabled: false },
  { name: "Shipping", description: "Zones, rates, partners, fulfilment states, and tracking links.", enabled: false },
  { name: "Inventory", description: "Stock levels, reserved units, low-stock alerts, and SKU movement.", enabled: true },
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
  "Direct checkout feature toggle reviewed",
  "Homepage hero content staged for v2 preview",
  "Support ticket SCS-2042 assigned to care team",
];

export const featureToggles = [
  { key: "directCheckout", label: "Direct ecommerce checkout", enabled: false },
  { key: "payments", label: "Payment gateway", enabled: false },
  { key: "orders", label: "Customer order history", enabled: false },
  { key: "marketplaceRedirects", label: "Marketplace redirect buttons", enabled: true },
  { key: "warrantyClaims", label: "Warranty claim submission", enabled: true },
  { key: "adminAlerts", label: "Admin alert notifications", enabled: true },
];

export const databaseCollections = [
  "products",
  "categories",
  "collections",
  "users",
  "marketplace_links",
  "marketplace_clicks",
  "warranty_claims",
  "support_tickets",
  "newsletter_subscribers",
  "orders_future",
  "payments_future",
  "coupons_future",
  "media_assets",
  "activity_logs",
  "feature_toggles",
];


