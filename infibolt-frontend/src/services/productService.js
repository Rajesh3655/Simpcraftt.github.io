import { request } from "./api";

export const productService = {
  list: () => request.get("/products"),
  detail: (slug) => request.get(`/products/${slug}`),
  homepage: () => request.get("/homepage"),
  notify: (payload) => request.post("/launch-notify", payload),
  categories: () => request.get("/categories"),
  collections: () => request.get("/collections"),
};
