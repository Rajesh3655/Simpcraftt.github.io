import { request } from "./api";

export const supportService = {
  listTickets: (config) => request.get("/support-tickets", config),
  createTicket: (payload) => request.post("/support-tickets", {
    ...payload,
    customer: payload.customer || payload.name,
  }),
};
