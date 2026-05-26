export const categories = [
  { id: "audio", name: "Audio", icon: "headphones", description: "Cinematic sound for focused work and deep listening.", desktopMenuVisible: true, sortOrder: 1 },
  { id: "wearables", name: "Wearables", icon: "watch", description: "Health, time, and everyday intelligence in premium hardware.", desktopMenuVisible: true, sortOrder: 2 },
  { id: "charging", name: "Charging", icon: "zap", description: "Fast, clean power systems for modern device ecosystems.", desktopMenuVisible: true, sortOrder: 3 },
  { id: "home-tech", name: "Home Tech", icon: "home", description: "Connected lifestyle tools for premium everyday spaces.", desktopMenuVisible: true, sortOrder: 4 },
];

export const collections = [
  { slug: "launch-edition", name: "Launch Edition", productSlugs: ["aura-audio-pro", "nova-watch-x", "echo-charge-max"] },
  { slug: "desk-essentials", name: "Desk Essentials", productSlugs: ["echo-charge-max", "lumen-hub-studio"] },
  { slug: "mobility-kit", name: "Mobility Kit", productSlugs: ["nova-watch-x", "pulse-pack-slim"] },
];

export const products = [
  {
    slug: "aura-audio-pro",
    name: "Aura Audio Pro",
    category: "audio",
    collection: "launch-edition",
    price: 7999,
    rating: 4.8,
    reviewCount: 214,
    badge: "Flagship",
    status: "Ready",
    featured: true,
    desktopMenuFeatured: true,
    visibility: "public",
    summary: "Hybrid active noise cancellation with a cinematic, low-distortion soundstage.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1400",
    marketplace: { amazon: "https://www.amazon.in/", flipkart: "https://www.flipkart.com/", custom: "https://infibolt.com/" },
  },
  {
    slug: "nova-watch-x",
    name: "Nova Watch X",
    category: "wearables",
    collection: "launch-edition",
    price: 11999,
    rating: 4.7,
    reviewCount: 168,
    badge: "New",
    status: "Preview",
    featured: true,
    visibility: "public",
    summary: "Titanium-inspired smartwatch with health tracking and an edge-to-edge AMOLED display.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1400",
    marketplace: { amazon: "https://www.amazon.in/", flipkart: "https://www.flipkart.com/", custom: "https://infibolt.com/" },
  },
  {
    slug: "echo-charge-max",
    name: "Echo Charge Max",
    category: "charging",
    collection: "launch-edition",
    price: 3499,
    rating: 4.6,
    reviewCount: 91,
    badge: "Fast Charge",
    status: "Ready",
    featured: true,
    visibility: "public",
    summary: "Magnetic wireless charger with thermal control and multi-device power routing.",
    image: "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&q=80&w=1400",
    marketplace: { amazon: "https://www.amazon.in/", flipkart: "https://www.flipkart.com/", custom: "https://infibolt.com/" },
  },
  {
    slug: "lumen-hub-studio",
    name: "Lumen Hub Studio",
    category: "home-tech",
    collection: "desk-essentials",
    price: 5999,
    rating: 4.5,
    reviewCount: 63,
    badge: "Studio",
    status: "Prototype",
    featured: false,
    visibility: "public",
    summary: "A compact control hub for lighting scenes, focus sessions, and smart desk automation.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1400",
    marketplace: { amazon: "https://www.amazon.in/", flipkart: "https://www.flipkart.com/", custom: "https://infibolt.com/" },
  },
  {
    slug: "pulse-pack-slim",
    name: "Pulse Pack Slim",
    category: "charging",
    collection: "mobility-kit",
    price: 2499,
    rating: 4.4,
    reviewCount: 52,
    badge: "Travel",
    status: "Preview",
    featured: false,
    visibility: "public",
    summary: "Ultra-slim power bank for pockets, bags, and long days away from the desk.",
    image: "https://images.unsplash.com/photo-1609592424825-13b2219b1a48?auto=format&fit=crop&q=80&w=1400",
    marketplace: { amazon: "https://www.amazon.in/", flipkart: "https://www.flipkart.com/", custom: "https://infibolt.com/" },
  },
];

export const customers = [
  { name: "Rajesh Kumar", email: "customer@infibolt.com", phone: "9876543210", products: 1, tickets: 0, status: "Verified" },
  { name: "Aarav Mehta", email: "aarav@example.com", phone: "9876500011", products: 2, tickets: 1, status: "Verified" },
];

export const supportTickets = [
  { id: "SCS-2041", customer: "Aarav Mehta", topic: "Marketplace purchase", status: "Open", channel: "Email", updatedAt: "2026-05-20" },
  { id: "SCS-2042", customer: "Rohan Shah", topic: "Warranty", status: "In Progress", channel: "WhatsApp", updatedAt: "2026-05-21" },
];

export const warrantyClaims = [
  { id: "SCW-MAY-1001", customer: "Aarav Mehta", product: "Aura Audio Pro", serial: "AAP-26-IND-4410", status: "Verification", priority: "High", updatedAt: "2026-05-22" },
];

export const featureToggles = [
  { key: "launchPartners", label: "Marketplace launch partners", enabled: true },
  { key: "availabilityLeads", label: "Availability lead capture", enabled: true },
  { key: "marketplaceRedirects", label: "Marketplace redirect buttons", enabled: true },
  { key: "warrantyClaims", label: "Warranty claim submission", enabled: true },
  { key: "adminAlerts", label: "Admin alert notifications", enabled: true },
];
