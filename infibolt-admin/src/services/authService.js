import { request } from "./api";

export const authService = {
  google(payload) {
    return request.post("/admin/auth/google", payload, { suppressGlobalErrorToast: true });
  },
  verifyOtp(payload) {
    return request.post("/admin/auth/otp/verify", payload, { suppressGlobalErrorToast: true });
  },
  resendOtp(payload) {
    return request.post("/admin/auth/otp/resend", payload, { suppressGlobalErrorToast: true });
  },
  logout() {
    return request.post("/admin/auth/logout");
  },
  me(options = {}) {
    return request.get("/admin/auth/me", options);
  },
  refresh() {
    return request.post("/admin/auth/refresh");
  },
};
