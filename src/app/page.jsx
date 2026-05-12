"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  ChevronDown,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  MessageCircle,
  ArrowRight,
  Shield,
  Zap,
  Star,
  Cpu,
  Clock,
  CheckCircle2,
  Menu,
  X,
  Send,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";

// --- Data ---
const FAQ_DATA = [
  {
    question: "What is Simpcraftt?",
    answer:
      "Simpcraftt is a premium lifestyle and electronics brand dedicated to crafting high-quality, futuristic products that blend technology with elegance.",
  },
  {
    question: "When is the official launch?",
    answer:
      "We are launching shortly! Sign up for our newsletter to get an exclusive notification and early-bird access to our first collection.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we plan to ship our premium products globally. Specific shipping details will be available at launch.",
  },
  {
    question: "How can I get early access?",
    answer:
      "By signing up for our 'Notify Me' list, you'll be among the first to receive an invitation to our private launch event.",
  },
];

const PRODUCTS_TEASER = [
  {
    title: "Aura Audio Pro",
    category: "Audio",
    description: "Immersive soundscapes with hybrid active noise cancellation.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    accent: "text-blue-400",
  },
  {
    title: "Nova Watch X",
    category: "Wearables",
    description: "Futuristic health tracking meets aerospace-grade titanium.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    accent: "text-purple-400",
  },
  {
    title: "Echo Charge Max",
    category: "Charging",
    description:
      "The fastest wireless charging ecosystem for your smart devices.",
    image:
      "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&q=80&w=800",
    accent: "text-emerald-400",
  },
];

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "High Performance",
    description: "Powered by the latest chipsets for a lag-free experience.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Premium Build",
    description:
      "Crafted using aerospace-grade materials for ultimate durability.",
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Futuristic Tech",
    description: "Innovative features that anticipate your needs.",
  },
];

const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "Tech Enthusiast",
    text: "Simpcraftt is bringing a level of detail back to electronics that I haven't seen in years. Can't wait for the drop!",
    avatar: "AR",
  },
  {
    name: "Sarah Chen",
    role: "Industrial Designer",
    text: "The design philosophy behind their upcoming lineup is absolutely stunning. Truly futuristic.",
    avatar: "SC",
  },
];

// --- Components ---

const CountdownTimer = () => {
  const launchOffsetDays = 25;
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + launchOffsetDays);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = Math.max(launchDate - now, 0);

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 md:gap-8 justify-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl w-16 h-16 md:w-24 md:h-24 flex items-center justify-center text-2xl md:text-4xl font-bold text-white mb-2">
            {value.toString().padStart(2, "0")}
          </div>
          <span className="text-[10px] md:text-sm uppercase tracking-widest text-gray-400 font-medium">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

const FAQItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg md:text-xl font-medium text-white group-hover:text-blue-400 transition-colors">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-400 leading-relaxed">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const newsletterMutation = useMutation({
    mutationFn: async (email) => {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Subscription failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Successfully subscribed! We'll notify you soon.");
    },
    onError: () => {
      toast.error("Failed to subscribe. Please try again.");
    },
  });

  const leadMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Submission failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Message sent! Our team will contact you.");
    },
    onError: () => {
      toast.error("Failed to send message. Please try again.");
    },
  });

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    newsletterMutation.mutate(email);
    e.target.reset();
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    leadMutation.mutate(data);
    e.target.reset();
  };

  return (
    <div className="min-h-screen bg-[#050505] font-plus-jakarta-sans text-white selection:bg-blue-500/30">
      <Toaster position="top-center" expand={true} richColors />

      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-emerald-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#050505]/80 backdrop-blur-lg border-b border-white/5 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl italic">
              S
            </div>
            <span className="text-2xl font-bold tracking-tight text-white uppercase">
              Simpcraftt
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-gray-400">
            {["Preview", "Features", "Community", "FAQ", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-white transition-colors uppercase"
                >
                  {item}
                </a>
              ),
            )}
          </div>

          <div className="hidden md:block">
            <a
              href="#notify"
              className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-all uppercase tracking-wider"
            >
              Notify Me
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-[#050505] border-b border-white/10 p-6 md:hidden flex flex-col gap-4"
            >
              {["Preview", "Features", "Community", "FAQ", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-gray-300 hover:text-white"
                  >
                    {item}
                  </a>
                ),
              )}
              <a
                href="#notify"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 px-6 py-3 bg-white text-black text-center font-bold rounded-xl"
              >
                Notify Me
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          <div className="container mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 custom-pulse" />
              <span className="text-xs md:text-sm font-bold tracking-widest text-blue-400 uppercase">
                Official Website Launching Soon
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-8xl font-black mb-6 tracking-tight leading-[1.1]"
            >
              Crafting The <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500">
                Future of Lifestyle
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Simpcraftt is redefining elegance in electronics. A new era of
              premium, futuristic products is launching shortly. Get ready for
              the revolution.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-16"
            >
              <CountdownTimer />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col md:flex-row gap-4 justify-center items-center"
            >
              <a
                href="#notify"
                className="group px-8 py-4 bg-white text-black font-black rounded-full flex items-center gap-2 hover:scale-105 transition-all uppercase tracking-widest text-sm"
              >
                Notify Me When Live
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#preview"
                className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black rounded-full hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
              >
                Upcoming Preview
              </a>
            </motion.div>
          </div>

          {/* Hero Teaser Visual */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20 container mx-auto px-6"
          >
            <div className="relative group max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent blur-[80px] -z-10 group-hover:bg-blue-600/30 transition-all duration-700" />
              <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20 bg-white/5 backdrop-blur-sm p-4">
                <div className="relative min-h-[320px] md:min-h-[520px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.35),transparent_28%),radial-gradient(circle_at_72%_58%,rgba(16,185,129,0.22),transparent_26%),linear-gradient(135deg,#050505_0%,#111827_48%,#030712_100%)]">
                  <div className="absolute inset-x-10 top-10 h-px bg-white/20" />
                  <div className="absolute inset-y-10 left-10 w-px bg-white/20" />
                  <div className="absolute bottom-10 right-10 text-right">
                    <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-blue-300 font-black">
                      Simpcraftt
                    </p>
                    <p className="mt-3 text-3xl md:text-6xl font-black tracking-tight">
                      Future Ready
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Brand Intro */}
        <section id="preview" className="py-24 px-6 bg-white/[0.02]">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-blue-500 font-black tracking-widest uppercase text-sm mb-4 block">
                  About Simpcraftt
                </span>
                <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                  Where Innovation <br /> Meets Craftsmanship
                </h2>
                <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                  Founded on the principles of simplicity and craft, Simpcraftt
                  aims to bridge the gap between high-end electronics and
                  artistic design. Every product we conceive is a testament to
                  our obsession with detail.
                </p>
                <div className="space-y-4">
                  {[
                    "Aerospace-Grade Materials",
                    "Intuitive User Interfaces",
                    "Sustainability-First Design",
                    "Global Warranty Support",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-gray-300 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="aspect-square rounded-3xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=600"
                      className="w-full h-full object-cover"
                      alt="Detail 1"
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-blue-600/20 flex items-center justify-center p-8">
                    <Star className="w-16 h-16 text-blue-500" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600"
                      className="w-full h-full object-cover"
                      alt="Detail 2"
                    />
                  </div>
                  <div className="aspect-square rounded-3xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600"
                      className="w-full h-full object-cover"
                      alt="Detail 3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Teaser Showcase */}
        <section className="py-24 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                Upcoming Lineup
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                A first look at the products that will define the next
                generation of premium tech.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {PRODUCTS_TEASER.map((product, idx) => (
                <motion.div
                  key={product.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.08] transition-all duration-500 overflow-hidden"
                >
                  <div className="mb-8 aspect-square rounded-[2rem] overflow-hidden relative">
                    <img
                      src={product.image}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={product.title}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-3">{product.title}</h3>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    {product.description}
                  </p>
                  <div
                    className={`text-xs font-black uppercase tracking-[0.2em] ${product.accent}`}
                  >
                    Coming Soon
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / Why Choose Us */}
        <section id="features" className="py-24 px-6 relative overflow-hidden">
          <div className="container mx-auto">
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-[3rem] p-12 md:p-24 relative">
              <div className="max-w-3xl">
                <h2 className="text-4xl md:text-6xl font-black mb-12">
                  The Simpcraftt <br /> Advantage
                </h2>
                <div className="grid md:grid-cols-3 gap-12">
                  {FEATURES.map((feature) => (
                    <div key={feature.title} className="space-y-4">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-bold">{feature.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block absolute -right-20 top-1/2 -translate-y-1/2 opacity-20">
                <Star className="w-96 h-96 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="community" className="py-24 px-6 relative overflow-hidden">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                Community Hype
              </h2>
              <p className="text-gray-400">
                Join thousands of others waiting for the Simpcraftt era.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {TESTIMONIALS.map((t, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest">
                        {t.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic leading-relaxed">
                    "{t.text}"
                  </p>
                  <div className="absolute top-8 right-8 opacity-10">
                    <Star
                      className="w-12 h-12 text-white"
                      fill="currentColor"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-6 bg-white/[0.02]">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4 tracking-tight">
                Common Inquiries
              </h2>
              <p className="text-gray-400">
                Everything you need to know about our upcoming launch.
              </p>
            </div>
            <div className="space-y-2">
              {FAQ_DATA.map((faq) => (
                <FAQItem key={faq.question} item={faq} />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section id="notify" className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white blur-3xl rounded-full" />
                <div className="absolute bottom-10 right-10 w-20 h-20 bg-white blur-3xl rounded-full" />
              </div>

              <h2 className="text-4xl md:text-6xl font-black mb-6">
                Stay Ahead of <br /> the Curve
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto">
                Join our inner circle and be the first to know when we launch
                our flagship products.
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="max-w-md mx-auto flex flex-col md:flex-row gap-4"
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-8 py-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-md"
                />
                <button
                  disabled={newsletterMutation.isPending}
                  className="bg-white text-blue-600 px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                >
                  {newsletterMutation.isPending ? "Joining..." : "Notify Me"}
                </button>
              </form>
              <p className="mt-6 text-xs text-white/60 font-medium uppercase tracking-widest italic">
                Early bird access for the first 1,000 subscribers
              </p>
            </div>
          </div>
        </section>

        {/* Contact/Lead Section */}
        <section id="contact" className="py-24 px-6 bg-white/[0.01]">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h2 className="text-4xl md:text-6xl font-black mb-8">
                  Get In Touch
                </h2>
                <p className="text-lg text-gray-400 mb-12 leading-relaxed">
                  Have questions about our technology or want to partner with
                  us? Our team is ready to connect with visionaries and early
                  adopters.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">Email Support</h4>
                      <p className="text-gray-400">hello@simpcraftt.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">
                        WhatsApp Quick Chat
                      </h4>
                      <p className="text-gray-400">Response within 24 hours</p>
                      <a
                        href="https://wa.me/1234567890"
                        target="_blank"
                        className="mt-2 inline-flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs hover:gap-3 transition-all"
                      >
                        Start Chat <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-md">
                <form onSubmit={handleLeadSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                        Name
                      </label>
                      <input
                        name="name"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                      WhatsApp (Optional)
                    </label>
                    <input
                      name="whatsapp"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="+1 (234) 567-890"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows="4"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="How can we help?"
                    ></textarea>
                  </div>
                  <button
                    disabled={leadMutation.isPending}
                    className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    {leadMutation.isPending ? "Sending..." : "Send Message"}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl italic">
                  S
                </div>
                <span className="text-2xl font-bold tracking-tight text-white uppercase">
                  Simpcraftt
                </span>
              </div>
              <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
                Reimagining lifestyle through the lens of futuristic technology
                and premium craft. The era of Simpcraftt is just beginning.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { icon: <Instagram />, href: "#" },
                  { icon: <Facebook />, href: "#" },
                  { icon: <Twitter />, href: "#" },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    {React.cloneElement(social.icon, { size: 18 })}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-black uppercase tracking-widest mb-6">
                Navigation
              </h5>
              <ul className="space-y-4 text-gray-400 text-sm font-medium uppercase tracking-wider">
                <li>
                  <a
                    href="#preview"
                    className="hover:text-white transition-colors"
                  >
                    Preview
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-black uppercase tracking-widest mb-6">
                Legal
              </h5>
              <ul className="space-y-4 text-gray-400 text-sm font-medium uppercase tracking-wider">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
              &copy; 2026 Simpcraftt. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
              Simpcraftt.com - Coming Soon
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/1234567890"
        target="_blank"
        className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/50 hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
          Chat on WhatsApp
        </span>
      </a>

      {/* Styles are handled globally in layout.jsx */}
    </div>
  );
}
