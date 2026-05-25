import { request } from "./api";

export const adminService = {
  overview: () => request.get("/admin/overview"),
  users: () => request.get("/admin/users"),
  newsletterSubscribers: () => request.get("/admin/newsletter-subscribers"),
  launchLeads: () => request.get("/admin/launch-leads"),
  auditLogs: () => request.get("/admin/audit-logs"),
  exportUsers: (type = "users") => request.get(`/admin/users/export?type=${encodeURIComponent(type)}`),
  analytics: () => request.get("/admin/analytics"),
  settings: () => request.get("/admin/settings"),
};
