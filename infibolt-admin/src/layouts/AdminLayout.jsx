import {
  Activity,
  Bell,
  Box,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Grid3X3,
  Headphones,
  Home,
  Image,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  Package,
  PackageCheck,
  Phone,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TicketCheck,
  Trash2,
  UploadCloud,
  Users,
  Watch,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { toast } from "sonner";
import ThemeToggle from "../components/ThemeToggle";
import { AdminProtectedRoute } from "../components/AppStates";
import {
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
import { categories, formatPrice, products } from "../store/commerce";
import { useAdminStore } from "../store/appStore";
import { productService } from "../services/productService";
import { uploadUrl } from "../config/api";
import { formatIndiaDateTime, isSameIndiaDay } from "../utils/time";

const navGroups = [
  { label: "Command", items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard, section: "dashboard" }] },
  {
    label: "Commerce",
    items: [
      { label: "Products", href: "/products", icon: Package, section: "products" },
      { label: "Add Product", href: "/products/add", icon: PackageCheck, section: "addProduct" },
      { label: "Categories", href: "/categories", icon: Grid3X3, section: "categories" },
      { label: "Product Hero", href: "/product-hero", icon: Sparkles, section: "productHero" },
      { label: "Homepage Sections", href: "/homepage-sections", icon: Home, section: "homepageSections" },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Users", href: "/users", icon: Users, section: "users" },
      { label: "Newsletter", href: "/newsletter-subscribers", icon: Mail, section: "newsletterSubscribers" },
    ],
  },
  {
    label: "Warranty",
    items: [
      { label: "Registered Warranty", href: "/warranty", icon: ShieldCheck, section: "registeredWarranty" },
      { label: "Warranty Policy", href: "/warranty-policy", icon: UploadCloud, section: "warrantyPolicy" },
      { label: "Warranty Claims", href: "/warranty-claims", icon: TicketCheck, section: "warrantyClaims" },
      { label: "Warranty Details", href: "/claim-status", icon: CheckCircle2, section: "claimStatus" },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Complaints", href: "/support", icon: MessageSquare, section: "complaints" },
    ],
  },
  {
    label: "Frontend",
    items: [
      { label: "Contact Settings", href: "/contact-settings", icon: Share2, section: "contactSettings" },
    ],
  },
];

const allNavItems = navGroups.flatMap((group) => group.items);

const sectionMeta = {
  dashboard: ["Operations Dashboard", "A calm command center for launch health, ownership growth, warranty pressure, and support workload."],
  products: ["Product Management", "Create and control products through focused cards instead of one overwhelming form."],
  categories: ["Category Management", "Organize product families, category heroes, and navigation visibility."],
  productHero: ["Product Hero", "Control flagship product placement across homepage and product surfaces."],
  homepageSections: ["Homepage Sections", "Arrange homepage modules visually by purpose and visibility."],
  users: ["Customer Directory", "Search, segment, export, and inspect ownership customers."],
  newsletterSubscribers: ["Newsletter Subscribers", "Manage footer subscribers, consent status, exports, and unsubscribe state."],
  registeredWarranty: ["Registered Warranty", "Verify device ownership and warranty activation records."],
  warrantyPolicy: ["Warranty Policy", "Publish the warranty policy PDF customers must acknowledge before registration."],
  warrantyClaims: ["Warranty Claims", "Approve, reject, and track claim decisions with invoice and serial context."],
  claimStatus: ["Warranty Details", "Review registered warranties and warranty claims with clean status controls."],
  serialManagement: ["Serial Management", "Look up serials, product mappings, ownership conflicts, and duplicate risk."],
  complaints: ["Complaints", "Triage incoming customer issues with context and priority."],
  contactSettings: ["Contact Settings", "Update storefront phone, help email, WhatsApp, and social media footer links."],
  supportTickets: ["Support Tickets", "Manage assignments, status, replies, and resolution health."],
  conversations: ["Conversations", "Review customer-support threads as a timeline."],
  prioritySupport: ["Priority Support", "Keep urgent warranty, flagship, and escalation cases visible."],
  newsletter: ["Newsletter", "Create launch updates and subscriber segments."],
  campaignLeads: ["Campaign Leads", "Track product-campaign interest and source quality."],
  notifyLeads: ["Notify Me Leads", "Monitor launch availability requests by product and channel."],
  homepageCms: ["Homepage CMS", "Visually manage hero blocks, sections, banners, and product placements."],
  productPageCms: ["Product Page CMS", "Control product story blocks, specs, ownership messaging, and SEO."],
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
  const auth = useAdminStore((state) => state.auth);
  const hydrateSession = useAdminStore((state) => state.hydrateSession);
  const loadAdminWorkspace = useAdminStore((state) => state.loadAdminWorkspace);
  const overviewStatus = useAdminStore((state) => state.overview.status);
  const logout = useAdminStore((state) => state.logout);
  const active = allNavItems.find((item) => pathname === item.href) || allNavItems.find((item) => item.section === section) || allNavItems[0];

  useEffect(() => setNavOpen(false), [pathname]);

  useEffect(() => {
    if (auth.status === "idle") hydrateSession();
  }, [auth.status, hydrateSession]);

  useEffect(() => {
    if (auth.user && overviewStatus === "idle") loadAdminWorkspace();
  }, [auth.user, overviewStatus, loadAdminWorkspace]);

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
                <span className="block text-[14px] font-extrabold uppercase leading-none tracking-[0.25em]">INFIBOLT</span>
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
                        end
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
                <button type="button" onClick={logout} className="grid h-11 w-11 place-items-center rounded-full border border-slate-900/10 bg-white/70 text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200" aria-label="Logout">
                  <LogOut className="h-4 w-4" />
                </button>
                <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">{(auth.user?.name || adminUser.name).slice(0, 1)}</div>
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

function useWorkspaceData() {
  const store = useAdminStore();
  return useMemo(() => {
    const overview = store.overview.data || {};
    const liveProducts = store.products.items.length ? store.products.items : overview.products || products;
    const liveCategories = store.categories.items.length ? store.categories.items : categories;
    const liveCustomers = store.users.items.length ? store.users.items : customers;
    const liveSubscribers = store.newsletter.subscribers.length ? store.newsletter.subscribers : newsletterSubscribers;
    const liveLeads = store.newsletter.leads.length ? store.newsletter.leads : launchLeads;
    const liveSupport = store.support.tickets.length ? store.support.tickets : overview.supportTickets || supportTickets;
    const liveWarranty = store.warranty.claims.length ? store.warranty.claims : overview.warrantyClaims || warrantyClaims;
    const liveRmas = store.warranty.rmas.length ? store.warranty.rmas : overview.rmas || [];
    const liveAudit = store.auditLogs.items;
    const liveHomepageSections = store.homepageSections.items || [];

    return {
      stats: overview.stats || adminStats,
      products: liveProducts,
      categories: liveCategories,
      homepageSections: liveHomepageSections,
      customers: liveCustomers,
      newsletterSubscribers: liveSubscribers,
      launchLeads: liveLeads,
      supportTickets: liveSupport,
      warrantyClaims: liveWarranty,
      rmas: liveRmas,
      units: store.warranty.units,
      auditLogs: liveAudit,
      otpAudit: store.otpAudit,
      featureToggles: store.settings.data?.featureToggles || [],
      loading: [store.overview.status, store.products.status, store.categories.status, store.homepageSections.status, store.users.status, store.support.status, store.warranty.status].includes("loading"),
    };
  }, [store]);
}

function Workspace({ section }) {
  if (["products", "categories", "productHero", "homepageSections"].includes(section)) return <CommerceWorkspace section={section} />;
  if (["users", "newsletterSubscribers"].includes(section)) return <CustomerWorkspace section={section} />;
  if (["registeredWarranty", "warrantyPolicy", "warrantyClaims", "claimStatus", "serialManagement"].includes(section)) return <WarrantyWorkspace section={section} />;
  if (["complaints", "supportTickets", "conversations", "prioritySupport"].includes(section)) return <SupportWorkspace section={section} />;
  if (section === "contactSettings") return <ContactSettingsWorkspace />;
  if (["newsletter", "campaignLeads", "notifyLeads"].includes(section)) return <MarketingWorkspace section={section} />;
  if (["homepageCms", "productPageCms", "seo"].includes(section)) return <ContentWorkspace section={section} />;
  if (["analytics", "inventory", "marketplace", "launchStatus"].includes(section)) return <OperationsWorkspace section={section} />;
  if (["security", "adminUsers", "auditLogs", "settings"].includes(section)) return <SystemWorkspace section={section} />;
  return <DashboardWorkspace />;
}

function DashboardWorkspace() {
  const data = useWorkspaceData();
  const cards = [
    {
      label: "Products",
      href: "/products",
      icon: Package,
      total: data.products.length,
      today: data.products.filter((item) => isToday(item.createdAt || item.updatedAt)).length,
      text: "Catalogue",
    },
    {
      label: "Complaints",
      href: "/support",
      icon: MessageSquare,
      total: data.supportTickets.length,
      today: data.supportTickets.filter((item) => isToday(item.createdAt || item.updatedAt)).length,
      text: "Support inbox",
    },
    {
      label: "Registered Warranty",
      href: "/warranty",
      icon: ShieldCheck,
      total: data.warrantyClaims.length,
      today: data.warrantyClaims.filter((item) => isToday(item.registeredAt || item.createdAt || item.updatedAt)).length,
      text: "Ownership records",
    },
    {
      label: "Claims",
      href: "/warranty-claims",
      icon: TicketCheck,
      total: data.rmas.length,
      today: data.rmas.filter((item) => isToday(item.createdAt || item.updatedAt)).length,
      text: "Warranty claims",
    },
    {
      label: "Users",
      href: "/users",
      icon: Users,
      total: data.customers.length,
      today: data.customers.filter((item) => isToday(item.createdAt || item.updatedAt)).length,
      text: "Registered accounts",
    },
    {
      label: "Newsletter",
      href: "/newsletter-subscribers",
      icon: Mail,
      total: data.newsletterSubscribers.length,
      today: data.newsletterSubscribers.filter((item) => isToday(item.subscribedAt || item.createdAt || item.updatedAt)).length,
      text: "Subscribers",
    },
  ];

  return (
    <section className="rounded-[1.25rem] border border-slate-900/8 bg-white/76 p-5 shadow-[0_18px_58px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/[0.035]">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Quick access</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Daily overview</h2>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today / Total</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => <DashboardAccessCard key={card.label} {...card} />)}
      </div>
    </section>
  );
}

function DashboardAccessCard({ label, href, icon: Icon, total, today, text }) {
  return (
    <Link
      to={href}
      className="group rounded-[1.15rem] border border-slate-900/8 bg-slate-950/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-slate-950/20 hover:bg-white hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white transition group-hover:scale-105 dark:bg-white dark:text-slate-950">
          <Icon className="h-4 w-4" />
        </span>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          Today {today}
        </span>
      </div>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{total}</p>
        <p className="pb-1 text-sm font-medium text-slate-500 dark:text-slate-400">{text}</p>
      </div>
    </Link>
  );
}

function isToday(value) {
  return isSameIndiaDay(value);
}

function CommerceWorkspace({ section }) {
  const data = useWorkspaceData();
  const productRows = data.products.map((product) => [product.name, categoryName(product.category || product.categorySlug, data.categories), product.status || "Draft", formatPrice(product.price || 0), product.badge || "Standard"]);

  return (
    <div className="grid gap-5">
      {section === "products" && (
        <Panel title="Product Operating Table" icon={Package}>
          <DataTable columns={["Product", "Category", "Status", "Price", "Positioning"]} rows={productRows} />
        </Panel>
      )}
      {section === "categories" && (
        <CategoryManager categories={data.categories} products={data.products} />
      )}
      {["productHero", "homepageSections"].includes(section) && (
        <HeroPlanner section={section} />
      )}
    </div>
  );
}

function CustomerWorkspace({ section }) {
  const data = useWorkspaceData();

  if (section === "users") return <RegisteredUsersManager customers={data.customers} />;
  if (section === "newsletterSubscribers") return <NewsletterSubscribersManager subscribers={data.newsletterSubscribers} />;

  return null;
}

function NewsletterSubscribersManager({ subscribers }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredSubscribers = subscribers.filter((subscriber) => {
    if (!normalizedQuery) return true;
    return [subscriber.email, subscriber.source, subscriber.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery));
  });

  const downloadCsv = () => {
    const rows = [
      ["email", "source", "status", "subscribedAt", "createdAt", "updatedAt"],
      ...subscribers.map((subscriber) => [
        subscriber.email || "",
        subscriber.source || "Website",
        subscriber.status || "Subscribed",
        subscriber.subscribedAt || "",
        subscriber.createdAt || "",
        subscriber.updatedAt || "",
      ]),
    ];
    downloadTextFile("infibolt-newsletter-subscribers.csv", toCsv(rows), "text/csv;charset=utf-8");
  };

  return (
    <Panel title="Newsletter Subscribers" icon={Mail}>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="premium-control min-h-[46px] w-full pl-11 pr-4 text-sm font-medium"
            placeholder="Search email, source, status"
          />
        </label>
        <button type="button" onClick={downloadCsv} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-slate-950">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>
      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[820px] border-separate border-spacing-y-2 text-left text-sm">
          <thead>
            <tr>
              {["Email", "Source", "Status", "Joined"].map((column) => (
                <th key={column} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.map((subscriber, index) => (
              <tr key={subscriber._id || subscriber.id || subscriber.email || index} className="rounded-xl bg-slate-950/[0.025] transition hover:bg-slate-950/[0.045] dark:bg-white/[0.025] dark:hover:bg-white/[0.055]">
                <td className="rounded-l-xl px-4 py-4 text-slate-700 dark:text-slate-300"><span className="font-semibold">{subscriber.email || "-"}</span></td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-300"><span className="font-medium">{subscriber.source || "Website"}</span></td>
                <td className="px-4 py-4 text-slate-700 dark:text-slate-300"><StatusPill status={subscriber.status || "Subscribed"} /></td>
                <td className="rounded-r-xl px-4 py-4 text-slate-700 dark:text-slate-300"><span className="font-medium">{formatDate(subscriber.createdAt || subscriber.subscribedAt)}</span></td>
              </tr>
            ))}
            {!filteredSubscribers.length && (
              <tr>
                <td colSpan={4} className="rounded-xl bg-slate-950/[0.025] px-4 py-10 text-center text-sm font-semibold text-slate-500 dark:bg-white/[0.025] dark:text-slate-400">
                  No newsletter subscribers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function RegisteredUsersManager({ customers }) {
  const updateCustomerSecurityStatus = useAdminStore((state) => state.updateCustomerSecurityStatus);
  const loadUsers = useAdminStore((state) => state.loadUsers);
  const [query, setQuery] = useState("");
  const [busyCustomer, setBusyCustomer] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCustomers = customers.filter((customer) => {
    if (!normalizedQuery) return true;
    return [customer.name, customer.customerName, customer.email, customer.phone, customer.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery));
  });

  const toggleCustomerAccess = async (customer) => {
    const id = customer._id || customer.id;
    if (!id) return;
    const nextStatus = customer.status === "Locked" ? (customer.emailVerifiedAt ? "Verified" : "Pending") : "Locked";
    setBusyCustomer(id);
    try {
      await updateCustomerSecurityStatus(id, nextStatus);
      await loadUsers();
      toast.success(nextStatus === "Locked" ? "User blocked" : "User unblocked", { description: customer.email });
    } catch (error) {
      toast.error("User update failed", { description: error.message || "Please try again." });
    } finally {
      setBusyCustomer("");
    }
  };

  const downloadCsv = () => {
    const rows = [
      ["name", "email", "phone", "status", "emailVerified", "devices", "createdAt", "updatedAt"],
      ...customers.map((customer) => [
        customer.name || customer.customerName || "Customer",
        customer.email || "",
        customer.phone || "",
        customer.status || "Pending",
        customer.emailVerifiedAt ? "yes" : "no",
        customer.products || customer.productCount || 0,
        customer.createdAt || "",
        customer.updatedAt || "",
      ]),
    ];
    downloadTextFile("infibolt-registered-users.csv", toCsv(rows), "text/csv;charset=utf-8");
  };

  return (
    <Panel title="Registered Users" icon={Users}>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="premium-control min-h-[46px] w-full pl-11 pr-4 text-sm font-medium"
            placeholder="Search name, email, phone, status"
          />
        </label>
        <button type="button" onClick={downloadCsv} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-slate-950">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>
      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
          <thead>
            <tr>
              {["Name", "Email", "Phone", "Signup", "Status"].map((column) => (
                <th key={column} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => {
              const id = customer._id || customer.id || customer.email;
              const locked = customer.status === "Locked";
              return (
                <tr key={id} className="rounded-xl bg-slate-950/[0.025] transition hover:bg-slate-950/[0.045] dark:bg-white/[0.025] dark:hover:bg-white/[0.055]">
                  <td className="rounded-l-xl px-4 py-4 text-slate-700 dark:text-slate-300"><span className="font-semibold">{customer.name || customer.customerName || "Customer"}</span></td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300"><span className="font-medium">{customer.email || "-"}</span></td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300"><span className="font-medium">{customer.phone || "Optional"}</span></td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300"><span className="font-medium">{formatDate(customer.createdAt)}</span></td>
                  <td className="rounded-r-xl px-4 py-4 text-slate-700 dark:text-slate-300">
                    <button
                      type="button"
                      disabled={busyCustomer === id}
                      onClick={() => toggleCustomerAccess(customer)}
                      className={`inline-flex min-h-[36px] min-w-[116px] items-center justify-center rounded-full px-4 text-[10px] font-bold uppercase tracking-[0.14em] transition disabled:opacity-50 ${
                        locked
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100"
                          : "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      }`}
                    >
                      {busyCustomer === id ? "Saving" : locked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!filteredCustomers.length && (
              <tr>
                <td colSpan={5} className="rounded-xl bg-slate-950/[0.025] px-4 py-10 text-center text-sm font-semibold text-slate-500 dark:bg-white/[0.025] dark:text-slate-400">
                  No registered users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function CategoryManager({ categories: categoryItems, products: productItems }) {
  const loadCategories = useAdminStore((state) => state.loadCategories);
  const loadProducts = useAdminStore((state) => state.loadProducts);
  const [draft, setDraft] = useState(emptyCategoryDraft);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [warning, setWarning] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const categoryRows = categoryItems.map((category) => ({
    category,
    productCount: categoryProductCount(category, productItems),
  }));
  const DraftIcon = categoryAdminIcon(draft.icon);

  const resetDraft = () => {
    setDraft(emptyCategoryDraft);
    setEditingId("");
    setWarning("");
    setFieldErrors({});
  };

  const editCategory = (category) => {
    setEditingId(category.id || category.slug);
    setDraft({
      name: category.name || "",
      slug: category.slug || category.id || slugify(category.name),
      description: category.description || "",
      icon: category.icon || defaultCategoryIcon(category.slug || category.id || category.name),
    });
    setWarning("");
    setFieldErrors({});
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    const name = draft.name.trim();
    const slug = slugify(draft.slug || name);
    const nextErrors = {};
    if (name.length < 2) nextErrors.name = "Enter at least 2 characters.";
    if (!slug) nextErrors.slug = "Use lowercase letters, numbers, and hyphens only.";
    if (draft.description.length > 800) nextErrors.description = "Keep the description under 800 characters.";
    if (draft.icon.length > 80) nextErrors.icon = "Keep the icon name under 80 characters.";
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      setWarning(Object.values(nextErrors)[0]);
      return;
    }
    if (!name || !slug) {
      setWarning("Add a category name before saving.");
      return;
    }
    const duplicate = categoryItems.find((category) => {
      const currentId = category.id || category.slug;
      if (editingId && currentId === editingId) return false;
      const values = [category.id, category.slug, category.name].filter(Boolean).map((value) => String(value).toLowerCase());
      return values.includes(slug.toLowerCase()) || values.includes(name.toLowerCase());
    });
    if (duplicate) {
      const message = `${duplicate.name} already exists. Use a different category name or slug.`;
      setWarning(message);
      setFieldErrors({ slug: message });
      toast.error("Category already exists", { description: message });
      return;
    }

    setSaving(true);
    setWarning("");
    setFieldErrors({});
    try {
      const payload = { name, id: slug, slug, description: draft.description.trim(), icon: (draft.icon || "sparkles").trim(), enabled: true };
      if (editingId) await productService.updateCategory(editingId, payload);
      else await productService.createCategory(payload);
      await loadCategories();
      toast.success(editingId ? "Category updated" : "Category added", { description: `${name} is available in Add Product.` });
      resetDraft();
    } catch (error) {
      const message = error.message || "Category could not be saved.";
      if (error.fields) setFieldErrors(categoryApiFields(error.fields));
      setWarning(message);
      await loadCategories();
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category, productCount) => {
    const id = category.id || category.slug;
    if (productCount > 0) {
      const message = `First delete or move ${productCount} product${productCount === 1 ? "" : "s"} from ${category.name}.`;
      setWarning(message);
      toast.error("Category cannot be deleted", { description: message });
      return;
    }
    setDeletingId(id);
    setWarning("");
    try {
      await productService.deleteCategory(id);
      await Promise.all([loadCategories(), loadProducts()]);
      toast.success("Category deleted", { description: `${category.name} was removed.` });
      if (editingId === id) resetDraft();
    } catch (error) {
      setWarning(error.message || "Category could not be deleted.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <Panel title={editingId ? "Edit Category" : "Add Category"} icon={Plus}>
        <form onSubmit={saveCategory} className="grid gap-4">
          <div className="rounded-2xl border border-slate-900/8 bg-slate-950/[0.025] p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
            Create only customer-visible product families. Use a short name, clean URL slug, and simple description. Delete is available only when no products use the category.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Category name</span>
              <input value={draft.name} onChange={(event) => { setDraft((current) => ({ ...current, name: event.target.value, slug: current.slug || slugify(event.target.value) })); clearCategoryFieldError(setFieldErrors, "name"); }} className={`premium-control min-h-[48px] px-4 text-sm font-medium ${fieldErrors.name ? "border-rose-500 bg-rose-50/60 text-rose-950" : ""}`} placeholder="Wearables" aria-invalid={Boolean(fieldErrors.name)} />
              {!fieldErrors.name && <span className="text-xs font-medium leading-5 text-slate-500">Use a broad catalogue family, not a product name.</span>}
              {fieldErrors.name && <span className="text-xs font-semibold text-rose-700">{fieldErrors.name}</span>}
            </label>
            <label className="grid gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Slug</span>
              <input value={draft.slug} onChange={(event) => { setDraft((current) => ({ ...current, slug: slugify(event.target.value) })); clearCategoryFieldError(setFieldErrors, "slug"); }} className={`premium-control min-h-[48px] px-4 text-sm font-medium ${fieldErrors.slug ? "border-rose-500 bg-rose-50/60 text-rose-950" : ""}`} placeholder="wearables" aria-invalid={Boolean(fieldErrors.slug)} />
              {!fieldErrors.slug && <span className="text-xs font-medium leading-5 text-slate-500">Lowercase URL handle. Example: home-tech.</span>}
              {fieldErrors.slug && <span className="text-xs font-semibold text-rose-700">{fieldErrors.slug}</span>}
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Description</span>
            <textarea value={draft.description} onChange={(event) => { setDraft((current) => ({ ...current, description: event.target.value })); clearCategoryFieldError(setFieldErrors, "description"); }} rows={3} className={`premium-control resize-none px-4 py-3 text-sm font-medium ${fieldErrors.description ? "border-rose-500 bg-rose-50/60 text-rose-950" : ""}`} placeholder="Short category purpose for catalogue surfaces." aria-invalid={Boolean(fieldErrors.description)} />
            {!fieldErrors.description && <span className="text-xs font-medium leading-5 text-slate-500">Optional admin context. Keep it short and useful.</span>}
            {fieldErrors.description && <span className="text-xs font-semibold text-rose-700">{fieldErrors.description}</span>}
          </label>
          <div className="grid gap-3 rounded-2xl border border-slate-900/8 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Category icon</p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-500">Choose the symbol shown on the homepage category section.</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <DraftIcon className="h-5 w-5" />
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              {categoryIconOptions.map(({ value, label, icon: Icon }) => {
                const active = draft.icon === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setDraft((current) => ({ ...current, icon: value }));
                      clearCategoryFieldError(setFieldErrors, "icon");
                    }}
                    className={`inline-flex min-h-[44px] items-center justify-between gap-3 rounded-xl border px-3 text-left text-xs font-bold transition ${
                      active
                        ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-100"
                        : "border-slate-900/10 bg-slate-50 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                    <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                  </button>
                );
              })}
            </div>
            <label className="grid gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Custom icon name</span>
              <input value={draft.icon} onChange={(event) => { setDraft((current) => ({ ...current, icon: iconKey(event.target.value) })); clearCategoryFieldError(setFieldErrors, "icon"); }} className={`premium-control min-h-[46px] px-4 text-sm font-medium ${fieldErrors.icon ? "border-rose-500 bg-rose-50/60 text-rose-950" : ""}`} placeholder="headphones, watch, zap, box, home, shield" aria-invalid={Boolean(fieldErrors.icon)} />
              {!fieldErrors.icon && <span className="text-xs font-medium leading-5 text-slate-500">Custom values are saved. If the website does not recognize the name, it falls back to Premium.</span>}
              {fieldErrors.icon && <span className="text-xs font-semibold text-rose-700">{fieldErrors.icon}</span>}
            </label>
          </div>
          {warning && <p className="rounded-xl bg-amber-500/10 p-3 text-sm font-semibold leading-6 text-amber-800 dark:text-amber-200">{warning}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-950 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">
              {saving ? "Saving" : editingId ? "Update Category" : "Add Category"}
            </button>
            {editingId && (
              <button type="button" onClick={resetDraft} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Categories" icon={Grid3X3}>
        <div className="-mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr>
                {["Category", "Slug", "Products", "Status", "Actions"].map((column) => (
                  <th key={column} className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryRows.map(({ category, productCount }) => {
                const id = category.id || category.slug;
                const canDelete = productCount === 0;
                const RowIcon = categoryAdminIcon(category.icon || defaultCategoryIcon(id || category.name));
                return (
                  <tr key={id} className="rounded-xl bg-slate-950/[0.025] transition hover:bg-slate-950/[0.045] dark:bg-white/[0.025] dark:hover:bg-white/[0.055]">
                    <td className="rounded-l-xl px-4 py-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-900/8 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
                          <RowIcon className="h-4 w-4" />
                        </span>
                        <span>
                          <p className="font-semibold text-slate-950 dark:text-white">{category.name}</p>
                          {category.description && <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{category.description}</p>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">{category.slug || category.id}</td>
                    <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{productCount}</td>
                    <td className="px-4 py-4"><StatusPill status={category.enabled === false ? "Paused" : "Enabled"} /></td>
                    <td className="rounded-r-xl px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={() => editCategory(category)} className="inline-flex min-h-[38px] items-center justify-center rounded-full border border-slate-900/10 bg-white/70 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(category, productCount)}
                          disabled={deletingId === id}
                          className={`inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border px-4 text-[10px] font-bold uppercase tracking-[0.12em] transition disabled:opacity-50 ${
                            canDelete
                              ? "border-rose-500/20 bg-rose-500/5 text-rose-700 hover:bg-rose-500/10 dark:text-rose-300"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                          }`}
                          title={canDelete ? "Delete category" : "Delete products from this category first"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {canDelete ? "Delete" : "Locked"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

const emptyCategoryDraft = { name: "", slug: "", description: "", icon: "sparkles" };

const categoryIconOptions = [
  { value: "headphones", label: "Audio", icon: Headphones },
  { value: "watch", label: "Wearable", icon: Watch },
  { value: "zap", label: "Charging", icon: Zap },
  { value: "box", label: "Device", icon: Box },
  { value: "home", label: "Home Tech", icon: Home },
  { value: "shield", label: "Warranty", icon: ShieldCheck },
  { value: "package", label: "Product", icon: Package },
  { value: "sparkles", label: "Premium", icon: Sparkles },
];

const categoryIconMap = categoryIconOptions.reduce((icons, option) => {
  icons[option.value] = option.icon;
  return icons;
}, {
  audio: Headphones,
  wearables: Watch,
  charging: Zap,
  "home-tech": Box,
});

function categoryAdminIcon(value) {
  return categoryIconMap[iconKey(value)] || Sparkles;
}

function defaultCategoryIcon(value) {
  const key = iconKey(value);
  if (key.includes("audio") || key.includes("sound") || key.includes("speaker")) return "headphones";
  if (key.includes("watch") || key.includes("wear")) return "watch";
  if (key.includes("charg") || key.includes("power")) return "zap";
  if (key.includes("home")) return "home";
  return "sparkles";
}

function iconKey(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function categoryProductCount(category, productItems) {
  const keys = [category.id, category.slug, category.name].filter(Boolean).map((value) => String(value).toLowerCase());
  return productItems.filter((product) => {
    const productKeys = [product.category, product.categorySlug].filter(Boolean).map((value) => String(value).toLowerCase());
    return productKeys.some((key) => keys.includes(key));
  }).length;
}

function categoryApiFields(fields = {}) {
  return Object.entries(fields).reduce((errors, [key, message]) => {
    const field = key === "id" ? "slug" : key;
    errors[field] = message;
    return errors;
  }, {});
}

function clearCategoryFieldError(setFieldErrors, key) {
  setFieldErrors((current) => {
    if (!current[key]) return current;
    const next = { ...current };
    delete next[key];
    return next;
  });
}

function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function WarrantyWorkspace({ section }) {
  const data = useWorkspaceData();
  const warrantyRows = [...data.rmas, ...data.warrantyClaims];
  const rows = warrantyRows.map((claim) => [claim.id, claim.customer || claim.customerName || claim.email || "Customer", claim.product || claim.productName || "Product", claim.serial || claim.serialNumber || "-", claim.status || claim.warrantyStatus || "Review"]);
  return (
    <div className="grid gap-5">
      <ActionStrip title="Warranty OS" text="A single calm queue for serial lookup, invoice review, approvals, rejections, and timeline movement." actions={[["Serial lookup", "/serial-management"], ["Claim status", "/claim-status"], ["Policy", "/warranty-policy"]]} />
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
  const data = useWorkspaceData();
  const markSupportRead = useAdminStore((state) => state.markSupportRead);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("unread");
  const [topicFilter, setTopicFilter] = useState("all");
  const [readingId, setReadingId] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const visibleTickets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = data.supportTickets.filter((ticket) => {
      const matchesTopic = topicFilter === "all" || ticketTopic(ticket).toLowerCase() === topicFilter;
      if (!matchesTopic) return false;
      if (!needle) return true;
      return [
        ticket.id,
        ticket._id,
        ticket.customer,
        ticket.name,
        ticket.email,
        ticket.topic,
        ticket.subject,
        ticket.message,
        ticket.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });

    return filtered;
  }, [data.supportTickets, query, topicFilter]);
  const unreadTickets = visibleTickets.filter(isUnreadComplaint);
  const readTickets = visibleTickets.filter((ticket) => !isUnreadComplaint(ticket));
  const activeTickets = viewMode === "read" ? readTickets : unreadTickets;
  const handleMarkRead = async (ticket) => {
    const id = ticket.id || ticket._id;
    if (!id) return;
    setReadingId(id);
    try {
      await markSupportRead(id);
      toast.success("Complaint moved to Read");
    } catch (error) {
      toast.error(error.message || "Unable to mark complaint as read.");
    } finally {
      setReadingId("");
    }
  };

  return (
    <div className="grid gap-5">
      <Panel title="Complaints List" icon={MessageSquare}>
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewMode("unread")}
            className={`inline-flex min-h-[40px] items-center justify-center rounded-full px-5 text-[10px] font-bold uppercase tracking-[0.14em] transition ${viewMode === "unread" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "border border-slate-900/10 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"}`}
          >
            Unread {unreadTickets.length}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("read")}
            className={`inline-flex min-h-[40px] items-center justify-center rounded-full px-5 text-[10px] font-bold uppercase tracking-[0.14em] transition ${viewMode === "read" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "border border-slate-900/10 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"}`}
          >
            Read {readTickets.length}
          </button>
        </div>

        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_240px]">
          <label className="flex min-h-[46px] items-center gap-3 rounded-full border border-slate-900/10 bg-white px-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search complaint, customer, topic"
              className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
          </label>
          <select
            value={topicFilter}
            onChange={(event) => setTopicFilter(event.target.value)}
            className="min-h-[46px] rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-slate-700 outline-none shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">All topics</option>
            <option value="warranty">Warranty</option>
            <option value="report a bug">Report a bug</option>
            <option value="marketplace purchase">Marketplace purchase</option>
            <option value="product information">Product information</option>
            <option value="partnership">Partnership</option>
          </select>
        </div>

        <ComplaintListSection
          title={viewMode === "read" ? "Read" : "Unread"}
          tickets={activeTickets}
          onMarkRead={handleMarkRead}
          onViewImage={setImagePreview}
          readingId={readingId}
        />
      </Panel>
      {imagePreview && <ComplaintImageModal preview={imagePreview} onClose={() => setImagePreview(null)} />}
    </div>
  );
}

function ComplaintListSection({ title, tickets, onMarkRead, onViewImage, readingId }) {
  const unread = title === "Unread";
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{title}</h3>
        <span className="rounded-full bg-slate-950/[0.055] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:bg-white/[0.08] dark:text-slate-300">{tickets.length}</span>
      </div>
      {tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-900/12 bg-slate-950/[0.02] p-5 text-sm font-medium text-slate-500 dark:border-white/10 dark:bg-white/[0.025]">
          No {title.toLowerCase()} complaints.
        </div>
      ) : (
        <div className="grid gap-2">
          {tickets.map((ticket) => (
            <ComplaintListItem
              key={ticket.id || ticket._id}
              ticket={ticket}
              showReadAction={unread}
              onMarkRead={onMarkRead}
              onViewImage={onViewImage}
              readingId={readingId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ComplaintListItem({ ticket, showReadAction, onMarkRead, onViewImage, readingId }) {
  const id = ticket.id || ticket._id;
  const screenshot = bugScreenshot(ticket);
  return (
    <div className="grid gap-3 rounded-xl bg-slate-950/[0.025] p-4 transition hover:bg-slate-950/[0.045] dark:bg-white/[0.025] dark:hover:bg-white/[0.055] md:grid-cols-[1fr_1fr_1fr] md:items-center">
      <div>
        <p className="font-semibold text-slate-950 dark:text-white">{ticket.customer || ticket.name || ticket.email || "Customer"}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">{id || "Complaint"}</p>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{ticketTopic(ticket)}</p>
        <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{ticket.message || ticket.subject || ticket.email || "-"}</p>
      </div>
      <div className="flex items-center justify-between gap-3 md:justify-end">
        <span className="text-xs font-medium text-slate-500">{formatDate(ticket.updatedAt || ticket.createdAt)}</span>
        <StatusPill status={ticket.status || "Open"} />
        {screenshot && (
          <button
            type="button"
            onClick={() => onViewImage({ ticket, attachment: screenshot })}
            className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white dark:hover:text-slate-950"
          >
            <Image className="h-3.5 w-3.5" />
            View image
          </button>
        )}
        {showReadAction && (
          <button
            type="button"
            disabled={readingId === id}
            onClick={() => onMarkRead(ticket)}
            className="inline-flex min-h-[34px] items-center justify-center rounded-full bg-slate-950 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            {readingId === id ? "Saving" : "Read"}
          </button>
        )}
      </div>
    </div>
  );
}

function ComplaintImageModal({ preview, onClose }) {
  const ticket = preview.ticket || {};
  const attachment = preview.attachment || {};
  const imageHref = uploadUrl(attachment.url);
  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-950/42 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl rounded-[1.25rem] border border-white/70 bg-white p-5 shadow-[0_30px_100px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-slate-950">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Bug screenshot</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{ticket.customer || ticket.name || ticket.email || "Customer"}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">{ticket.id || ticket._id} / {attachment.filename || "Uploaded image"}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-slate-900/10 bg-white text-slate-600 transition hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-[1rem] border border-slate-900/8 bg-slate-950/[0.025] p-3 dark:border-white/10 dark:bg-white/[0.035]">
          <img src={imageHref} alt="Bug report screenshot" className="max-h-[74vh] w-full rounded-xl bg-white object-contain dark:bg-slate-900" />
        </div>
      </div>
    </div>
  );
}

function ticketTopic(ticket) {
  return ticket.topic || ticket.subject || "Support";
}

function bugScreenshot(ticket) {
  if (ticketTopic(ticket).toLowerCase() !== "report a bug") return null;
  return (ticket.attachments || []).find((attachment) => {
    const type = String(attachment.type || "").toLowerCase();
    const url = String(attachment.url || "").toLowerCase();
    return type.startsWith("image/") || /\.(png|jpe?g|webp|gif|avif)(?:$|\?)/i.test(url);
  }) || null;
}

function isUnreadComplaint(ticket) {
  const status = String(ticket.status || "Open").toLowerCase();
  return !["read", "replied", "resolved", "closed"].some((value) => status.includes(value));
}

const contactSettingDefaults = {
  mobileNumber: "1234567890",
  phone: "1234567890",
  helpEmail: "support@infibolt.com",
  whatsapp: "https://wa.me/1234567890",
  instagram: "",
  facebook: "",
  x: "",
  youtube: "",
  linkedin: "",
};

function ContactSettingsWorkspace() {
  const settings = useAdminStore((state) => state.settings);
  const loadSettings = useAdminStore((state) => state.loadSettings);
  const updateContactSettings = useAdminStore((state) => state.updateContactSettings);
  const [draft, setDraft] = useState(contactSettingDefaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings.status === "idle") loadSettings();
  }, [loadSettings, settings.status]);

  useEffect(() => {
    setDraft({ ...contactSettingDefaults, ...(settings.data?.contactSettings || {}) });
  }, [settings.data?.contactSettings]);

  const updateField = (field, value) => setDraft((current) => {
    if (field === "mobileNumber") return { ...current, mobileNumber: value, phone: value };
    return { ...current, [field]: value };
  });

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await updateContactSettings(draft);
      setDraft({ ...contactSettingDefaults, ...saved });
      toast.success("Frontend contact settings updated", { description: "Footer and support links now use the latest values." });
    } catch (error) {
      toast.error("Settings update failed", { description: error.message || "Please check the fields and try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="Frontend Contact Settings" icon={Share2}>
      <form onSubmit={save} className="grid gap-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <ContactSettingField icon={Phone} label="Mobile number" type="tel" value={draft.mobileNumber || draft.phone} onChange={(value) => updateField("mobileNumber", value)} placeholder="1234567890" />
          <ContactSettingField icon={Mail} label="Help email" type="email" value={draft.helpEmail} onChange={(value) => updateField("helpEmail", value)} placeholder="support@infibolt.com" />
          <ContactSettingField icon={MessageSquare} label="WhatsApp link" value={draft.whatsapp} onChange={(value) => updateField("whatsapp", value)} placeholder="https://wa.me/1234567890" />
          <ContactSettingField icon={Share2} label="Instagram link" value={draft.instagram} onChange={(value) => updateField("instagram", value)} placeholder="https://instagram.com/infibolt" />
          <ContactSettingField icon={Share2} label="Facebook link" value={draft.facebook} onChange={(value) => updateField("facebook", value)} placeholder="https://facebook.com/infibolt" />
          <ContactSettingField icon={Share2} label="X link" value={draft.x} onChange={(value) => updateField("x", value)} placeholder="https://x.com/infibolt" />
          <ContactSettingField icon={Share2} label="YouTube link" value={draft.youtube} onChange={(value) => updateField("youtube", value)} placeholder="https://youtube.com/@infibolt" />
          <ContactSettingField icon={Share2} label="LinkedIn link" value={draft.linkedin} onChange={(value) => updateField("linkedin", value)} placeholder="https://linkedin.com/company/infibolt" />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-900/8 bg-slate-950/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Published storefront values</p>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
              Phone, help email, WhatsApp, and social links update across the customer footer and support surfaces.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving || settings.status === "loading"}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-slate-950 px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 disabled:opacity-55 dark:bg-white dark:text-slate-950"
          >
            {saving ? "Saving" : "Save Settings"}
          </button>
        </div>
      </form>
    </Panel>
  );
}

function ContactSettingField({ icon: Icon, label, value, onChange, type = "url", placeholder }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</span>
      <span className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-slate-900/10 bg-white px-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type={type}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />
      </span>
    </label>
  );
}

function MarketingWorkspace({ section }) {
  const data = useWorkspaceData();
  if (section === "newsletter") return <NewsletterSubscribersManager subscribers={data.newsletterSubscribers} />;

  return (
    <div className="grid gap-5">
      <ActionStrip title="Marketing workspace" text="Newsletter, launch leads, and campaign capture live here instead of inside product operations." actions={[["Newsletter", "/newsletter"], ["Notify leads", "/notify-leads"]]} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={section === "notifyLeads" ? "Notify Me Leads" : "Campaign Leads"} icon={Megaphone}>
          <DataTable columns={["Product", "Email", "Phone", "Status"]} rows={data.launchLeads.map((lead) => [lead.product || lead.productSlug || "Launch", lead.email || "-", lead.phone || "-", lead.status || "New"])} />
        </Panel>
        <Panel title="Subscriber Health" icon={Mail}>
          <DataTable columns={["Email", "Source", "Status", "Joined"]} rows={data.newsletterSubscribers.map((item) => [item.email, item.source || "Website", item.status || "Subscribed", formatDate(item.createdAt || item.subscribedAt)])} />
        </Panel>
      </div>
    </div>
  );
}

function ContentWorkspace({ section }) {
  const data = useWorkspaceData();
  const contentRows = data.auditLogs.length && section === "seo"
    ? data.auditLogs.slice(0, 8).map((item) => [item.action || "Admin action", item.actorEmail || "System", item.status || "Logged", formatDate(item.createdAt)])
    : cmsBlocks.map((block) => [block.name, block.owner, block.status, block.updated]);
  return (
    <div className="grid gap-5">
      <ActionStrip title="CMS workspace" text="Content is organized by where it appears, so admins can safely update the right screen." actions={[["Homepage", "/cms"], ["SEO", "/seo"], ["Products", "/product-page-cms"]]} />
      <Panel title="Content Blocks" icon={FileText}>
        <DataTable columns={["Block", "Owner", "Status", "Updated"]} rows={contentRows} />
      </Panel>
      <div className="grid gap-5 md:grid-cols-2">
        <FeatureCard title="Homepage" text="Hero, featured products, launch banners, and section order." href="/homepage-sections" />
        <FeatureCard title="Product pages" text="Highlights, specs, media, support details, and recommendations." href="/product-page-cms" />
      </div>
    </div>
  );
}

function OperationsWorkspace({ section }) {
  const data = useWorkspaceData();
  const marketplace = data.products.map((product) => [product.name, product.marketplace?.priority || product.marketplace?.preferred || "Amazon", product.marketplace?.clicks || product.clicks || 0, product.marketplace?.visible === false ? "Paused" : "Live"]);
  return (
    <div className="grid gap-5">
      <MetricGrid />
      {section === "marketplace" ? (
        <Panel title="Marketplace Links" icon={ShoppingBag}>
          <DataTable columns={["Product", "Preferred", "Clicks", "Status"]} rows={marketplace} />
        </Panel>
      ) : (
        <Panel title="Launch Operations" icon={Activity}>
          <DataTable columns={["Product", "SKU", "Stock", "Status"]} rows={data.products.map((product) => [product.name, product.sku || product.slug, product.stock ?? "Track", product.status || "Draft"])} />
        </Panel>
      )}
    </div>
  );
}

function SystemWorkspace({ section }) {
  const data = useWorkspaceData();
  const securityRows = [
    ["Helmet + CSP", "Enabled", "Strict headers and framing protection"],
    ["CSRF", "Enabled", "Token required for API writes"],
    ["Rate limits", "Enabled", "Auth, uploads, and API limits"],
    ["Audit logs", "Enabled", "Sensitive admin actions recorded"],
  ];
  return (
    <div className="grid gap-5">
      <ActionStrip title="System controls" text="Security, audit, admin-user, and settings controls are isolated from daily commerce work." actions={[["Security", "/security"], ["Audit", "/audit-logs"], ["Settings", "/settings"]]} />
      <Panel title={section === "auditLogs" ? "Audit Logs" : "Security Posture"} icon={LockKeyhole}>
        {section === "auditLogs" && data.auditLogs.length ? (
          <DataTable columns={["Action", "Actor", "IP", "Updated"]} rows={data.auditLogs.map((item) => [item.action || "Admin action", item.actorEmail || item.actorId || "System", item.ip || "-", formatDate(item.createdAt)])} />
        ) : (
          <DataTable columns={["Control", "State", "Purpose"]} rows={securityRows} />
        )}
      </Panel>
      <div className="grid gap-5 md:grid-cols-2">
        <FeatureCard title="RBAC" text="One admin role gates protected operations." href="/admin-users" />
        <FeatureCard title="Index control" text="Admin, private profiles, warranty, support, and APIs are noindex." href="/security" />
      </div>
    </div>
  );
}

function HeroPlanner({ section }) {
  const data = useWorkspaceData();
  const loadProducts = useAdminStore((state) => state.loadProducts);
  const loadCategories = useAdminStore((state) => state.loadCategories);
  const [savingKey, setSavingKey] = useState("");
  const menuCategories = data.categories
    .filter((category) => category.desktopMenuVisible === true)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name).localeCompare(String(b.name)));
  const menuProducts = data.products
    .filter((product) => product.desktopMenuFeatured === true)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name).localeCompare(String(b.name)));
  const maxMenuCategories = 4;
  const maxMenuProducts = 4;
  const savingLabel = savingKey.startsWith("category-") ? "Updating menu category" : savingKey.startsWith("product-") ? "Updating product card" : "Saving change";

  const toggleMenuCategory = async (category) => {
    const id = category.id || category.slug;
    const nextVisible = category.desktopMenuVisible !== true;
    if (nextVisible && menuCategories.length >= maxMenuCategories) {
      toast.error("Category menu limit reached", { description: `Choose up to ${maxMenuCategories} categories for the desktop hover menu.` });
      return;
    }
    setSavingKey(`category-${id}`);
    try {
      await productService.updateCategory(id, {
        desktopMenuVisible: nextVisible,
        sortOrder: category.sortOrder ?? menuCategories.length + 1,
      });
      await loadCategories();
      toast.success(nextVisible ? "Category added to menu" : "Category removed from menu", { description: category.name });
    } catch (error) {
      toast.error("Category menu update failed", { description: error.message || "Please try again." });
    } finally {
      setSavingKey("");
    }
  };

  const toggleMenuProduct = async (product) => {
    const nextEnabled = product.desktopMenuFeatured !== true;
    if (nextEnabled && menuProducts.length >= maxMenuProducts) {
      toast.error("Featured product limit reached", { description: `Choose up to ${maxMenuProducts} products for the desktop hover menu.` });
      return;
    }
    setSavingKey(`product-${product.slug}`);
    try {
      await productService.update(product.slug, { desktopMenuFeatured: nextEnabled });
      await loadProducts();
      toast.success(nextEnabled ? "Product added to menu" : "Product removed from menu", { description: product.name });
    } catch (error) {
      toast.error("Product menu update failed", { description: error.message || "Please try again." });
    } finally {
      setSavingKey("");
    }
  };

  if (section === "homepageSections") {
    return <HomepageSectionsManager data={data} />;
  }

  return (
    <div className="grid gap-5">
      {savingKey && <BlockingSaveOverlay label={savingLabel} />}
      <Panel title="Desktop Products Hover Menu" icon={Image}>
        <div className="mb-5 rounded-2xl border border-slate-900/8 bg-slate-950/[0.025] p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
          Controls only the desktop hover panel under Products. Mobile navigation stays compact. Use up to {maxMenuCategories} categories and {maxMenuProducts} featured product cards.
        </div>
        <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Menu categories</p>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-slate-950">
                {menuCategories.length}/{maxMenuCategories}
              </span>
            </div>
            <div className="grid gap-2">
              {data.categories.map((category) => {
                const id = category.id || category.slug;
                const active = category.desktopMenuVisible === true;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={Boolean(savingKey)}
                    onClick={() => toggleMenuCategory(category)}
                    className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition disabled:opacity-55 ${
                      active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100"
                        : "border-slate-900/8 bg-white/60 text-slate-700 hover:border-slate-900/16 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{category.name}</span>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{category.description || category.slug || id}</span>
                    </span>
                    <span className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
                      active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}>
                      <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-5" : "translate-x-0"}`} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Future product cards</p>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-slate-950">
                {menuProducts.length}/{maxMenuProducts}
              </span>
            </div>
            <div className="grid gap-2">
              {data.products.map((product) => {
                const active = product.desktopMenuFeatured === true;
                return (
                  <button
                    key={product.slug}
                    type="button"
                    disabled={Boolean(savingKey)}
                    onClick={() => toggleMenuProduct(product)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition disabled:opacity-55 ${
                      active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100"
                        : "border-slate-900/8 bg-white/60 text-slate-700 hover:border-slate-900/16 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <ProductThumb product={product} className="h-12 w-12 rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{product.name}</span>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{product.badge || product.status || "Product"}</span>
                    </span>
                    <span className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
                      active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}>
                      <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-5" : "translate-x-0"}`} />
                    </span>
                  </button>
                );
              })}
            </div>
            {menuProducts.length > 0 && (
              <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Current desktop cards: <span className="font-semibold text-slate-800 dark:text-slate-200">{menuProducts.map((product) => product.name).join(", ")}</span>
              </p>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

const categorySectionDefaults = {
  key: "home-categories",
  title: "Instruments of",
  subtitle: "Clarity",
  type: "categories",
  enabled: true,
  sortOrder: 2,
  categorySlugs: [],
  settings: {
    kicker: "",
    titleLine1: "Instruments of",
    titleAccent: "Clarity",
  },
};

const featuredSectionDefaults = {
  key: "home-featured",
  title: "Engineered for",
  subtitle: "modern silence.",
  type: "products",
  enabled: true,
  sortOrder: 3,
  productSlugs: [],
  settings: {
    kicker: "Signature Objects",
    titleLine1: "Engineered for",
    titleAccent: "modern silence.",
  },
};

function HomepageSectionsManager({ data }) {
  const loadHomepageSections = useAdminStore((state) => state.loadHomepageSections);
  const [categoryDraft, setCategoryDraft] = useState(() => homepageCategoryDraft(data));
  const [featuredDraft, setFeaturedDraft] = useState(() => homepageProductDraft(data));
  const [saving, setSaving] = useState("");
  const [savedSection, setSavedSection] = useState("");

  useEffect(() => {
    setCategoryDraft(homepageCategoryDraft(data));
    setFeaturedDraft(homepageProductDraft(data));
  }, [data]);

  const saveSection = async (key, draft) => {
    setSaving(key);
    setSavedSection("");
    try {
      await productService.saveHomepageSection(cleanHomepageSection(draft));
      await loadHomepageSections();
      setSavedSection(key);
      toast.success("Homepage placement updated", { description: key === "home-categories" ? "Focus categories are ready." : "Focus products are ready." });
      window.setTimeout(() => setSavedSection((current) => (current === key ? "" : current)), 2800);
    } catch (error) {
      toast.error("Homepage section update failed", { description: error.message || "Please check the fields and try again." });
    } finally {
      setSaving("");
    }
  };

  const selectedCategories = new Set(categoryDraft.categorySlugs || []);
  const toggleCategory = (category) => {
    const slug = category.slug || category.id;
    setCategoryDraft((current) => {
      const next = new Set(current.categorySlugs || []);
      if (next.has(slug)) next.delete(slug);
      else if (next.size >= 4) {
        toast.error("Category limit reached", { description: "Homepage can show up to 4 focus categories." });
        return current;
      } else next.add(slug);
      return { ...current, categorySlugs: [...next] };
    });
  };
  const selectedProducts = new Set(featuredDraft.productSlugs || []);
  const focusProducts = data.products.filter((product) => product.slug);
  const toggleFeaturedProduct = (product) => {
    setFeaturedDraft((current) => {
      const next = new Set(current.productSlugs || []);
      if (next.has(product.slug)) next.delete(product.slug);
      else if (next.size >= 4) {
        toast.error("Featured product limit reached", { description: "Homepage can show up to 4 focus products." });
        return current;
      } else next.add(product.slug);
      return { ...current, productSlugs: [...next] };
    });
  };

  return (
    <div className="grid gap-5">
      <Panel title="Focus Categories" icon={Grid3X3}>
        <div className="mb-5 rounded-2xl border border-slate-900/8 bg-slate-950/[0.025] p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
          Select the product families that appear on the homepage. Keep this controlled and premium: maximum 4 categories.
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {data.categories.map((category) => {
            const slug = category.slug || category.id;
            const active = selectedCategories.has(slug);
            return (
              <button
                key={slug}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`flex min-h-[74px] items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100"
                    : "border-slate-900/8 bg-white/60 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{category.name}</span>
                  <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">{category.description || slug}</span>
                </span>
                <SwitchVisual active={active} />
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold text-slate-500">
            {selectedCategories.size}/4 categories selected
            {savedSection === "home-categories" && <span className="ml-3 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Saved</span>}
          </p>
          <button type="button" disabled={saving === "home-categories"} onClick={() => saveSection("home-categories", categoryDraft)} className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-950 px-6 text-[11px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-55 dark:bg-white dark:text-slate-950">
            {saving === "home-categories" ? "Saving..." : "Save Focus Categories"}
          </button>
        </div>
      </Panel>

      <Panel title="Focus Products" icon={Package}>
        <div className="mb-5 rounded-2xl border border-slate-900/8 bg-slate-950/[0.025] p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
          Select the product cards displayed under the homepage category section. Maximum 4 products.
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {focusProducts.map((product) => {
            const active = selectedProducts.has(product.slug);
            return (
              <button
                key={product.slug}
                type="button"
                onClick={() => toggleFeaturedProduct(product)}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100"
                    : "border-slate-900/8 bg-white/60 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300"
                }`}
              >
                <ProductThumb product={product} className="h-14 w-14 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{product.name}</span>
                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{product.status || "Product"} / {formatPrice(product.price || 0)}</span>
                </span>
                <SwitchVisual active={active} />
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold text-slate-500">
            {selectedProducts.size}/4 products selected
            {savedSection === "home-featured" && <span className="ml-3 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Saved</span>}
          </p>
          <button type="button" disabled={saving === "home-featured"} onClick={() => saveSection("home-featured", featuredDraft)} className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-slate-950 px-6 text-[11px] font-bold uppercase tracking-[0.16em] text-white disabled:opacity-55 dark:bg-white dark:text-slate-950">
            {saving === "home-featured" ? "Saving..." : "Save Focus Products"}
          </button>
        </div>
      </Panel>
    </div>
  );
}

function SwitchVisual({ active }) {
  return (
    <span className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${active ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}>
      <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-5" : "translate-x-0"}`} />
    </span>
  );
}

function BlockingSaveOverlay({ label }) {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-slate-950/18 backdrop-blur-[2px]" aria-live="assertive" aria-busy="true">
      <div className="flex min-w-[250px] flex-col items-center gap-4 rounded-[1.25rem] border border-white/70 bg-white/92 px-8 py-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/92">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950 dark:border-white/20 dark:border-t-white" />
        <span>
          <span className="block text-sm font-semibold text-slate-950 dark:text-white">{label}</span>
          <span className="mt-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Please wait until the action is confirmed.</span>
        </span>
      </div>
    </div>
  );
}

function ProductThumb({ product, className = "" }) {
  const [failed, setFailed] = useState(false);
  const source = productMediaSrc(product.thumbnail || product.coverImage || product.image);
  if (!source || failed) {
    return (
      <span className={`grid shrink-0 place-items-center bg-slate-100 text-slate-400 dark:bg-white/10 ${className}`}>
        <Package className="h-5 w-5" />
      </span>
    );
  }
  return <img src={source} alt="" onError={() => setFailed(true)} className={`shrink-0 object-cover ${className}`} loading="lazy" decoding="async" />;
}

function mergeSectionDraft(sections, defaults) {
  const saved = sections.find((section) => section.key === defaults.key) || {};
  return {
    ...defaults,
    ...saved,
    settings: { ...defaults.settings, ...plainSettings(saved.settings) },
    categorySlugs: saved.categorySlugs || defaults.categorySlugs || [],
    productSlugs: saved.productSlugs || defaults.productSlugs || [],
  };
}

function homepageCategoryDraft(data) {
  const draft = mergeSectionDraft(data.homepageSections, categorySectionDefaults);
  if (draft.categorySlugs.length) return { ...draft, categorySlugs: draft.categorySlugs.slice(0, 4) };
  return { ...draft, categorySlugs: data.categories.slice(0, 4).map((category) => category.slug || category.id).filter(Boolean) };
}

function homepageProductDraft(data) {
  const draft = mergeSectionDraft(data.homepageSections, featuredSectionDefaults);
  const focusProducts = data.products.filter((product) => product.slug);
  const focusSlugs = new Set(focusProducts.map((product) => product.slug));
  const savedSlugs = (draft.productSlugs || []).filter((slug) => focusSlugs.has(slug)).slice(0, 4);
  if (savedSlugs.length) return { ...draft, productSlugs: savedSlugs };
  return { ...draft, productSlugs: focusProducts.slice(0, 4).map((product) => product.slug).filter(Boolean) };
}

function productMediaSrc(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("/images/")) return path;
  return uploadUrl(path);
}

function plainSettings(settings) {
  if (!settings) return {};
  if (settings instanceof Map) return Object.fromEntries(settings);
  return typeof settings === "object" ? settings : {};
}

function cleanHomepageSection(draft) {
  return {
    key: draft.key,
    title: draft.settings?.titleLine1 || draft.title,
    subtitle: draft.subtitle || draft.settings?.titleAccent || "",
    type: draft.type,
    enabled: draft.enabled !== false,
    sortOrder: draft.sortOrder || 0,
    categorySlugs: (draft.categorySlugs || []).slice(0, 4),
    productSlugs: (draft.productSlugs || []).slice(0, 4),
    settings: draft.settings || {},
  };
}

function MetricGrid() {
  const data = useWorkspaceData();
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.stats.map((stat) => (
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

function csvCell(value) {
  const normalized = value === undefined || value === null ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function downloadTextFile(filename, content, type) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
        <p className="font-semibold">{ticket.customer || ticket.name || ticket.email || "Customer"}</p>
        <StatusPill status={ticket.status || "Open"} />
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{ticket.id || ticket._id} · {ticket.topic || ticket.subject || "Support"} · {ticket.channel || "Email"}</p>
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

function categoryName(id, categoryList = categories) {
  return categoryList.find((category) => category.id === id || category.slug === id)?.name || id || "Product";
}

function formatDate(value) {
  return formatIndiaDateTime(value);
}

export const adminNav = allNavItems;
export { navGroups };
