import axios from "axios";
import { toast } from "sonner";
import { apiConfig } from "../config/api";
import { mockRequest } from "./mockApi";

let csrfToken = null;
let csrfTokenPromise = null;
let refreshPromise = null;
const unsafeMethods = new Set(["post", "put", "patch", "delete"]);
const retryDelayMs = 500;
const toastIds = {
  sessionExpired: "admin-session-expired",
  csrfFailed: "admin-csrf-failed",
};

const sessionExpiredEvent = "infibolt-admin-session-expired";

export function dismissAuthToasts() {
  toast.dismiss(toastIds.sessionExpired);
  toast.dismiss(toastIds.csrfFailed);
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
      csrfToken = await fetchCsrfToken();
    }
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.__mockResponse) return Promise.resolve(error.response.data);
    if (shouldRetryRequest(error)) {
      await delay(retryDelayMs);
      return api({ ...error.config, __networkRetry: true });
    }
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "Something went wrong.";
    const details = error.response?.data?.details || [];
    const fields = error.response?.data?.fields || {};
    const detailMessage = formatValidationDetail(details[0]);

    if (status === 401 && shouldAttemptRefresh(error.config)) {
      try {
        await refreshAdminSession();
        const retryConfig = { ...error.config, __isRetryRequest: true };
        return api(retryConfig);
      } catch {
        if (!shouldSuppressSessionExpired(error.config)) notifySessionExpired();
        return Promise.reject({ status, message: "Admin session expired", details, fields });
      }
    }

    if (status === 401) {
      if (!shouldSuppressSessionExpired(error.config)) notifySessionExpired();
    } else if (shouldSuppressGlobalErrorToast(error.config)) {
      return Promise.reject({ status, message, details, fields });
    } else if (status === 403 && message.includes("CSRF")) {
      csrfToken = null;
      toast.error("Security check failed", { id: toastIds.csrfFailed, description: "Please retry the action." });
    } else if (status === 422) {
      toast.error("Validation failed", { description: detailMessage || "Please check the required product fields." });
    } else {
      toast.error("Admin request failed", { description: message });
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

function formatValidationDetail(detail) {
  if (!detail) return "";
  const field = String(detail.path || detail.param || "Field")
    .replace(/^marketplace\./, "Marketplace ")
    .replace(/([A-Z])/g, " $1")
    .replace(/[._]/g, " ")
    .trim();
  const label = field ? field.charAt(0).toUpperCase() + field.slice(1) : "Field";
  return detail.msg && detail.msg !== "Invalid value" ? `${label}: ${detail.msg}` : `${label} is invalid.`;
}

function shouldAttemptRefresh(config = {}) {
  if (!config || config.__isRetryRequest) return false;
  const url = String(config.url || "");
  return url.startsWith("/admin/") && !url.includes("/admin/auth/google") && !url.includes("/admin/auth/refresh") && !url.includes("/admin/auth/logout");
}

function shouldSuppressSessionExpired(config = {}) {
  return Boolean(config?.suppressSessionExpired);
}

function shouldSuppressGlobalErrorToast(config = {}) {
  return Boolean(config?.suppressGlobalErrorToast);
}

async function refreshAdminSession() {
  if (!refreshPromise) {
    refreshPromise = api.post("/admin/auth/refresh").finally(() => {
      refreshPromise = null;
    });
  }
  await refreshPromise;
  dismissAuthToasts();
}

function notifySessionExpired() {
  dismissAuthToasts();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(sessionExpiredEvent));
  }
}

async function fetchCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = requestWithNetworkRetry(() => axios.get(`${apiConfig.baseURL}/csrf-token`, { withCredentials: true }))
      .then((response) => response.data.csrfToken)
      .finally(() => {
        csrfTokenPromise = null;
      });
  }
  return csrfTokenPromise;
}

async function requestWithNetworkRetry(requestFactory) {
  try {
    return await requestFactory();
  } catch (error) {
    if (!isTransientNetworkError(error)) throw error;
    await delay(retryDelayMs);
    return requestFactory();
  }
}

function shouldRetryRequest(error) {
  if (error.config?.__networkRetry || !isTransientNetworkError(error)) return false;
  const method = (error.config?.method || "get").toLowerCase();
  return method === "get" || method === "head" || method === "options";
}

function isTransientNetworkError(error) {
  return !error.response && (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED" || error.message === "Network Error");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
