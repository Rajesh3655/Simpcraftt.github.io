import { request } from "./api";

export const adminService = {
  overview: () => request.get("/admin/overview"),
  users: () => request.get("/admin/users"),
  otpAudit: () => request.get("/admin/users/otp-audit"),
  resendActivation: (id) => request.post(`/admin/users/${id}/resend-activation`),
  updateCustomerSecurityStatus: (id, status) => request.patch(`/admin/users/${id}/security-status`, { status }),
  newsletterSubscribers: () => request.get("/admin/newsletter-subscribers"),
  launchLeads: () => request.get("/admin/launch-leads"),
  auditLogs: () => request.get("/admin/audit-logs"),
  analytics: () => request.get("/admin/analytics"),
  settings: () => request.get("/admin/settings"),
  updateContactSettings: (payload) => request.put("/admin/contact-settings", payload),
};
