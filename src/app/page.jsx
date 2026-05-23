"use client";

import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Mail,
  Menu,
  Send,
  Shield,
  Star,
  X,
  Zap
} from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

const REVEAL_EASE = [0.16, 1, 0.3, 1];
const REVEAL_VIEWPORT = { once: true, amount: 0.1, margin: "0px 0px 0px 0px" };
const HERO_STAGGER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

// --- Data ---
const FAQ_DATA = [
  {
    question: "What is INFIBOLT?",
    answer:
      "INFIBOLT is a premium lifestyle and electronics brand crafting high-quality, futuristic products that blend technology with elegance.",
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
    title: "INFIBOLT Audio Headset",
    category: "Premium Audio",
    description: "A clean wireless headset concept for focused listening and everyday comfort.",
    image:
      "/branding/products/hero-sec.png",
    accent: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "INFIBOLT Power Dock",
    category: "Charging Dock",
    description: "A compact wireless charging stand for phones and everyday smart devices.",
    image:
      "/branding/products/product2.png",
    accent: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "INFIBOLT Power Bank",
    category: "Portable Power",
    description:
      "Slim portable backup power for travel, work, and daily charging needs.",
    image:
      "/branding/products/product3.png",
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
    text: "INFIBOLT is bringing a level of detail back to electronics that I haven't seen in years. Can't wait for the drop!",
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
  "INFIBOLT Labs",
  "INFIBOLT Design",
  "INFIBOLT Audio",
  "INFIBOLT Power",
  "INFIBOLT Launch",
  "INFIBOLT Support",
  "INFIBOLT Future",
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
    // Launch target: July 1, 2026 (local time)
    const launchDate = new Date(2026, 6, 1, 0, 0, 0, 0);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      const safeDistance = Math.max(distance, 0);

      setTimeLeft({
        days: Math.floor(safeDistance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (safeDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((safeDistance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((safeDistance % (1000 * 60)) / 1000),
      });

      if (distance <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-2 sm:gap-4 md:gap-8 justify-center w-full max-w-full">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 flex items-center justify-center text-xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-2 shadow-sm dark:shadow-none transition-colors">
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
    const isMobile = window.innerWidth < 768;
    const particleArray = Array.from({ length: isMobile ? 12 : 40 }).map((_, i) => ({
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

const ProductCard = ({ product, idx, isMobile }) => {
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
      initial={{ opacity: 0.7, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.45, delay: idx * 0.06, ease: "easeOut" }}
      onMouseMove={isMobile ? undefined : handleMouseMove}
      onMouseLeave={isMobile ? undefined : handleMouseLeave}
      className="relative h-full w-full group scroll-reveal"
    >
      <motion.div
        style={{
          rotateX: isMobile ? 0 : rotateX,
          rotateY: isMobile ? 0 : rotateY,
          transformPerspective: 1000,
        }}
        className="relative h-full lux-panel rounded-[1.75rem] md:rounded-[2rem] p-4 sm:p-5 md:p-6 hover:bg-gray-50/80 dark:hover:bg-white/[0.08] transition-colors duration-200 cursor-pointer"
      >
        <motion.div style={{ x: isMobile ? 0 : translateX, y: isMobile ? 0 : translateY }} className="flex flex-col h-full pointer-events-none">
          <div className="mb-5 md:mb-6 aspect-[4/3] rounded-[1.35rem] md:rounded-[1.6rem] overflow-hidden relative shadow-lg">
            <img
              src={product.image}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
              alt={product.title}
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-text-base dark:text-text-base-dark transition-colors">
                {product.category}
              </span>
            </div>
          </div>
          <h3 className="text-2xl md:text-[1.7rem] luxury-title mb-3">{product.title}</h3>
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

const LoadingScreen = () => {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: "-100%" }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[9999] bg-[#f1efea] dark:bg-[#07090c] flex flex-col items-center justify-center lux-noise pointer-events-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <div className="mb-8">
          <BrandLogo className="scale-125 origin-center" />
        </div>
        
        <div className="w-48 h-[2px] bg-gray-300 dark:bg-gray-800 overflow-hidden relative rounded-full">
          <motion.div 
            className="absolute inset-0 bg-gray-900 dark:bg-white origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function LandingPage() {
  const systemReducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const prefersReducedMotion = !!systemReducedMotion;

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  useEffect(() => {
    const loaderSeen = sessionStorage.getItem("INFIBOLT_loader_seen") === "1";
    if (loaderSeen) {
      setIsLoading(false);
      return;
    }

    const minLoadTime = new Promise((resolve) => setTimeout(resolve, 1500));
    const windowLoad = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else {
        const onLoad = () => resolve();
        window.addEventListener("load", onLoad, { once: true });
      }
    });

    Promise.all([minLoadTime, windowLoad]).then(() => {
      sessionStorage.setItem("INFIBOLT_loader_seen", "1");
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const updateViewport = () => setIsMobileViewport(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateScrolled = () => {
      const next = window.scrollY > 50;
      setScrolled((prev) => (prev === next ? prev : next));
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrolled);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrolled();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { scrollY } = useScroll();
  const revealProps = (delay = 0, duration = 0.55, y = 14) => {
    const responsiveDelay = isMobileViewport ? Math.max(0, delay * 0.65) : delay;
    const responsiveDuration = isMobileViewport
      ? Math.max(0.4, duration - 0.08)
      : duration;
    const responsiveY = isMobileViewport ? Math.max(8, y - 2) : y;

    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        whileInView: { opacity: 1, y: 0 },
        viewport: REVEAL_VIEWPORT,
        transition: { duration: 0.01 },
      };
    }

    return {
      initial: { opacity: 0.8, y: responsiveY },
      whileInView: { opacity: 1, y: 0 },
      viewport: REVEAL_VIEWPORT,
      transition: { duration: responsiveDuration, delay: responsiveDelay, ease: REVEAL_EASE },
    };
  };

  const revealItem = (duration = 0.58, y = 14) => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.01 } },
      };
    }

    return {
      hidden: { opacity: 0.82, y },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: isMobileViewport ? Math.max(0.44, duration - 0.08) : duration,
          ease: REVEAL_EASE,
        },
      },
    };
  };
  
  // --- Hero Parallax Transforms ---
  const heroBgY = useTransform(scrollY, [0, 1000], ["0%", "15%"]);
  const heroTextY = useTransform(scrollY, [0, 1000], ["0%", "4%"]);
  const heroImageY = useTransform(scrollY, [0, 1000], ["0%", "0%"]);

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

  const handleMenuNavigate = (e, targetId) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    const navOffset = window.innerWidth < 768 ? 76 : 96;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#f1efea] text-text-base dark:bg-[#07090c] dark:text-text-base-dark font-satoshi selection:bg-blue-500/30 transition-colors duration-200 ease-out lux-noise">
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      <Toaster position="top-center" expand={true} richColors />

      {!prefersReducedMotion && <GlowingCursor />}

      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-200 ease-out">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(243,228,201,0.52),transparent_36%),radial-gradient(circle_at_88%_14%,rgba(174,194,212,0.3),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(212,186,168,0.22),transparent_40%)] dark:bg-[radial-gradient(circle_at_14%_18%,rgba(62,84,110,0.28),transparent_36%),radial-gradient(circle_at_88%_14%,rgba(72,82,94,0.22),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(84,66,86,0.22),transparent_40%)]" />
        <div className="absolute -top-[8%] right-[18%] w-[28rem] h-[28rem] bg-white/45 dark:bg-white/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[5%] left-[6%] w-[20rem] h-[20rem] bg-[#d3c2ad]/40 dark:bg-[#3f4d62]/20 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.55, ease: "easeOut" }}
        className={`navbar-shell fixed top-0 left-0 right-0 z-50 h-[76px] md:h-[88px] transition-colors duration-200 ease-out ${
          scrolled
            ? "bg-white/55 dark:bg-[#0a0c10]/70 backdrop-blur-xl border-b border-white/30 dark:border-white/10"
            : "bg-transparent border-b border-transparent backdrop-blur-xl"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <BrandLogo />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400">
            {["Preview", "Features", "Community", "FAQ", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => handleMenuNavigate(e, item.toLowerCase())}
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
              onClick={(e) => handleMenuNavigate(e, "notify")}
              className="px-6 py-2.5 bg-black/85 dark:bg-white/90 text-white dark:text-black text-sm font-bold rounded-full hover:scale-[1.03] transition-all uppercase tracking-wider"
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
              className="absolute top-full left-0 right-0 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-xl border-b border-black/10 dark:border-white/10 p-6 md:hidden flex flex-col gap-4 shadow-2xl"
            >
              {["Preview", "Features", "Community", "FAQ", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={(e) => handleMenuNavigate(e, item.toLowerCase())}
                    className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    {item}
                  </a>
                ),
              )}
              <a
                href="#notify"
                onClick={(e) => handleMenuNavigate(e, "notify")}
                className="mt-4 px-6 py-3 bg-black text-white dark:bg-white dark:text-black text-center font-bold rounded-xl"
              >
                Notify Me
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <motion.main
        initial={{ opacity: 0.98, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Hero Section */}
        <section className="relative pt-24 pb-14 md:pt-32 md:pb-20 lg:pt-36 lg:pb-24 px-4 sm:px-6 overflow-hidden lg:min-h-screen flex flex-col justify-center">
          {/* Parallax Background Layer */}
          <motion.div 
            style={prefersReducedMotion || isMobileViewport ? undefined : { y: heroBgY }} 
            className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
          >
            {!prefersReducedMotion && <ParticleBackground />}
            
            {/* Futuristic Concentric Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] border-[1.5px] border-blue-500/20 dark:border-blue-400/10 rounded-full opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[1200px] max-h-[1200px] border-[1.5px] border-purple-500/20 dark:border-purple-400/10 rounded-full opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160vw] h-[160vw] max-w-[1600px] max-h-[1600px] border-[1.5px] border-emerald-500/20 dark:border-emerald-400/10 rounded-full opacity-10" />
          </motion.div>

          <motion.div
            style={prefersReducedMotion || isMobileViewport ? undefined : { y: heroTextY }}
            className="container mx-auto max-w-7xl relative z-20"
          >
            <div className="grid xl:grid-cols-[1.04fr_0.96fr] gap-8 md:gap-10 xl:gap-16 items-center">
              <motion.div
                className="text-left"
                initial="hidden"
                animate="visible"
                variants={HERO_STAGGER}
              >
                <motion.div
                  variants={revealItem(0.62, 14)}
                  className="lux-panel rounded-[1.5rem] md:rounded-[2rem] px-4 py-4 sm:px-5 md:px-8 md:py-6 mb-6 md:mb-10 max-w-[34rem]"
                >
                  <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.18em] mb-4 font-bold">
                    Launch Countdown
                  </p>
                  <CountdownTimer />
                </motion.div>

                <motion.div
                  variants={revealItem(0.52, 12)}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full lux-panel mb-8"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 custom-pulse" />
                  <span className="text-[11px] md:text-xs font-bold hero-kicker text-blue-700 dark:text-blue-300 uppercase transition-colors">Collection Zero Arrives Soon</span>
                </motion.div>

                <motion.h1
                  variants={revealItem(0.72, 16)}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl luxury-heading mb-6 md:mb-9 xl:max-w-[12ch] break-words"
                >
                  Technology For The <span className="heading-highlight">Quiet Future</span>
                </motion.h1>

                <motion.p
                  variants={revealItem(0.62, 14)}
                  className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-[48ch] mb-8 md:mb-12 leading-relaxed"
                >
                  INFIBOLT blends precision electronics with cinematic material language.
                  Sculpted hardware, atmospheric interfaces, and a premium ecosystem built for the
                  next decade of everyday life.
                </motion.p>

                <motion.div
                  variants={revealItem(0.56, 14)}
                  className="flex flex-col sm:flex-row gap-4 items-start"
                >
                  <a
                    href="#notify"
                    className="group px-6 py-4 md:px-8 md:py-4 bg-black/90 dark:bg-white text-white dark:text-black font-black rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-all uppercase tracking-widest text-xs md:text-sm shadow-xl w-full sm:w-auto"
                  >
                    Reserve Access
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="#preview"
                    className="px-6 py-4 md:px-8 md:py-4 lux-panel text-text-base dark:text-text-base-dark font-black rounded-full hover:scale-[1.02] transition-all uppercase tracking-widest text-xs md:text-sm text-center w-full sm:w-auto"
                  >
                    Explore Vision
                  </a>
                </motion.div>
              </motion.div>

              <motion.div style={prefersReducedMotion || isMobileViewport ? undefined : { y: heroImageY }} className="relative lg:pt-2 w-full max-w-[32rem] md:max-w-[36rem] mx-auto xl:max-w-none">
                <motion.div
                  initial={{ opacity: prefersReducedMotion ? 1 : 0.82, y: prefersReducedMotion ? 0 : 26, scale: prefersReducedMotion ? 1 : 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.7, delay: prefersReducedMotion ? 0 : 0.18, ease: REVEAL_EASE }}
                  className="relative scroll-reveal"
                >
                  <motion.div
                    initial={{ opacity: prefersReducedMotion ? 1 : 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0.01 : 0.8, ease: "easeOut" }}
                    className="absolute inset-2 md:inset-0 bg-gradient-to-tr from-[#f2d8bb]/40 via-[#c4d4ea]/24 to-transparent dark:from-[#283344]/34 dark:via-[#334056]/24 blur-[56px] md:blur-[90px] -z-10 rounded-[3rem]"
                  />
                  <div className="lux-panel rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-5 relative overflow-hidden h-[340px] sm:h-[420px] md:h-[520px] xl:h-[560px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none" />
                    <img
                      src="/branding/products/hero-sec.png"
                      alt="INFIBOLT product preview"
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover object-center rounded-[1.2rem] md:rounded-[2rem] transition-transform duration-500 ease-out hover:scale-[1.02]"
                    />
                    <motion.div
                      animate={{ y: [-4, 6, -4] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-8 right-6 bg-white/85 dark:bg-black/65 backdrop-blur-xl border border-white/60 dark:border-white/20 p-4 rounded-2xl shadow-2xl hidden md:flex items-center gap-4 scroll-reveal"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Neural Core</p>
                        <p className="text-sm font-black text-black dark:text-white">SC-A1 Architecture</p>
                      </div>
                    </motion.div>
                    <motion.div
                      animate={{ y: [4, -4, 4] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                      className="absolute bottom-8 left-6 bg-white/85 dark:bg-black/65 backdrop-blur-xl border border-white/60 dark:border-white/20 p-4 rounded-2xl shadow-2xl hidden md:flex items-center gap-4 scroll-reveal"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Ambient Charge</p>
                        <p className="text-sm font-black text-black dark:text-white">HyperCharge 2.0</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <BrandMarquee />

        {/* Brand Intro */}
        <motion.section id="preview" className="py-16 md:py-24 px-4 sm:px-6 transition-colors scroll-reveal" {...revealProps(0.02, 0.8, 20)}>
          <div className="container mx-auto max-w-7xl">
            <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-10 md:gap-12 lg:gap-16 items-center">
              <div>
                <span className="text-blue-500 font-black tracking-widest uppercase text-sm mb-4 block">
                  About INFIBOLT
                </span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl luxury-title mb-6 md:mb-8">
                  Where Innovation <br /> Meets Craftsmanship
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed transition-colors">
                  Founded on the principles of simplicity and craft, INFIBOLT
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
              <div className="lux-panel rounded-[1.75rem] md:rounded-[2.25rem] p-3 md:p-5 overflow-hidden w-full max-w-[42rem] mx-auto xl:mx-0">
                <img
                  src="/branding/products/product3.png"
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[4/3] object-cover object-center rounded-[1.4rem] md:rounded-[1.8rem]"
                  alt="INFIBOLT portable power product"
                />
              </div>
            </div>
          </div>
        </motion.section>

    {/* Product Teaser Showcase */}
    <motion.section className="py-16 md:py-24 px-4 sm:px-6 scroll-reveal" {...revealProps(0.02, 0.8, 20)}>
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 md:mb-14 max-w-3xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl luxury-title mb-5">
            Upcoming Lineup
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl transition-colors">
            A first look at the products that will define the next
            generation of premium tech.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
          {PRODUCTS_TEASER.map((product, idx) => (
            <ProductCard key={product.title} product={product} idx={idx} isMobile={isMobileViewport} />
          ))}
        </div>
      </div>
    </motion.section>

        {/* Features / Why Choose Us */}
        <motion.section id="features" className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden scroll-reveal" {...revealProps(0.02, 0.8, 20)}>
          <div className="container mx-auto max-w-7xl">
            <div className="lux-panel rounded-[1.75rem] md:rounded-[2.5rem] p-5 sm:p-8 md:p-12 lg:p-16 xl:p-20 relative transition-colors">
              <RotatingGridBackground />
              <div className="max-w-full lg:max-w-[55%] xl:max-w-3xl relative z-10">
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl luxury-title mb-8 md:mb-12">
                  The INFIBOLT <br /> Advantage
                </h2>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1, margin: "0px 0px -12% 0px" }}
                  variants={{
                    visible: { transition: { staggerChildren: 0.08 } },
                    hidden: {},
                  }}
                  className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10 scroll-reveal"
                >
                  {FEATURES.map((feature) => (
                    <motion.div
                      key={feature.title}
                      variants={{
                        hidden: { opacity: 0.72, y: 10 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
                      }}
                      className="space-y-4 scroll-reveal"
                    >
                      <div className="w-12 h-12 bg-blue-100 dark:bg-white/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-white transition-colors">
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-bold">{feature.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transition-colors">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              <div className="hidden lg:block absolute -right-6 xl:-right-12 top-1/2 -translate-y-1/2 z-10 scale-[0.6] lg:scale-75 xl:scale-100 origin-right pointer-events-none">
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
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
                    initial={{ y: 15, rotate: 0 }}
                    animate={{ y: [6, -6, 6], rotate: [0, 4, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -top-12 -left-12 w-28 h-28 bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 rounded-3xl flex items-center justify-center shadow-2xl transition-colors"
                  >
                    <Cpu className="w-12 h-12 text-blue-600 dark:text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]" />
                  </motion.div>

                  <motion.div
                    initial={{ y: -15, rotate: 0 }}
                    animate={{ y: [-6, 6, -6], rotate: [0, -4, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 rounded-full flex items-center justify-center shadow-2xl transition-colors"
                  >
                    <Zap className="w-10 h-10 text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section id="community" className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden scroll-reveal" {...revealProps(0.02, 0.8, 20)}>
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl luxury-title mb-5">
                Community Hype
              </h2>
              <p className="text-gray-600 dark:text-gray-400 transition-colors">
                Join thousands of others waiting for the INFIBOLT era.
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-5 md:gap-8 max-w-4xl mx-auto">
              {TESTIMONIALS.map((t, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0.72, y: 10, scale: 0.985 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.1, margin: "0px 0px -12% 0px" }}
                  transition={{ duration: 0.45, delay: idx * 0.06, ease: "easeOut" }}
                  className="lux-panel rounded-[2rem] p-8 relative transition-colors scroll-reveal"
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
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          id="faq"
          className="py-16 md:py-24 px-4 sm:px-6 transition-colors scroll-reveal"
          initial={{ opacity: 0.75, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px 0px -12% 0px" }}
          transition={{ duration: 0.8, ease: REVEAL_EASE }}
        >
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl luxury-title mb-4">
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
        </motion.section>

        {/* Newsletter Section */}
        <motion.section
          id="notify"
          className="py-16 md:py-24 px-4 sm:px-6 scroll-reveal"
          initial={{ opacity: 0.75, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px 0px -12% 0px" }}
          transition={{ duration: 0.8, ease: REVEAL_EASE }}
        >
          <div className="container mx-auto max-w-5xl">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-[1.75rem] md:rounded-[2.5rem] p-6 sm:p-10 md:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/20 dark:shadow-none transition-colors">
              <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white blur-3xl rounded-full" />
                <div className="absolute bottom-10 right-10 w-20 h-20 bg-white blur-3xl rounded-full" />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl luxury-title mb-6 break-words">
                Stay <span className="heading-highlight ml-2">Ahead</span> of <br className="hidden sm:block" />
                the <span className="heading-highlight ml-2">Curve</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/90 dark:text-white/80 mb-8 md:mb-10 max-w-xl mx-auto transition-colors">
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
        </motion.section>

        {/* Contact/Lead Section */}
        <motion.section
          id="contact"
          className="py-16 md:py-24 px-4 sm:px-6 transition-colors scroll-reveal"
          initial={{ opacity: 0.75, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px 0px -12% 0px" }}
          transition={{ duration: 0.8, ease: REVEAL_EASE }}
        >
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-10 md:gap-14 xl:gap-16">
              <div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl luxury-title mb-6 md:mb-8">
                  Get In Touch
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 md:mb-12 leading-relaxed transition-colors">
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
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">hello@infibolt.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-600/20 rounded-2xl flex items-center justify-center transition-colors">
                      <ChevronRight className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">
                        Launch Enquiries
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">
                        Product updates, partnership queries, and early access requests.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lux-panel rounded-[1.75rem] md:rounded-[2.5rem] p-5 sm:p-8 md:p-10 lg:p-12 transition-colors">
                <form onSubmit={handleLeadSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 transition-colors ml-2">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        required
                        className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 rounded-2xl px-5 py-4 md:px-6 focus:outline-none focus:border-gray-400 dark:focus:border-white/20 transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 transition-colors ml-2">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 rounded-2xl px-5 py-4 md:px-6 focus:outline-none focus:border-gray-400 dark:focus:border-white/20 transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 transition-colors ml-2">
                      Phone (Optional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 rounded-2xl px-5 py-4 md:px-6 focus:outline-none focus:border-gray-400 dark:focus:border-white/20 transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 transition-colors ml-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 rounded-2xl px-5 py-4 md:px-6 focus:outline-none focus:border-gray-400 dark:focus:border-white/20 transition-colors resize-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
                      placeholder="How can we help?"
                    ></textarea>
                  </div>
                  <button
                    disabled={leadMutation.isPending}
                    className="w-full py-5 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.15em] text-xs rounded-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 shadow-[0_10px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(255,255,255,0.1)] disabled:opacity-50"
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
      <footer className="py-14 md:py-20 px-4 sm:px-6 border-t border-gray-200/50 dark:border-white/5 transition-colors relative z-10 bg-white/30 dark:bg-[#030305]/30 backdrop-blur-3xl">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-8">
                <BrandLogo />
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-8 md:mb-10 leading-relaxed transition-colors text-base md:text-lg">
                Reimagining lifestyle through the lens of futuristic technology
                and premium craft. The era of INFIBOLT is just beginning.
              </p>
              <a
                href="mailto:hello@infibolt.com"
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Contact INFIBOLT
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-900 dark:text-white transition-colors">
                Navigation
              </h5>
              <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-widest transition-colors">
                <li>
                  <a
                    href="#preview"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Preview
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-900 dark:text-white transition-colors">
                Legal
              </h5>
              <ul className="space-y-4 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-widest transition-colors">
                <li>
                  <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200/50 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-center md:text-left transition-colors">
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.16em] md:tracking-[0.2em] font-bold">
              &copy; 2026 INFIBOLT. All rights reserved.
            </p>
            <a
              href="https://www.softsitesolution.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-[0.16em] md:tracking-[0.2em] font-bold transition-colors"
            >
              Developed by SoftSiteSolutions
            </a>
          </div>
        </div>
      </footer>

      {/* Styles are handled globally in layout.jsx */}
    </div>
  );
}
