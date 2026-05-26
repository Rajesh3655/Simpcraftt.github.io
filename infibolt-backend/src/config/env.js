import "dotenv/config";

const production = process.env.NODE_ENV === "production";
const fallbackSecret = "replace-this-local-development-secret-only";
const placeholderPattern = /replace|change-me|<|user:password|password@cluster/i;
const defaultCorsOrigins = [
  process.env.FRONTEND_ORIGIN || "https://app.infibolt.com",
  process.env.ADMIN_ORIGIN || "https://admin.infibolt.com",
];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: production,
  host: process.env.HOST || "0.0.0.0",
  port: Number(process.env.PORT || 3000),
  apiOrigin: process.env.API_ORIGIN || "https://api.infibolt.com",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "https://app.infibolt.com",
  adminOrigin: process.env.ADMIN_ORIGIN || "https://admin.infibolt.com",
  corsOrigins: (process.env.CORS_ORIGINS || defaultCorsOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .filter((origin, index, origins) => origins.indexOf(origin) === index),
  mongoUri: process.env.MONGODB_URI || "",
  mongoDb: process.env.MONGODB_DB || "infibolt_dev",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || fallbackSecret,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || `${fallbackSecret}-refresh`,
  cookieSecret: process.env.COOKIE_SECRET || `${fallbackSecret}-cookie`,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS || 7),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  maxUploadBytes: Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024),
  uploadProvider: process.env.UPLOAD_PROVIDER || "local",
  uploadBasePath: process.env.UPLOAD_BASE_PATH || "uploads",
  allowProductionSeed: process.env.ALLOW_PRODUCTION_SEED === "true",
  otpProvider: process.env.OTP_PROVIDER || "local",
  allowLocalOtp: process.env.ALLOW_LOCAL_OTP === "true",
  emailFrom: process.env.EMAIL_FROM || "INFIBOLT <no-reply@infibolt.com>",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  resendApiKey: process.env.RESEND_API_KEY || "",
  sendgridApiKey: process.env.SENDGRID_API_KEY || "",
  awsSesRegion: process.env.AWS_SES_REGION || "",
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES || 10),
  otpResendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60),
  otpMaxRequestsPerHour: Number(process.env.OTP_MAX_REQUESTS_PER_HOUR || 5),
  otpMaxVerifyAttempts: Number(process.env.OTP_MAX_VERIFY_ATTEMPTS || 5),
  sentryDsn: process.env.SENTRY_DSN || "",
  logLevel: process.env.LOG_LEVEL || (production ? "info" : "debug"),
  adminEmail: process.env.SEED_ADMIN_EMAIL || "admin@infibolt.com",
  adminPassword: process.env.SEED_ADMIN_PASSWORD || "",
  customerPassword: process.env.SEED_CUSTOMER_PASSWORD || "",
};

function requireProductionValue(name, value, { url = false, secret = false } = {}) {
  if (!production) return;
  if (!value || placeholderPattern.test(String(value))) {
    throw new Error(`Production ${name} must be configured.`);
  }
  if (url && !String(value).startsWith("https://")) {
    throw new Error(`Production ${name} must use HTTPS.`);
  }
  if (secret && String(value).length < 48) {
    throw new Error(`Production ${name} must be at least 48 characters.`);
  }
}

if (production && env.uploadProvider !== "local") {
  throw new Error("Only UPLOAD_PROVIDER=local is enabled in this deployment.");
}

requireProductionValue("API_ORIGIN", env.apiOrigin, { url: true });
requireProductionValue("FRONTEND_ORIGIN", env.frontendOrigin, { url: true });
requireProductionValue("ADMIN_ORIGIN", env.adminOrigin, { url: true });
requireProductionValue("MONGODB_URI", env.mongoUri);
requireProductionValue("JWT_ACCESS_SECRET", env.jwtAccessSecret, { secret: true });
requireProductionValue("JWT_REFRESH_SECRET", env.jwtRefreshSecret, { secret: true });
requireProductionValue("COOKIE_SECRET", env.cookieSecret, { secret: true });
if (production && env.allowProductionSeed) {
  requireProductionValue("SEED_ADMIN_PASSWORD", env.adminPassword);
}
