export const platformStatus = {
  directCheckoutEnabled: false,
  paymentsEnabled: false,
  accountOrdersEnabled: false,
};

export const categories = [
  { id: "audio", name: "Audio", icon: "headphones", description: "Cinematic sound for focused work and deep listening.", desktopMenuVisible: true, sortOrder: 1 },
  { id: "wearables", name: "Wearables", icon: "watch", description: "Health, time, and everyday intelligence in premium hardware.", desktopMenuVisible: true, sortOrder: 2 },
  { id: "charging", name: "Charging", icon: "zap", description: "Fast, clean power systems for modern device ecosystems.", desktopMenuVisible: true, sortOrder: 3 },
  { id: "home-tech", name: "Home Tech", icon: "home", description: "Connected lifestyle tools for premium everyday spaces.", desktopMenuVisible: true, sortOrder: 4 },
];

export const products = [
  {
    slug: "aura-audio-pro",
    name: "Aura Audio Pro",
    category: "audio",
    price: 7999,
    rating: 4.8,
    reviewCount: 214,
    badge: "Flagship",
    desktopMenuFeatured: true,
    status: "ready",
    summary: "Hybrid active noise cancellation with a cinematic, low-distortion soundstage.",
    description:
      "Aura Audio Pro is engineered for premium listening, calls, and travel with a lightweight shell, adaptive microphones, and studio-inspired tuning.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1400",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&q=80&w=1400",
    ],
    variants: ["Obsidian", "Ice Alloy"],
    features: ["Hybrid ANC", "40-hour battery", "Low-latency mode", "Spatial audio profile"],
    specs: {
      Driver: "40mm graphene composite",
      Battery: "Up to 40 hours",
      Charging: "USB-C fast charge",
      Warranty: "12 months limited warranty",
    },
    marketplace: {
      amazon: "https://www.amazon.in/",
      flipkart: "https://www.flipkart.com/",
      custom: "https://infibolt.com/",
    },
  },
  {
    slug: "nova-watch-x",
    name: "Nova Watch X",
    category: "wearables",
    price: 11999,
    rating: 4.7,
    reviewCount: 168,
    badge: "New",
    status: "Preview",
    summary: "Titanium-inspired smartwatch with health tracking and an edge-to-edge AMOLED display.",
    description:
      "Nova Watch X blends modern wellness sensors, long battery life, and an elegant interface built around daily rituals.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1400",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=1400",
    ],
    variants: ["Graphite", "Mist Silver", "Solar Sand"],
    features: ["AMOLED display", "Sleep intelligence", "Workout tracking", "5ATM water resistance"],
    specs: {
      Display: "1.43 inch AMOLED",
      Battery: "Up to 10 days",
      Sensors: "Heart rate, SpO2, motion",
      Warranty: "12 months limited warranty",
    },
    marketplace: {
      amazon: "https://www.amazon.in/",
      flipkart: "https://www.flipkart.com/",
      custom: "https://infibolt.com/",
    },
  },
  {
    slug: "echo-charge-max",
    name: "Echo Charge Max",
    category: "charging",
    price: 3499,
    rating: 4.6,
    reviewCount: 91,
    badge: "Fast Charge",
    status: "ready",
    summary: "Magnetic wireless charger with thermal control and multi-device power routing.",
    description:
      "Echo Charge Max keeps your everyday devices topped up with a slim footprint, intelligent temperature control, and premium desk presence.",
    image:
      "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&q=80&w=1400",
    gallery: [
      "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1603539444875-76e7684265f6?auto=format&fit=crop&q=80&w=1400",
    ],
    variants: ["Slate", "Pearl"],
    features: ["15W wireless charging", "Thermal monitoring", "USB-C PD input", "Desk-safe silicone base"],
    specs: {
      Output: "Up to 15W wireless",
      Input: "USB-C PD 30W",
      Material: "Aluminium shell",
      Warranty: "12 months limited warranty",
    },
    marketplace: {
      amazon: "https://www.amazon.in/",
      flipkart: "https://www.flipkart.com/",
      custom: "https://infibolt.com/",
    },
  },
  {
    slug: "lumen-hub-studio",
    name: "Lumen Hub Studio",
    category: "home-tech",
    price: 5999,
    rating: 4.5,
    reviewCount: 63,
    badge: "Studio",
    status: "Prototype",
    summary: "A compact control hub for lighting scenes, focus sessions, and smart desk automation.",
    description:
      "Lumen Hub Studio gives creators a tactile command center for lighting, sound profiles, and everyday smart routines.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1400",
    gallery: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1400",
    ],
    variants: ["Matte Black"],
    features: ["Scene presets", "Smart home ready", "Creator controls", "Compact aluminium body"],
    specs: {
      Connectivity: "Wi-Fi and Bluetooth",
      Controls: "Dial and touch keys",
      Power: "USB-C",
      Warranty: "12 months limited warranty",
    },
    marketplace: {
      amazon: "https://www.amazon.in/",
      flipkart: "https://www.flipkart.com/",
      custom: "https://infibolt.com/",
    },
  },
  {
    slug: "pulse-pack-slim",
    name: "Pulse Pack Slim",
    category: "charging",
    price: 2499,
    rating: 4.4,
    reviewCount: 52,
    badge: "Travel",
    status: "Preview",
    summary: "Ultra-slim power bank for pockets, bags, and long days away from the desk.",
    description:
      "Pulse Pack Slim is a portable charging layer with smart power delivery and a pocket-friendly industrial design.",
    image:
      "https://images.unsplash.com/photo-1609592424825-13b2219b1a48?auto=format&fit=crop&q=80&w=1400",
    gallery: [
      "https://images.unsplash.com/photo-1609592424825-13b2219b1a48?auto=format&fit=crop&q=80&w=1400",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=1400",
    ],
    variants: ["Cloud", "Graphite"],
    features: ["10,000mAh capacity", "22.5W fast charge", "USB-C input/output", "Travel-safe chipset"],
    specs: {
      Capacity: "10,000mAh",
      Output: "22.5W max",
      Ports: "USB-C and USB-A",
      Warranty: "12 months limited warranty",
    },
    marketplace: {
      amazon: "https://www.amazon.in/",
      flipkart: "https://www.flipkart.com/",
      custom: "https://infibolt.com/",
    },
  },
];

export const faqs = [
  {
    question: "Where can I purchase INFIBOLT products?",
    answer: "INFIBOLT products can be purchased through trusted marketplace and retail launch partners including Amazon, Flipkart, and selected offline channels.",
  },
  {
    question: "Which launch partners are available?",
    answer: "Availability may vary by product. Each product page shows the trusted purchase options currently available for that device.",
  },
  {
    question: "How do I register my device for warranty coverage?",
    answer: "After purchase, you can securely register your product using your invoice and serial number to activate warranty coverage and support services.",
  },
  {
    question: "How does ownership verification work after purchase?",
    answer: "Sign in to your INFIBOLT account, add your product details, and verify ownership through your registered email for a protected care experience.",
  },
];

export const getProductBySlug = (slug) => products.find((product) => product.slug === slug);
export const getCategoryById = (id) => categories.find((category) => category.id === id);
export const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);


