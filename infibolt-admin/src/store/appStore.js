import { create } from "zustand";
import { adminService } from "../services/adminService";
import { authService } from "../services/authService";
import { productService } from "../services/productService";
import { supportService } from "../services/supportService";
import { warrantyService } from "../services/warrantyService";

export const useAdminStore = create((set, get) => ({
  auth: {
    user: null,
    status: "idle",
    error: null,
  },
  overview: { data: null, status: "idle", error: null },
  products: { items: [], status: "idle", error: null },
  users: { items: [], status: "idle", error: null },
  support: { tickets: [], status: "idle", error: null },
  warranty: { claims: [], rmas: [], units: [], status: "idle", error: null },
  notifications: [
    { id: 1, title: "Warranty queue", body: "3 claims need verification.", read: false },
    { id: 2, title: "Support SLA", body: "2 tickets are approaching SLA.", read: false },
  ],
  theme: typeof window === "undefined" ? "light" : localStorage.getItem("infibolt.admin.theme") || "light",

  login: async (credentials) => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    try {
      const result = await authService.login(credentials);
      set({ auth: { user: result.user, status: "authenticated", error: null } });
      return result;
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, status: "error", error: error.message || "Login failed." } }));
      throw error;
    }
  },
  hydrateSession: async () => {
    try {
      const result = await authService.me();
      set({ auth: { user: result.user, status: "authenticated", error: null } });
      return result;
    } catch {
      set((state) => ({ auth: { ...state.auth, user: null, status: "idle" } }));
      return null;
    }
  },
  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set((state) => ({ auth: { ...state.auth, user: null, status: "idle" } }));
    }
  },
  loadOverview: async () => {
    set((state) => ({ overview: { ...state.overview, status: "loading", error: null } }));
    try {
      const data = await adminService.overview();
      set({ overview: { data, status: "success", error: null } });
    } catch (error) {
      set((state) => ({ overview: { ...state.overview, status: "error", error: error.message || "Unable to load overview." } }));
    }
  },
  loadProducts: async () => {
    set((state) => ({ products: { ...state.products, status: "loading", error: null } }));
    try {
      const result = await productService.list();
      set({ products: { items: result.items || [], status: "success", error: null } });
    } catch (error) {
      set((state) => ({ products: { ...state.products, status: "error", error: error.message || "Unable to load products." } }));
    }
  },
  saveProduct: async (payload) => {
    const result = payload.slug ? await productService.update(payload.slug, payload) : await productService.create(payload);
    const current = get().products.items;
    set({ products: { items: [result, ...current.filter((item) => item.slug !== payload.slug)], status: "success", error: null } });
    return result;
  },
  loadUsers: async () => {
    set((state) => ({ users: { ...state.users, status: "loading", error: null } }));
    const result = await adminService.users();
    set({ users: { items: result.items || [], status: "success", error: null } });
  },
  loadSupport: async () => {
    set((state) => ({ support: { ...state.support, status: "loading", error: null } }));
    const result = await supportService.listTickets();
    set({ support: { tickets: result.items || [], status: "success", error: null } });
  },
  loadWarranty: async () => {
    set((state) => ({ warranty: { ...state.warranty, status: "loading", error: null } }));
    const result = await warrantyService.listClaims();
    set({ warranty: { claims: result.items || [], rmas: result.rmas || [], units: result.units || [], status: "success", error: null } });
  },
  updateWarrantyStatus: async (id, payload) => {
    const result = await warrantyService.updateStatus(id, payload);
    set((state) => ({
      warranty: {
        ...state.warranty,
        claims: state.warranty.claims.map((item) => (item.id === result.id ? result : item)),
        rmas: state.warranty.rmas.map((item) => (item.id === result.id ? result : item)),
        status: "success",
        error: null,
      },
    }));
    return result;
  },
  markNotificationRead: (id) =>
    set((state) => ({ notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)) })),
  setTheme: (theme) => {
    if (typeof window !== "undefined") localStorage.setItem("infibolt.admin.theme", theme);
    set({ theme });
  },
}));
