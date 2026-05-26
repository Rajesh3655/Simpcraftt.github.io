import { existsSync } from "fs";
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { uploadLimiter } from "../middleware/rateLimit.js";
import {
  buildUploadResponse,
  createUploadMiddleware,
  deleteLocalUpload,
  ensureUploadDirectories,
  limits,
  resolveUploadPath,
  uploadReadiness,
} from "../services/uploadService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createHttpError } from "../utils/httpError.js";

await ensureUploadDirectories();

const productUpload = createUploadMiddleware("products", { imagesOnly: true, maxSize: limits.products });
const warrantyUpload = createUploadMiddleware("warranty", { documentsOnly: true, maxSize: limits.warranty });
const warrantyDraftUpload = createUploadMiddleware("temp", { documentsOnly: true, maxSize: limits.warranty });
const policyUpload = createUploadMiddleware("policies", { documentsOnly: true, maxSize: limits.policies });
const rmaUpload = createUploadMiddleware("rma", { imagesOnly: true, maxSize: limits.rma });
const supportUpload = createUploadMiddleware("support", { maxSize: limits.support });
const tempUpload = createUploadMiddleware("temp", { maxSize: limits.temp });

export const uploadRoutes = Router();

uploadRoutes.get("/status", requireAuth(["customer", "admin"]), (_req, res) => res.json(uploadReadiness()));

uploadRoutes.post("/", uploadLimiter, requireAuth(["customer", "admin"]), tempUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "File is required.");
  res.status(201).json(buildUploadResponse(req, "temp"));
}));

uploadRoutes.post("/products", uploadLimiter, requireAuth("admin"), productUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "Product image is required.");
  res.status(201).json(buildUploadResponse(req, "products"));
}));

uploadRoutes.post("/warranty", uploadLimiter, requireAuth(["customer", "admin"]), warrantyUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "Warranty invoice is required.");
  res.status(201).json(buildUploadResponse(req, "warranty"));
}));

uploadRoutes.post("/warranty-draft", uploadLimiter, requireAuth(["customer", "admin"]), warrantyDraftUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "Warranty invoice is required.");
  res.status(201).json(buildUploadResponse(req, "temp"));
}));

uploadRoutes.post("/policies", uploadLimiter, requireAuth("admin"), policyUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "Warranty policy PDF is required.");
  res.status(201).json(buildUploadResponse(req, "policies"));
}));

uploadRoutes.post("/rma", uploadLimiter, requireAuth(["customer", "admin"]), rmaUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "Product photo is required.");
  res.status(201).json(buildUploadResponse(req, "rma"));
}));

uploadRoutes.post("/support", uploadLimiter, requireAuth(["customer", "admin"]), supportUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "Support attachment is required.");
  res.status(201).json(buildUploadResponse(req, "support"));
}));

uploadRoutes.get("/:folder/:filename", requireAuth(["customer", "admin"]), asyncHandler(async (req, res) => {
  const target = resolveUploadPath(req.params.folder, req.params.filename);
  if (!existsSync(target)) throw createHttpError(404, "File not found.");
  res.sendFile(target);
}));

uploadRoutes.delete("/:folder/:filename", requireAuth("admin"), asyncHandler(async (req, res) => {
  res.json(await deleteLocalUpload(req.params.folder, req.params.filename));
}));
