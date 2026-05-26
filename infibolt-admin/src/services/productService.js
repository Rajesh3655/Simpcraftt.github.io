import { request } from "./api";

export const productService = {
  list: () => request.get("/admin/products?limit=500"),
  categories: () => request.get("/admin/categories"),
  homepageSections: () => request.get("/admin/homepage-sections"),
  create: (payload) => request.post("/admin/products", payload),
  update: (slug, payload) => request.patch(`/admin/products/${slug}`, payload),
  delete: (slug) => request.delete(`/admin/products/${slug}`),
  reorder: (items) => request.post("/admin/products/reorder", { items }),
  createCategory: (payload) => request.post("/admin/categories", payload),
  updateCategory: (id, payload) => request.patch(`/admin/categories/${id}`, payload),
  deleteCategory: (id) => request.delete(`/admin/categories/${id}`),
  saveHomepageSection: (payload) => payload.key ? request.patch(`/admin/homepage-sections/${payload.key}`, payload) : request.post("/admin/homepage-sections", payload),
};
