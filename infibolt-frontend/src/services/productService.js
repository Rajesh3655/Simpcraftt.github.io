import { request } from "./api";

export const productService = {
  list: () => request.cachedGet("/products", { skipGlobalErrorToast: true }, 90 * 1000),
  warrantyRegistrationList: () => request.cachedGet("/products?warrantyRegistration=true&limit=200", { skipGlobalErrorToast: true }, 90 * 1000),
  detail: (slug) => request.cachedGet(`/products/${slug}`, { skipGlobalErrorToast: true }, 90 * 1000),
  homepage: () => request.cachedGet("/homepage", { skipGlobalErrorToast: true }, 90 * 1000),
  notify: (payload) => request.post("/launch-notify", payload),
  categories: () => request.cachedGet("/categories", { skipGlobalErrorToast: true }, 90 * 1000),
};
