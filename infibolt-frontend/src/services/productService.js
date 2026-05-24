import { request } from "./api";

export const productService = {
  list: () => request.get("/products"),
  detail: (slug) => request.get(`/products/${slug}`),
  collections: () => request.get("/collections"),
};
