import {
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
  LockKeyhole,
  Megaphone,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  Search,
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
import { Link, NavLink, useLocation } from "react-router";
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
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Products", href: "/admin/products", icon: Package },
  { label: "Warranty Claims", href: "/admin/warranty", icon: ShieldCheck },
  { label: "Complaints", href: "/admin/support", icon: MessageSquare },
  { label: "Future Orders", href: "/admin/ecommerce", icon: ShoppingCart },
];

const sectionCopy = {
  products: {
    title: "Manage Products",
    description: "Add, edit, feature, hide, and prepare launch products with the fields needed for the storefront.",
  },
  marketplace: {
    title: "Marketplace Redirects",
    description: "Control Amazon, Flipkart, and custom marketplace buttons per product while tracking outbound click performance.",
  },
  warranty: {
    title: "Warranty Claims",
    description: "Review warranty requests, verify invoices and serial numbers, and update claim status.",
  },
  customers: {
    title: "Customer Management",
    description: "View users, profiles, registered products, activity, support tickets, newsletter status, and future order history.",
  },
  ecommerce: {
    title: "Future Cart & Orders",
    description: "Cart, checkout, payments, and order handling are planned for later. Keep this area disabled until ecommerce launches.",
  },
  cms: {
    title: "Content Management",
    description: "Manage homepage banners, hero copy, product highlights, testimonials, FAQs, collections, promotions, social links, and footer content.",
  },
  support: {
    title: "Complaints & Support",
    description: "Handle customer complaints, support tickets, reply notes, and escalation status.",
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
  const { pathname } = useLocation();
  const isAdminDashboard = pathname === "/admin";
  const primaryAction = isAdminDashboard
    ? { href: "/admin/products", label: "Manage Products" }
    : { href: "/admin", label: "Dashboard" };

  return (
    <div className="min-h-screen font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900 bg-[#F8F7F5] dark:bg-[#0A0A0C]">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5" />
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      </div>

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-900/5 bg-white/80 p-4 backdrop-blur-2xl transition-transform lg:translate-x-0 dark:border-white/5 dark:bg-black/50 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between gap-3 px-2 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <img
              src="/images/favicon.svg"
              alt="INFIBOLT logo"
              className="h-6 w-6 shrink-0 object-contain dark:invert"
            />
            <span>
              <span className="block text-[13px] font-bold uppercase leading-none tracking-[0.22em] text-slate-900 dark:text-white">INFIBOLT</span>
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
              <input className="w-full bg-transparent text-sm font-medium focus:outline-none dark:text-white placeholder:text-slate-400" placeholder="Search products, warranty claims, complaints" />
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
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">Admin Operations</p>
                <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-[2.5rem] lg:text-[3rem] dark:text-white">{title}</h1>
                {description && <p className="mt-5 max-w-3xl text-base font-light leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">{description}</p>}
              </div>
              <div className="flex gap-3">
                <AdminButton href="/products">View Storefront</AdminButton>
                <AdminButton href={primaryAction.href} tone="solid">{primaryAction.label}</AdminButton>
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
    <AdminShell
      title="Admin Dashboard"
      description="A focused control panel for products, warranty claims, customer complaints, and future cart/order readiness."
    >
      <div className="space-y-8">
        <MetricGrid />
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <AdminPanel title="Product Queue" icon={Package}>
            <AdminTable columns={["Product", "Category", "Status", "Price"]} rows={products.slice(0, 5).map((product) => [product.name, getProductCategoryName(product.category), product.status, formatPrice(product.price)])} />
          </AdminPanel>
          <AdminPanel title="Warranty Queue" icon={ShieldCheck}>
            <AdminTable columns={["Claim", "Customer", "Product", "Status"]} rows={warrantyClaims.map((claim) => [claim.id, claim.customer, claim.product, claim.status])} />
          </AdminPanel>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <AdminPanel title="Complaints" icon={MessageSquare}>
            <AdminTable columns={["Ticket", "Customer", "Topic", "Status"]} rows={supportTickets.map((ticket) => [ticket.id, ticket.customer, ticket.topic, ticket.status])} />
          </AdminPanel>
          <AdminPanel title="Future Cart & Orders" icon={ShoppingCart}>
            <ComingSoonBanner
              title="Cart and order handling will be enabled later"
              description="Checkout, payments, customer orders, invoices, refunds, and shipping controls are intentionally paused until direct ecommerce launches."
              icon={ShoppingCart}
            />
          </AdminPanel>
        </div>
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

function getProductCategoryName(categoryId) {
  return categories.find((category) => category.id === categoryId)?.name ?? "Product";
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
        title="Product management backend coming soon"
        description="The admin UX is prepared for product creation and updates. Data is still static until product APIs and storage are connected."
        icon={Package}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <SimpleAdminCard icon={Plus} title="Add product" description="Create product name, price, category, images, and status." status="Coming Soon" />
        <SimpleAdminCard icon={Pencil} title="Edit details" description="Update content, feature state, visibility, and marketplace copy." status="Coming Soon" />
        <SimpleAdminCard icon={UploadCloud} title="Upload media" description="Add hero images, galleries, and specification files." status="Coming Soon" />
      </div>
      <AdminPanel title="Product Catalogue" icon={Package}>
        <AdminTable columns={["Product", "Category", "Price", "Stock Status", "Badge"]} rows={rows} />
      </AdminPanel>
      <AdminPanel title="Quick Product Actions" icon={Pencil}>
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
        title="Warranty handling backend coming soon"
        description="Use this screen as the planned workflow for reviewing claims. Invoice upload, serial checks, and status updates will become active after backend connection."
        icon={ShieldCheck}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <SimpleAdminCard icon={FileSearch} title="Review claim" description="Open claim details, customer info, product, and submitted invoice." status="Planned" />
        <SimpleAdminCard icon={ShieldCheck} title="Verify serial" description="Check product serial number and invoice before approval." status="Planned" />
        <SimpleAdminCard icon={TicketCheck} title="Update status" description="Move claim through pending, approved, rejected, or resolved." status="Planned" />
      </div>
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
      <ComingSoonBanner
        title="Future Cart & Orders coming soon"
        description="This section is intentionally not implemented yet. It is reserved for cart, direct booking, checkout, payments, and order management when INFIBOLT starts direct ecommerce."
        icon={ShoppingCart}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SimpleAdminCard icon={ShoppingCart} title="Cart management" description="View carts, abandoned carts, reserved stock, and customer cart activity." status="Coming Soon" />
        <SimpleAdminCard icon={CreditCard} title="Direct booking" description="Allow customers to book directly from INFIBOLT instead of marketplace-only purchase." status="Coming Soon" />
        <SimpleAdminCard icon={WalletCards} title="Checkout & payment" description="Manage payment gateway, coupons, invoices, refunds, and payment status." status="Coming Soon" />
        <SimpleAdminCard icon={Package} title="Order management" description="Track orders, shipping, delivery, cancellation, and customer order history." status="Coming Soon" />
      </div>
      <AdminPanel title="Launch Roadmap" icon={ShoppingCart}>
        <AdminList items={[
          "Phase 1: Enable cart and direct booking UI",
          "Phase 2: Connect payment gateway and invoice generation",
          "Phase 3: Add order lifecycle, shipping, refunds, and cancellation",
          "Phase 4: Show customer order history in account dashboard",
        ]} />
      </AdminPanel>
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
        title="Complaint handling backend coming soon"
        description="The complaint queue and reply layout are prepared. Ticket intake, reply sending, and status updates will become active after support APIs are connected."
        icon={MessageSquare}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <SimpleAdminCard icon={TicketCheck} title="New complaint" description="See incoming support requests from email, forms, and WhatsApp." status="Planned" />
        <SimpleAdminCard icon={MessageSquare} title="Reply customer" description="Send support replies and keep conversation history." status="Planned" />
        <SimpleAdminCard icon={UserRound} title="Escalate case" description="Move warranty or product complaints to the right team." status="Planned" />
      </div>
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

function SimpleAdminCard({ icon: Icon, title, description, status }) {
  return (
    <div className="rounded-2xl border border-slate-900/5 bg-white/50 p-5 shadow-sm dark:border-white/5 dark:bg-white/[0.02]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-xl bg-slate-900/5 p-2 text-slate-900 dark:bg-white/10 dark:text-white">
          <Icon className="h-5 w-5" />
        </span>
        <StatusPill status={status} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
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
