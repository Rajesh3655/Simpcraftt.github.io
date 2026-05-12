"use client";

import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Facebook,
  Instagram,
  Mail,
  Menu,
  MessageCircle,
  Send,
  Shield,
  Star,
  Twitter,
  X,
  Zap
} from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import ThemeToggle from "./ThemeToggle";

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
    accent: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Nova Watch X",
    category: "Wearables",
    description: "Futuristic health tracking meets aerospace-grade titanium.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
    accent: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Echo Charge Max",
    category: "Charging",
    description:
      "The fastest wireless charging ecosystem for your smart devices.",
    image:
      "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&q=80&w=800",
    accent: "text-emerald-600 dark:text-emerald-400",
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

const MARQUEE_BRANDS = [
  "TechCrunch",
  "Wired",
  "The Verge",
  "Forbes",
  "Gizmodo",
  "Engadget",
  "Mashable",
];

// --- Components ---

const GlowingCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring physics for the trailing effect
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <>
      {/* Tiny bright core */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 -ml-[6px] -mt-[6px] rounded-full bg-blue-500/50 dark:bg-blue-400/80 blur-[1px] pointer-events-none z-[100] hidden md:block"
        style={{ x: cursorXSpring, y: cursorYSpring }}
      />
      {/* Large soft tracking aura */}
      <motion.div
        className="fixed top-0 left-0 w-80 h-80 -ml-40 -mt-40 rounded-full bg-blue-500/10 dark:bg-purple-500/10 blur-[80px] pointer-events-none z-[40] hidden md:block"
        style={{ x: cursorXSpring, y: cursorYSpring }}
      />
    </>
  );
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 15); // Launch in 15 days

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

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
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl w-16 h-16 md:w-24 md:h-24 flex items-center justify-center text-4xl font-bold text-black dark:text-white mb-2 shadow-sm dark:shadow-none transition-colors">
            {value.toString().padStart(2, "0")}
          </div>
          <span className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 font-medium transition-colors">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles only on the client side to avoid hydration mismatch
    const particleArray = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      moveX: (Math.random() - 0.5) * 80,
      moveY: (Math.random() - 0.5) * 80,
      duration: Math.random() * 10 + 10, // 10s to 20s
      delay: Math.random() * 5,
    }));
    setParticles(particleArray);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-500/40 dark:bg-blue-400/30 shadow-[0_0_12px_rgba(59,130,246,0.6)] blur-[1px]"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            x: [0, p.moveX, 0],
            y: [0, p.moveY, 0],
            opacity: [0, 0.6, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

const RotatingGridBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none z-0">
      <div
        className="absolute inset-0 opacity-20 dark:opacity-30 flex items-center justify-center"
        style={{
          WebkitMaskImage: "radial-gradient(ellipse at center, white, transparent 70%)",
          maskImage: "radial-gradient(ellipse at center, white, transparent 70%)",
        }}
      >
        <div
          className="absolute w-[300%] h-[300%] md:w-[200%] md:h-[200%]"
          style={{ transform: "perspective(1000px) rotateX(60deg) translateZ(0)" }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.4) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const BrandMarquee = () => {
  const content = [...MARQUEE_BRANDS, ...MARQUEE_BRANDS, ...MARQUEE_BRANDS, ...MARQUEE_BRANDS];

  return (
    <div className="w-full overflow-hidden border-y border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-surface-dark/5 backdrop-blur-md py-8 flex transition-colors relative z-20">
      <motion.div
        className="flex w-max items-center"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        {content.map((brand, i) => (
          <div key={i} className="flex items-center">
            <span className="text-2xl font-black tracking-widest text-gray-400 dark:text-gray-600 uppercase transition-colors px-12 md:px-20 hover:text-gray-600 dark:hover:text-gray-300 cursor-default">
              {brand}
            </span>
            <Star className="w-6 h-6 text-gray-300 dark:text-gray-700 transition-colors" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const FAQItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-white/10 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-xl font-medium text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors" />
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
            <p className="pb-6 text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductCard = ({ product, idx }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], ["-15px", "15px"]);
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], ["-15px", "15px"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-full w-full group"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1000,
        }}
        className="relative h-full bg-surface dark:bg-surface-dark/5 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 md:p-8 hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-colors duration-500 shadow-lg shadow-gray-200/50 dark:shadow-none cursor-pointer"
      >
        <motion.div style={{ x: translateX, y: translateY }} className="flex flex-col h-full pointer-events-none">
          <div className="mb-6 md:mb-8 aspect-[4/3] rounded-[2rem] overflow-hidden relative shadow-lg">
            <img
              src={product.image}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              alt={product.title}
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-text-base dark:text-text-base-dark transition-colors">
                {product.category}
              </span>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-sreda font-bold mb-3">{product.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed transition-colors flex-1">
            {product.description}
          </p>
          <div className={`text-xs font-black uppercase tracking-[0.2em] ${product.accent} transition-colors`}>
            Coming Soon
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
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

  const { scrollY } = useScroll();
  
  // --- Hero Parallax Transforms ---
  const heroBgY = useTransform(scrollY, [0, 1000], ["0%", "40%"]);
  const heroBgOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroTextY = useTransform(scrollY, [0, 1000], ["0%", "60%"]);
  const heroTextOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroImageY = useTransform(scrollY, [0, 1000], ["0%", "-15%"]);

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
    <div className="min-h-screen bg-surface text-text-base dark:bg-surface-dark dark:text-text-base-dark font-plus-jakarta-sans selection:bg-blue-500/30 transition-colors duration-500 ease-in-out">
      <Toaster position="top-center" expand={true} richColors />

      <GlowingCursor />

      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-500">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-300/30 dark:bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-purple-300/30 dark:bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-emerald-300/30 dark:bg-emerald-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-[#050505]/80 backdrop-blur-lg border-b border-black/5 dark:border-white/5 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl italic">
              S
            </div>
            <span className="text-2xl font-sreda font-bold tracking-tight text-black dark:text-white uppercase">
              Simpcraftt
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400">
            {["Preview", "Features", "Community", "FAQ", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-black dark:hover:text-white transition-colors uppercase"
                >
                  {item}
                </a>
              ),
            )}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            <a
              href="#notify"
              className="px-6 py-2.5 bg-brand-primary dark:bg-brand-primary-dark text-white text-sm font-bold rounded-full hover:bg-opacity-90 transition-all uppercase tracking-wider"
            >
              Notify Me
            </a>
          </div>

          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-black dark:text-white"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-white dark:bg-[#050505] border-b border-black/10 dark:border-white/10 p-6 md:hidden flex flex-col gap-4"
            >
              {["Preview", "Features", "Community", "FAQ", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    {item}
                  </a>
                ),
              )}
              <a
                href="#notify"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 px-6 py-3 bg-black text-white dark:bg-white dark:text-black text-center font-bold rounded-xl"
              >
                Notify Me
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          {/* Parallax Background Layer */}
          <motion.div 
            style={{ y: heroBgY, opacity: heroBgOpacity }} 
            className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
          >
            <ParticleBackground />
            
            {/* Futuristic Concentric Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] border-[1.5px] border-blue-500/20 dark:border-blue-400/10 rounded-full opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[1200px] max-h-[1200px] border-[1.5px] border-purple-500/20 dark:border-purple-400/10 rounded-full opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160vw] h-[160vw] max-w-[1600px] max-h-[1600px] border-[1.5px] border-emerald-500/20 dark:border-emerald-400/10 rounded-full opacity-10" />
          </motion.div>

          {/* Parallax Text Layer */}
          <motion.div 
            style={{ y: heroTextY, opacity: heroTextOpacity }} 
            className="container mx-auto text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-md mb-8 shadow-sm dark:shadow-none transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 custom-pulse" />
              <span className="text-sm font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase transition-colors">
                Official Website Launching Soon
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-8xl font-sreda font-bold mb-6 tracking-tight leading-[1.1]"
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
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed transition-colors"
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
                className="group px-8 py-4 bg-brand-primary dark:bg-brand-primary-dark text-white font-black rounded-full flex items-center gap-2 hover:scale-105 transition-all uppercase tracking-widest text-sm shadow-xl hover:bg-opacity-90"
              >
                Notify Me When Live
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#preview"
                className="px-8 py-4 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 text-text-base dark:text-text-base-dark font-black rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all uppercase tracking-widest text-sm shadow-sm dark:shadow-none"
              >
                Upcoming Preview
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Teaser Visual Parallax Wrapper */}
          <motion.div style={{ y: heroImageY }} className="relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-20 container mx-auto px-6"
            >
            <div className="relative group max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-300/40 dark:from-blue-600/20 to-transparent blur-[80px] -z-10 group-hover:bg-blue-400/40 dark:group-hover:bg-blue-600/30 transition-all duration-700" />
              <div className="rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/20 bg-white/50 dark:bg-white/5 backdrop-blur-sm p-4 transition-colors relative">
                <img
                  src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1600"
                  alt="Simpcraftt Premium Device"
                  className="w-full h-auto rounded-[1.5rem] md:rounded-[2.5rem] transition-transform duration-1000 group-hover:scale-[1.02]"
                />
                
                {/* Floating AI / Specs Tag 1 */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-12 right-12 bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-white/40 dark:border-white/10 p-4 rounded-2xl shadow-2xl hidden md:flex items-center gap-4 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center transition-colors">
                    <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 transition-colors">Neural Engine</p>
                    <p className="text-sm font-black text-black dark:text-white transition-colors">SC-A1 Chip</p>
                  </div>
                </motion.div>

                {/* Floating AI / Specs Tag 2 */}
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-12 left-12 bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-white/40 dark:border-white/10 p-4 rounded-2xl shadow-2xl hidden md:flex items-center gap-4 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center transition-colors">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 transition-colors">Power Output</p>
                    <p className="text-sm font-black text-black dark:text-white transition-colors">HyperCharge 2.0</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          </motion.div>
        </section>

        <BrandMarquee />

        {/* Brand Intro */}
        <section id="preview" className="py-24 px-6 bg-surface dark:bg-white/[0.02] transition-colors">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-blue-500 font-black tracking-widest uppercase text-sm mb-4 block">
                  About Simpcraftt
                </span>
                <h2 className="text-5xl font-sreda font-bold mb-8 leading-tight">
                  Where Innovation <br /> Meets Craftsmanship
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed transition-colors">
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
                      <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">{item}</span>
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
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center p-8 transition-colors">
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
          <h2 className="text-6xl font-sreda font-bold mb-4">
            Upcoming Lineup
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto transition-colors">
            A first look at the products that will define the next
            generation of premium tech.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PRODUCTS_TEASER.map((product, idx) => (
            <ProductCard key={product.title} product={product} idx={idx} />
          ))}
        </div>
      </div>
    </section>

        {/* Features / Why Choose Us */}
        <section id="features" className="py-24 px-6 relative overflow-hidden">
          <div className="container mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-600/10 dark:to-purple-600/10 border border-gray-200 dark:border-white/10 rounded-[3rem] p-12 md:p-24 relative shadow-xl shadow-gray-200/50 dark:shadow-none transition-colors">
              <RotatingGridBackground />
              <div className="max-w-3xl relative z-10">
                <h2 className="text-6xl font-sreda font-bold mb-12">
                  The Simpcraftt <br /> Advantage
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                  {FEATURES.map((feature) => (
                    <div key={feature.title} className="space-y-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-white/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-white transition-colors">
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-bold">{feature.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block absolute -right-12 top-1/2 -translate-y-1/2 z-10">
                <motion.div
                  animate={{ y: [-20, 20, -20] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-[80px] rounded-full" />
                  <div className="relative w-80 h-80 bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-colors">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                    
                    <div className="relative w-32 h-32 mb-6 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                      <Shield className="w-16 h-16 text-white drop-shadow-md" />
                    </div>

                    <div className="text-center relative z-10 space-y-3">
                      <div className="h-2 w-16 bg-blue-500/40 rounded-full mx-auto" />
                      <div className="h-2 w-24 bg-purple-500/40 rounded-full mx-auto" />
                    </div>
                  </div>

                  <motion.div
                    animate={{ y: [15, -15, 15], rotate: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -top-12 -left-12 w-28 h-28 bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 rounded-3xl flex items-center justify-center shadow-2xl transition-colors"
                  >
                    <Cpu className="w-12 h-12 text-blue-600 dark:text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [-15, 15, -15], rotate: [0, -10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 rounded-full flex items-center justify-center shadow-2xl transition-colors"
                  >
                    <Zap className="w-10 h-10 text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="community" className="py-24 px-6 relative overflow-hidden">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-6xl font-sreda font-bold mb-4">
                Community Hype
              </h2>
              <p className="text-gray-600 dark:text-gray-400 transition-colors">
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
                  className="bg-surface dark:bg-surface-dark/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative shadow-lg shadow-gray-200/50 dark:shadow-none transition-colors"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-widest transition-colors">
                        {t.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-text-base dark:text-text-base-dark italic leading-relaxed transition-colors">
                    "{t.text}"
                  </p>
                  <div className="absolute top-8 right-8 opacity-5 dark:opacity-10 transition-opacity">
                    <Star
                      className="w-12 h-12 text-black dark:text-white transition-colors"
                      fill="currentColor"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-6 bg-surface dark:bg-white/[0.02] transition-colors">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-sreda font-bold mb-4 tracking-tight">
                Common Inquiries
              </h2>
              <p className="text-gray-600 dark:text-gray-400 transition-colors">
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
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20 dark:shadow-none transition-colors">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white blur-3xl rounded-full" />
                <div className="absolute bottom-10 right-10 w-20 h-20 bg-white blur-3xl rounded-full" />
              </div>

              <h2 className="text-6xl font-sreda font-bold mb-6">
                Stay Ahead of <br /> the Curve
              </h2>
              <p className="text-xl text-white/90 dark:text-white/80 mb-10 max-w-xl mx-auto transition-colors">
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
                  className="flex-1 bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-full px-8 py-4 text-white placeholder:text-white/70 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 dark:focus:ring-white/30 backdrop-blur-md transition-colors"
                />
                <button
                  disabled={newsletterMutation.isPending}
                  className="bg-white text-brand-primary dark:text-brand-primary-dark px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                >
                  {newsletterMutation.isPending ? "Joining..." : "Notify Me"}
                </button>
              </form>
              <p className="mt-6 text-xs text-white/90 dark:text-white/60 font-medium uppercase tracking-widest italic transition-colors">
                Early bird access for the first 1,000 subscribers
              </p>
            </div>
          </div>
        </section>

        {/* Contact/Lead Section */}
        <motion.section id="contact" className="py-24 px-6 bg-surface dark:bg-white/[0.01] transition-colors">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h2 className="text-6xl font-sreda font-bold mb-8">
                  Get In Touch
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 leading-relaxed transition-colors">
                  Have questions about our technology or want to partner with
                  us? Our team is ready to connect with visionaries and early
                  adopters.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-600/20 rounded-2xl flex items-center justify-center transition-colors">
                      <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">Email Support</h4>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">hello@simpcraftt.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-600/20 rounded-2xl flex items-center justify-center transition-colors">
                      <MessageCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">
                        WhatsApp Quick Chat
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">Response within 24 hours</p>
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

              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-md shadow-2xl shadow-gray-200/50 dark:shadow-none transition-colors">
                <form onSubmit={handleLeadSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 transition-colors">
                        Name
                      </label>
                      <input
                        name="name"
                        required
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 transition-colors">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 transition-colors">
                      WhatsApp (Optional)
                    </label>
                    <input
                      name="whatsapp"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="+1 (234) 567-890"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-500 transition-colors">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows="4"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 transition-colors resize-none text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="How can we help?"
                    ></textarea>
                  </div>
                  <button
                    disabled={leadMutation.isPending}
                    className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-lg dark:shadow-none disabled:opacity-50"
                  >
                    {leadMutation.isPending ? "Sending..." : "Send Message"}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.main>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-200 dark:border-white/10 transition-colors">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl italic">
                  S
                </div>
                <span className="text-2xl font-sreda font-bold tracking-tight text-black dark:text-white uppercase transition-colors">
                  Simpcraftt
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-8 leading-relaxed transition-colors">
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
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                  >
                    {React.cloneElement(social.icon, { size: 18 })}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-black uppercase tracking-widest mb-6 text-black dark:text-white transition-colors">
                Navigation
              </h5>
              <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wider transition-colors">
                <li>
                  <a
                    href="#preview"
                    className="hover:text-black dark:hover:text-white transition-colors"
                  >
                    Preview
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-black dark:hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-black dark:hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-black dark:hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-black uppercase tracking-widest mb-6 text-black dark:text-white transition-colors">
                Legal
              </h5>
              <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wider transition-colors">
                <li>
                  <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors">
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
