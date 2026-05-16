import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Heart,
  Lock,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  TicketCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "../../ThemeToggle";
import {
  categories,
  collections,
  faqs,
  formatPrice,
  getCategoryById,
  platformStatus,
  products,
} from "../../data/commerce";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "Warranty", href: "/warranty" },
  { label: "Support", href: "/support" },
];

const sectionReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-8 w-8 rounded-full border border-slate-900/20 bg-slate-900/5 backdrop-blur-sm md:block dark:border-white/20 dark:bg-white/10"
      style={{ x: cursorXSpring, y: cursorYSpring }}
    >
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900 dark:bg-white" />
    </motion.div>
  );
}

export function CommerceShell({ children, eyebrow = "Simpcraftt Commerce", title, description }) {
  const [open, setOpen] = useState(false);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <div className="min-h-screen font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
      <CustomCursor />
      {/* Cinematic Atmospheric Background */}
      <motion.div style={{ y: bgY }} className="fixed inset-0 pointer-events-none mix-blend-normal z-[-1]">
        <div className="absolute inset-0 bg-surface dark:bg-surface-dark transition-colors duration-1000" />
      </motion.div>

      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-surface/80 backdrop-blur-md transition-colors duration-700 dark:border-white/[0.03] dark:bg-surface-dark/80">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-12">
          <a href="/" className="flex items-center gap-3 group">
            <span className="flex h-8 w-8 items-center justify-center bg-slate-900 text-[13px] font-medium text-white transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 shadow-sm dark:bg-white dark:text-slate-900">
              S
            </span>
            <span className="text-lg font-medium tracking-tight text-slate-900 dark:text-white uppercase tracking-widest">Simpcraftt</span>
          </a>

          <nav className="hidden items-center gap-10 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`relative text-sm font-medium tracking-wide transition-colors duration-300 ${
                  pathname === item.href
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-0 right-0 h-[2px] rounded-full bg-slate-900 dark:bg-white" />
                )}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <IconLink href="/wishlist" label="Wishlist">
              <Heart className="h-4 w-4" />
            </IconLink>
            <IconLink href="/cart" label="Cart">
              <ShoppingBag className="h-4 w-4" />
            </IconLink>
            <IconLink href="/profile" label="Profile">
              <User className="h-4 w-4" />
            </IconLink>
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-900/10 bg-transparent md:hidden dark:border-white/10 text-slate-900 dark:text-white"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-900/5 px-6 md:hidden dark:border-white/5"
            >
              <div className="grid gap-2 py-4">
                {[...navItems, { label: "Cart", href: "/cart" }, { label: "Profile", href: "/profile" }].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-4 py-4 text-sm font-medium tracking-wide ${
                      pathname === item.href ? "bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white" : "hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {title && <PageHero eyebrow={eyebrow} title={title} description={description} />}
      <main className="relative z-10">{children}</main>
      <CommerceFooter />
    </div>
  );
}

function IconLink({ href, label, children }) {
  return (
    <a href={href} aria-label={label} title={label} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all duration-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">
      {children}
    </a>
  );
}

export function PageHero({ eyebrow, title, description, action }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative z-10 flex min-h-[50vh] flex-col justify-end overflow-hidden px-6 pb-24 pt-40 md:min-h-[60vh] md:px-12 lg:px-24">
      <motion.div style={{ y, opacity }} className="mx-auto w-full max-w-[1400px]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} className="max-w-5xl">
          <p className="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{eyebrow}</p>
          <h1 className="text-6xl font-normal leading-[1.0] tracking-tighter text-slate-900 sm:text-7xl md:text-8xl lg:text-[7rem] dark:text-white">
            {title}
          </h1>
          {description && <p className="mt-8 max-w-2xl text-xl font-light leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
          {action && <div className="mt-16 flex flex-wrap items-center gap-6">{action}</div>}
        </motion.div>
      </motion.div>
    </section>
  );
}

export function PrimaryButton({ href, children, disabled = false, external = false }) {
  const className =
    "group relative inline-flex min-h-[48px] items-center justify-center gap-3 overflow-hidden bg-slate-900 px-8 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-all duration-500 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100";

  if (disabled) {
    return (
      <button type="button" disabled className={className}>
        {children}
      </button>
    );
  }

  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={className}>
      {children}
    </a>
  );
}

export function SecondaryButton({ href, children, external = false }) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="group relative inline-flex min-h-[48px] items-center justify-center gap-3 border border-slate-900/20 bg-transparent px-8 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-900 transition-all duration-500 hover:bg-slate-900/5 disabled:pointer-events-none disabled:opacity-50 dark:border-white/20 dark:text-white dark:hover:bg-white/5 sm:w-auto">
      {children}
    </a>
  );
}

function SubmitButton({ children }) {
  return (
    <button type="submit" className="group relative inline-flex min-h-[48px] items-center justify-center gap-3 overflow-hidden bg-slate-900 px-8 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-all duration-500 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
      {children}
    </button>
  );
}

export function ProductGrid({ items = products, columns = "default" }) {
  const columnClass = columns === "featured" ? "lg:grid-cols-2" : "lg:grid-cols-3";
  return (
    <div className={`grid gap-6 sm:grid-cols-2 ${columnClass}`}>
      {items.map((product, index) => (
        <ProductCard key={product.slug} product={product} index={index} />
      ))}
    </div>
  );
}

export function ProductCard({ product, index = 0 }) {
  const category = getCategoryById(product.category);

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      variants={sectionReveal}
      custom={index}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative flex flex-col overflow-hidden bg-slate-50 p-2 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] dark:bg-white/[0.02] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_24px_48px_rgba(0,0,0,0.4)] border border-white/60 dark:border-white/5"
    >
      <a href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-slate-100 dark:bg-slate-800/50">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 z-10" />
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
          <div className="pointer-events-none absolute inset-0 z-20 rounded-[1.5rem] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
        </div>
        <div className="flex flex-col p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {category?.name}
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{product.rating} / 5</span>
          </div>
          <h3 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">{product.name}</h3>
          <p className="mt-3 min-h-[4rem] text-sm leading-relaxed text-slate-600 dark:text-slate-400">{product.summary}</p>
          <div className="mt-8 flex items-center justify-between">
            <span className="text-lg font-medium text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-transform duration-500 group-hover:translate-x-1 text-slate-900 dark:text-white">
              View <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}

export function ProductFilters({ selectedCategory, onCategoryChange, query, onQueryChange, sort, onSortChange }) {
  return (
    <div className="mb-10 bg-slate-50 p-4 sm:p-6 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <label className="flex items-center gap-3 rounded-full border border-slate-900/10 bg-transparent px-5 py-4 dark:border-white/10">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm font-medium placeholder:text-slate-400 focus:outline-none dark:text-white" />
        </label>
        <label className="flex items-center gap-3 rounded-full border border-slate-900/10 bg-transparent px-5 py-4 dark:border-white/10">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <select value={selectedCategory} onChange={(event) => onCategoryChange(event.target.value)} className="bg-transparent text-sm font-medium focus:outline-none dark:text-white">
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <select value={sort} onChange={(event) => onSortChange(event.target.value)} className="rounded-full border border-slate-900/10 bg-transparent px-5 py-4 text-sm font-medium focus:outline-none dark:border-white/10 dark:text-white">
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to high</option>
          <option value="price-high">Price: High to low</option>
          <option value="rating">Rating</option>
        </select>
      </div>
    </div>
  );
}

export function FutureCommerceNotice({ title = "Direct purchase launching soon" }) {
  return (
    <div className="rounded-[1.5rem] border border-amber-500/30 bg-amber-400/10 p-6 text-amber-900 dark:text-amber-100 backdrop-blur-md">
      <div className="flex items-start gap-4">
        <Lock className="mt-1 h-5 w-5" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed opacity-85">
            Cart, checkout, payments, coupons, orders, and address management are designed into the platform but disabled for public users in this launch phase.
          </p>
        </div>
      </div>
    </div>
  );
}

export function BuyPanel({ product }) {
  return (
    <div className="bg-slate-50 p-6 sm:p-8 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Marketplace launch</p>
          <p className="mt-2 text-3xl font-medium tracking-tight text-slate-900 dark:text-white">{formatPrice(product.price)}</p>
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-900/10 bg-transparent text-slate-600 transition-all hover:bg-slate-900/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10" aria-label="Add to wishlist">
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Choose your preferred marketplace channel while direct checkout is being prepared.</p>
      <div className="mt-8 grid gap-4">
        <SecondaryButton href={product.marketplace.amazon} external>Buy on Amazon</SecondaryButton>
        <SecondaryButton href={product.marketplace.flipkart} external>Buy on Flipkart</SecondaryButton>
        <PrimaryButton href={product.marketplace.custom} external>Buy Now</PrimaryButton>
      </div>
    </div>
  );
}

export function ProductGallery({ product }) {
  const [active, setActive] = useState(product.gallery?.[0] ?? product.image);

  return (
    <div>
      <div className="aspect-[5/4] overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
        <img src={active} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-4">
        {(product.gallery ?? [product.image]).map((image) => (
          <button key={image} type="button" onClick={() => setActive(image)} className={`aspect-square overflow-hidden rounded-2xl border transition-all duration-300 ${active === image ? "border-slate-900 dark:border-white" : "border-transparent hover:border-slate-900/20 dark:hover:border-white/20"}`}>
            <img src={image} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function EcommerceStepper({ current = 0 }) {
  const steps = [
    { label: "Cart", icon: ShoppingBag },
    { label: "Address", icon: PackageCheck },
    { label: "Payment", icon: CreditCard },
    { label: "Order", icon: TicketCheck },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= current;
        return (
          <div key={step.label} className={`rounded-[1.5rem] border p-6 ${isActive ? "border-slate-900/20 bg-white/60 dark:border-white/20 dark:bg-white/10" : "border-white/60 bg-white/40 dark:border-white/5 dark:bg-white/[0.02]"} backdrop-blur-md`}>
            <Icon className="mb-3 h-5 w-5" />
            <p className="text-xs font-semibold uppercase tracking-wider">{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export function AccountShell({ title, description, children }) {
  return (
    <CommerceShell eyebrow="Account" title={title} description={description}>
      <section className="px-4 pb-24 sm:px-5">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="bg-slate-50 p-6 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
            {["Profile", "Addresses", "Orders", "Wishlist", "Registered Products"].map((item) => (
              <a key={item} href={item === "Profile" ? "/profile" : "#"} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">
                {item}
              </a>
            ))}
          </aside>
          <div>{children}</div>
        </div>
      </section>
    </CommerceShell>
  );
}

export function AdminPanelPreview() {
  const capabilities = [
    "Add, edit, delete products",
    "Upload and organize product images",
    "Manage categories and visibility",
    "Update Amazon and Flipkart URLs per product",
    "Review warranty claims and support tickets",
    "Manage users, banners, and product content",
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {capabilities.map((capability) => (
        <div key={capability} className="bg-slate-50 p-6 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
          <BadgeCheck className="mb-4 h-5 w-5 text-slate-900 dark:text-white" />
          <p className="text-sm font-medium leading-relaxed">{capability}</p>
        </div>
      ))}
    </div>
  );
}

export function WarrantyForm() {
  const [ticket, setTicket] = useState("");

  const submitWarranty = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const res = await fetch("/api/warranty-claims", { method: "POST", body: formData });
    const data = await res.json();
    setTicket(data.ticketId ?? "SCW-PENDING");
    form.reset();
  };

  return (
    <form onSubmit={submitWarranty} className="grid gap-5 bg-slate-50 p-6 sm:p-10 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
      <div className="grid gap-5 md:grid-cols-3">
        <Field name="name" label="Full name" required />
        <Field name="email" type="email" label="Email" required />
        <Field name="phone" label="Phone" required />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Select name="productSlug" label="Product" options={products.map((product) => [product.slug, product.name])} />
        <Field name="serialNumber" label="Serial number" required />
        <Field name="purchaseDate" label="Purchase date" type="date" required />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Field name="invoiceNumber" label="Invoice number" required />
        <Field name="dealer" label="Dealer / store" required />
        <Field name="pincode" label="Pincode" required />
      </div>
      <Field name="address" label="Address" required />
      <Field name="invoice" label="Invoice upload" type="file" required />
      <label className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400 py-4">
        <input type="checkbox" required className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
        I confirm that the provided details are accurate.
      </label>
      <SubmitButton>Submit Warranty Claim</SubmitButton>
      {ticket && (
        <div className="rounded-xl bg-slate-900/5 p-5 text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-white">
          Claim submitted. Ticket ID: {ticket}
        </div>
      )}
    </form>
  );
}

export function SupportForm() {
  const [ticket, setTicket] = useState("");

  const submitSupport = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/support-tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setTicket(data.ticketId ?? "SCS-PENDING");
    form.reset();
  };

  return (
    <form onSubmit={submitSupport} className="grid gap-6 bg-slate-50 p-6 sm:p-10 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
      <div className="grid gap-6 md:grid-cols-2">
        <Field name="name" label="Full name" required />
        <Field name="email" type="email" label="Email" required />
      </div>
      <Select name="topic" label="Topic" options={[["marketplace", "Marketplace purchase"], ["warranty", "Warranty"], ["product", "Product information"], ["partnership", "Partnership"]]} />
      <Field name="message" label="Message" textarea required />
      <SubmitButton>Create Support Ticket</SubmitButton>
      {ticket && (
        <div className="rounded-xl bg-slate-900/5 p-5 text-sm font-medium text-slate-900 dark:bg-white/10 dark:text-white">
          Support ticket created: {ticket}
        </div>
      )}
    </form>
  );
}

function Field({ label, name, type = "text", textarea = false, required = false }) {
  const className = "w-full rounded-xl border border-slate-900/10 bg-transparent px-5 py-4 text-sm font-medium focus:border-slate-900 focus:outline-none dark:border-white/10 dark:text-white dark:focus:border-white transition-colors";
  return (
    <label className="grid gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</span>
      {textarea ? <textarea name={name} required={required} rows={5} className={className} /> : <input name={name} type={type} required={required} className={className} />}
    </label>
  );
}

function Select({ label, name, options }) {
  return (
    <label className="grid gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</span>
      <select name={name} className="w-full rounded-xl border border-slate-900/10 bg-transparent px-5 py-4 text-sm font-medium focus:border-slate-900 focus:outline-none dark:border-white/10 dark:text-white dark:focus:border-white transition-colors">
        {options.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </label>
  );
}

export function FAQList() {
  return (
    <div className="flex flex-col border-t border-slate-200 dark:border-white/10">
      {faqs.map((faq) => (
        <details key={faq.question} className="group border-b border-slate-200 py-8 dark:border-white/10">
          <summary className="cursor-pointer list-none text-xl font-normal tracking-tight text-slate-900 transition-colors group-open:text-slate-500 dark:text-white dark:group-open:text-slate-400 flex items-center justify-between">
            {faq.question}
            <span className="ml-6 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-transform duration-500 group-open:rotate-45 dark:border-white/10">
              +
            </span>
          </summary>
          <p className="mt-6 text-base font-light leading-relaxed text-slate-600 dark:text-slate-400 pr-12">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function FeatureBand() {
  const features = [
    { icon: ShieldCheck, title: "Warranty-ready", text: "Registration, claims, serial details, invoice upload, and ticket tracking." },
    { icon: Sparkles, title: "Marketplace-first", text: "Every product supports editable Amazon, Flipkart, and custom purchase links." },
    { icon: ShoppingBag, title: "Commerce-ready", text: "Cart, checkout, coupons, payments, and orders are modeled for future activation." },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={sectionReveal}
            custom={index}
            className="bg-slate-50 p-8 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10"
          >
            <Icon className="mb-6 h-6 w-6 text-slate-900 dark:text-white" />
            <h3 className="text-xl font-medium tracking-tight text-slate-900 dark:text-white">{feature.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{feature.text}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

export function CollectionGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {collections.map((collection) => (
        <a key={collection.slug} href={`/products?collection=${collection.slug}`} className="group relative flex flex-col justify-between overflow-hidden bg-slate-50 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] dark:bg-white/[0.02] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_24px_48px_rgba(0,0,0,0.4)] border border-white/60 dark:border-white/5 min-h-[300px]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{collection.productSlugs.length} products</p>
            <h3 className="mt-5 text-3xl font-medium tracking-tight text-slate-900 dark:text-white">{collection.name}</h3>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{collection.description}</p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-transform duration-500 group-hover:translate-x-1 text-slate-900 dark:text-white">
            Explore <ArrowRight className="h-4 w-4" />
          </div>
        </a>
      ))}
    </div>
  );
}

export function useFilteredProducts() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("featured");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const categoryMatches = selectedCategory === "all" || product.category === selectedCategory;
      const textMatches = !normalizedQuery || `${product.name} ${product.summary} ${product.features.join(" ")}`.toLowerCase().includes(normalizedQuery);
      return categoryMatches && textMatches;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [query, selectedCategory, sort]);

  return { filteredProducts, query, setQuery, selectedCategory, setSelectedCategory, sort, setSort };
}

function CommerceFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-slate-900/5 px-6 py-20 dark:border-white/5 md:px-12 lg:px-24">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white">
            Simpcraftt
          </p>

          <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            A premium product ecosystem moving from marketplace-first
            launches into full direct commerce.
          </p>
        </div>

        <FooterColumn
          title="Shop"
          links={[
            ["Products", "/products"],
            ["Collections", "/collections"],
            ["Cart", "/cart"],
            ["Checkout", "/checkout"],
          ]}
        />

        <FooterColumn
          title="Care"
          links={[
            ["Warranty", "/warranty"],
            ["Support", "/support"],
            ["FAQ", "/faq"],
            ["Contact", "/contact"],
          ]}
        />

        <FooterColumn
          title="Company"
          links={[
            ["About", "/about"],
            ["Privacy", "/privacy-policy"],
            ["Terms", "/terms-conditions"],
            ["Admin", "/admin"],
          ]}
        />
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="text-sm text-slate-600 transition-colors duration-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}