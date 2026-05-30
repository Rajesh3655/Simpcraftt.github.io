import { request } from "./api";

export const warrantyService = {
  getPolicy: (config) => request.get("/warranty-policy", config),
  listClaims: (config) => request.get("/warranty-claims", config),
  createClaim: (payload) => request.post("/warranty-claims", {
    ...payload,
    customer: payload.customer || payload.name,
  }),
  createRma: (payload) => request.post("/warranty-claims/rma", payload),
  submitShipment: (id, payload) => request.post(`/warranty-claims/rma/${id}/shipment`, payload),
};
