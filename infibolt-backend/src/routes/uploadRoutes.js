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
const warrantyUpload = createUploadMiddleware("warranty", { maxSize: limits.warranty });
const supportUpload = createUploadMiddleware("support", { maxSize: limits.support });
const tempUpload = createUploadMiddleware("temp", { maxSize: limits.temp });

export const uploadRoutes = Router();

uploadRoutes.get("/status", requireAuth(["customer", "admin", "super-admin"]), (_req, res) => res.json(uploadReadiness()));

uploadRoutes.post("/", uploadLimiter, requireAuth(["customer", "admin", "super-admin"]), tempUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "File is required.");
  res.status(201).json(buildUploadResponse(req, "temp"));
}));

uploadRoutes.post("/products", uploadLimiter, requireAuth(["admin", "super-admin"]), productUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "Product image is required.");
  res.status(201).json(buildUploadResponse(req, "products"));
}));

uploadRoutes.post("/warranty", uploadLimiter, requireAuth(["customer", "admin", "super-admin"]), warrantyUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "Warranty invoice is required.");
  res.status(201).json(buildUploadResponse(req, "warranty"));
}));

uploadRoutes.post("/support", uploadLimiter, requireAuth(["customer", "admin", "super-admin"]), supportUpload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) throw createHttpError(400, "Support attachment is required.");
  res.status(201).json(buildUploadResponse(req, "support"));
}));

uploadRoutes.get("/:folder/:filename", requireAuth(["customer", "admin", "super-admin"]), asyncHandler(async (req, res) => {
  const target = resolveUploadPath(req.params.folder, req.params.filename);
  if (!existsSync(target)) throw createHttpError(404, "File not found.");
  res.sendFile(target);
}));

uploadRoutes.delete("/:folder/:filename", requireAuth(["admin", "super-admin"]), asyncHandler(async (req, res) => {
  res.json(await deleteLocalUpload(req.params.folder, req.params.filename));
}));
