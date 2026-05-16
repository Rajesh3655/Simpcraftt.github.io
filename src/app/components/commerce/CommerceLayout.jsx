import { useState, useEffect } from "react";
import ThemeToggle from "../../ThemeToggle";
import { categories, collections, faqs, formatPrice, getCategoryById, platformStatus, products } from "../../data/commerce";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronDown, Heart, Home, Menu, Search, ShieldCheck, User, X } from "lucide-react";

const nav = [
  { l: "Products", h: "/products" },
  { l: "Collections", h: "/collections" },
  { l: "Warranty", h: "/warranty" },
  { l: "Support", h: "/support" },
];
const bnav = [
  { l: "Home", h: "/", i: Home },
  { l: "Shop", h: "/products", i: Search },
  { l: "Care", h: "/warranty", i: ShieldCheck },
  { l: "Account", h: "/profile", i: User },
];

function Navbar({ transparent = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 72);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const solid = !transparent || scrolled;
  const ease = "cubic-bezier(0.22,1,0.36,1)";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, display: "flex", alignItems: "center",
        padding: "0 clamp(1.5rem,5vw,3rem)",
        background: solid ? "rgba(7,8,10,0.94)" : "transparent",
        backdropFilter: solid ? "blur(24px) saturate(1.5)" : "none",
        WebkitBackdropFilter: solid ? "blur(24px) saturate(1.5)" : "none",
        borderBottom: solid ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        transition: `background .5s ${ease}, border-color .5s ${ease}, backdrop-filter .5s ${ease}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: 1200, margin: "0 auto" }}>

          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ width: 32, height: 32, background: "#fff", color: "#07080a", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7, fontWeight: 800, fontSize: 14, fontStyle: "italic", flexShrink: 0, letterSpacing: "-0.02em" }}>S</span>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "#fff" }}>Simpcraftt</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ display: "flex", gap: 36, alignItems: "center" }}>
            {nav.map(n => (
              <a key={n.h} href={n.h} style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color .2s" }}
                onMouseOver={e => e.currentTarget.style.color = "#fff"}
                onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
                {n.l}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ThemeToggle />
            <a href="/profile" aria-label="Account" title="Account"
              style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "all .2s" }}
              onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "transparent"; }}>
              <User size={14} />
            </a>
            <button type="button" onClick={() => setOpen(v => !v)} className="md:hidden"
              style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", transition: "all .2s" }}>
              {open ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)" }} />
            <motion.div initial={{ opacity: 0, y: -10, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: .98 }}
              transition={{ duration: .22, ease: [.22,1,.36,1] }}
              style={{ position: "fixed", top: 72, left: 12, right: 12, zIndex: 90, background: "#0d0e11", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "0.75rem", boxShadow: "0 32px 80px rgba(0,0,0,.7)" }}>
              <div style={{ padding: "0.5rem 0.75rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "0.5rem" }}>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Navigation</p>
              </div>
              {[...nav, { l: "About", h: "/about" }, { l: "Login", h: "/login" }].map(n => (
                <a key={n.h} href={n.h} onClick={() => setOpen(false)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 12px", borderRadius: 12, color: "rgba(255,255,255,0.7)", textDecoration: "none", fontWeight: 600, fontSize: 15, transition: "all .15s" }}
                  onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                  {n.l}
                  <ArrowRight size={13} style={{ color: "rgba(255,255,255,.25)" }} />
                </a>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
export function CommerceShell({ children, heroNav = false }) {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text-primary)", minHeight: "100vh", paddingBottom: 80 }}>
      <Navbar transparent={heroNav} />
      <main>{children}</main>
      <CommerceFooter />
      <MobileBottomNav />
    </div>
  );
}

function MobileBottomNav() {
  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90, display: "grid", gridTemplateColumns: "repeat(4,1fr)", height: 68, borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(7,8,10,0.96)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} className="md:hidden">
      {bnav.map(({ l, h, i: I }) => (
        <a key={h} href={h} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, textDecoration: "none", color: "rgba(255,255,255,0.45)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", transition: "color .2s" }}
          onMouseOver={e => e.currentTarget.style.color = "#fff"}
          onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}>
          <I size={18} />
          {l}
        </a>
      ))}
    </nav>
  );
}

function CommerceFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "5rem clamp(1.5rem,5vw,3rem) 4rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: "3rem", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ width: 30, height: 30, background: "#fff", color: "#07080a", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, fontWeight: 800, fontSize: 13, fontStyle: "italic" }}>S</span>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>Simpcraftt</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.4)", maxWidth: 220 }}>
            Premium electronics. Marketplace-first. Direct commerce coming soon.
          </p>
        </div>
        {[
          ["Shop", [["Products", "/products"], ["Collections", "/collections"], ["Warranty", "/warranty"]]],
          ["Company", [["About", "/about"], ["Support", "/support"], ["Privacy", "/privacy-policy"], ["Terms", "/terms-conditions"]]],
          ["Account", [["Login", "/login"], ["Register", "/register"], ["Profile", "/profile"], ["Wishlist", "/wishlist"]]],
        ].map(([title, links]) => (
          <div key={title}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 20 }}>{title}</p>
            {links.map(([label, href]) => (
              <a key={href} href={href} style={{ display: "block", marginBottom: 12, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.48)", textDecoration: "none", transition: "color .2s" }}
                onMouseOver={e => e.currentTarget.style.color = "#fff"}
                onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.48)"}>
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1200, margin: "3rem auto 0", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>&copy; {new Date().getFullYear()} Simpcraftt. All rights reserved.</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>Direct checkout: coming soon</p>
      </div>
    </footer>
  );
}

export function PrimaryButton({ href, children, disabled = false, external = false, onClick }) {
  const style = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    height: 46, padding: "0 1.5rem",
    background: "#fff", color: "#07080a",
    borderRadius: 10, border: "none", cursor: "pointer",
    fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    textDecoration: "none", whiteSpace: "nowrap",
    transition: "all .22s cubic-bezier(0.22,1,0.36,1)",
    boxShadow: "0 1px 0 rgba(255,255,255,0.12) inset",
  };
  if (disabled) return <button type="button" disabled style={{ ...style, opacity: .35, cursor: "not-allowed" }}>{children}</button>;
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick} style={style}
      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,0.12) inset"; }}
      onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 0 rgba(255,255,255,0.12) inset"; }}>
      {children}
    </a>
  );
}

export function SecondaryButton({ href, children, external = false, onClick }) {
  const style = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    height: 46, padding: "0 1.5rem",
    background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)",
    borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer",
    fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    textDecoration: "none", whiteSpace: "nowrap",
    transition: "all .22s cubic-bezier(0.22,1,0.36,1)",
  };
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick} style={style}
      onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.transform = ""; }}>
      {children}
    </a>
  );
}

export function FutureCommerceNotice({ title = "Direct purchase launching soon" }) {
  return (
    <div style={{ borderRadius: 10, border: "1px solid rgba(255,200,50,0.15)", background: "rgba(255,200,50,0.04)", padding: "1.25rem 1.5rem" }}>
      <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,200,50,0.6)", marginBottom: 8 }}>Notice</p>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.45)" }}>
        Cart, checkout, and payments are architected and disabled for this launch phase.
      </p>
    </div>
  );
}
export function ProductCard({ product, index = 0 }) {
  const cat = getCategoryById(product.category);
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .12 }} transition={{ duration: .55, delay: index * .07 }}
      style={{ borderRadius: 16, overflow: "hidden", background: "#0d0e11", border: "1px solid rgba(255,255,255,0.07)", transition: "border-color .3s, transform .3s cubic-bezier(0.22,1,0.36,1), box-shadow .3s" }}
      onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(0,0,0,.5)"; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <a href={"/products/" + product.slug} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
        <div style={{ aspectRatio: "3/2", overflow: "hidden", background: "#111318", position: "relative" }}>
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .7s cubic-bezier(0.22,1,0.36,1)", display: "block" }}
            onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={e => e.currentTarget.style.transform = "scale(1)"} />
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", borderRadius: 99, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>
              {cat?.name}
            </span>
          </div>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <h3 style={{ fontWeight: 700, fontSize: "clamp(1.1rem,2vw,1.3rem)", letterSpacing: "-0.016em", lineHeight: 1.2 }}>{product.name}</h3>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, flexShrink: 0, marginLeft: 12 }}>★ {product.rating}</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 20, minHeight: 42 }}>{product.summary}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em" }}>{formatPrice(product.price)}</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}>View <ArrowRight size={12} /></span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}

export function ProductGrid({ items = products }) {
  return (
    <div style={{ display: "grid", gap: "1px", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", background: "rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
      {items.map((p, i) => (
        <motion.div key={p.slug} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5, delay: i * .06 }}>
          <a href={"/products/" + p.slug} style={{ display: "block", textDecoration: "none", color: "inherit", background: "#07080a", transition: "background .2s", height: "100%" }}
            onMouseOver={e => e.currentTarget.style.background = "#0d0e11"}
            onMouseOut={e => e.currentTarget.style.background = "#07080a"}>
            <div style={{ aspectRatio: "3/2", overflow: "hidden" }}>
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s cubic-bezier(0.22,1,0.36,1)" }}
                onMouseOver={e => e.currentTarget.style.transform = "scale(1.04)"}
                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"} />
            </div>
            <div style={{ padding: "1.5rem" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 10 }}>{getCategoryById(p.category)?.name}</span>
              <h3 style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.016em", marginBottom: 8 }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 20 }}>{p.summary}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{formatPrice(p.price)}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 4 }}>View <ArrowRight size={11} /></span>
              </div>
            </div>
          </a>
        </motion.div>
      ))}
    </div>
  );
}

export function CollectionGrid() {
  return (
    <div style={{ display: "grid", gap: "1px", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", background: "rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
      {collections.map((c, i) => (
        <a key={c.slug} href={"/products?collection=" + c.slug}
          style={{ display: "block", padding: "2rem", textDecoration: "none", color: "inherit", background: "#07080a", transition: "background .25s" }}
          onMouseOver={e => e.currentTarget.style.background = "#0d0e11"}
          onMouseOut={e => e.currentTarget.style.background = "#07080a"}>
          <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", display: "block", marginBottom: 20 }}>{c.productSlugs.length} Products</span>
          <h3 style={{ fontWeight: 700, fontSize: "clamp(1.4rem,2.5vw,1.8rem)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 14 }}>{c.name}</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>{c.description}</p>
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
            Explore <ArrowRight size={12} />
          </div>
        </a>
      ))}
    </div>
  );
}

export function FeatureBand() {
  const fs = [
    { t: "Warranty-ready", d: "Registration, claim tracking, invoice upload, and status flow." },
    { t: "Marketplace-first", d: "Amazon, Flipkart, and custom links per product — editable anytime." },
    { t: "Commerce-ready", d: "Cart, checkout, and payments engineered in, staged for activation." },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
      {fs.map((f, i) => (
        <div key={f.t} style={{ padding: "2.5rem 2rem", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
          <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.2)", marginBottom: 24 }} />
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, letterSpacing: "-0.01em" }}>{f.t}</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>{f.d}</p>
        </div>
      ))}
    </div>
  );
}

export function FAQList() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
      {faqs.map((f, i) => (
        <div key={f.question} style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none", background: open === i ? "#0d0e11" : "transparent", transition: "background .2s" }}>
          <button type="button" onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 1.75rem", background: "none", border: "none", cursor: "pointer", color: "inherit", textAlign: "left", gap: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>{f.question}</span>
            <span style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "rgba(255,255,255,0.4)", fontSize: 14, transform: open === i ? "rotate(45deg)" : "none", transition: "transform .25s" }}>+</span>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .28 }} style={{ overflow: "hidden" }}>
                <p style={{ padding: "0 1.75rem 1.5rem", fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{f.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function PageHero({ eyebrow, title, description, action }) {
  return (
    <section style={{ padding: "clamp(6rem,12vw,10rem) clamp(1.5rem,5vw,3rem) clamp(4rem,6vw,6rem)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75 }}>
          {eyebrow && <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>{eyebrow}</p>}
          <h1 style={{ fontWeight: 700, fontSize: "clamp(2.5rem,5vw,5rem)", letterSpacing: "-0.028em", lineHeight: 0.95, maxWidth: "16ch" }}>{title}</h1>
          {description && <p style={{ marginTop: 24, fontSize: "clamp(0.95rem,1.5vw,1.05rem)", lineHeight: 1.7, color: "rgba(255,255,255,0.48)", maxWidth: "54ch" }}>{description}</p>}
          {action && <div style={{ marginTop: 36 }}>{action}</div>}
        </motion.div>
      </div>
    </section>
  );
}
export function BuyPanel({ product }) {
  return (
    <div style={{ borderRadius: 16, background: "#0d0e11", border: "1px solid rgba(255,255,255,0.08)", padding: "1.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 10 }}>Marketplace Price</p>
          <p style={{ fontWeight: 700, fontSize: 32, letterSpacing: "-0.02em" }}>{formatPrice(product.price)}</p>
        </div>
        <button style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }} aria-label="Add to wishlist"><Heart size={16} /></button>
      </div>
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        <SecondaryButton href={product.marketplace.amazon} external>Buy on Amazon</SecondaryButton>
        <SecondaryButton href={product.marketplace.flipkart} external>Buy on Flipkart</SecondaryButton>
        <PrimaryButton href={product.marketplace.custom} external>Buy Now</PrimaryButton>
      </div>
      <FutureCommerceNotice />
    </div>
  );
}

export function ProductGallery({ product }) {
  const [active, setActive] = useState(product.gallery?.[0] ?? product.image);
  return (
    <div>
      <div style={{ aspectRatio: "1", overflow: "hidden", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "#0d0e11" }}>
        <motion.img key={active} src={active} alt={product.name} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .4 }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 10 }}>
        {(product.gallery ?? [product.image]).map(img => (
          <button key={img} type="button" onClick={() => setActive(img)}
            style={{ aspectRatio: "1", overflow: "hidden", borderRadius: 10, border: "1px solid " + (active === img ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.08)"), background: "none", cursor: "pointer", padding: 0, transition: "border-color .2s" }}>
            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductFilters({ selectedCategory, onCategoryChange, query, onQueryChange, sort, onSortChange }) {
  const inp = { height: 48, borderRadius: 10, border: "1px solid rgba(255,255,255,0.09)", background: "#0d0e11", color: "#f0f0ee", padding: "0 1rem", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" };
  return (
    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr auto auto", marginBottom: 36 }}>
      <label style={{ ...inp, display: "flex", alignItems: "center", gap: 10, cursor: "text" }}>
        <Search size={14} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0 }} />
        <input value={query} onChange={e => onQueryChange(e.target.value)} placeholder="Search products…" style={{ background: "none", border: "none", color: "inherit", fontSize: 14, fontWeight: 500, width: "100%", fontFamily: "inherit" }} />
      </label>
      <select value={selectedCategory} onChange={e => onCategoryChange(e.target.value)} style={inp}>
        <option value="all">All categories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select value={sort} onChange={e => onSortChange(e.target.value)} style={inp}>
        <option value="featured">Featured</option>
        <option value="price-low">Price: Low–High</option>
        <option value="price-high">Price: High–Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
}

export function EcommerceStepper({ current = 0 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
      {["Cart", "Address", "Payment", "Order"].map((s, i) => (
        <div key={s} style={{ padding: "1.25rem 1rem", background: i <= current ? "#0d0e11" : "#07080a", textAlign: "center" }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: i <= current ? "#fff" : "rgba(255,255,255,0.28)" }}>{s}</p>
        </div>
      ))}
    </div>
  );
}

export function AccountShell({ title, description, children }) {
  return (
    <CommerceShell>
      <PageHero eyebrow="Account" title={title} description={description} />
      <section style={{ padding: "0 clamp(1.5rem,5vw,3rem) 6rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 24, gridTemplateColumns: "220px 1fr" }}>
          <aside style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "#0d0e11", padding: "0.5rem", alignSelf: "start" }}>
            {["Profile", "Orders", "Wishlist", "Registered Products"].map(item => (
              <a key={item} href={item === "Profile" ? "/profile" : "#"}
                style={{ display: "block", padding: "10px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "all .15s" }}
                onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
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
  return (
    <div style={{ display: "grid", gap: "1px", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", background: "rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      {["Manage products", "Manage categories", "Upload images", "Edit marketplace URLs", "Review warranty claims", "Manage users"].map(c => (
        <div key={c} style={{ padding: "1.5rem", background: "#07080a" }}>
          <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.2)", marginBottom: 18 }} />
          <p style={{ fontWeight: 700, fontSize: 14 }}>{c}</p>
        </div>
      ))}
    </div>
  );
}

function Field({ label, name, type = "text", textarea = false, required = false }) {
  const s = { width: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.09)", background: "#0d0e11", color: "#f0f0ee", padding: "0 1rem", fontFamily: "inherit", fontSize: 14, fontWeight: 500 };
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{label}</span>
      {textarea ? <textarea name={name} required={required} rows={4} style={{ ...s, height: "auto", padding: "0.875rem 1rem" }} /> : <input name={name} type={type} required={required} style={{ ...s, height: 48 }} />}
    </label>
  );
}

function Sel({ label, name, options }) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{label}</span>
      <select name={name} style={{ height: 48, borderRadius: 10, border: "1px solid rgba(255,255,255,0.09)", background: "#0d0e11", color: "#f0f0ee", padding: "0 1rem", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

export function WarrantyForm() {
  const [ticket, setTicket] = useState("");
  const submit = async e => { e.preventDefault(); const f = e.currentTarget; const res = await fetch("/api/warranty-claims", { method: "POST", body: new FormData(f) }); const d = await res.json(); setTicket(d.ticketId ?? "SCW-PENDING"); f.reset(); };
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}><Field name="name" label="Full name" required /><Field name="email" type="email" label="Email" required /><Field name="phone" label="Phone" required /></div>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}><Sel name="productSlug" label="Product" options={products.map(p => [p.slug, p.name])} /><Field name="serialNumber" label="Serial number" required /><Field name="purchaseDate" label="Purchase date" type="date" required /></div>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}><Field name="invoiceNumber" label="Invoice number" required /><Field name="dealer" label="Dealer/store" required /><Field name="pincode" label="Pincode" required /></div>
      <Field name="address" label="Address" required />
      <Field name="invoice" label="Invoice upload" type="file" required />
      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.55)" }}><input type="checkbox" required style={{ width: 16, height: 16 }} />I confirm the details are accurate.</label>
      <PrimaryButton href="#" onClick={e => { e.preventDefault(); e.target.closest("form").requestSubmit(); }}>Submit Warranty Claim</PrimaryButton>
      {ticket && <div style={{ padding: "1.25rem", borderRadius: 10, background: "rgba(91,108,242,.12)", border: "1px solid rgba(91,108,242,.25)", fontSize: 14, fontWeight: 600 }}>Submitted — Ticket ID: {ticket}</div>}
    </form>
  );
}

export function SupportForm() {
  const [ticket, setTicket] = useState("");
  const submit = async e => { e.preventDefault(); const f = e.currentTarget; const res = await fetch("/api/support-tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(f))) }); const d = await res.json(); setTicket(d.ticketId ?? "SCS-PENDING"); f.reset(); };
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}><Field name="name" label="Full name" required /><Field name="email" type="email" label="Email" required /></div>
      <Sel name="topic" label="Topic" options={[["marketplace", "Marketplace purchase"], ["warranty", "Warranty"], ["product", "Product information"], ["partnership", "Partnership"]]} />
      <Field name="message" label="Message" textarea required />
      <PrimaryButton href="#" onClick={e => { e.preventDefault(); e.target.closest("form").requestSubmit(); }}>Create Support Ticket</PrimaryButton>
      {ticket && <div style={{ padding: "1.25rem", borderRadius: 10, background: "rgba(91,108,242,.12)", border: "1px solid rgba(91,108,242,.25)", fontSize: 14, fontWeight: 600 }}>Ticket created: {ticket}</div>}
    </form>
  );
}

export function useFilteredProducts() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const q = query.trim().toLowerCase();
  const r = products.filter(p => {
    const cm = selectedCategory === "all" || p.category === selectedCategory;
    const tm = !q || `${p.name} ${p.summary} ${(p.features || []).join(" ")}`.toLowerCase().includes(q);
    return cm && tm;
  });
  const filteredProducts = [...r].sort((a, b) =>
    sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : 0);
  return { filteredProducts, query, setQuery, selectedCategory, setSelectedCategory, sort, setSort };
}