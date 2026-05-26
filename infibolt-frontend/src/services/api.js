import axios from "axios";
import { toast } from "sonner";
import { apiConfig } from "../config/api";
import { mockRequest } from "./mockApi";

let csrfToken = null;
const unsafeMethods = new Set(["post", "put", "patch", "delete"]);

function getFriendlyApiError(error) {
  const status = error.response?.status;
  const details = error.response?.data?.details;
  const fields = error.response?.data?.fields || details?.fields || {};
  const validationMessage = Array.isArray(details) ? details.map((detail) => detail.msg).filter(Boolean).join(" ") : "";
  const serverMessage = validationMessage || error.response?.data?.message;

  if (serverMessage) return { status, message: serverMessage, details, fields };
  if (error.code === "ECONNABORTED") {
    return {
      status,
      message: "The server took too long to respond. Please try again in a moment.",
      details,
      fields,
    };
  }
  if (!error.response) {
    return {
      status,
      message: "We could not reach the Infibolt server. Please make sure the backend is running and try again.",
      details,
      fields,
    };
  }
  if (status >= 500) {
    return {
      status,
      message: "The Infibolt server had a temporary issue. Please try again.",
      details,
      fields,
    };
  }
  return {
    status,
    message: error.message || "Something went wrong. Please try again.",
    details,
    fields,
  };
}

export const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  if (apiConfig.useMockApi) {
    const response = await mockRequest(config);
    return Promise.reject({ __mockResponse: true, response });
  }
  const method = (config.method || "get").toLowerCase();
  if (unsafeMethods.has(method)) {
    if (!csrfToken) {
      const response = await axios.get(`${apiConfig.baseURL}/csrf-token`, { withCredentials: true });
      csrfToken = response.data.csrfToken;
    }
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.__mockResponse) return Promise.resolve(error.response.data);
    const { status, message, details, fields } = getFriendlyApiError(error);
    if (!error.config?.skipGlobalErrorToast) {
      const toastId = status ? `api-error-${status}` : "api-error-network";
      if (status === 401) {
        toast.error("Please sign in again", { id: toastId, description: "Your account session expired for safety." });
      } else if (status === 403 && message.includes("CSRF")) {
        csrfToken = null;
        toast.error("Please try once more", { id: toastId, description: "We refreshed the page safety check." });
      } else {
        toast.error("We could not complete that", { id: toastId, description: message });
      }
    }
    return Promise.reject({ status, message, details, fields });
  }
);

export const request = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};
