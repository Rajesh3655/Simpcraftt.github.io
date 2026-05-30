import { request } from "./api";

export const manualService = {
  list: (params = {}) => request.cachedGet("/manuals", { params, skipGlobalErrorToast: true }, 60 * 1000),
  get: (id) => request.get(`/manuals/${id}`, { skipGlobalErrorToast: true }),
};
