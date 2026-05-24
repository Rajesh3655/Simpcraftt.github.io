import { request } from "./api";

export const authService = {
  async login(credentials) {
    return request.post("/auth/login", credentials);
  },
  signup(payload) {
    return request.post("/auth/signup", payload);
  },
  async verifyOtp(payload) {
    return request.post("/auth/verify-otp", payload);
  },
  forgotPassword(payload) {
    return request.post("/auth/forgot-password", payload);
  },
  resetPassword(payload) {
    return request.post("/auth/reset-password", payload);
  },
  requestLoginOtp(payload) {
    return request.post("/auth/login/request-otp", payload);
  },
  verifyLoginOtp(payload) {
    return request.post("/auth/login/verify-otp", payload);
  },
  logout() {
    return request.post("/auth/logout");
  },
  me() {
    return request.get("/auth/me");
  },
  refresh() {
    return request.post("/auth/refresh");
  },
};
