import { matchedData } from "express-validator";
import { writeAuditLog } from "../middleware/audit.js";
import { AdminUser } from "../models/AdminUser.js";
import { Category } from "../models/Category.js";
import { Collection } from "../models/Collection.js";
import { Customer } from "../models/Customer.js";
import { FeatureToggle } from "../models/FeatureToggle.js";
import { Product } from "../models/Product.js";
import { SupportTicket } from "../models/SupportTicket.js";
import { WarrantyClaim } from "../models/WarrantyClaim.js";
import { hashToken, verifyPassword } from "../utils/crypto.js";
import { clearAuthCookies, verifyRefreshToken } from "../utils/cookies.js";
import { createHttpError } from "../utils/httpError.js";
import { ok, sanitizeUser } from "../utils/response.js";
import { createSession, revokeUserSessions, rotateRefreshSession } from "../services/sessionService.js";

const maxFailedLogins = 5;

export async function adminLogin(req, res) {
  const { email, password } = matchedData(req);
  const user = await AdminUser.findOne({ email }).select("+passwordHash +failedLoginCount +lockUntil +refreshTokenHash");
  if (!user || user.status === "Locked") throw createHttpError(401, "Invalid admin credentials.");
  if (user.lockUntil && user.lockUntil > new Date()) throw createHttpError(423, "Admin account temporarily locked.");
  if (!(await verifyPassword(password, user.passwordHash))) {
    user.failedLoginCount = (user.failedLoginCount || 0) + 1;
    if (user.failedLoginCount >= maxFailedLogins) user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await writeAuditLog(req, "admin.login.failed", { email });
    throw createHttpError(401, "Invalid admin credentials.");
  }
  user.failedLoginCount = 0;
  user.lockUntil = undefined;
  await createSession(req, res, user);
  await writeAuditLog(req, "admin.login.success", { email });
  return ok(res, { user: sanitizeUser(user) });
}

export async function adminRefresh(req, res) {
  const refreshToken = req.signedCookies?.infibolt_refresh;
  if (!refreshToken) throw createHttpError(401, "Refresh token missing.");
  const payload = verifyRefreshToken(refreshToken);
  if (payload.role !== "admin") throw createHttpError(403, "Invalid session role.");
  const user = await AdminUser.findById(payload.sub).select("+refreshTokenHash");
  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) throw createHttpError(401, "Refresh token has been invalidated.");
  await rotateRefreshSession(req, res, user, refreshToken);
  return ok(res, { user: sanitizeUser(user) });
}

export async function adminLogout(req, res) {
  const user = req.user && (await AdminUser.findById(req.user._id).select("+refreshTokenHash"));
  if (user) {
    await revokeUserSessions(user);
    await writeAuditLog(req, "admin.logout");
  }
  clearAuthCookies(res);
  return ok(res, { loggedOut: true });
}

export async function adminMe(req, res) {
  return ok(res, { user: sanitizeUser(req.user) });
}

export async function overview(_req, res) {
  const [products, warrantyClaims, supportTickets] = await Promise.all([
    Product.find().lean(),
    WarrantyClaim.find().lean(),
    SupportTicket.find().lean(),
  ]);
  return ok(res, {
    stats: [
      { label: "Products", value: products.length, trend: "Local catalogue", status: "live" },
      { label: "Warranty Claims", value: warrantyClaims.length, trend: "Local queue", status: "attention" },
      { label: "Complaints", value: supportTickets.length, trend: "Support queue", status: "attention" },
      { label: "Future Orders", value: 0, trend: "Checkout staged", status: "staged" },
    ],
    products,
    warrantyClaims,
    supportTickets,
  });
}

export async function listAdminProducts(_req, res) {
  const page = Math.max(Number(_req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(_req.query.limit || 50), 1), 100);
  const filter = {};
  if (_req.query.category) filter.category = _req.query.category;
  if (_req.query.status) filter.status = _req.query.status;
  if (_req.query.search) filter.$text = { $search: String(_req.query.search) };
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  return ok(res, { items, total, page, pages: Math.ceil(total / limit) || 1 });
}

export async function createProduct(req, res) {
  const data = matchedData(req);
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const product = await Product.create({ ...data, slug });
  await writeAuditLog(req, "admin.product.created", { slug });
  return ok(res, product, 201);
}

export async function updateProduct(req, res) {
  const product = await Product.findOneAndUpdate({ slug: req.params.slug }, matchedData(req, { locations: ["body"] }), {
    new: true,
    runValidators: true,
  });
  if (!product) throw createHttpError(404, "Product not found.");
  await writeAuditLog(req, "admin.product.updated", { slug: req.params.slug });
  return ok(res, product);
}

export async function deleteProduct(req, res) {
  const product = await Product.findOneAndDelete({ slug: req.params.slug });
  if (!product) throw createHttpError(404, "Product not found.");
  await writeAuditLog(req, "admin.product.deleted", { slug: req.params.slug });
  return ok(res, { deleted: true, product });
}

export async function listUsers(_req, res) {
  return ok(res, { items: await Customer.find().sort({ createdAt: -1 }).lean() });
}

export async function listWarrantyClaimsAdmin(_req, res) {
  return ok(res, { items: await WarrantyClaim.find().sort({ updatedAt: -1 }).lean() });
}

export async function listSupportTicketsAdmin(_req, res) {
  return ok(res, { items: await SupportTicket.find().sort({ updatedAt: -1 }).lean() });
}

export const analytics = overview;

export async function settings(_req, res) {
  return ok(res, { featureToggles: await FeatureToggle.find().lean() });
}

export async function listCategoriesAdmin(_req, res) {
  return ok(res, { items: await Category.find().sort({ name: 1 }).lean() });
}

export async function createCategory(req, res) {
  const category = await Category.create(matchedData(req));
  await writeAuditLog(req, "admin.category.created", { id: category.id });
  return ok(res, category, 201);
}

export async function listCollectionsAdmin(_req, res) {
  return ok(res, { items: await Collection.find().sort({ name: 1 }).lean() });
}

export async function createCollection(req, res) {
  const collection = await Collection.create(matchedData(req));
  await writeAuditLog(req, "admin.collection.created", { slug: collection.slug });
  return ok(res, collection, 201);
}

export async function updateWarrantyStatus(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  const update = {
    $set: data,
    $push: data.status
      ? {
          statusHistory: {
            status: data.status,
            note: data.notes || "Admin status update",
            actorEmail: req.user.email,
          },
        }
      : undefined,
  };
  if (!update.$push) delete update.$push;
  const claim = await WarrantyClaim.findOneAndUpdate({ id: req.params.id }, update, { new: true, runValidators: true });
  if (!claim) throw createHttpError(404, "Claim not found.");
  await writeAuditLog(req, "admin.warranty.updated", { claimId: req.params.id });
  return ok(res, claim);
}

export async function replySupportTicket(req, res) {
  const { message, status } = matchedData(req);
  const ticket = await SupportTicket.findOneAndUpdate(
    { id: req.params.id },
    {
      status: status || "Replied",
      lastReply: message,
      $push: {
        replies: {
          authorName: req.user.name,
          authorRole: req.user.role,
          message,
        },
      },
    },
    { new: true, runValidators: true }
  );
  if (!ticket) throw createHttpError(404, "Ticket not found.");
  await writeAuditLog(req, "admin.support.replied", { ticketId: req.params.id });
  return ok(res, ticket);
}
