import { create } from "zustand";
import { authService } from "../services/authService";
import { productService } from "../services/productService";
import { supportService } from "../services/supportService";
import { warrantyService } from "../services/warrantyService";

const initialProfile = {
  name: "Rajesh Kumar",
  email: "customer@infibolt.com",
  phone: "9876543210",
  city: "Bengaluru",
  state: "Karnataka",
};

export const useAppStore = create((set, get) => ({
  auth: {
    user: null,
    status: "idle",
    error: null,
  },
  profile: initialProfile,
  products: { items: [], status: "idle", error: null },
  support: { tickets: [], status: "idle", error: null },
  warranty: { claims: [], status: "idle", error: null },
  notifications: [
    { id: 1, title: "Care profile ready", body: "Your product ownership space is ready for your first device.", read: false },
  ],
  cart: { items: [], status: "empty" },
  wishlist: { items: [], status: "empty" },
  theme: typeof window === "undefined" ? "light" : localStorage.getItem("infibolt.theme") || "light",

  login: async (credentials) => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    try {
      const result = await authService.login(credentials);
      set({ auth: { user: result.user, status: "authenticated", error: null }, profile: { ...initialProfile, ...result.user } });
      return result;
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, status: "error", error: error.message || "Login failed." } }));
      throw error;
    }
  },
  signup: (payload) => authService.signup(payload),
  verifyOtp: async (payload) => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    const result = await authService.verifyOtp(payload);
    set({ auth: { user: result.user, status: "authenticated", error: null }, profile: { ...initialProfile, ...result.user } });
    return result;
  },
  hydrateSession: async () => {
    try {
      const result = await authService.me();
      set({ auth: { user: result.user, status: "authenticated", error: null }, profile: { ...initialProfile, ...result.user } });
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
  loadProducts: async () => {
    if (get().products.status === "loading") return;
    set((state) => ({ products: { ...state.products, status: "loading", error: null } }));
    try {
      const result = await productService.list();
      set({ products: { items: result.items || [], status: "success", error: null } });
    } catch (error) {
      set((state) => ({ products: { ...state.products, status: "error", error: error.message || "Unable to load products." } }));
    }
  },
  loadSupportTickets: async () => {
    set((state) => ({ support: { ...state.support, status: "loading", error: null } }));
    try {
      const result = await supportService.listTickets({ skipGlobalErrorToast: true });
      set({ support: { tickets: result.items || [], status: "success", error: null } });
    } catch (error) {
      if (error.status === 401) {
        set({ support: { tickets: [], status: "success", error: null } });
        return;
      }
      set((state) => ({ support: { ...state.support, status: "error", error: error.message || "Unable to load support tickets." } }));
    }
  },
  createSupportTicket: async (payload) => {
    const ticket = await supportService.createTicket(payload);
    set((state) => ({ support: { ...state.support, tickets: [ticket, ...state.support.tickets], status: "success" } }));
    return ticket;
  },
  loadWarrantyClaims: async () => {
    set((state) => ({ warranty: { ...state.warranty, status: "loading", error: null } }));
    try {
      const result = await warrantyService.listClaims({ skipGlobalErrorToast: true });
      set({ warranty: { claims: result.items || [], status: "success", error: null } });
    } catch (error) {
      if (error.status === 401) {
        set({ warranty: { claims: [], status: "success", error: null } });
        return;
      }
      set((state) => ({ warranty: { ...state.warranty, status: "error", error: error.message || "Unable to load warranty claims." } }));
    }
  },
  createWarrantyClaim: async (payload) => {
    const claim = await warrantyService.createClaim(payload);
    set((state) => ({ warranty: { ...state.warranty, claims: [claim, ...state.warranty.claims], status: "success" } }));
    return claim;
  },
  updateProfile: (profile) => set((state) => ({ profile: { ...state.profile, ...profile } })),
  setTheme: (theme) => {
    if (typeof window !== "undefined") localStorage.setItem("infibolt.theme", theme);
    set({ theme });
  },
  addToWishlist: (product) => set((state) => ({ wishlist: { items: [product, ...state.wishlist.items], status: "ready" } })),
  addToCart: (product) => set((state) => ({ cart: { items: [product, ...state.cart.items], status: "ready" } })),
}));
