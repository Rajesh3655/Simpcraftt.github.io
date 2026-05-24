import { request } from "./api";

export const warrantyService = {
  listClaims: () => request.get("/admin/warranty-claims"),
  updateStatus: (id, status) => request.patch(`/admin/warranty-claims/${id}`, { status }),
};
