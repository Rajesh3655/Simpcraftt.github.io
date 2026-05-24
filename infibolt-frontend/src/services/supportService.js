import { request } from "./api";

export const supportService = {
  listTickets: () => request.get("/support-tickets"),
  createTicket: (payload) => request.post("/support-tickets", payload),
};
