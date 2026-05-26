import { request } from "./api";

export const authService = {
  async login(credentials) {
    return request.post("/auth/login", credentials, { skipGlobalErrorToast: true });
  },
  signup(payload) {
    return request.post("/auth/signup", payload, { skipGlobalErrorToast: true });
  },
  async verifyOtp(payload) {
    return request.post("/auth/verify-otp", payload, { skipGlobalErrorToast: true });
  },
  google(payload) {
    return request.post("/auth/google", payload, { skipGlobalErrorToast: true });
  },
  forgotPassword(payload) {
    return request.post("/auth/forgot-password", payload, { skipGlobalErrorToast: true });
  },
  resetPassword(payload) {
    return request.post("/auth/reset-password", payload, { skipGlobalErrorToast: true });
  },
  requestLoginOtp(payload) {
    return request.post("/auth/login/request-otp", payload, { skipGlobalErrorToast: true });
  },
  verifyLoginOtp(payload) {
    return request.post("/auth/login/verify-otp", payload, { skipGlobalErrorToast: true });
  },
  logout() {
    return request.post("/auth/logout");
  },
  me() {
    return request.get("/auth/me", { skipGlobalErrorToast: true });
  },
  updateProfile(payload) {
    return request.patch("/profile", payload, { skipGlobalErrorToast: true });
  },
  requestProfileContactUpdate(payload) {
    return request.post("/profile/contact-update", payload, { skipGlobalErrorToast: true });
  },
  verifyProfileContactUpdate(payload) {
    return request.post("/profile/contact-update/verify", payload, { skipGlobalErrorToast: true });
  },
  refresh() {
    return request.post("/auth/refresh", undefined, { skipGlobalErrorToast: true });
  },
};
