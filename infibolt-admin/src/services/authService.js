import { request } from "./api";

export const authService = {
  async login(credentials) {
    return request.post("/admin/auth/login", credentials);
  },
  logout() {
    return request.post("/admin/auth/logout");
  },
  me() {
    return request.get("/admin/auth/me");
  },
  refresh() {
    return request.post("/admin/auth/refresh");
  },
};
