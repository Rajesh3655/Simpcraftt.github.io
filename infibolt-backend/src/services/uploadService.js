import crypto from "crypto";
import { existsSync } from "fs";
import { mkdir, readdir, rename, stat, unlink } from "fs/promises";
import multer from "multer";
import { basename, extname, resolve } from "path";
import { env } from "../config/env.js";
import { createHttpError } from "../utils/httpError.js";

export const uploadFolders = {
  products: "products",
  warranty: "warranty",
  policies: "policies",
  rma: "rma",
  support: "support",
  temp: "temp",
};

const imageMime = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const documentMime = new Set(["application/pdf"]);
const imageExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const documentExt = new Set([".pdf"]);

export const limits = {
  products: 5 * 1024 * 1024,
  warranty: 5 * 1024 * 1024,
  policies: 5 * 1024 * 1024,
  rma: 2 * 1024 * 1024,
  support: 10 * 1024 * 1024,
  temp: env.maxUploadBytes,
};

export function uploadRoot() {
  return resolve(process.cwd(), env.uploadBasePath);
}

export function folderPath(folder) {
  const safeFolder = uploadFolders[folder] || uploadFolders.temp;
  const target = resolve(uploadRoot(), safeFolder);
  if (!target.startsWith(uploadRoot())) throw createHttpError(400, "Invalid upload folder.");
  return target;
}

export async function ensureUploadDirectories() {
  await Promise.all(Object.keys(uploadFolders).map((folder) => mkdir(folderPath(folder), { recursive: true })));
}

export function sanitizeOriginalName(name = "upload") {
  const parsed = basename(name).replace(/\.[^.]+$/, "");
  const safe = parsed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
  return safe || "upload";
}

export function uniqueFilename(file) {
  const ext = extname(file.originalname || "").toLowerCase();
  return `${Date.now()}-${crypto.randomUUID()}-${sanitizeOriginalName(file.originalname)}${ext}`;
}

export function assertUploadAllowed(file, { imagesOnly = false, documentsOnly = false } = {}) {
  if (!file) throw createHttpError(400, "File is required.");
  const ext = extname(file.originalname || "").toLowerCase();
  const validImage = imageMime.has(file.mimetype) && imageExt.has(ext);
  const validDocument = documentMime.has(file.mimetype) && documentExt.has(ext);
  if (imagesOnly && !validImage) throw createHttpError(422, "Only JPG, PNG, WEBP, GIF, and AVIF images are allowed.");
  if (documentsOnly && !validDocument) throw createHttpError(422, "Only PDF files are allowed.");
  if (documentsOnly) return;
  if (!imagesOnly && !validImage && !validDocument) throw createHttpError(422, "Only JPG, PNG, WEBP, and PDF files are allowed.");
}

export function createUploadMiddleware(folder, options = {}) {
  const targetFolder = uploadFolders[folder] ? folder : "temp";
  const maxSize = options.maxSize || limits[targetFolder];
  const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, folderPath(targetFolder)),
    filename: (_req, file, callback) => callback(null, uniqueFilename(file)),
  });

  return multer({
    storage,
    limits: { fileSize: maxSize, files: 1 },
    fileFilter: (_req, file, callback) => {
      try {
        assertUploadAllowed(file, options);
        callback(null, true);
      } catch (error) {
        callback(error);
      }
    },
  });
}

export function relativeUploadPath(folder, filename) {
  const safeFolder = uploadFolders[folder] || uploadFolders.temp;
  if (!/^[0-9]+-[0-9a-f-]+-[a-z0-9-]+\.(jpg|jpeg|png|webp|gif|avif|pdf)$/i.test(filename)) {
    throw createHttpError(400, "Invalid filename.");
  }
  return `/uploads/${safeFolder}/${filename}`;
}

export function resolveUploadPath(folder, filename) {
  const target = resolve(folderPath(folder), filename);
  if (!target.startsWith(folderPath(folder))) throw createHttpError(400, "Invalid file path.");
  return target;
}

export function parseRelativeUploadPath(path) {
  const match = String(path || "").match(/^\/uploads\/([a-z]+)\/([0-9]+-[0-9a-f-]+-[a-z0-9-]+\.(?:jpg|jpeg|png|webp|gif|avif|pdf))$/i);
  if (!match) throw createHttpError(400, "Invalid upload path.");
  return { folder: match[1], filename: match[2] };
}

export function buildUploadResponse(req, folder) {
  const relativePath = relativeUploadPath(folder, req.file.filename);
  return {
    provider: "local",
    status: "uploaded",
    folder,
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: relativePath,
    url: relativePath,
    fullUrl: `${env.apiOrigin}${relativePath}`,
    size: req.file.size,
    type: req.file.mimetype,
  };
}

export async function deleteLocalUpload(folder, filename) {
  const target = resolveUploadPath(folder, filename);
  if (!existsSync(target)) throw createHttpError(404, "File not found.");
  await unlink(target);
  return { deleted: true, path: relativeUploadPath(folder, filename) };
}

export async function moveLocalUpload(path, targetFolder) {
  const { folder, filename } = parseRelativeUploadPath(path);
  if (!uploadFolders[targetFolder]) throw createHttpError(400, "Invalid upload target.");
  if (folder === targetFolder) return relativeUploadPath(targetFolder, filename);
  if (folder !== uploadFolders.temp) throw createHttpError(422, "Only temporary uploads can be finalized.");
  const source = resolveUploadPath(folder, filename);
  const target = resolveUploadPath(targetFolder, filename);
  if (!existsSync(source)) throw createHttpError(410, "Uploaded file expired. Please upload the invoice again.");
  await rename(source, target);
  return relativeUploadPath(targetFolder, filename);
}

export async function cleanupTempUploads(maxAgeMs = 24 * 60 * 60 * 1000) {
  const tempPath = folderPath("temp");
  const now = Date.now();
  const files = await readdir(tempPath, { withFileTypes: true });
  const deleted = [];
  await Promise.all(files.map(async (file) => {
    if (!file.isFile() || file.name === ".gitkeep") return;
    const target = resolveUploadPath("temp", file.name);
    const info = await stat(target);
    if (now - info.mtimeMs < maxAgeMs) return;
    await unlink(target);
    deleted.push(file.name);
  }));
  return { deleted };
}

export function uploadReadiness() {
  return {
    provider: "local",
    basePath: env.uploadBasePath,
    folders: Object.values(uploadFolders),
    limits: {
      products: "5MB",
      warranty: "5MB",
      policies: "5MB",
      rma: "2MB",
      support: "10MB",
      temp: `${Math.round(env.maxUploadBytes / 1024 / 1024)}MB`,
    },
    storageModes: ["local-secure", "cdn-ready", "object-storage-ready"],
  };
}
