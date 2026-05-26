import { create } from "zustand";
import { authService } from "../services/authService";
import { productService } from "../services/productService";
import { supportService } from "../services/supportService";
import { warrantyService } from "../services/warrantyService";

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  city: "Bengaluru",
  state: "Karnataka",
};

function setCustomerSessionHint(active) {
  if (typeof window === "undefined") return;
  if (active) window.localStorage.setItem("infibolt.customerSession", "active");
  else window.localStorage.removeItem("infibolt.customerSession");
}

export const useAppStore = create((set, get) => ({
  auth: {
    user: null,
    status: "idle",
    error: null,
  },
  profile: initialProfile,
  products: { items: [], categories: [], status: "idle", error: null },
  support: { tickets: [], status: "idle", error: null },
  warranty: { claims: [], rmas: [], status: "idle", error: null },
  notifications: [
    { id: 1, title: "Care profile ready", body: "Your product ownership space is ready for your first device.", read: false },
  ],
  wishlist: { items: [], status: "empty" },
  theme: typeof window === "undefined" ? "light" : localStorage.getItem("infibolt.theme") || "light",

  login: async (credentials) => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    try {
      const result = await authService.login(credentials);
      setCustomerSessionHint(true);
      set({ auth: { user: result.user, status: "authenticated", error: null }, profile: { ...initialProfile, ...result.user } });
      return result;
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, status: "error", error: error.message || "Login failed." } }));
      throw error;
    }
  },
  requestLoginOtp: (payload) => authService.requestLoginOtp(payload),
  verifyLoginOtp: async (payload) => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    try {
      const result = await authService.verifyLoginOtp(payload);
      setCustomerSessionHint(true);
      set({ auth: { user: result.user, status: "authenticated", error: null }, profile: { ...initialProfile, ...result.user } });
      return result;
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, status: "error", error: error.message || "OTP login failed." } }));
      throw error;
    }
  },
  signup: (payload) => authService.signup(payload),
  googleLogin: async (payload) => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    try {
      const result = await authService.google(payload);
      setCustomerSessionHint(true);
      set({ auth: { user: result.user, status: "authenticated", error: null }, profile: { ...initialProfile, ...result.user } });
      return result;
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, status: "error", error: error.message || "Google sign in failed." } }));
      throw error;
    }
  },
  verifyOtp: async (payload) => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    try {
      const result = await authService.verifyOtp(payload);
      setCustomerSessionHint(true);
      set({ auth: { user: result.user, status: "authenticated", error: null }, profile: { ...initialProfile, ...result.user } });
      return result;
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, status: "error", error: error.message || "OTP verification failed." } }));
      throw error;
    }
  },
  hydrateSession: async () => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    try {
      const result = await authService.me();
      setCustomerSessionHint(true);
      set({ auth: { user: result.user, status: "authenticated", error: null }, profile: { ...initialProfile, ...result.user } });
      return result;
    } catch (error) {
      if (error.status === 401) {
        try {
          const result = await authService.refresh();
          setCustomerSessionHint(true);
          set({ auth: { user: result.user, status: "authenticated", error: null }, profile: { ...initialProfile, ...result.user } });
          return result;
        } catch {
          // Fall through to clear the stale local session hint.
        }
      }
      setCustomerSessionHint(false);
      set((state) => ({ auth: { ...state.auth, user: null, status: "idle" } }));
      return null;
    }
  },
  refreshSession: async () => {
    try {
      const result = await authService.refresh();
      setCustomerSessionHint(true);
      set({ auth: { user: result.user, status: "authenticated", error: null }, profile: { ...initialProfile, ...result.user } });
      return result;
    } catch (error) {
      setCustomerSessionHint(false);
      set((state) => ({ auth: { ...state.auth, user: null, status: "expired", error: "Your secure session expired. Please sign in again." } }));
      return null;
    }
  },
  logout: async () => {
    try {
      await authService.logout();
    } finally {
      setCustomerSessionHint(false);
      set((state) => ({ auth: { ...state.auth, user: null, status: "idle" } }));
    }
  },
  loadProducts: async () => {
    if (get().products.status === "loading") return;
    set((state) => ({ products: { ...state.products, status: "loading", error: null } }));
    try {
      const result = await productService.list();
      set({ products: { items: result.items || [], categories: result.categories || [], status: "success", error: null } });
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
      set({ warranty: { claims: result.items || [], rmas: result.rmas || [], status: "success", error: null } });
    } catch (error) {
      if (error.status === 401) {
        set({ warranty: { claims: [], rmas: [], status: "success", error: null } });
        return;
      }
      set((state) => ({ warranty: { ...state.warranty, status: "error", error: error.message || "Unable to load warranty claims." } }));
    }
  },
  createWarrantyClaim: async (payload) => {
    const claim = await warrantyService.createClaim(payload);
    return claim;
  },
  verifyWarrantyOtp: async (id, otp) => {
    const claim = await warrantyService.verifyOtp(id, otp);
    set((state) => ({
      warranty: {
        ...state.warranty,
        claims: [claim, ...state.warranty.claims.filter((item) => item.id !== claim.id)],
        status: "success",
      },
    }));
    return claim;
  },
  createWarrantyRma: async (payload) => {
    const rma = await warrantyService.createRma(payload);
    set((state) => ({ warranty: { ...state.warranty, rmas: [rma, ...state.warranty.rmas], status: "success" } }));
    return rma;
  },
  updateProfile: async (profile) => {
    const result = await authService.updateProfile(profile);
    set((state) => ({ profile: { ...state.profile, ...result }, auth: { ...state.auth, user: { ...(state.auth.user || {}), ...result } } }));
    return result;
  },
  requestProfileContactUpdate: (payload) => authService.requestProfileContactUpdate(payload),
  verifyProfileContactUpdate: async (payload) => {
    const result = await authService.verifyProfileContactUpdate(payload);
    set((state) => ({ profile: { ...state.profile, ...result }, auth: { ...state.auth, user: { ...(state.auth.user || {}), ...result } } }));
    return result;
  },
  setTheme: (theme) => {
    if (typeof window !== "undefined") localStorage.setItem("infibolt.theme", theme);
    set({ theme });
  },
  addToWishlist: (product) => set((state) => ({ wishlist: { items: [product, ...state.wishlist.items], status: "ready" } })),
}));
