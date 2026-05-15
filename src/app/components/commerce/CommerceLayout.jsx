import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Heart,
  Home,
  Lock,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  TicketCheck,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
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

const bottomNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/products", icon: Search },
  { label: "Care", href: "/warranty", icon: ShieldCheck },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Account", href: "/profile", icon: User },
];

export function CommerceShell({ children, eyebrow = "Simpcraftt Commerce", title, description }) {
  return (
    <div className="min-h-screen bg-[#f6f7f4] pb-20 text-[#111714] transition-colors dark:bg-[#050607] dark:text-white md:pb-0">
      <div className="fixed inset-0 pointer-events-none opacity-70">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(17,23,20,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(17,23,20,0.06)_1px,transparent_1px)] bg-[size:42px_42px] dark:bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f7f4]/88 backdrop-blur-2xl dark:border-white/10 dark:bg-[#050607]/88">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-5 md:py-4">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111714] text-base font-black italic text-white dark:bg-white dark:text-[#111714] md:h-10 md:w-10 md:text-lg">
              S
            </span>
            <span className="luxury-brand text-base tracking-[0.08em] md:text-lg">Simpcraftt</span>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-xs font-black uppercase tracking-[0.16em] text-black/60 transition hover:text-black dark:text-white/60 dark:hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
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

          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {title && <PageHero eyebrow={eyebrow} title={title} description={description} />}
      <main className="relative z-10">{children}</main>
      <CommerceFooter />
      <MobileBottomNav />
    </div>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-black/10 bg-white/90 p-1.5 shadow-[0_20px_70px_rgba(17,23,20,0.22)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#080a0b]/90 md:hidden">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <a key={item.href} href={item.href} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-black text-black/62 transition active:scale-95 dark:text-white/62">
            <Icon className="h-4 w-4" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

function IconLink({ href, label, children }) {
  return (
    <a href={href} aria-label={label} title={label} className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white/65 text-black transition hover:bg-black hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white dark:hover:text-black">
      {children}
    </a>
  );
}

export function PageHero({ eyebrow, title, description, action }) {
  return (
    <section className="relative z-10 overflow-hidden px-4 pb-10 pt-10 md:px-5 md:pb-16 md:pt-24">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="max-w-4xl">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300 md:text-xs">{eyebrow}</p>
          <h1 className="luxury-heading text-4xl md:text-7xl lg:text-8xl">{title}</h1>
          {description && <p className="mt-5 max-w-2xl text-base leading-7 text-black/64 dark:text-white/64 md:mt-7 md:text-lg md:leading-8">{description}</p>}
          {action && <div className="mt-7 md:mt-9">{action}</div>}
        </motion.div>
      </div>
    </section>
  );
}

export function PrimaryButton({ href, children, disabled = false, external = false }) {
  const className =
    "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#111714] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90 sm:w-auto md:tracking-[0.14em]";

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
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-black/15 bg-white/70 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:-translate-y-0.5 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-auto md:tracking-[0.14em]">
      {children}
    </a>
  );
}

function SubmitButton({ children }) {
  return (
    <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#111714] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-white/90">
      {children}
    </button>
  );
}

export function ProductGrid({ items = products }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      className="group overflow-hidden rounded-2xl border border-black/10 bg-white/78 shadow-[0_20px_60px_rgba(17,23,20,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] md:rounded-lg"
    >
      <a href={`/products/${product.slug}`} className="block">
        <div className="aspect-[1.05/1] overflow-hidden bg-black/5 sm:aspect-[4/3]">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
        <div className="p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
              {category?.name}
            </span>
            <span className="text-xs font-bold text-black/50 dark:text-white/50">{product.rating} / 5</span>
          </div>
          <h3 className="text-xl font-black tracking-tight md:text-2xl">{product.name}</h3>
          <p className="mt-3 text-sm leading-6 text-black/62 dark:text-white/62 md:min-h-16">{product.summary}</p>
          <div className="mt-5 flex items-center justify-between">
            <span className="font-black">{formatPrice(product.price)}</span>
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em]">
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
    <div className="mb-6 grid gap-3 rounded-2xl border border-black/10 bg-white/78 p-3 shadow-[0_20px_60px_rgba(17,23,20,0.08)] backdrop-blur-xl md:mb-8 md:grid-cols-[1fr_auto_auto] md:rounded-lg dark:border-white/10 dark:bg-white/[0.045]">
      <label className="flex min-h-12 items-center gap-3 rounded-xl bg-black/[0.035] px-4 py-3 dark:bg-white/[0.05] md:rounded-md">
        <Search className="h-4 w-4 text-black/50 dark:text-white/50" />
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm font-semibold placeholder:text-black/40 dark:placeholder:text-white/40" />
      </label>
      <label className="flex min-h-12 items-center gap-3 rounded-xl bg-black/[0.035] px-4 py-3 dark:bg-white/[0.05] md:rounded-md">
        <SlidersHorizontal className="h-4 w-4 text-black/50 dark:text-white/50" />
        <select value={selectedCategory} onChange={(event) => onCategoryChange(event.target.value)} className="bg-transparent text-sm font-bold">
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
      <select value={sort} onChange={(event) => onSortChange(event.target.value)} className="min-h-12 rounded-xl bg-black/[0.035] px-4 py-3 text-sm font-bold dark:bg-white/[0.05] md:rounded-md">
        <option value="featured">Featured</option>
        <option value="price-low">Price: Low to high</option>
        <option value="price-high">Price: High to low</option>
        <option value="rating">Rating</option>
      </select>
    </div>
  );
}

export function FutureCommerceNotice({ title = "Direct purchase launching soon" }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-400/10 p-5 text-amber-900 dark:text-amber-100">
      <div className="flex items-start gap-4">
        <Lock className="mt-1 h-5 w-5" />
        <div>
          <h3 className="font-black">{title}</h3>
          <p className="mt-2 text-sm leading-6 opacity-80">
            Cart, checkout, payments, coupons, orders, and address management are designed into the platform but disabled for public users in this launch phase.
          </p>
        </div>
      </div>
    </div>
  );
}

export function BuyPanel({ product }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/80 p-4 shadow-[0_24px_80px_rgba(17,23,20,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] md:rounded-lg md:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-black/45 dark:text-white/45">Marketplace launch</p>
          <p className="mt-1 text-2xl font-black">{formatPrice(product.price)}</p>
        </div>
        <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5" aria-label="Add to wishlist">
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <SecondaryButton href={product.marketplace.amazon} external>Buy on Amazon</SecondaryButton>
        <SecondaryButton href={product.marketplace.flipkart} external>Buy on Flipkart</SecondaryButton>
        <PrimaryButton href={product.marketplace.custom} external>Buy Now</PrimaryButton>
      </div>
      <div className="mt-5 hidden md:block">
        <FutureCommerceNotice />
      </div>
    </div>
  );
}

export function ProductGallery({ product }) {
  const [active, setActive] = useState(product.gallery?.[0] ?? product.image);

  return (
    <div>
      <div className="aspect-[1/1.08] overflow-hidden rounded-2xl border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/[0.045] md:aspect-square md:rounded-lg">
        <img src={active} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 md:gap-3">
        {(product.gallery ?? [product.image]).map((image) => (
          <button key={image} type="button" onClick={() => setActive(image)} className={`aspect-square overflow-hidden rounded-xl border md:rounded-md ${active === image ? "border-emerald-500" : "border-black/10 dark:border-white/10"}`}>
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= current;
        return (
          <div key={step.label} className={`rounded-2xl border p-4 md:rounded-lg ${isActive ? "border-emerald-500/40 bg-emerald-400/10" : "border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/[0.04]"}`}>
            <Icon className="mb-3 h-5 w-5" />
            <p className="text-sm font-black uppercase tracking-[0.14em]">{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export function AccountShell({ title, description, children }) {
  return (
    <CommerceShell eyebrow="Account" title={title} description={description}>
      <section className="px-4 pb-24 md:px-5">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.045] md:rounded-lg md:p-4">
            {["Profile", "Addresses", "Orders", "Wishlist", "Registered Products"].map((item) => (
              <a key={item} href={item === "Profile" ? "/profile" : "#"} className="block rounded-md px-4 py-3 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/10">
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
        <div key={capability} className="rounded-lg border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.045]">
          <BadgeCheck className="mb-4 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          <p className="font-bold">{capability}</p>
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
    <form onSubmit={submitWarranty} className="grid gap-4 rounded-lg border border-black/10 bg-white/76 p-5 dark:border-white/10 dark:bg-white/[0.045]">
      <div className="grid gap-4 md:grid-cols-3">
        <Field name="name" label="Full name" required />
        <Field name="email" type="email" label="Email" required />
        <Field name="phone" label="Phone" required />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Select name="productSlug" label="Product" options={products.map((product) => [product.slug, product.name])} />
        <Field name="serialNumber" label="Serial number" required />
        <Field name="purchaseDate" label="Purchase date" type="date" required />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field name="invoiceNumber" label="Invoice number" required />
        <Field name="dealer" label="Dealer / store" required />
        <Field name="pincode" label="Pincode" required />
      </div>
      <Field name="address" label="Address" required />
      <Field name="invoice" label="Invoice upload" type="file" required />
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input type="checkbox" required className="h-4 w-4" />
        I confirm that the provided details are accurate.
      </label>
      <SubmitButton>Submit Warranty Claim</SubmitButton>
      {ticket && (
        <div className="rounded-lg bg-emerald-500/12 p-4 text-sm font-bold text-emerald-800 dark:text-emerald-200">
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
    <form onSubmit={submitSupport} className="grid gap-4 rounded-lg border border-black/10 bg-white/76 p-5 dark:border-white/10 dark:bg-white/[0.045]">
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="name" label="Full name" required />
        <Field name="email" type="email" label="Email" required />
      </div>
      <Select name="topic" label="Topic" options={[["marketplace", "Marketplace purchase"], ["warranty", "Warranty"], ["product", "Product information"], ["partnership", "Partnership"]]} />
      <Field name="message" label="Message" textarea required />
      <SubmitButton>Create Support Ticket</SubmitButton>
      {ticket && (
        <div className="rounded-lg bg-emerald-500/12 p-4 text-sm font-bold text-emerald-800 dark:text-emerald-200">
          Support ticket created: {ticket}
        </div>
      )}
    </form>
  );
}

function Field({ label, name, type = "text", textarea = false, required = false }) {
  const className = "w-full rounded-lg border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/[0.045]";
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-black/48 dark:text-white/48">{label}</span>
      {textarea ? <textarea name={name} required={required} rows={5} className={className} /> : <input name={name} type={type} required={required} className={className} />}
    </label>
  );
}

function Select({ label, name, options }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-black/48 dark:text-white/48">{label}</span>
      <select name={name} className="w-full rounded-lg border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/[0.045]">
        {options.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </label>
  );
}

export function FAQList() {
  return (
    <div className="grid gap-4">
      {faqs.map((faq) => (
        <details key={faq.question} className="rounded-lg border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.045]">
          <summary className="cursor-pointer text-lg font-black">{faq.question}</summary>
          <p className="mt-4 leading-7 text-black/64 dark:text-white/64">{faq.answer}</p>
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
    <div className="grid gap-4 md:grid-cols-3">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div key={feature.title} className="rounded-lg border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.045]">
            <Icon className="mb-5 h-6 w-6 text-emerald-700 dark:text-emerald-300" />
            <h3 className="text-xl font-black">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-black/62 dark:text-white/62">{feature.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export function CollectionGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {collections.map((collection) => (
        <a key={collection.slug} href={`/products?collection=${collection.slug}`} className="rounded-lg border border-black/10 bg-white/70 p-6 transition hover:-translate-y-1 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:hover:bg-white/10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">{collection.productSlugs.length} products</p>
          <h3 className="mt-5 text-3xl font-black tracking-tight">{collection.name}</h3>
          <p className="mt-4 leading-7 text-black/62 dark:text-white/62">{collection.description}</p>
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
    <footer className="relative z-10 border-t border-black/10 px-5 py-12 dark:border-white/10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="luxury-brand text-2xl">Simpcraftt</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-black/58 dark:text-white/58">
            A premium product ecosystem moving from marketplace-first launches into full direct commerce.
          </p>
        </div>
        <FooterColumn title="Shop" links={[["Products", "/products"], ["Collections", "/collections"], ["Cart", "/cart"], ["Checkout", "/checkout"]]} />
        <FooterColumn title="Care" links={[["Warranty", "/warranty"], ["Support", "/support"], ["FAQ", "/faq"], ["Contact", "/contact"]]} />
        <FooterColumn title="Company" links={[["About", "/about"], ["Privacy", "/privacy-policy"], ["Terms", "/terms-conditions"], ["Admin", "/admin"]]} />
      </div>
      <div className="mx-auto mt-10 max-w-7xl text-xs font-bold uppercase tracking-[0.16em] text-black/42 dark:text-white/42">
        v2 ecommerce platform foundation. Direct checkout: {platformStatus.directCheckoutEnabled ? "enabled" : "disabled"}
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-black uppercase tracking-[0.16em]">{title}</h4>
      <div className="grid gap-3">
        {links.map(([label, href]) => (
          <a key={href} href={href} className="text-sm font-semibold text-black/58 hover:text-black dark:text-white/58 dark:hover:text-white">
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
