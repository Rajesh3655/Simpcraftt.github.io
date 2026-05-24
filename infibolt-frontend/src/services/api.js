import axios from "axios";
import { toast } from "sonner";
import { apiConfig } from "../config/api";
import { mockRequest } from "./mockApi";

let csrfToken = null;
const unsafeMethods = new Set(["post", "put", "patch", "delete"]);

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
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "Something went wrong.";
    if (status === 401) {
      toast.error("Session expired", { description: "Please login again." });
    } else if (status === 403 && message.includes("CSRF")) {
      csrfToken = null;
      toast.error("Security check failed", { description: "Please retry the action." });
    } else {
      toast.error("Request failed", { description: message });
    }
    return Promise.reject({ status, message });
  }
);

export const request = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};
