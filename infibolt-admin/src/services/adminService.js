import { request } from "./api";

export const adminService = {
  overview: () => request.get("/admin/overview"),
  users: () => request.get("/admin/users"),
  analytics: () => request.get("/admin/analytics"),
  settings: () => request.get("/admin/settings"),
};
