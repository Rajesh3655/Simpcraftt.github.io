const isLocalBrowser =
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_URL || (isLocalBrowser ? "http://localhost:4000/api/v1" : "https://api.infibolt.com/api/v1"),
  uploadBaseURL: import.meta.env.VITE_UPLOAD_URL || (isLocalBrowser ? "http://localhost:4000/uploads" : "https://api.infibolt.com/uploads"),
  useMockApi: import.meta.env.VITE_USE_MOCK_API === "true",
  timeout: 12000,
};

export function uploadUrl(path = "") {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/uploads/") ? path.replace(/^\/uploads/, "") : path;
  return `${apiConfig.uploadBaseURL}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}
