import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { env } from "./config/env.js";
import { attachMonitoringErrorHandler, initializeMonitoring } from "./config/monitoring.js";
import { adminRoutes } from "./routes/adminRoutes.js";
import { customerRoutes } from "./routes/customerRoutes.js";
import { healthRoutes } from "./routes/healthRoutes.js";
import { uploadRoutes } from "./routes/uploadRoutes.js";
import { requireAuth } from "./middleware/auth.js";
import { csrfProtection, issueCsrfToken } from "./middleware/csrf.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { requestId } from "./middleware/requestId.js";
import { sanitizePayload } from "./middleware/sanitize.js";
import { ensureUploadDirectories, folderPath } from "./services/uploadService.js";

const app = express();
initializeMonitoring();
await ensureUploadDirectories();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(requestId);
app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "blob:", "https://images.unsplash.com"],
        "connect-src": ["'self'", env.frontendOrigin, env.adminOrigin, env.apiOrigin],
        "frame-ancestors": ["'none'"],
        "object-src": ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: env.isProduction ? { maxAge: 15552000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: "no-referrer" },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "X-Request-Id"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser(env.cookieSecret));
app.use(hpp());
app.use(sanitizePayload);
app.use(apiLimiter);

const staticUploadOptions = {
  dotfiles: "deny",
  fallthrough: false,
  index: false,
  setHeaders(res) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'; object-src 'none'; sandbox");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
};

app.use("/uploads/products", express.static(folderPath("products"), staticUploadOptions));
app.use("/uploads/warranty", requireAuth(["customer", "admin", "super-admin"]), express.static(folderPath("warranty"), staticUploadOptions));
app.use("/uploads/support", requireAuth(["customer", "admin", "super-admin"]), express.static(folderPath("support"), staticUploadOptions));

app.use("/health", healthRoutes);
app.use("/api/v1/health", healthRoutes);
app.get("/api/v1/csrf-token", issueCsrfToken);
app.use("/api/v1", csrfProtection);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", customerRoutes);

attachMonitoringErrorHandler(app);
app.use(notFound);
app.use(errorHandler);

export { app };
