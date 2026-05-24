import { request } from "./api";

export const warrantyService = {
  listClaims: () => request.get("/warranty-claims"),
  createClaim: (payload) => request.post("/warranty-claims", payload),
};
