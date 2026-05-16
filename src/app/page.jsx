import { motion } from "motion/react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CommerceShell, PrimaryButton, SecondaryButton, ProductCard, FAQList, FeatureBand } from "./components/commerce/CommerceLayout";
import { products } from "./data/commerce";

const hero = products[0];
const showcase = products[1];
const featured = products.slice(0, 3);

function Stat({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontWeight: 700, fontSize: "clamp(1.6rem,3vw,2.4rem)", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 8 }}>{label}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <CommerceShell heroNav={true}>

      {/* ─── HERO ─── */}
      <section style={{ position: "relative", height: "100svh", minHeight: 640, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0 }}>
          <img src={hero.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        </div>
        {/* Cinematic gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(7,8,10,0.1) 0%, rgba(7,8,10,0.2) 30%, rgba(7,8,10,0.7) 65%, rgba(7,8,10,0.97) 100%)" }} />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1200, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,3rem) clamp(3.5rem,8vw,7rem)" }}>
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [.22,1,.36,1] }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2, duration: .8 }}
              style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>
              Premium Electronics
            </motion.p>
            <h1 style={{ fontWeight: 700, fontSize: "clamp(3.5rem,9vw,9rem)", letterSpacing: "-0.035em", lineHeight: 0.9, color: "#fff", maxWidth: "10ch" }}>
              Quiet<br />Precision.
            </h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35, duration: .8 }}
              style={{ marginTop: 28, fontSize: "clamp(.9rem,1.4vw,1rem)", lineHeight: 1.75, color: "rgba(255,255,255,0.5)", maxWidth: "40ch" }}>
              Premium audio, wearables, and charging — engineered for everyday precision.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5, duration: .7 }}
              style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <PrimaryButton href="/products">Explore Products <ArrowRight size={13} /></PrimaryButton>
              <SecondaryButton href="/warranty">Register Warranty</SecondaryButton>
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .7, duration: .8 }}
            style={{ display: "flex", gap: "clamp(2rem,6vw,5rem)", marginTop: "clamp(3rem,6vw,5rem)", paddingTop: "clamp(2rem,4vw,3rem)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <Stat value="5" label="Products" />
            <Stat value="3" label="Collections" />
            <Stat value="12mo" label="Warranty" />
            <Stat value="2" label="Marketplaces" />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: .6 }}
          style={{ position: "absolute", bottom: "2.5rem", right: "clamp(1.5rem,5vw,3rem)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.35))" }} />
          <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", writingMode: "vertical-rl" }}>Scroll</p>
        </motion.div>
      </section>

      {/* ─── FLAGSHIP EDITORIAL ─── */}
      <section style={{ padding: "clamp(5rem,10vw,10rem) clamp(1.5rem,5vw,3rem)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: .6 }}
            style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 56 }}>
            Flagship — {hero.badge}
          </motion.p>
          <div style={{ display: "grid", gap: "clamp(3rem,6vw,6rem)", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", alignItems: "center" }}>
            <motion.div initial={{ opacity: 0, scale: .97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: .8 }}>
              <div style={{ aspectRatio: "4/5", borderRadius: 20, overflow: "hidden", background: "#0d0e11", border: "1px solid rgba(255,255,255,0.07)" }}>
                <img src={hero.image} alt={hero.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .7, delay: .1 }}>
              <h2 style={{ fontWeight: 700, fontSize: "clamp(2.2rem,4vw,3.8rem)", letterSpacing: "-0.03em", lineHeight: 0.96, marginBottom: 20 }}>{hero.name}</h2>
              <p style={{ fontSize: "clamp(0.9rem,1.3vw,1rem)", lineHeight: 1.75, color: "rgba(255,255,255,0.48)", maxWidth: "44ch", marginBottom: 40 }}>{hero.description}</p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 32, marginBottom: 40 }}>
                {Object.entries(hero.specs).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <PrimaryButton href={"/products/" + hero.slug}>View Product <ArrowRight size={13} /></PrimaryButton>
                <SecondaryButton href="/products">All Products</SecondaryButton>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT GRID ─── */}
      <section style={{ padding: "0 clamp(1.5rem,5vw,3rem) clamp(5rem,10vw,10rem)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 20 }}>
            <div>
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 16 }}>Products</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .6 }}
                style={{ fontWeight: 700, fontSize: "clamp(2rem,3.5vw,3rem)", letterSpacing: "-0.025em", lineHeight: 0.95 }}>
                The ecosystem.
              </motion.h2>
            </div>
            <SecondaryButton href="/products">View all</SecondaryButton>
          </div>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
            {featured.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ─── BRAND PILLARS ─── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(1.5rem,5vw,3rem)" }}>
          <FeatureBand />
        </div>
      </section>

      {/* ─── MANIFESTO ─── */}
      <section style={{ padding: "clamp(5rem,10vw,10rem) clamp(1.5rem,5vw,3rem)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: "clamp(3rem,6vw,6rem)", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", alignItems: "center" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 24 }}>Philosophy</p>
            <h2 style={{ fontWeight: 700, fontSize: "clamp(2.2rem,4vw,3.6rem)", letterSpacing: "-0.028em", lineHeight: 0.95, marginBottom: 28 }}>
              Built for the ones<br />who notice.
            </h2>
            <p style={{ fontSize: "clamp(.9rem,1.3vw,1rem)", lineHeight: 1.75, color: "rgba(255,255,255,0.45)", maxWidth: "42ch", marginBottom: 40 }}>
              Every Simpcraftt product earns trust through restraint — not spectacle. Hardware designed to disappear into your life, until you need it most.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <SecondaryButton href="/about">Our Story</SecondaryButton>
              <PrimaryButton href="/warranty">Warranty <ShieldCheck size={13} /></PrimaryButton>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: .97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: .8, delay: .1 }}>
            <div style={{ aspectRatio: "4/3", borderRadius: 20, overflow: "hidden", background: "#0d0e11", border: "1px solid rgba(255,255,255,0.07)", position: "relative" }}>
              <img src={showcase.image} alt={showcase.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,8,10,.8) 0%, transparent 60%)" }} />
              <div style={{ position: "absolute", bottom: "1.75rem", left: "1.75rem", right: "1.75rem" }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{showcase.badge}</p>
                <p style={{ fontWeight: 700, fontSize: "1.3rem", letterSpacing: "-0.016em" }}>{showcase.name}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: "clamp(5rem,10vw,9rem) clamp(1.5rem,5vw,3rem)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 24 }}>Get Started</p>
            <h2 style={{ fontWeight: 700, fontSize: "clamp(2.2rem,4vw,3.6rem)", letterSpacing: "-0.028em", lineHeight: 0.96, marginBottom: 20 }}>Ready to explore?</h2>
            <p style={{ fontSize: "clamp(.9rem,1.3vw,1rem)", lineHeight: 1.75, color: "rgba(255,255,255,0.45)", marginBottom: 40 }}>
              Browse the full catalogue or register your warranty today.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <PrimaryButton href="/products">Browse Products <ArrowRight size={13} /></PrimaryButton>
              <SecondaryButton href="/support">Get Support</SecondaryButton>
            </div>
          </motion.div>
        </div>
      </section>

    </CommerceShell>
  );
}