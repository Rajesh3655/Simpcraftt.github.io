import {
  adminStats,
  customers,
  featureToggles,
  supportTickets,
  warrantyClaims,
} from "../store/admin";
import { categories, products } from "../store/commerce";

const wait = (ms = 620) => new Promise((resolve) => window.setTimeout(resolve, ms));
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

export async function mockRequest(config) {
  await wait(config.mockDelay || 620);
  const method = (config.method || "get").toLowerCase();
  const url = String(config.url || "");
  const data = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};

  if (url === "/admin/auth/google" && method === "post") {
    if (!data.credential) {
      const error = new Error("Missing Google credential");
      error.response = { status: 422, data: { message: "Google credential is required." } };
      throw error;
    }
    return { data: { mfaRequired: true, email: "admin@infibolt.com", verificationId: "64a000000000000000000001", expiresInSeconds: 300, resendAfterSeconds: 60 } };
  }
  if (url === "/admin/auth/otp/verify" && method === "post") {
    if (data.otp !== "123456") {
      const error = new Error("Invalid OTP");
      error.response = { status: 422, data: { message: "Invalid OTP." } };
      throw error;
    }
    return { data: { user: { name: "INFIBOLT Admin", email: data.email } } };
  }
  if (url === "/admin/auth/otp/resend" && method === "post") {
    return { data: { mfaRequired: true, email: data.email, verificationId: "64a000000000000000000002", expiresInSeconds: 300, resendAfterSeconds: 60 } };
  }
  if (url === "/admin/overview") return { data: { stats: adminStats, products, warrantyClaims, supportTickets } };
  if (url === "/admin/products" && method === "get") return { data: { items: products } };
  if (url === "/admin/products" && method === "post") return { data: { id: Date.now(), ...data, status: data.status || "Draft" } };
  if (url.startsWith("/admin/products/") && ["put", "patch"].includes(method)) return { data: { ...data, updatedAt: new Date().toISOString() } };
  if (url === "/admin/categories" && method === "get") return { data: { items: categories } };
  if (url === "/admin/categories" && method === "post") return { data: { id: data.id || data.slug, ...data } };
  if (url === "/admin/homepage-sections" && method === "get") return { data: { items: [] } };
  if (url.startsWith("/admin/homepage-sections") && ["post", "patch"].includes(method)) return { data: { key: data.key, ...data } };
  if (url === "/admin/users") return { data: { items: customers } };
  if (url === "/admin/warranty-claims") return { data: { items: warrantyClaims } };
  if (url === "/admin/support-tickets") return { data: { items: supportTickets } };
  if (/^\/admin\/support-tickets\/[^/]+\/read$/.test(url) && method === "patch") {
    const id = decodeURIComponent(url.split("/")[3]);
    return { data: { id, status: "Read", updatedAt: new Date().toISOString() } };
  }
  if (url === "/admin/analytics") return { data: { stats: adminStats, series: [42, 64, 38, 80, 56, 92, 71] } };
  if (url === "/admin/settings") return { data: { featureToggles, contactSettings } };
  if (url === "/admin/contact-settings" && method === "put") {
    Object.assign(contactSettings, data);
    return { data: contactSettings };
  }
  if (url.startsWith("/uploads") && method === "post") return { data: { url: "/uploads/products/mock-upload.png", status: "uploaded", provider: "local" } };

  return { data: { ok: true } };
}
