import { request } from "./api";

export const warrantyService = {
  listClaims: (config) => request.get("/warranty-claims", config),
  createClaim: (payload) => request.post("/warranty-claims", {
    ...payload,
    customer: payload.customer || payload.name,
  }),
};
