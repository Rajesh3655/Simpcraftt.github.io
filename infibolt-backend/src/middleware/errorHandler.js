import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ message: "Route not found.", requestId: req.id });
}

export function errorHandler(error, req, res, _next) {
  const isMulterLimit = error.name === "MulterError" && error.code === "LIMIT_FILE_SIZE";
  const isDuplicateKey = error?.code === 11000;
  const statusCode = isMulterLimit ? 413 : isDuplicateKey ? 409 : error.statusCode || error.status || 500;
  if (statusCode >= 500) {
    console.error("[api:error]", { requestId: req.id, message: error.message, stack: error.stack });
  }
  const duplicateField = isDuplicateKey ? Object.keys(error.keyPattern || error.keyValue || {})[0] : "";
  const fields = validationFields(error.details);
  res.status(statusCode).json({
    message: isMulterLimit
      ? "Uploaded file exceeds the allowed size limit."
      : isDuplicateKey
        ? `${duplicateField ? `${duplicateField} already exists.` : "Record already exists."}`
        : statusCode >= 500
          ? "Internal server error."
          : error.message,
    details: statusCode < 500 ? error.details : undefined,
    fields: statusCode < 500 ? fields : undefined,
    requestId: req.id,
    stack: env.nodeEnv === "development" ? error.stack : undefined,
  });
}

function validationFields(details) {
  if (!Array.isArray(details)) return undefined;
  return details.reduce((fields, detail) => {
    const key = detail.path || detail.param;
    if (!key || fields[key]) return fields;
    fields[key] = detail.msg && detail.msg !== "Invalid value" ? detail.msg : "This field needs attention.";
    return fields;
  }, {});
}
