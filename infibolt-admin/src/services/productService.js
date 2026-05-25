import { request } from "./api";

export const productService = {
  list: () => request.get("/admin/products"),
  categories: () => request.get("/admin/categories"),
  collections: () => request.get("/admin/collections"),
  homepageSections: () => request.get("/admin/homepage-sections"),
  create: (payload) => request.post("/admin/products", payload),
  update: (slug, payload) => request.patch(`/admin/products/${slug}`, payload),
  delete: (slug) => request.delete(`/admin/products/${slug}`),
  reorder: (items) => request.post("/admin/products/reorder", { items }),
  createCategory: (payload) => request.post("/admin/categories", payload),
  updateCategory: (id, payload) => request.patch(`/admin/categories/${id}`, payload),
  createCollection: (payload) => request.post("/admin/collections", payload),
  updateCollection: (slug, payload) => request.patch(`/admin/collections/${slug}`, payload),
  saveHomepageSection: (payload) => payload.key ? request.patch(`/admin/homepage-sections/${payload.key}`, payload) : request.post("/admin/homepage-sections", payload),
};
