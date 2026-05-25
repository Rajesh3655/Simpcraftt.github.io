import {
  adminStats,
  customers,
  featureToggles,
  supportTickets,
  warrantyClaims,
} from "../store/admin";
import { products } from "../store/commerce";
import { categories, collections } from "../store/commerce";

const wait = (ms = 620) => new Promise((resolve) => window.setTimeout(resolve, ms));
const token = () => `admin.${Date.now().toString(36)}.mock-token`;

export async function mockRequest(config) {
  await wait(config.mockDelay || 620);
  const method = (config.method || "get").toLowerCase();
  const url = String(config.url || "");
  const data = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};

  if (url === "/admin/auth/login" && method === "post") {
    if (!data.email || !data.password) {
      const error = new Error("Missing credentials");
      error.response = { status: 422, data: { message: "Email and password are required." } };
      throw error;
    }
    return { data: { token: token(), user: { name: "INFIBOLT Admin", email: data.email, role: "Owner" } } };
  }
  if (url === "/admin/overview") return { data: { stats: adminStats, products, warrantyClaims, supportTickets } };
  if (url === "/admin/products" && method === "get") return { data: { items: products } };
  if (url === "/admin/products" && method === "post") return { data: { id: Date.now(), ...data, status: data.status || "Draft" } };
  if (url.startsWith("/admin/products/") && ["put", "patch"].includes(method)) return { data: { ...data, updatedAt: new Date().toISOString() } };
  if (url === "/admin/categories" && method === "get") return { data: { items: categories } };
  if (url === "/admin/categories" && method === "post") return { data: { id: data.id || data.slug, ...data } };
  if (url === "/admin/collections" && method === "get") return { data: { items: collections } };
  if (url === "/admin/collections" && method === "post") return { data: { slug: data.slug, ...data } };
  if (url === "/admin/homepage-sections" && method === "get") return { data: { items: [] } };
  if (url.startsWith("/admin/homepage-sections") && ["post", "patch"].includes(method)) return { data: { key: data.key, ...data } };
  if (url === "/admin/users") return { data: { items: customers } };
  if (url === "/admin/warranty-claims") return { data: { items: warrantyClaims } };
  if (url === "/admin/support-tickets") return { data: { items: supportTickets } };
  if (url === "/admin/analytics") return { data: { stats: adminStats, series: [42, 64, 38, 80, 56, 92, 71] } };
  if (url === "/admin/settings") return { data: { featureToggles } };
  if (url.startsWith("/uploads") && method === "post") return { data: { url: "/uploads/products/mock-upload.png", status: "uploaded", provider: "local" } };

  return { data: { ok: true } };
}
