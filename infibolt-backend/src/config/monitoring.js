import * as Sentry from "@sentry/node";
import { env } from "./env.js";

let monitoringEnabled = false;

export function initializeMonitoring() {
  if (!env.sentryDsn) return false;
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    tracesSampleRate: env.isProduction ? 0.15 : 1.0,
  });
  monitoringEnabled = true;
  return monitoringEnabled;
}

export function attachMonitoringErrorHandler(app) {
  if (!monitoringEnabled) return false;
  Sentry.setupExpressErrorHandler(app);
  return true;
}

export { Sentry };
