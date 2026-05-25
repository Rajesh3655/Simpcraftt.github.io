import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Database,
  Download,
  FileSearch,
  FileText,
  Gauge,
  Globe2,
  Grid3X3,
  Home,
  Image,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Megaphone,
  MessageSquare,
  Package,
  PackageCheck,
  PanelsTopLeft,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  TicketCheck,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import ThemeToggle from "../components/ThemeToggle";
import { AdminProtectedRoute } from "../components/AppStates";
import {
  activityLog,
  adminStats,
  adminUser,
  cmsBlocks,
  customers,
  launchLeads,
  marketplaceRows,
  newsletterSubscribers,
  supportTickets,
  warrantyClaims,
} from "../store/admin";
import { categories, collections, formatPrice, products } from "../store/commerce";

const navGroups = [
  { label: "Command", items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard, section: "dashboard" }] },
  {
    label: "Commerce",
    items: [
      { label: "Products", href: "/products", icon: Package, section: "products" },
      { label: "Categories", href: "/categories", icon: Grid3X3, section: "categories" },
      { label: "Collections", href: "/collections", icon: Layers3, section: "collections" },
      { label: "Product Hero", href: "/product-hero", icon: Sparkles, section: "productHero" },
      { label: "Collection Hero", href: "/collection-hero", icon: PanelsTopLeft, section: "collectionHero" },
      { label: "Homepage Sections", href: "/homepage-sections", icon: Home, section: "homepageSections" },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Users", href: "/users", icon: Users, section: "users" },
      { label: "Newsletter", href: "/newsletter-subscribers", icon: Mail, section: "newsletterSubscribers" },
      { label: "Export Users", href: "/export-users", icon: Download, section: "exportUsers" },
      { label: "Ownership Profiles", href: "/ownership-profiles", icon: PackageCheck, section: "ownershipProfiles" },
    ],
  },
  {
    label: "Warranty",
    items: [
      { label: "Registered Warranty", href: "/warranty", icon: ShieldCheck, section: "registeredWarranty" },
      { label: "Warranty Claims", href: "/warranty-claims", icon: TicketCheck, section: "warrantyClaims" },
      { label: "Claim Status", href: "/claim-status", icon: CheckCircle2, section: "claimStatus" },
      { label: "Serial Management", href: "/serial-management", icon: FileSearch, section: "serialManagement" },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Complaints", href: "/support", icon: MessageSquare, section: "complaints" },
      { label: "Support Tickets", href: "/support-tickets", icon: TicketCheck, section: "supportTickets" },
      { label: "Conversations", href: "/conversations", icon: MessageSquare, section: "conversations" },
      { label: "Priority Support", href: "/priority-support", icon: Gauge, section: "prioritySupport" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Newsletter", href: "/newsletter", icon: Mail, section: "newsletter" },
      { label: "Campaign Leads", href: "/campaign-leads", icon: Megaphone, section: "campaignLeads" },
      { label: "Notify Me Leads", href: "/notify-leads", icon: Bell, section: "notifyLeads" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Homepage CMS", href: "/cms", icon: PanelsTopLeft, section: "homepageCms" },
      { label: "Product Page CMS", href: "/product-page-cms", icon: FileText, section: "productPageCms" },
      { label: "Collection Page CMS", href: "/collection-page-cms", icon: Layers3, section: "collectionPageCms" },
      { label: "SEO Management", href: "/seo", icon: Globe2, section: "seo" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3, section: "analytics" },
      { label: "Inventory", href: "/inventory", icon: Boxes, section: "inventory" },
      { label: "Marketplace Links", href: "/marketplace", icon: ShoppingBag, section: "marketplace" },
      { label: "Launch Status", href: "/launch-status", icon: Activity, section: "launchStatus" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Security", href: "/security", icon: LockKeyhole, section: "security" },
      { label: "Admin Users", href: "/admin-users", icon: UserCog, section: "adminUsers" },
      { label: "Audit Logs", href: "/audit-logs", icon: Database, section: "auditLogs" },
      { label: "Settings", href: "/settings", icon: SlidersHorizontal, section: "settings" },
    ],
  },
];

const allNavItems = navGroups.flatMap((group) => group.items);

const sectionMeta = {
  dashboard: ["Operations Dashboard", "A calm command center for launch health, ownership growth, warranty pressure, and support workload."],
  products: ["Product Management", "Create and control products through focused cards instead of one overwhelming form."],
  categories: ["Category Management", "Organize product families, category heroes, and navigation visibility."],
  collections: ["Collection Management", "Build launch stories, bundles, and ecosystem groupings."],
  productHero: ["Product Hero", "Control flagship product placement across homepage and product surfaces."],
  collectionHero: ["Collection Hero", "Choose which collection story receives hero treatment."],
  homepageSections: ["Homepage Sections", "Arrange homepage modules visually by purpose and visibility."],
  users: ["Customer Directory", "Search, segment, export, and inspect ownership customers."],
  newsletterSubscribers: ["Newsletter Subscribers", "Manage footer subscribers, consent status, exports, and unsubscribe state."],
  exportUsers: ["Export Center", "Export users, warranty customers, support customers, and subscribers."],
  ownershipProfiles: ["Ownership Profiles", "View registered devices, warranty health, marketplace origin, and support history."],
  registeredWarranty: ["Registered Warranty", "Verify device ownership and warranty activation records."],
  warrantyClaims: ["Warranty Claims", "Approve, reject, and track claim decisions with invoice and serial context."],
  claimStatus: ["Claim Status", "Move claims through a clear operational timeline."],
  serialManagement: ["Serial Management", "Look up serials, product mappings, ownership conflicts, and duplicate risk."],
  complaints: ["Complaints", "Triage incoming customer issues with context and priority."],
  supportTickets: ["Support Tickets", "Manage assignments, status, replies, and resolution health."],
  conversations: ["Conversations", "Review customer-support threads as a timeline."],
  prioritySupport: ["Priority Support", "Keep urgent warranty, flagship, and escalation cases visible."],
  newsletter: ["Newsletter", "Create launch updates and subscriber segments."],
  campaignLeads: ["Campaign Leads", "Track product-campaign interest and source quality."],
  notifyLeads: ["Notify Me Leads", "Monitor launch availability requests by product and channel."],
  homepageCms: ["Homepage CMS", "Visually manage hero blocks, sections, banners, and product placements."],
  productPageCms: ["Product Page CMS", "Control product story blocks, specs, ownership messaging, and SEO."],
  collectionPageCms: ["Collection Page CMS", "Manage collection heroes, copy, ordering, and featured products."],
  seo: ["SEO Management", "Review titles, descriptions, sitemap readiness, and index controls."],
  analytics: ["Analytics", "Simple, useful operational analytics without chart clutter."],
  inventory: ["Inventory", "Track SKU, stock, serial prefixes, and launch readiness."],
  marketplace: ["Marketplace Links", "Control Amazon, Flipkart, retail partner, and regional launch URLs."],
  launchStatus: ["Launch Status", "Coordinate public visibility, hero timing, and availability signals."],
  security: ["Security", "Session, RBAC, rate limit, audit, and upload hardening controls."],
  adminUsers: ["Admin Users", "Manage internal users, roles, status, and permissions."],
  auditLogs: ["Audit Logs", "Review sensitive changes, sign-ins, exports, and operational actions."],
  settings: ["Settings", "Brand, system, integration, and feature controls."],
};

export function AdminShell({ title, description, section = "dashboard", children }) {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  const active = allNavItems.find((item) => pathname === item.href) || allNavItems.find((item) => item.section === section) || allNavItems[0];

  useEffect(() => setNavOpen(false), [pathname]);

  useEffect(() => {
    if (!navOpen) return undefined;
    document.body.style.overflow = "hidden";
    const close = (event) => event.key === "Escape" && setNavOpen(false);
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [navOpen]);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-[#f6f4ef] text-slate-950 dark:bg-[#08090c] dark:text-white">
        {navOpen && <button type="button" aria-label="Close navigation" onClick={() => setNavOpen(false)} className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm xl:hidden" />}

        <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(21rem,calc(100vw-1rem))] flex-col border-r border-slate-900/8 bg-white/90 shadow-[16px_0_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-transform duration-300 xl:translate-x-0 dark:border-white/10 dark:bg-[#0c0d12]/92 ${navOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between gap-3 px-5 py-5">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/favicon.svg" alt="INFIBOLT" className="h-7 w-7 dark:invert" />
              <span>
                <span className="block text-[13px] font-bold uppercase leading-none tracking-[0.24em]">INFIBOLT</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Admin OS</span>
              </span>
            </Link>
            <button type="button" onClick={() => setNavOpen(false)} className="rounded-xl border border-slate-900/10 p-2 xl:hidden dark:border-white/10" aria-label="Close admin navigation">
              <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-5">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-5">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{group.label}</p>
                <div className="grid gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                          `group flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
                            isActive || active.href === item.href
                              ? "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:bg-white dark:text-slate-950"
                              : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white"
                          }`
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-900/8 p-4 dark:border-white/10">
            <div className="rounded-2xl bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
              <p className="text-sm font-semibold">Secure session</p>
              <p className="mt-1 text-xs opacity-70">{adminUser.role} access · audit enabled</p>
            </div>
          </div>
        </aside>

        <div className="xl:pl-[21rem]">
          <header className="sticky top-0 z-30 border-b border-slate-900/8 bg-[#f6f4ef]/86 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-[#08090c]/86 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1440px] items-center gap-3">
              <button type="button" onClick={() => setNavOpen(true)} className="rounded-xl border border-slate-900/10 bg-white/60 p-3 xl:hidden dark:border-white/10 dark:bg-white/5" aria-label="Open admin navigation">
                <LayoutDashboard className="h-5 w-5" />
              </button>
              <label className="hidden min-h-[44px] flex-1 items-center gap-3 rounded-full border border-slate-900/10 bg-white/60 px-5 md:flex dark:border-white/10 dark:bg-white/5">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full bg-transparent text-sm font-medium placeholder:text-slate-400 focus:outline-none" placeholder="Search users, serials, products, claims" />
              </label>
              <div className="ml-auto flex items-center gap-2">
                <Link to="/security" className="hidden min-h-[42px] items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-600 md:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <LockKeyhole className="h-4 w-4" />
                  Protected
                </Link>
                <ThemeToggle />
                <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">{adminUser.name.slice(0, 1)}</div>
              </div>
            </div>
          </header>

          <main id="admin-main-content" className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[1440px]">
              <div className="mb-6 flex flex-col gap-4 rounded-[1.35rem] border border-slate-900/8 bg-white/62 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.035] lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{active ? active.label : "Admin"}</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                  {description && <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <CommandButton href="/products" label="Add Product" />
                  <CommandButton href="/export-users" label="Export" tone="ghost" />
                </div>
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

export function AdminOverview() {
  return (
    <AdminShell section="dashboard" title={sectionMeta.dashboard[0]} description={sectionMeta.dashboard[1]}>
      <DashboardWorkspace />
    </AdminShell>
  );
}

export function AdminSectionPage({ section }) {
  const meta = sectionMeta[section] || sectionMeta.dashboard;
  return (
    <AdminShell section={section} title={meta[0]} description={meta[1]}>
      <Workspace section={section} />
    </AdminShell>
  );
}

function Workspace({ section }) {
  if (["products", "categories", "collections", "productHero", "collectionHero", "homepageSections"].includes(section)) return <CommerceWorkspace section={section} />;
  if (["users", "newsletterSubscribers", "exportUsers", "ownershipProfiles"].includes(section)) return <CustomerWorkspace section={section} />;
  if (["registeredWarranty", "warrantyClaims", "claimStatus", "serialManagement"].includes(section)) return <WarrantyWorkspace section={section} />;
  if (["complaints", "supportTickets", "conversations", "prioritySupport"].includes(section)) return <SupportWorkspace section={section} />;
  if (["newsletter", "campaignLeads", "notifyLeads"].includes(section)) return <MarketingWorkspace section={section} />;
  if (["homepageCms", "productPageCms", "collectionPageCms", "seo"].includes(section)) return <ContentWorkspace section={section} />;
  if (["analytics", "inventory", "marketplace", "launchStatus"].includes(section)) return <OperationsWorkspace section={section} />;
  if (["security", "adminUsers", "auditLogs", "settings"].includes(section)) return <SystemWorkspace section={section} />;
  return <DashboardWorkspace />;
}

function DashboardWorkspace() {
  return (
    <div className="grid gap-5">
      <MetricGrid />
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Today" icon={Gauge}>
          <div className="grid gap-3">
            {activityLog.map((item) => <TimelineRow key={item} label={item} />)}
          </div>
        </Panel>
        <Panel title="Queues" icon={CircleDot}>
          <div className="grid gap-3 sm:grid-cols-2">
            <QueueCard label="Warranty review" value={warrantyClaims.length} href="/warranty" />
            <QueueCard label="Support open" value={supportTickets.filter((ticket) => ticket.status !== "Resolved").length} href="/support" />
            <QueueCard label="Notify leads" value={launchLeads.length} href="/notify-leads" />
            <QueueCard label="Products live" value={products.length} href="/products" />
          </div>
        </Panel>
      </div>
      <Panel title="Operational Map" icon={LayoutDashboard}>
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard title="Commerce" text="Products, categories, collections, heroes, and homepage placement." href="/products" />
          <FeatureCard title="Ownership" text="Users, registered devices, warranty records, serial integrity, and support context." href="/ownership-profiles" />
          <FeatureCard title="Launch" text="Marketplace links, notify leads, launch status, newsletter, and campaign readiness." href="/launch-status" />
        </div>
      </Panel>
    </div>
  );
}

function CommerceWorkspace({ section }) {
  const productRows = products.map((product) => [product.name, categoryName(product.category), product.status, formatPrice(product.price), product.badge || "Standard"]);
  const categoryRows = categories.map((category) => [category.name, category.id, products.filter((product) => product.category === category.id).length, "Enabled"]);
  const collectionRows = collections.map((collection) => [collection.name, collection.slug, collection.productSlugs?.length || 0, "Visible"]);

  return (
    <div className="grid gap-5">
      <ActionStrip
        title="Commerce controls"
        text="Use focused modules for daily changes. Deep editing stays in the product workspace."
        actions={[["Quick add", "/products"], ["Marketplace", "/marketplace"], ["Homepage", "/homepage-sections"]]}
      />
      {section === "products" && (
        <Panel title="Product Operating Table" icon={Package}>
          <DataTable columns={["Product", "Category", "Status", "Price", "Positioning"]} rows={productRows} />
        </Panel>
      )}
      {section === "categories" && (
        <Panel title="Categories" icon={Grid3X3}>
          <DataTable columns={["Category", "Slug", "Products", "Status"]} rows={categoryRows} />
        </Panel>
      )}
      {section === "collections" && (
        <Panel title="Collections" icon={Layers3}>
          <DataTable columns={["Collection", "Slug", "Products", "Homepage"]} rows={collectionRows} />
        </Panel>
      )}
      {["productHero", "collectionHero", "homepageSections"].includes(section) && (
        <HeroPlanner section={section} />
      )}
      <div className="grid gap-5 lg:grid-cols-3">
        <FeatureCard title="Visibility" text="Published, homepage, hero, collection, and mobile carousel controls stay separated." href="/launch-status" />
        <FeatureCard title="Media" text="Cover, hover, gallery, thumbnail, and mobile hero assets are managed per product." href="/products" />
        <FeatureCard title="SEO" text="Titles, descriptions, keywords, and structured product data remain launch-ready." href="/seo" />
      </div>
    </div>
  );
}

function CustomerWorkspace({ section }) {
  const rows = customers.map((customer) => [customer.name, customer.email, customer.phone || "Not set", customer.products, customer.status]);
  const subscriberRows = newsletterSubscribers.map((subscriber) => [subscriber.email, subscriber.source, subscriber.status, subscriber.createdAt]);

  return (
    <div className="grid gap-5">
      <ActionStrip
        title="Customer management"
        text="Profile, warranty, support, newsletter, and export workflows are separated so operators know exactly where to act."
        actions={[["Export CSV", "/export-users"], ["Ownership", "/ownership-profiles"], ["Subscribers", "/newsletter-subscribers"]]}
      />
      {section === "newsletterSubscribers" ? (
        <Panel title="Newsletter Subscribers" icon={Mail}>
          <DataTable columns={["Email", "Source", "Status", "Joined"]} rows={subscriberRows} />
        </Panel>
      ) : section === "exportUsers" ? (
        <ExportCenter />
      ) : section === "ownershipProfiles" ? (
        <Panel title="Ownership Profiles" icon={PackageCheck}>
          <DataTable columns={["Customer", "Email", "Mobile", "Devices", "Status"]} rows={rows} />
        </Panel>
      ) : (
        <Panel title="Registered Users" icon={Users}>
          <DataTable columns={["Name", "Email", "Mobile", "Devices", "Status"]} rows={rows} />
        </Panel>
      )}
      <Panel title="Profile Sync Rules" icon={ShieldCheck}>
        <div className="grid gap-3 md:grid-cols-2">
          <PolicyRow title="Email updates" text="Require verification before login, support, newsletter, and ownership records switch to the new address." />
          <PolicyRow title="Mobile updates" text="Require OTP before warranty or support contact numbers update." />
          <PolicyRow title="Change history" text="Every profile change writes an audit entry with actor, IP, and device context." />
          <PolicyRow title="Ownership integrity" text="Serial ownership remains locked to verified accounts unless an admin transfers it." />
        </div>
      </Panel>
    </div>
  );
}

function WarrantyWorkspace({ section }) {
  const rows = warrantyClaims.map((claim) => [claim.id, claim.customer, claim.product, claim.serial, claim.status]);
  return (
    <div className="grid gap-5">
      <ActionStrip title="Warranty OS" text="A single calm queue for serial lookup, invoice review, approvals, rejections, and timeline movement." actions={[["Serial lookup", "/serial-management"], ["Claim status", "/claim-status"], ["Policy", "/warranty"]]} />
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <Panel title={section === "serialManagement" ? "Serial Lookup" : "Warranty Queue"} icon={ShieldCheck}>
          <DataTable columns={["Claim", "Customer", "Product", "Serial", "Status"]} rows={rows} />
        </Panel>
        <Panel title="Claim Timeline" icon={TicketCheck}>
          {["Submitted", "Invoice review", "Serial verified", "Decision", "Closed"].map((item, index) => <TimelineRow key={item} label={item} meta={index < 2 ? "Active" : "Waiting"} />)}
        </Panel>
      </div>
    </div>
  );
}

function SupportWorkspace({ section }) {
  const rows = supportTickets.map((ticket) => [ticket.id, ticket.customer, ticket.topic, ticket.status, ticket.channel]);
  return (
    <div className="grid gap-5">
      <ActionStrip title="Support OS" text="Operators can triage, assign, reply, and resolve without opening unrelated product or warranty tools." actions={[["New reply", "/support"], ["Priority", "/priority-support"], ["Threads", "/conversations"]]} />
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title={section === "prioritySupport" ? "Priority Queue" : "Support Queue"} icon={MessageSquare}>
          <DataTable columns={["Ticket", "Customer", "Topic", "Status", "Channel"]} rows={rows} />
        </Panel>
        <Panel title="Conversation Preview" icon={MessageSquare}>
          <div className="grid gap-3">
            {supportTickets.map((ticket) => <ConversationCard key={ticket.id} ticket={ticket} />)}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MarketingWorkspace({ section }) {
  return (
    <div className="grid gap-5">
      <ActionStrip title="Marketing workspace" text="Newsletter, launch leads, and campaign capture live here instead of inside product operations." actions={[["Newsletter", "/newsletter"], ["Notify leads", "/notify-leads"], ["Export", "/export-users"]]} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={section === "notifyLeads" ? "Notify Me Leads" : "Campaign Leads"} icon={Megaphone}>
          <DataTable columns={["Product", "Email", "Phone", "Status"]} rows={launchLeads.map((lead) => [lead.product, lead.email || "-", lead.phone || "-", lead.status])} />
        </Panel>
        <Panel title="Subscriber Health" icon={Mail}>
          <DataTable columns={["Email", "Source", "Status", "Joined"]} rows={newsletterSubscribers.map((item) => [item.email, item.source, item.status, item.createdAt])} />
        </Panel>
      </div>
    </div>
  );
}

function ContentWorkspace({ section }) {
  return (
    <div className="grid gap-5">
      <ActionStrip title="CMS workspace" text="Content is organized by where it appears, so admins can safely update the right screen." actions={[["Homepage", "/cms"], ["SEO", "/seo"], ["Products", "/product-page-cms"]]} />
      <Panel title="Content Blocks" icon={FileText}>
        <DataTable columns={["Block", "Owner", "Status", "Updated"]} rows={cmsBlocks.map((block) => [block.name, block.owner, block.status, block.updated])} />
      </Panel>
      <div className="grid gap-5 md:grid-cols-3">
        <FeatureCard title="Homepage" text="Hero, featured products, launch banners, and section order." href="/homepage-sections" />
        <FeatureCard title="Product pages" text="Highlights, specs, media, support details, and recommendations." href="/product-page-cms" />
        <FeatureCard title="Collections" text="Collection hero banners, copy, product ordering, and SEO." href="/collection-page-cms" />
      </div>
    </div>
  );
}

function OperationsWorkspace({ section }) {
  const marketplace = marketplaceRows.map((row) => [row.product, row.preferred, row.clicks, row.enabled ? "Live" : "Paused"]);
  return (
    <div className="grid gap-5">
      <MetricGrid />
      {section === "marketplace" ? (
        <Panel title="Marketplace Links" icon={ShoppingBag}>
          <DataTable columns={["Product", "Preferred", "Clicks", "Status"]} rows={marketplace} />
        </Panel>
      ) : (
        <Panel title="Launch Operations" icon={Activity}>
          <DataTable columns={["Product", "SKU", "Stock", "Status"]} rows={products.map((product) => [product.name, product.sku || product.slug, product.stock ?? "Track", product.status])} />
        </Panel>
      )}
    </div>
  );
}

function SystemWorkspace({ section }) {
  const securityRows = [
    ["Helmet + CSP", "Enabled", "Strict headers and framing protection"],
    ["CSRF", "Enabled", "Token required for API writes"],
    ["Rate limits", "Enabled", "Auth, uploads, and API limits"],
    ["Audit logs", "Enabled", "Sensitive admin actions recorded"],
  ];
  return (
    <div className="grid gap-5">
      <ActionStrip title="System controls" text="Security, audit, admin-user, and settings controls are isolated from daily commerce work." actions={[["Security", "/security"], ["Audit", "/audit-logs"], ["Settings", "/settings"]]} />
      <Panel title={section === "auditLogs" ? "Audit Log Policy" : "Security Posture"} icon={LockKeyhole}>
        <DataTable columns={["Control", "State", "Purpose"]} rows={securityRows} />
      </Panel>
      <div className="grid gap-5 md:grid-cols-2">
        <FeatureCard title="RBAC" text="Admin and super-admin roles gate protected operations." href="/admin-users" />
        <FeatureCard title="Index control" text="Admin, private profiles, warranty, support, and APIs are noindex." href="/security" />
      </div>
    </div>
  );
}

function HeroPlanner({ section }) {
  const rows = section === "collectionHero"
    ? collections.map((item) => [item.name, item.slug, "Hero ready", "Visible"])
    : products.slice(0, 5).map((item) => [item.name, item.slug, item.badge || "Launch", item.status]);
  return (
    <Panel title="Visual Placement" icon={Image}>
      <DataTable columns={["Item", "Slug", "Placement", "State"]} rows={rows} />
    </Panel>
  );
}

function ExportCenter() {
  const exports = [
    ["All users", "CSV / Excel", customers.length],
    ["Warranty customers", "CSV", warrantyClaims.length],
    ["Support customers", "CSV", supportTickets.length],
    ["Newsletter subscribers", "CSV", newsletterSubscribers.length],
  ];
  return (
    <Panel title="Export Center" icon={Download}>
      <DataTable columns={["Dataset", "Format", "Records"]} rows={exports} />
    </Panel>
  );
}

function MetricGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {adminStats.map((stat) => (
        <div key={stat.label} className="rounded-[1.15rem] border border-slate-900/8 bg-white/68 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.035]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{stat.label}</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
            <StatusPill status={stat.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{stat.trend}</p>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-[1.25rem] border border-slate-900/8 bg-white/72 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.035]">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="-mx-2 overflow-x-auto px-2">
      <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
        <thead>
          <tr>{columns.map((column) => <th key={column} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="rounded-xl bg-slate-950/[0.025] transition hover:bg-slate-950/[0.045] dark:bg-white/[0.025] dark:hover:bg-white/[0.055]">
              {row.map((cell, cellIndex) => (
                <td key={`${index}-${cellIndex}`} className="px-4 py-4 text-slate-700 first:rounded-l-xl last:rounded-r-xl dark:text-slate-300">
                  {cellIndex === row.length - 1 ? <StatusPill status={cell} /> : <span className="font-medium">{cell}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionStrip({ title, text, actions }) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.15rem] border border-slate-900/8 bg-white/68 p-5 dark:border-white/10 dark:bg-white/[0.035] lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map(([label, href], index) => <CommandButton key={label} href={href} label={label} tone={index === 0 ? "solid" : "ghost"} />)}
      </div>
    </div>
  );
}

function CommandButton({ href, label, tone = "solid" }) {
  const classes = tone === "solid"
    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
    : "border border-slate-900/10 bg-white/50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300";
  return <Link to={href} className={`inline-flex min-h-[40px] items-center justify-center rounded-full px-4 text-[10px] font-bold uppercase tracking-[0.14em] transition hover:-translate-y-0.5 ${classes}`}>{label}</Link>;
}

function FeatureCard({ title, text, href }) {
  return (
    <Link to={href} className="block rounded-[1rem] border border-slate-900/8 bg-slate-950/[0.025] p-5 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.025] dark:hover:bg-white/[0.055]">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
    </Link>
  );
}

function QueueCard({ label, value, href }) {
  return (
    <Link to={href} className="rounded-2xl border border-slate-900/8 bg-white/56 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </Link>
  );
}

function TimelineRow({ label, meta = "Updated" }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/[0.025] px-4 py-3 dark:bg-white/[0.025]">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{meta}</span>
    </div>
  );
}

function PolicyRow({ title, text }) {
  return (
    <div className="rounded-xl bg-slate-950/[0.025] p-4 dark:bg-white/[0.025]">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
    </div>
  );
}

function ConversationCard({ ticket }) {
  return (
    <div className="rounded-xl bg-slate-950/[0.025] p-4 dark:bg-white/[0.025]">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{ticket.customer}</p>
        <StatusPill status={ticket.status} />
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{ticket.id} · {ticket.topic} · {ticket.channel}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const value = String(status || "Live");
  const normalized = value.toLowerCase();
  const tone = normalized.includes("rejected") || normalized.includes("locked") || normalized.includes("high")
    ? "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
    : normalized.includes("pending") || normalized.includes("review") || normalized.includes("verification") || normalized.includes("attention")
      ? "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
      : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tone}`}>{value}</span>;
}

function categoryName(id) {
  return categories.find((category) => category.id === id)?.name || id || "Product";
}

export const adminNav = allNavItems;
export { navGroups };
