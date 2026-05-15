import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  CreditCard,
  FileText,
  Globe,
  Images,
  LayoutDashboard,
  Link,
  LockKeyhole,
  Megaphone,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  TicketCheck,
  ToggleLeft,
  Users,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import ThemeToggle from "../../ThemeToggle";
import {
  activityLog,
  adminStats,
  adminUser,
  cmsBlocks,
  customers,
  databaseCollections,
  ecommerceModules,
  featureToggles,
  marketplaceRows,
  supportTickets,
  warrantyClaims,
} from "../../data/admin";
import { categories, collections, formatPrice, products } from "../../data/commerce";

const adminNav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Marketplace", href: "/admin/marketplace", icon: Link },
  { label: "Warranty", href: "/admin/warranty", icon: ShieldCheck },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Ecommerce", href: "/admin/ecommerce", icon: ShoppingCart },
  { label: "CMS", href: "/admin/cms", icon: FileText },
  { label: "Support", href: "/admin/support", icon: TicketCheck },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Media", href: "/admin/media", icon: Images },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const sectionCopy = {
  products: {
    title: "Product Management",
    description: "Create and govern launch products, categories, collections, stock states, SEO fields, image galleries, variants, specs, tags, and visibility.",
  },
  marketplace: {
    title: "Marketplace Redirects",
    description: "Control Amazon, Flipkart, and custom marketplace buttons per product while tracking outbound click performance.",
  },
  warranty: {
    title: "Warranty Claims",
    description: "Review registrations, verify serial numbers, inspect invoices, approve or reject claims, and update claim statuses.",
  },
  customers: {
    title: "Customer Management",
    description: "View users, profiles, registered products, activity, support tickets, newsletter status, and future order history.",
  },
  ecommerce: {
    title: "Future Ecommerce Control",
    description: "Prepare orders, payments, coupons, shipping, inventory, cart analytics, and checkout activation without enabling public direct purchase yet.",
  },
  cms: {
    title: "Content Management",
    description: "Manage homepage banners, hero copy, product highlights, testimonials, FAQs, collections, promotions, social links, and footer content.",
  },
  support: {
    title: "Support & Communication",
    description: "Manage contact enquiries, support tickets, WhatsApp handoff, announcements, newsletters, and customer updates.",
  },
  analytics: {
    title: "Analytics",
    description: "Monitor product views, marketplace redirects, warranty registrations, customer engagement, traffic, and newsletter performance.",
  },
  media: {
    title: "Media Library",
    description: "Upload product images, banners, invoice files, documents, and future optimized media assets.",
  },
  settings: {
    title: "Settings",
    description: "Configure brand details, SEO, contact data, marketplace integrations, social links, roles, permissions, and feature toggles.",
  },
};

export function AdminShell({ title = "Admin Command Center", description, children }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f5f2] text-[#111714] dark:bg-[#050607] dark:text-white">
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(17,23,20,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(17,23,20,0.05)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)]" />

      {navOpen && <button className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden" onClick={() => setNavOpen(false)} aria-label="Close admin overlay" />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[86vw] max-w-80 border-r border-black/10 bg-white/92 p-4 backdrop-blur-2xl transition-transform lg:w-72 lg:translate-x-0 dark:border-white/10 dark:bg-[#080a0b]/94 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between gap-3 px-2 py-3">
          <a href="/admin" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111714] text-lg font-black italic text-white dark:bg-white dark:text-[#111714]">S</span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.16em]">Simpcraftt</span>
              <span className="text-xs font-bold text-black/46 dark:text-white/46">Admin OS</span>
            </span>
          </a>
          <button className="rounded-lg border border-black/10 p-2 lg:hidden dark:border-white/10" onClick={() => setNavOpen(false)} aria-label="Close admin navigation">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-6 grid max-h-[calc(100svh-180px)] gap-1 overflow-y-auto pb-24 lg:max-h-none lg:overflow-visible lg:pb-0">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-black/62 transition hover:bg-black/5 hover:text-black dark:text-white/62 dark:hover:bg-white/10 dark:hover:text-white">
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-3">
            <LockKeyhole className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
            <div>
              <p className="text-sm font-black">Protected Admin</p>
              <p className="text-xs text-black/56 dark:text-white/56">JWT/session layer planned</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f3f5f2]/88 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-[#050607]/88 md:px-5 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <button className="rounded-lg border border-black/10 bg-white/72 p-3 shadow-sm lg:hidden dark:border-white/10 dark:bg-white/[0.045]" onClick={() => setNavOpen(true)} aria-label="Open admin navigation">
              <LayoutDashboard className="h-5 w-5" />
            </button>
            <label className="hidden min-h-11 w-full max-w-lg items-center gap-3 rounded-lg border border-black/10 bg-white/68 px-4 md:flex dark:border-white/10 dark:bg-white/[0.045]">
              <Search className="h-4 w-4 text-black/40 dark:text-white/40" />
              <input className="w-full bg-transparent text-sm font-semibold" placeholder="Search products, claims, customers, tickets" />
            </label>
            <div className="ml-auto flex items-center gap-3">
              <button className="relative rounded-lg border border-black/10 bg-white/68 p-3 dark:border-white/10 dark:bg-white/[0.045]" aria-label="Admin alerts">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
              </button>
              <ThemeToggle />
              <div className="hidden rounded-lg border border-black/10 bg-white/68 px-4 py-2 md:block dark:border-white/10 dark:bg-white/[0.045]">
                <p className="text-sm font-black">{adminUser.name}</p>
                <p className="text-xs text-black/46 dark:text-white/46">{adminUser.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-5 md:py-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col justify-between gap-5 md:mb-8 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Enterprise Management</p>
                <h1 className="luxury-title text-3xl md:text-6xl">{title}</h1>
                {description && <p className="mt-4 max-w-3xl leading-7 text-black/60 dark:text-white/60">{description}</p>}
              </div>
              <div className="grid gap-3 sm:flex">
                <AdminButton href="/products">View Storefront</AdminButton>
                <AdminButton href="/admin/settings" tone="solid">Feature Toggles</AdminButton>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminOverview() {
  return (
    <AdminShell description="A central operations layer for products, marketplace redirects, warranty claims, customer engagement, future ecommerce controls, CMS, support, analytics, media, and settings.">
      <div className="space-y-8">
        <MetricGrid />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <AdminPanel title="Marketplace Performance" icon={Globe}>
            <AdminTable columns={["Product", "Preferred", "Clicks", "Enabled"]} rows={marketplaceRows.slice(0, 5).map((row) => [row.product, row.preferred, row.clicks, row.enabled ? "Active" : "Off"])} />
          </AdminPanel>
          <AdminPanel title="Recent Activity" icon={Activity}>
            <div className="grid gap-3">
              {activityLog.map((item) => (
                <div key={item} className="rounded-lg bg-black/[0.035] p-4 text-sm font-semibold dark:bg-white/[0.05]">{item}</div>
              ))}
            </div>
          </AdminPanel>
        </div>
        <AdminPanel title="Future Commerce Readiness" icon={ShoppingCart}>
          <ModuleGrid modules={ecommerceModules} />
        </AdminPanel>
      </div>
    </AdminShell>
  );
}

export function AdminSectionPage({ section }) {
  const copy = sectionCopy[section] ?? sectionCopy.products;

  return (
    <AdminShell title={copy.title} description={copy.description}>
      <AdminSectionContent section={section} />
    </AdminShell>
  );
}

function AdminSectionContent({ section }) {
  if (section === "products") return <ProductsAdmin />;
  if (section === "marketplace") return <MarketplaceAdmin />;
  if (section === "warranty") return <WarrantyAdmin />;
  if (section === "customers") return <CustomersAdmin />;
  if (section === "ecommerce") return <EcommerceAdmin />;
  if (section === "cms") return <CMSAdmin />;
  if (section === "support") return <SupportAdmin />;
  if (section === "analytics") return <AnalyticsAdmin />;
  if (section === "media") return <MediaAdmin />;
  if (section === "settings") return <SettingsAdmin />;
  return <ProductsAdmin />;
}

function MetricGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {adminStats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-black/10 bg-white/78 p-4 shadow-[0_20px_60px_rgba(17,23,20,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] md:rounded-lg md:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-black/44 dark:text-white/44">{stat.label}</p>
              <p className="mt-3 text-2xl font-black md:mt-4 md:text-3xl">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold text-black/56 dark:text-white/56">{stat.trend}</p>
            </div>
            <StatusPill status={stat.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsAdmin() {
  const rows = products.map((product) => [
    product.name,
    categories.find((category) => category.id === product.category)?.name ?? product.category,
    formatPrice(product.price),
    product.status,
    product.badge,
  ]);

  return (
    <div className="space-y-6">
      <AdminToolbar primary="Add Product" secondary="Import CSV" />
      <AdminPanel title="Product Catalogue" icon={Package}>
        <AdminTable columns={["Product", "Category", "Price", "Stock Status", "Badge"]} rows={rows} />
      </AdminPanel>
      <div className="grid gap-6 lg:grid-cols-3">
        <AdminPanel title="Categories" icon={Boxes}>
          <AdminList items={categories.map((category) => `${category.name} - ${category.description}`)} />
        </AdminPanel>
        <AdminPanel title="Collections" icon={Package}>
          <AdminList items={collections.map((collection) => `${collection.name} - ${collection.productSlugs.length} products`)} />
        </AdminPanel>
        <AdminPanel title="SEO & Product Fields" icon={FileText}>
          <AdminList items={["Meta title", "Meta description", "Open Graph image", "Structured data", "Product tags"]} />
        </AdminPanel>
      </div>
    </div>
  );
}

function MarketplaceAdmin() {
  return (
    <div className="space-y-6">
      <AdminToolbar primary="Update Links" secondary="Export Clicks" />
      <AdminPanel title="Per-product Marketplace Links" icon={Link}>
        <AdminTable columns={["Product", "Preferred", "Clicks", "Amazon", "Flipkart"]} rows={marketplaceRows.map((row) => [row.product, row.preferred, row.clicks, "Enabled", "Enabled"])} />
      </AdminPanel>
      <AdminPanel title="Redirect Controls" icon={Globe}>
        <ModuleGrid modules={[
          { name: "Amazon buttons", description: "Enable or disable Amazon redirects globally.", enabled: true },
          { name: "Flipkart buttons", description: "Enable or disable Flipkart redirects globally.", enabled: true },
          { name: "Custom Buy Now", description: "Use custom marketplace URL or campaign landing URL.", enabled: true },
        ]} />
      </AdminPanel>
    </div>
  );
}

function WarrantyAdmin() {
  return (
    <div className="space-y-6">
      <AdminToolbar primary="Review Claim" secondary="Verify Serial" />
      <AdminPanel title="Warranty Claim Queue" icon={ShieldCheck}>
        <AdminTable columns={["Claim ID", "Customer", "Product", "Serial", "Status", "Priority"]} rows={warrantyClaims.map((claim) => [claim.id, claim.customer, claim.product, claim.serial, claim.status, claim.priority])} />
      </AdminPanel>
      <AdminPanel title="Claim Workflow" icon={TicketCheck}>
        <AdminList items={["Invoice upload review", "Serial number verification", "Approve/reject claim", "Send customer update", "Generate claim ticket history"]} />
      </AdminPanel>
    </div>
  );
}

function CustomersAdmin() {
  return (
    <div className="space-y-6">
      <AdminToolbar primary="Create Segment" secondary="Export Customers" />
      <AdminPanel title="Customer Directory" icon={Users}>
        <AdminTable columns={["Name", "Email", "Registered Products", "Tickets", "Status"]} rows={customers.map((customer) => [customer.name, customer.email, customer.products, customer.tickets, customer.status])} />
      </AdminPanel>
      <AdminPanel title="Customer Data Modules" icon={Users}>
        <ModuleGrid modules={[
          { name: "Profiles", description: "Personal details, preferences, and verification state.", enabled: true },
          { name: "Saved Addresses", description: "Prepared for checkout and warranty service.", enabled: false },
          { name: "Registered Products", description: "Ownership records linked to warranty claims.", enabled: true },
          { name: "Future Orders", description: "Inactive until direct ecommerce launches.", enabled: false },
        ]} />
      </AdminPanel>
    </div>
  );
}

function EcommerceAdmin() {
  return (
    <div className="space-y-6">
      <AdminToolbar primary="Review Roadmap" secondary="Export Schema" />
      <AdminPanel title="Future Ecommerce Modules" icon={ShoppingCart}>
        <ModuleGrid modules={ecommerceModules} />
      </AdminPanel>
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Payment Architecture" icon={WalletCards}>
          <AdminList items={["Gateway status disabled", "Payment reconciliation collection prepared", "Refund flow placeholder", "Invoice generation placeholder"]} />
        </AdminPanel>
        <AdminPanel title="Order Operations" icon={CreditCard}>
          <AdminList items={["Cart analytics", "Order lifecycle", "Coupon eligibility", "Shipping partners", "Inventory reservations"]} />
        </AdminPanel>
      </div>
    </div>
  );
}

function CMSAdmin() {
  return (
    <div className="space-y-6">
      <AdminToolbar primary="Create Block" secondary="Preview Site" />
      <AdminPanel title="Content Blocks" icon={FileText}>
        <AdminTable columns={["Block", "Owner", "Status", "Updated"]} rows={cmsBlocks.map((block) => [block.name, block.owner, block.status, block.updated])} />
      </AdminPanel>
      <AdminPanel title="Manageable Content" icon={Megaphone}>
        <AdminList items={["Homepage banners", "Hero content", "Testimonials", "FAQs", "Collections", "Product highlights", "Promotional sections", "Footer content", "Social links"]} />
      </AdminPanel>
    </div>
  );
}

function SupportAdmin() {
  return (
    <div className="space-y-6">
      <AdminToolbar primary="Reply" secondary="Send Announcement" />
      <AdminPanel title="Support Tickets" icon={TicketCheck}>
        <AdminTable columns={["Ticket", "Customer", "Topic", "Status", "Channel"]} rows={supportTickets.map((ticket) => [ticket.id, ticket.customer, ticket.topic, ticket.status, ticket.channel])} />
      </AdminPanel>
      <AdminPanel title="Communication Controls" icon={Bell}>
        <ModuleGrid modules={[
          { name: "Email notifications", description: "Warranty, support, and announcement emails.", enabled: true },
          { name: "WhatsApp handoff", description: "Customer support handoff and quick response.", enabled: true },
          { name: "Newsletter campaigns", description: "Subscriber segments and launch updates.", enabled: true },
        ]} />
      </AdminPanel>
    </div>
  );
}

function AnalyticsAdmin() {
  return (
    <div className="space-y-6">
      <MetricGrid />
      <div className="grid gap-6 lg:grid-cols-3">
        {["Product views", "Marketplace redirects", "Warranty registrations", "Newsletter performance", "Traffic overview", "Customer engagement"].map((item, index) => (
          <AdminPanel key={item} title={item} icon={BarChart3}>
            <div className="h-40 rounded-lg bg-[linear-gradient(180deg,rgba(16,185,129,0.2),rgba(16,185,129,0.02))] p-4">
              <div className="flex h-full items-end gap-2">
                {[42, 64, 38, 80, 56, 92, 71].map((height, barIndex) => (
                  <div key={`${item}-${barIndex}`} className="flex-1 rounded-t bg-emerald-500/70" style={{ height: `${Math.max(20, height - index * 4)}%` }} />
                ))}
              </div>
            </div>
          </AdminPanel>
        ))}
      </div>
    </div>
  );
}

function MediaAdmin() {
  return (
    <div className="space-y-6">
      <AdminToolbar primary="Upload Media" secondary="Optimize Assets" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <div key={product.slug} className="overflow-hidden rounded-lg border border-black/10 bg-white/74 dark:border-white/10 dark:bg-white/[0.045]">
            <img src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover" />
            <div className="p-4">
              <p className="font-black">{product.name}</p>
              <p className="mt-1 text-sm text-black/52 dark:text-white/52">Product image asset</p>
            </div>
          </div>
        ))}
      </div>
      <AdminPanel title="Media Capabilities" icon={Images}>
        <AdminList items={["Product galleries", "Homepage banners", "Warranty invoice uploads", "Document storage", "Image compression", "Alt text and SEO metadata"]} />
      </AdminPanel>
    </div>
  );
}

function SettingsAdmin() {
  return (
    <div className="space-y-6">
      <AdminPanel title="Feature Toggles" icon={ToggleLeft}>
        <div className="grid gap-3">
          {featureToggles.map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between gap-5 rounded-lg bg-black/[0.035] p-4 dark:bg-white/[0.05]">
              <div>
                <p className="font-black">{toggle.label}</p>
                <p className="text-sm text-black/52 dark:text-white/52">{toggle.enabled ? "Enabled" : "Disabled"}</p>
              </div>
              <span className={`h-7 w-12 rounded-full p-1 ${toggle.enabled ? "bg-emerald-500" : "bg-black/20 dark:bg-white/20"}`}>
                <span className={`block h-5 w-5 rounded-full bg-white transition ${toggle.enabled ? "translate-x-5" : ""}`} />
              </span>
            </div>
          ))}
        </div>
      </AdminPanel>
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel title="Security & Roles" icon={LockKeyhole}>
          <AdminList items={["JWT/session authentication", "Role-based permissions", "Password reset", "Admin activity log", "Protected routes"]} />
        </AdminPanel>
        <AdminPanel title="Database Collections" icon={Boxes}>
          <AdminList items={databaseCollections} />
        </AdminPanel>
      </div>
    </div>
  );
}

function AdminPanel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white/78 p-4 shadow-[0_20px_60px_rgba(17,23,20,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] md:rounded-lg md:p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-lg bg-emerald-500/12 p-2 text-emerald-700 dark:text-emerald-300">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-black md:text-xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AdminTable({ columns, rows }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-black/44 dark:text-white/44">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-black/[0.035] dark:bg-white/[0.05]">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-4 first:rounded-l-lg last:rounded-r-lg">
                  {cellIndex === row.length - 1 && typeof cell === "string" ? <StatusPill status={cell} /> : <span className="font-semibold">{cell}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModuleGrid({ modules }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module) => (
        <div key={module.name} className="rounded-xl bg-black/[0.035] p-4 dark:bg-white/[0.05] md:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="font-black">{module.name}</h3>
            <StatusPill status={module.enabled ? "Enabled" : "Disabled"} />
          </div>
          <p className="text-sm leading-6 text-black/58 dark:text-white/58">{module.description}</p>
        </div>
      ))}
    </div>
  );
}

function AdminList({ items }) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div key={item} className="rounded-lg bg-black/[0.035] px-4 py-3 text-sm font-semibold dark:bg-white/[0.05]">{item}</div>
      ))}
    </div>
  );
}

function AdminToolbar({ primary, secondary }) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-black/10 bg-white/78 p-4 md:flex-row md:items-center md:rounded-lg dark:border-white/10 dark:bg-white/[0.045]">
      <p className="text-sm font-bold text-black/58 dark:text-white/58">Changes are staged in admin architecture and ready for secure backend persistence.</p>
      <div className="grid gap-3 sm:flex">
        <AdminButton href="#">{secondary}</AdminButton>
        <AdminButton href="#" tone="solid">{primary}</AdminButton>
      </div>
    </div>
  );
}

function AdminButton({ href, children, tone = "ghost" }) {
  const className =
    tone === "solid"
      ? "inline-flex min-h-11 items-center justify-center rounded-lg bg-[#111714] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white dark:bg-white dark:text-black"
      : "inline-flex min-h-11 items-center justify-center rounded-lg border border-black/10 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/[0.045]";

  return <a href={href} className={className}>{children}</a>;
}

function StatusPill({ status }) {
  const normalized = String(status).toLowerCase();
  const tone =
    normalized.includes("enabled") || normalized.includes("active") || normalized.includes("published") || normalized.includes("approved") || normalized.includes("live") || normalized.includes("growth")
      ? "bg-emerald-500/14 text-emerald-800 dark:text-emerald-200"
      : normalized.includes("disabled") || normalized.includes("paused") || normalized.includes("inactive")
        ? "bg-zinc-500/14 text-zinc-700 dark:text-zinc-200"
        : "bg-amber-500/14 text-amber-800 dark:text-amber-200";

  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${tone}`}>{status}</span>;
}

export { adminNav };
