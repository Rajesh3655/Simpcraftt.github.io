import { request } from "./api";

export const warrantyService = {
  listClaims: () => request.get("/admin/warranty-claims"),
  getPolicy: () => request.get("/admin/warranty-policy"),
  updatePolicy: (payload) => request.put("/admin/warranty-policy", payload),
  updateStatus: (id, payload) => request.patch(`/admin/warranty-claims/${id}`, typeof payload === "string" ? { status: payload } : payload),
};
