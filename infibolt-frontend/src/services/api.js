import axios from "axios";
import { toast } from "sonner";
import { apiConfig } from "../config/api";
import { mockRequest } from "./mockApi";

let csrfToken = null;
let csrfTokenPromise = null;
const responseCache = new Map();
const unsafeMethods = new Set(["post", "put", "patch", "delete"]);
const retryDelayMs = 500;
const defaultCacheTtlMs = 60 * 1000;
const maxCacheEntries = 80;

function getFriendlyApiError(error) {
  const status = error.response?.status;
  const details = error.response?.data?.details;
  const fields = error.response?.data?.fields || details?.fields || {};
  const validationMessage = Array.isArray(details) ? details.map((detail) => detail.msg).filter((message) => message && message !== "Invalid value").join(" ") : "";
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
      message: "We could not reach INFIBOLT services right now. Please try again in a moment.",
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
    const { status, message, details, fields } = getFriendlyApiError(error);
    if (!error.config?.skipGlobalErrorToast) {
      const toastId = status ? `api-error-${status}` : "api-error-network";
      if (status === 401) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("infibolt:customer-auth-expired"));
        }
        toast.info("Session ended", { id: toastId, description: "Please sign in again to continue." });
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
  cachedGet: (url, config = {}, ttlMs = defaultCacheTtlMs) => cachedGet(url, config, ttlMs),
  prefetch: (url, config = {}, ttlMs = defaultCacheTtlMs) => {
    cachedGet(url, config, ttlMs).catch(() => {});
  },
  clearCache: (prefix = "") => clearCache(prefix),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

function cachedGet(url, config = {}, ttlMs = defaultCacheTtlMs) {
  const cacheKey = `${url}:${JSON.stringify(config.params || {})}`;
  pruneExpiredCache();
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    cached.lastAccessedAt = Date.now();
    return cached.promise;
  }
  const promise = api.get(url, config).catch((error) => {
    responseCache.delete(cacheKey);
    throw error;
  });
  responseCache.set(cacheKey, { promise, expiresAt: Date.now() + ttlMs, lastAccessedAt: Date.now() });
  enforceCacheLimit();
  return promise;
}

function pruneExpiredCache() {
  const now = Date.now();
  responseCache.forEach((entry, key) => {
    if (entry.expiresAt <= now) responseCache.delete(key);
  });
}

function enforceCacheLimit() {
  if (responseCache.size <= maxCacheEntries) return;
  const removable = [...responseCache.entries()].sort((a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt);
  removable.slice(0, responseCache.size - maxCacheEntries).forEach(([key]) => responseCache.delete(key));
}

function clearCache(prefix = "") {
  if (!prefix) {
    responseCache.clear();
    return;
  }
  responseCache.forEach((_, key) => {
    if (key.startsWith(prefix)) responseCache.delete(key);
  });
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
