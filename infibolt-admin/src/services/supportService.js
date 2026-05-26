import { request } from "./api";

export const supportService = {
  listTickets: () => request.get("/admin/support-tickets"),
  markRead: (id) => request.patch(`/admin/support-tickets/${id}/read`),
  reply: (id, payload) => request.post(`/admin/support-tickets/${id}/reply`, payload),
};
