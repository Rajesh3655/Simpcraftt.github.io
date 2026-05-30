import { request } from "./api";

export const manualService = {
  list: (params = {}) => request.get("/admin/manuals", { params }),
  get: (id) => request.get(`/admin/manuals/${id}`),
  create: (payload) => request.post("/admin/manuals", payload),
  update: (id, payload) => request.put(`/admin/manuals/${id}`, payload),
  patch: (id, payload) => request.patch(`/admin/manuals/${id}`, payload),
  delete: (id) => request.delete(`/admin/manuals/${id}`),
};
