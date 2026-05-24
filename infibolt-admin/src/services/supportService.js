import { request } from "./api";

export const supportService = {
  listTickets: () => request.get("/admin/support-tickets"),
  reply: (id, payload) => request.post(`/admin/support-tickets/${id}/reply`, payload),
};
