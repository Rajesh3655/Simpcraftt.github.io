import * as Sentry from "@sentry/react";

let monitoringStarted = false;

export function initializeMonitoring() {
  if (monitoringStarted) return true;
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (dsn) {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: import.meta.env.PROD ? 0.08 : 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      integrations: [],
    });
  }
  monitoringStarted = true;
  if (typeof window !== "undefined") observeWebVitals();
  return true;
}

function observeWebVitals() {
  if (!("PerformanceObserver" in window)) return;
  const report = (name, value, rating = "needs-review") => {
    window.dispatchEvent(new CustomEvent("infibolt:web-vital", { detail: { name, value, rating } }));
  };

  try {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) report("LCP", lastEntry.startTime, lastEntry.startTime < 2500 ? "good" : "needs-review");
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}

  try {
    let cls = 0;
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) cls += entry.value;
      });
      report("CLS", cls, cls < 0.1 ? "good" : "needs-review");
    }).observe({ type: "layout-shift", buffered: true });
  } catch {}

  try {
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        report("INP-candidate", entry.duration, entry.duration < 200 ? "good" : "needs-review");
      });
    }).observe({ type: "event", buffered: true, durationThreshold: 40 });
  } catch {}
}
