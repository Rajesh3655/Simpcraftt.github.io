import { create } from "zustand";
import { adminService } from "../services/adminService";
import { dismissAuthToasts } from "../services/api";
import { authService } from "../services/authService";
import { productService } from "../services/productService";
import { supportService } from "../services/supportService";
import { warrantyService } from "../services/warrantyService";

export const useAdminStore = create((set, get) => ({
  auth: {
    user: null,
    status: "idle",
    error: null,
    mfa: null,
  },
  overview: { data: null, status: "idle", error: null },
  products: { items: [], status: "idle", error: null },
  categories: { items: [], status: "idle", error: null },
  homepageSections: { items: [], status: "idle", error: null },
  newsletter: { subscribers: [], leads: [], status: "idle", error: null },
  users: { items: [], status: "idle", error: null },
  otpAudit: { records: [], events: [], status: "idle", error: null },
  auditLogs: { items: [], status: "idle", error: null },
  settings: { data: null, status: "idle", error: null },
  support: { tickets: [], status: "idle", error: null },
  warranty: { claims: [], rmas: [], units: [], status: "idle", error: null },
  notifications: [
    { id: 1, title: "Warranty queue", body: "3 claims need verification.", read: false },
    { id: 2, title: "Support SLA", body: "2 tickets are approaching SLA.", read: false },
  ],
  theme: typeof window === "undefined" ? "light" : localStorage.getItem("infibolt.admin.theme") || "light",

  googleLogin: async (payload) => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    try {
      const result = await authService.google(payload);
      dismissAuthToasts();
      if (result.mfaRequired) {
        set({
          auth: {
            user: null,
            status: "mfa-required",
            error: null,
            mfa: {
              email: result.email,
              verificationId: result.verificationId,
              expiresInSeconds: result.expiresInSeconds || 300,
              resendAfterSeconds: result.resendAfterSeconds || 60,
            },
          },
        });
        return result;
      }
      set({ auth: { user: result.user, status: "authenticated", error: null, mfa: null } });
      return result;
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, status: "error", error: error.message || "Google login failed." } }));
      throw error;
    }
  },
  verifyAdminOtp: async (payload) => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    try {
      const result = await authService.verifyOtp(payload);
      dismissAuthToasts();
      set({ auth: { user: result.user, status: "authenticated", error: null, mfa: null } });
      return result;
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, status: "mfa-required", error: error.message || "Invalid verification code." } }));
      throw error;
    }
  },
  resendAdminOtp: async (payload) => {
    try {
      const result = await authService.resendOtp(payload);
      set((state) => ({
        auth: {
          ...state.auth,
          status: "mfa-required",
          error: null,
          mfa: {
            email: result.email,
            verificationId: result.verificationId,
            expiresInSeconds: result.expiresInSeconds || 300,
            resendAfterSeconds: result.resendAfterSeconds || 60,
          },
        },
      }));
      return result;
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, status: "mfa-required", error: error.message || "Could not resend OTP." } }));
      throw error;
    }
  },
  expireSession: () => {
    set((state) => ({
      auth: {
        ...state.auth,
        user: null,
        status: "session-expired",
        error: "Your admin session has timed out.",
        mfa: null,
      },
    }));
  },
  hydrateSession: async () => {
    set((state) => ({ auth: { ...state.auth, status: "loading", error: null } }));
    try {
      const result = await authService.me({ suppressSessionExpired: true });
      dismissAuthToasts();
      set({ auth: { user: result.user, status: "authenticated", error: null, mfa: null } });
      return result;
    } catch {
      set((state) => ({ auth: { ...state.auth, user: null, status: "unauthenticated", mfa: null } }));
      return null;
    }
  },
  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set((state) => ({ auth: { ...state.auth, user: null, status: "unauthenticated", mfa: null } }));
    }
  },
  clearLocalSession: () => {
    set((state) => ({ auth: { ...state.auth, user: null, status: "unauthenticated", error: null, mfa: null } }));
  },
  loadAdminWorkspace: async () => {
    const loaders = [
      get().loadOverview(),
      get().loadProducts(),
      get().loadCategories(),
      get().loadHomepageSections(),
      get().loadUsers(),
      get().loadWarranty(),
      get().loadSupport(),
      get().loadNewsletter(),
      get().loadAuditLogs(),
      get().loadOtpAudit(),
      get().loadSettings(),
    ];
    await Promise.allSettled(loaders);
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
  deleteProduct: async (slug) => {
    await productService.delete(slug);
    set((state) => ({
      products: {
        ...state.products,
        items: state.products.items.filter((item) => item.slug !== slug),
        status: "success",
        error: null,
      },
    }));
  },
  loadCategories: async () => {
    set((state) => ({ categories: { ...state.categories, status: "loading", error: null } }));
    try {
      const result = await productService.categories();
      set({ categories: { items: result.items || [], status: "success", error: null } });
    } catch (error) {
      set((state) => ({ categories: { ...state.categories, status: "error", error: error.message || "Unable to load categories." } }));
    }
  },
  loadHomepageSections: async () => {
    set((state) => ({ homepageSections: { ...state.homepageSections, status: "loading", error: null } }));
    try {
      const result = await productService.homepageSections();
      set({ homepageSections: { items: result.items || [], status: "success", error: null } });
    } catch (error) {
      set((state) => ({ homepageSections: { ...state.homepageSections, status: "error", error: error.message || "Unable to load homepage sections." } }));
    }
  },
  loadUsers: async () => {
    set((state) => ({ users: { ...state.users, status: "loading", error: null } }));
    try {
      const result = await adminService.users();
      set({ users: { items: result.items || [], status: "success", error: null } });
    } catch (error) {
      set((state) => ({ users: { ...state.users, status: "error", error: error.message || "Unable to load users." } }));
    }
  },
  loadOtpAudit: async () => {
    set((state) => ({ otpAudit: { ...state.otpAudit, status: "loading", error: null } }));
    try {
      const result = await adminService.otpAudit();
      set({ otpAudit: { records: result.records || [], events: result.events || [], status: "success", error: null } });
    } catch (error) {
      set((state) => ({ otpAudit: { ...state.otpAudit, status: "error", error: error.message || "Unable to load OTP audit." } }));
    }
  },
  resendActivation: async (id) => adminService.resendActivation(id),
  updateCustomerSecurityStatus: async (id, status) => {
    const result = await adminService.updateCustomerSecurityStatus(id, status);
    set((state) => ({ users: { ...state.users, items: state.users.items.map((item) => ((item._id || item.id) === id ? { ...item, ...result } : item)) } }));
    return result;
  },
  loadSupport: async () => {
    set((state) => ({ support: { ...state.support, status: "loading", error: null } }));
    try {
      const result = await supportService.listTickets();
      set({ support: { tickets: result.items || [], status: "success", error: null } });
    } catch (error) {
      set((state) => ({ support: { ...state.support, status: "error", error: error.message || "Unable to load support tickets." } }));
    }
  },
  markSupportRead: async (id) => {
    const result = await supportService.markRead(id);
    set((state) => ({
      support: {
        ...state.support,
        tickets: state.support.tickets.map((ticket) => ((ticket.id || ticket._id) === id ? { ...ticket, ...result } : ticket)),
      },
    }));
    return result;
  },
  loadWarranty: async () => {
    set((state) => ({ warranty: { ...state.warranty, status: "loading", error: null } }));
    try {
      const result = await warrantyService.listClaims();
      set({ warranty: { claims: result.items || [], rmas: result.rmas || [], units: result.units || [], status: "success", error: null } });
    } catch (error) {
      set((state) => ({ warranty: { ...state.warranty, status: "error", error: error.message || "Unable to load warranty claims." } }));
    }
  },
  loadNewsletter: async () => {
    set((state) => ({ newsletter: { ...state.newsletter, status: "loading", error: null } }));
    try {
      const [subscribers, leads] = await Promise.all([adminService.newsletterSubscribers(), adminService.launchLeads()]);
      set({
        newsletter: {
          subscribers: subscribers.items || [],
          leads: leads.items || [],
          status: "success",
          error: null,
        },
      });
    } catch (error) {
      set((state) => ({ newsletter: { ...state.newsletter, status: "error", error: error.message || "Unable to load marketing data." } }));
    }
  },
  loadAuditLogs: async () => {
    set((state) => ({ auditLogs: { ...state.auditLogs, status: "loading", error: null } }));
    try {
      const result = await adminService.auditLogs();
      set({ auditLogs: { items: result.items || [], status: "success", error: null } });
    } catch (error) {
      set((state) => ({ auditLogs: { ...state.auditLogs, status: "error", error: error.message || "Unable to load audit logs." } }));
    }
  },
  loadSettings: async () => {
    set((state) => ({ settings: { ...state.settings, status: "loading", error: null } }));
    try {
      const result = await adminService.settings();
      set({ settings: { data: result, status: "success", error: null } });
    } catch (error) {
      set((state) => ({ settings: { ...state.settings, status: "error", error: error.message || "Unable to load settings." } }));
    }
  },
  updateContactSettings: async (payload) => {
    const result = await adminService.updateContactSettings(payload);
    set((state) => ({
      settings: {
        data: { ...(state.settings.data || {}), contactSettings: result },
        status: "success",
        error: null,
      },
    }));
    return result;
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
