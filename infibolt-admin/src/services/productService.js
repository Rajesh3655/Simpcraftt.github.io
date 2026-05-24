import { request } from "./api";

export const productService = {
  list: () => request.get("/admin/products"),
  create: (payload) => request.post("/admin/products", payload),
  update: (slug, payload) => request.patch(`/admin/products/${slug}`, payload),
};
