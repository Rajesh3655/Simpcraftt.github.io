import { products, categories } from "../store/commerce";

const wait = (ms = 650) => new Promise((resolve) => window.setTimeout(resolve, ms));
const token = (role = "customer") => `${role}.${Date.now().toString(36)}.mock-token`;

const tickets = [
  { id: "SCS-2041", topic: "Warranty", status: "Open", channel: "Email", updatedAt: "2026-05-20" },
  { id: "SCS-2042", topic: "Marketplace purchase", status: "In Review", channel: "WhatsApp", updatedAt: "2026-05-21" },
];

const claims = [
  { id: "SCW-MAY-1001", product: "Aura Audio Pro", serial: "AAP-26-IND-4410", status: "Verification", updatedAt: "2026-05-22" },
];

const contactSettings = {
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
const manuals = [
  {
    _id: "64b000000000000000000001",
    productName: "Aura Audio Pro",
    category: "Audio",
    description: "Official setup, controls, charging, and care guidance.",
    pdfUrl: "/uploads/manuals/mock-aura-audio-pro.pdf",
    featured: true,
    isVisible: true,
    createdAt: "2026-05-30T00:00:00.000Z",
  },
  {
    _id: "64b000000000000000000002",
    productName: "Echo Charge Max",
    category: "Charging",
    description: "Wireless charging alignment, safety, and maintenance guide.",
    pdfUrl: "/uploads/manuals/mock-echo-charge-max.pdf",
    featured: false,
    isVisible: true,
    createdAt: "2026-05-29T00:00:00.000Z",
  },
];

export async function mockRequest(config) {
  await wait(config.mockDelay || 640);
  const method = (config.method || "get").toLowerCase();
  const url = String(config.url || "");
  const data = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};

  if (url.includes("fail")) {
    const error = new Error("Mock network failure");
    error.response = { status: 503, data: { message: "The mock API is temporarily unavailable." } };
    throw error;
  }

  if (url === "/auth/login" && method === "post") {
    return { data: { token: token(), user: { name: "Rajesh Kumar", email: data.email || "customer@infibolt.com", phone: "9876543210", role: "customer" } } };
  }
  if (url === "/auth/signup" && method === "post") {
    if (!data.acceptedTerms) {
      const error = new Error("Accept the Terms and Privacy Policy to continue.");
      error.response = { status: 422, data: { message: "Accept the Terms and Privacy Policy to continue." } };
      throw error;
    }
    return { data: { verificationId: `otp_${Date.now().toString(36)}`, channel: "email", message: "Email OTP prepared." } };
  }
  if (url === "/auth/verify-otp" && method === "post") {
    if (data.otp !== "123456") {
      const error = new Error("Invalid OTP.");
      error.response = { status: 422, data: { message: "Invalid OTP.", fields: { otp: "Check this code." } } };
      throw error;
    }
    return { data: { token: token(), user: { name: data.name || "INFIBOLT Customer", email: data.email || "customer@infibolt.com", phone: data.phone || "9876543210", role: "customer" } } };
  }
  if (url === "/auth/google" && method === "post") {
    if (data.flow === "login" && data.credential === "mock_new_google_account") {
      const error = new Error("No INFIBOLT account is linked to this Google email. Create an account first.");
      error.response = { status: 404, data: { message: "No INFIBOLT account is linked to this Google email. Create an account first." } };
      throw error;
    }
    return { data: { token: token(), user: { name: "Google Customer", email: "customer@infibolt.com", phone: "", role: "customer" } } };
  }
  if (url === "/auth/forgot-password") return { data: { resetId: `reset_${Date.now().toString(36)}`, message: "Reset OTP prepared." } };

  if (url === "/products") return { data: { items: products, categories, total: products.length } };
  if (url === "/manuals") return { data: { items: manuals, total: manuals.length, categories: ["Audio", "Charging"] } };
  if (url.startsWith("/manuals/")) return { data: manuals.find((item) => item._id === url.split("/").pop()) };
  if (url === "/homepage") return { data: { featuredProducts: products.slice(0, 4), heroProducts: products.slice(0, 1), categories } };
  if (url === "/site-settings") return { data: { contactSettings } };
  if (url === "/categories") return { data: { items: categories } };
  if (url.startsWith("/products/")) return { data: products.find((item) => item.slug === url.split("/").pop()) };
  if (url === "/launch-notify" && method === "post") return { data: { id: `LAUNCH-${Date.now().toString().slice(-4)}`, status: "Subscribed", message: "Launch updates enabled." } };

  if (url === "/support-tickets" && method === "get") return { data: { items: tickets } };
  if (url === "/support-tickets" && method === "post") return { data: { id: `SCS-${Date.now().toString().slice(-4)}`, status: "Open", ...data } };
  if (url === "/warranty-claims" && method === "get") return { data: { items: claims } };
  if (url === "/warranty-claims" && method === "post") return { data: { id: `SCW-${Date.now().toString().slice(-4)}`, status: "Verification", ...data } };
  if (url.startsWith("/uploads") && method === "post") return { data: { url: "/uploads/temp/mock-upload.pdf", status: "uploaded", provider: "local" } };
  if (url === "/profile") return { data: { name: "Rajesh Kumar", email: "customer@infibolt.com", phone: "9876543210", city: "Bengaluru", state: "Karnataka" } };

  return { data: { ok: true } };
}
