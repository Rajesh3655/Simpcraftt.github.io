"use client";

import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  FileSearch,
  FileText,
  Globe,
  Images,
  LayoutDashboard,
  Link as LinkIcon,
  LockKeyhole,
  Megaphone,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  TicketCheck,
  ToggleLeft,
  Trash2,
  Users,
  UploadCloud,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router";
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
  { label: "Marketplace", href: "/admin/marketplace", icon: LinkIcon },
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
    <div className="min-h-screen font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900 bg-[#F8F7F5] dark:bg-[#0A0A0C]">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5" />
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      </div>

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-900/5 bg-white/80 p-4 backdrop-blur-2xl transition-transform lg:translate-x-0 dark:border-white/5 dark:bg-black/50 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between gap-3 px-2 py-3">
          <Link to="/admin" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-[15px] font-medium text-white dark:bg-white dark:text-slate-900">S</span>
            <span>
              <span className="block text-sm font-semibold tracking-wide text-slate-900 dark:text-white">Simpcraftt</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Admin OS</span>
            </span>
          </Link>
          <button className="rounded-xl border border-slate-900/10 p-2 text-slate-500 lg:hidden dark:border-white/10 dark:text-slate-400" onClick={() => setNavOpen(false)} aria-label="Close admin navigation">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-6 grid gap-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.href} to={item.href} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-slate-900/10 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <LockKeyhole className="h-5 w-5 text-slate-900 dark:text-white" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Protected Admin</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">JWT/session layer planned</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-72">
        <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-900/5 bg-[#F8F7F5]/80 px-6 py-4 backdrop-blur-2xl dark:border-white/5 dark:bg-[#0A0A0C]/80 md:px-8 lg:left-72 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <button className="rounded-xl border border-slate-900/10 p-3 text-slate-500 lg:hidden dark:border-white/10 dark:text-slate-400" onClick={() => setNavOpen(true)} aria-label="Open admin navigation">
              <LayoutDashboard className="h-5 w-5" />
            </button>
            <label className="hidden min-h-[44px] w-full max-w-lg items-center gap-3 rounded-full border border-slate-900/10 bg-white/50 px-5 md:flex dark:border-white/10 dark:bg-white/5">
              <Search className="h-4 w-4 text-slate-400" />
              <input className="w-full bg-transparent text-sm font-medium focus:outline-none dark:text-white placeholder:text-slate-400" placeholder="Search products, claims, customers, tickets" />
            </label>
            <div className="ml-auto flex items-center gap-3">
              <button className="relative rounded-full border border-slate-900/10 bg-white/50 p-3 dark:border-white/10 dark:bg-white/5 dark:text-white" aria-label="Admin alerts">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-slate-900 dark:bg-white" />
              </button>
              <ThemeToggle />
              <div className="hidden rounded-full border border-slate-900/10 bg-white/50 px-5 py-2 md:block dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{adminUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{adminUser.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 pb-10 pt-24 md:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">Enterprise Management</p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-slate-900 sm:text-5xl dark:text-white">{title}</h1>
                {description && <p className="mt-5 max-w-3xl text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>}
              </div>
              <div className="flex gap-3">
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
                <div key={item} className="rounded-xl border border-slate-900/5 bg-white/40 p-4 text-sm font-medium text-slate-600 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">{item}</div>
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {adminStats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-slate-900/5 bg-white/50 p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{stat.label}</p>
              <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-slate-500">{stat.trend}</p>
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
      <ComingSoonBanner
        title="Admin product management coming soon"
        description="Create, edit, delete, upload, feature, and visibility workflows are designed below and ready for persistence once backend product APIs are connected."
        icon={Package}
      />
      <AdminToolbar primary="Add Product" secondary="Import CSV" />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AdminPanel title="Add / Edit Product" icon={Pencil}>
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminInput label="Product name" placeholder="Aura Audio Pro" />
              <AdminInput label="SKU / slug" placeholder="aura-audio-pro" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <AdminInput label="Price" placeholder="7999" />
              <AdminSelect label="Category" options={categories.map((category) => category.name)} />
              <AdminSelect label="Stock status" options={["Coming Soon", "Preview", "Prototype", "Live"]} />
            </div>
            <AdminInput label="Short summary" placeholder="Premium product summary for cards and detail pages" />
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleRow icon={CheckCircle2} title="Featured product" description="Highlight in homepage and collection modules." enabled />
              <ToggleRow icon={Eye} title="Visible on storefront" description="Publish product to public catalogue." enabled />
            </div>
            <button type="button" disabled className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white opacity-60 dark:bg-white dark:text-slate-900">
              <Plus className="h-4 w-4" />
              Save Product Soon
            </button>
          </div>
        </AdminPanel>
        <AdminPanel title="Upload Placeholders" icon={UploadCloud}>
          <div className="grid gap-4">
            {["Hero image", "Gallery images", "Specification PDF"].map((item) => (
              <div key={item} className="flex min-h-[92px] items-center justify-between gap-4 rounded-xl border border-dashed border-slate-900/15 bg-white/40 p-4 dark:border-white/15 dark:bg-white/[0.02]">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item}</p>
                  <p className="mt-1 text-sm text-slate-500">Storage connection pending.</p>
                </div>
                <UploadCloud className="h-5 w-5 text-slate-400" />
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
      <AdminPanel title="Product Catalogue" icon={Package}>
        <AdminTable columns={["Product", "Category", "Price", "Stock Status", "Badge"]} rows={rows} />
      </AdminPanel>
      <AdminPanel title="Product Row Actions" icon={Trash2}>
        <div className="grid gap-3">
          {products.slice(0, 3).map((product, index) => (
            <div key={product.slug} className="grid gap-3 rounded-xl border border-slate-900/5 bg-white/40 p-4 dark:border-white/5 dark:bg-white/[0.02] md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                <p className="mt-1 text-sm text-slate-500">{product.status} · {product.badge}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionPill icon={Pencil} label="Edit Soon" />
                <ActionPill icon={index % 2 === 0 ? Eye : EyeOff} label={index % 2 === 0 ? "Visible" : "Hidden"} />
                <ActionPill icon={Trash2} label="Delete Confirm" tone="danger" />
              </div>
            </div>
          ))}
        </div>
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
      <ComingSoonBanner
        title="Warranty management system coming soon"
        description="Claims, invoice previews, serial checks, customer details, and approval states are staged for backend verification."
        icon={ShieldCheck}
      />
      <AdminToolbar primary="Review Claim" secondary="Verify Serial" />
      <AdminPanel title="Warranty Claim Queue" icon={ShieldCheck}>
        <AdminTable columns={["Claim ID", "Customer", "Product", "Serial", "Status", "Priority"]} rows={warrantyClaims.map((claim) => [claim.id, claim.customer, claim.product, claim.serial, claim.status, claim.priority])} />
      </AdminPanel>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminPanel title="Claim Detail View" icon={FileSearch}>
          <div className="grid gap-4">
            {warrantyClaims.slice(0, 1).map((claim) => (
              <div key={claim.id} className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <DetailBlock label="Claim ID" value={claim.id} />
                  <DetailBlock label="Status" value={claim.status} />
                  <DetailBlock label="Customer" value={claim.customer} />
                  <DetailBlock label="Product" value={claim.product} />
                  <DetailBlock label="Serial number" value={claim.serial} />
                  <DetailBlock label="Priority" value={claim.priority} />
                </div>
                <div className="rounded-xl border border-dashed border-slate-900/15 bg-white/40 p-5 dark:border-white/15 dark:bg-white/[0.02]">
                  <p className="font-medium text-slate-900 dark:text-white">Invoice preview placeholder</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Invoice files will render here after storage and secure admin access are connected.</p>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
        <AdminPanel title="Claim Status Controls" icon={TicketCheck}>
          <div className="grid gap-3">
            {["Verification", "Approved", "Rejected", "Pending invoice", "Resolved"].map((status) => (
              <button key={status} type="button" disabled className="flex items-center justify-between rounded-xl border border-slate-900/5 bg-white/40 px-4 py-3 text-left text-sm font-medium text-slate-600 opacity-80 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                {status}
                <StatusPill status={status} />
              </button>
            ))}
          </div>
        </AdminPanel>
      </div>
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
      <ComingSoonBanner
        title="Support ticket system coming soon"
        description="Complaint intake, ticket history, status badges, and admin reply workflows are visually ready and waiting for ticket APIs."
        icon={MessageSquare}
      />
      <AdminToolbar primary="Reply" secondary="Send Announcement" />
      <AdminPanel title="Support Tickets" icon={TicketCheck}>
        <AdminTable columns={["Ticket", "Customer", "Topic", "Status", "Channel"]} rows={supportTickets.map((ticket) => [ticket.id, ticket.customer, ticket.topic, ticket.status, ticket.channel])} />
      </AdminPanel>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AdminPanel title="Complaint Detail" icon={MessageSquare}>
          <div className="grid gap-4">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-slate-900/5 bg-white/40 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{ticket.id} · {ticket.customer}</p>
                    <p className="mt-1 text-sm text-slate-500">{ticket.topic} via {ticket.channel}</p>
                  </div>
                  <StatusPill status={ticket.status} />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
        <AdminPanel title="Admin Reply Layout" icon={UserRound}>
          <div className="grid gap-4">
            <AdminSelect label="Reply template" options={["Warranty follow-up", "Marketplace guidance", "Product information", "Escalation note"]} />
            <textarea disabled rows={7} placeholder="Admin reply composer coming soon" className="w-full resize-none rounded-xl border border-slate-900/10 bg-white/40 px-4 py-3 text-sm text-slate-600 placeholder:text-slate-400 disabled:opacity-70 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300" />
            <button type="button" disabled className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white opacity-60 dark:bg-white dark:text-slate-900">
              <MessageSquare className="h-4 w-4" />
              Send Reply Soon
            </button>
          </div>
        </AdminPanel>
      </div>
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
            <div className="h-40 rounded-xl border border-slate-900/5 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
              <div className="flex h-full items-end gap-2">
                {[42, 64, 38, 80, 56, 92, 71].map((height, barIndex) => (
                  <div key={`${item}-${barIndex}`} className="flex-1 rounded-t bg-slate-900/20 dark:bg-white/20" style={{ height: `${Math.max(20, height - index * 4)}%` }} />
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
          <div key={product.slug} className="overflow-hidden rounded-2xl border border-slate-900/5 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
            <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
            <div className="p-4">
              <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
              <p className="mt-1 text-sm text-slate-500">Product image asset</p>
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
            <div key={toggle.key} className="flex items-center justify-between gap-5 rounded-xl border border-slate-900/5 bg-white/40 p-4 dark:border-white/5 dark:bg-white/[0.02]">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{toggle.label}</p>
                <p className="text-sm text-slate-500">{toggle.enabled ? "Enabled" : "Disabled"}</p>
              </div>
              <span className={`h-7 w-12 rounded-full p-1 transition-colors ${toggle.enabled ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-white/10"}`}>
                <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${toggle.enabled ? "translate-x-5 dark:bg-slate-900" : ""}`} />
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
    <section className="rounded-2xl border border-slate-900/5 bg-white/50 p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.02]">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-xl bg-slate-900/5 p-2 text-slate-900 dark:bg-white/10 dark:text-white">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ComingSoonBanner({ title, description, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-5 text-amber-900 dark:text-amber-100">
      <div className="flex items-start gap-4">
        <span className="rounded-xl bg-amber-500/10 p-2">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-4xl text-sm leading-7 opacity-85">{description}</p>
        </div>
      </div>
    </div>
  );
}

function AdminInput({ label, placeholder }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{label}</span>
      <input disabled placeholder={placeholder} className="w-full rounded-xl border border-slate-900/10 bg-white/40 px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300" />
    </label>
  );
}

function AdminSelect({ label, options }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{label}</span>
      <select disabled className="w-full rounded-xl border border-slate-900/10 bg-white/40 px-4 py-3 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({ icon: Icon, title, description, enabled }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-900/5 bg-white/40 p-4 dark:border-white/5 dark:bg-white/[0.02]">
      <div className="flex gap-3">
        <Icon className="mt-1 h-4 w-4 text-slate-500 dark:text-slate-400" />
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <span className={`h-6 w-11 shrink-0 rounded-full p-1 ${enabled ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-white/10"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white ${enabled ? "translate-x-5 dark:bg-slate-900" : ""}`} />
      </span>
    </div>
  );
}

function ActionPill({ icon: Icon, label, tone = "default" }) {
  const toneClass = tone === "danger" ? "text-red-700 dark:text-red-300" : "text-slate-700 dark:text-slate-300";
  return (
    <button type="button" disabled className={`inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-75 dark:border-white/10 dark:bg-white/[0.03] ${toneClass}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-900/5 bg-white/40 p-4 dark:border-white/5 dark:bg-white/[0.02]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function AdminTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-slate-900/5 transition-colors hover:bg-slate-900/5 dark:border-white/5 dark:hover:bg-white/5">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {cellIndex === row.length - 1 && typeof cell === "string" ? <StatusPill status={cell} /> : <span className="font-medium">{cell}</span>}
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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module) => (
        <div key={module.name} className="rounded-2xl border border-slate-900/5 bg-white/40 p-6 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="font-medium text-slate-900 dark:text-white">{module.name}</h3>
            <StatusPill status={module.enabled ? "Enabled" : "Disabled"} />
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{module.description}</p>
        </div>
      ))}
    </div>
  );
}

function AdminList({ items }) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div key={item} className="rounded-xl border border-slate-900/5 bg-white/40 px-4 py-3 text-sm font-medium text-slate-600 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">{item}</div>
      ))}
    </div>
  );
}

function AdminToolbar({ primary, secondary }) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-900/5 bg-white/50 p-5 md:flex-row md:items-center dark:border-white/5 dark:bg-white/[0.02]">
      <p className="text-sm font-medium text-slate-500">Changes are staged in admin architecture and ready for secure backend persistence.</p>
      <div className="flex gap-3">
        <AdminDisabledButton>{secondary}</AdminDisabledButton>
        <AdminDisabledButton tone="solid">{primary}</AdminDisabledButton>
      </div>
    </div>
  );
}

function AdminDisabledButton({ children, tone = "ghost" }) {
  const className =
    tone === "solid"
      ? "inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white opacity-60 dark:bg-white dark:text-slate-900"
      : "inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-900/10 bg-transparent px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900 opacity-60 dark:border-white/10 dark:text-white";

  return (
    <button type="button" disabled className={className}>
      {children}
    </button>
  );
}

function AdminButton({ href, children, tone = "ghost" }) {
  const className =
    tone === "solid"
        ? "inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] dark:bg-white dark:text-slate-900 dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] dark:hover:shadow-[0_0_32px_rgba(255,255,255,0.2)]"
        : "inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-900/10 bg-transparent px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900 transition-all duration-500 hover:-translate-y-0.5 hover:bg-slate-900/5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:border-white/10 dark:text-white dark:hover:bg-white/5 dark:hover:shadow-[0_8px_24px_rgba(255,255,255,0.05)]";

  return <Link to={href} className={className}>{children}</Link>;
}

function StatusPill({ status }) {
  const normalized = String(status).toLowerCase();
  const tone =
    normalized.includes("enabled") || normalized.includes("active") || normalized.includes("published") || normalized.includes("approved") || normalized.includes("live") || normalized.includes("growth")
      ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      : normalized.includes("disabled") || normalized.includes("paused") || normalized.includes("inactive")
        ? "bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300"
        : "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";

  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${tone}`}>{status}</span>;
}

export { adminNav };
