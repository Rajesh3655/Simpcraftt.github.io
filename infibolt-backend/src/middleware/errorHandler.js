import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ message: "Route not found.", requestId: req.id });
}

export function errorHandler(error, req, res, _next) {
  const isMulterLimit = error.name === "MulterError" && error.code === "LIMIT_FILE_SIZE";
  const statusCode = isMulterLimit ? 413 : error.statusCode || error.status || 500;
  if (statusCode >= 500) {
    console.error("[api:error]", { requestId: req.id, message: error.message, stack: error.stack });
  }
  res.status(statusCode).json({
    message: isMulterLimit ? "Uploaded file exceeds the allowed size limit." : statusCode >= 500 ? "Internal server error." : error.message,
    details: statusCode < 500 ? error.details : undefined,
    requestId: req.id,
    stack: env.nodeEnv === "development" ? error.stack : undefined,
  });
}
