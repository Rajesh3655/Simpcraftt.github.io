import { matchedData } from "express-validator";
import { Category } from "../models/Category.js";
import { Collection } from "../models/Collection.js";
import { Customer } from "../models/Customer.js";
import { Product } from "../models/Product.js";
import { SupportTicket } from "../models/SupportTicket.js";
import { WarrantyClaim } from "../models/WarrantyClaim.js";
import { writeAuditLog } from "../middleware/audit.js";
import { env } from "../config/env.js";
import { hashPassword, hashToken, randomToken, verifyPassword } from "../utils/crypto.js";
import { clearAuthCookies, verifyRefreshToken } from "../utils/cookies.js";
import { createHttpError } from "../utils/httpError.js";
import { ok, productDetails, sanitizeUser } from "../utils/response.js";
import { createSession, revokeUserSessions, rotateRefreshSession } from "../services/sessionService.js";
import { issueOtp, verifyOtpCode } from "../services/otpService.js";

const lockMinutes = 15;
const maxFailedLogins = 5;

function issueId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function assertUnlocked(user) {
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw createHttpError(423, "Account is temporarily locked. Please try again later.");
  }
}

async function recordFailedLogin(user) {
  user.failedLoginCount = (user.failedLoginCount || 0) + 1;
  if (user.failedLoginCount >= maxFailedLogins) {
    user.lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
  }
  await user.save();
}

export async function login(req, res) {
  const { email, password } = matchedData(req);
  const user = await Customer.findOne({ email }).select("+passwordHash +failedLoginCount +lockUntil +refreshTokenHash");
  if (!user) throw createHttpError(401, "Invalid email or password.");
  await assertUnlocked(user);
  if (!user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    await recordFailedLogin(user);
    await writeAuditLog(req, "customer.login.failed", { email });
    throw createHttpError(401, "Invalid email or password.");
  }
  user.failedLoginCount = 0;
  user.lockUntil = undefined;
  await createSession(req, res, user);
  await writeAuditLog(req, "customer.login.success", { email });
  return ok(res, { user: sanitizeUser(user) });
}

export async function signup(req, res) {
  const data = matchedData(req);
  const exists = await Customer.exists({ email: data.email });
  if (exists) throw createHttpError(409, "An account with this email already exists.");
  const otp = await issueOtp({ target: data.email, purpose: "signup", metadata: { name: data.name, phone: data.phone }, req });
  await writeAuditLog(req, "customer.signup.requested", { email: data.email });
  return ok(res, {
    verificationId: otp.id,
    channel: data.phone ? "sms" : "email",
    expiresInSeconds: otp.expiresInSeconds,
    resendAfterSeconds: otp.resendAfterSeconds,
    message: "OTP sent successfully.",
  }, 202);
}

export async function verifyOtp(req, res) {
  const data = matchedData(req);
  await verifyOtpCode({ target: data.email, purpose: "signup", otp: data.otp, req });
  const passwordHash = await hashPassword(data.password);
  const user = await Customer.findOneAndUpdate(
    { email: data.email },
    {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      status: "Verified",
      role: "customer",
      emailVerifiedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).select("+refreshTokenHash");
  await createSession(req, res, user);
  await writeAuditLog(req, "customer.email.verified", { email: data.email });
  return ok(res, { user: sanitizeUser(user) }, 201);
}

export async function forgotPassword(req, res) {
  const { email } = matchedData(req);
  const user = await Customer.findOne({ email }).select("+resetTokenHash +resetTokenExpiresAt");
  let resendAfterSeconds = env.otpResendCooldownSeconds;
  if (user) {
    const token = randomToken(24);
    user.resetTokenHash = hashToken(token);
    user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const otp = await issueOtp({ target: email, purpose: "password-reset", metadata: { resetTokenHint: token.slice(0, 8) }, ttlMinutes: 15, req });
    resendAfterSeconds = otp.resendAfterSeconds;
    await writeAuditLog(req, "customer.password_reset.requested", { email });
  }
  return ok(res, { message: "If the account exists, an OTP has been sent.", resendAfterSeconds });
}

export async function resetPassword(req, res) {
  const { email, otp, password } = matchedData(req);
  await verifyOtpCode({ target: email, purpose: "password-reset", otp, req });
  const user = await Customer.findOne({ email }).select("+passwordHash +resetTokenHash +resetTokenExpiresAt");
  if (!user) throw createHttpError(404, "Account not found.");
  user.passwordHash = await hashPassword(password);
  user.resetTokenHash = undefined;
  user.resetTokenExpiresAt = undefined;
  user.failedLoginCount = 0;
  user.lockUntil = undefined;
  await user.save();
  await revokeUserSessions(user);
  await writeAuditLog(req, "customer.password_reset.completed", { email });
  return ok(res, { reset: true });
}

export async function requestLoginOtp(req, res) {
  const { email, password } = matchedData(req);
  const user = await Customer.findOne({ email }).select("+passwordHash +failedLoginCount +lockUntil");
  if (!user) throw createHttpError(401, "Invalid email or password.");
  await assertUnlocked(user);
  if (!user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    await recordFailedLogin(user);
    await writeAuditLog(req, "customer.login_otp.failed", { email });
    throw createHttpError(401, "Invalid email or password.");
  }
  const otp = await issueOtp({ target: email, purpose: "login", metadata: { userId: String(user._id) }, req });
  await writeAuditLog(req, "customer.login_otp.requested", { email });
  return ok(res, {
    otpRequired: true,
    verificationId: otp.id,
    expiresInSeconds: otp.expiresInSeconds,
    resendAfterSeconds: otp.resendAfterSeconds,
    message: "Login OTP sent successfully.",
  }, 202);
}

export async function verifyLoginOtp(req, res) {
  const { email, otp } = matchedData(req);
  await verifyOtpCode({ target: email, purpose: "login", otp, req });
  const user = await Customer.findOne({ email }).select("+refreshTokenHash");
  if (!user) throw createHttpError(404, "Account not found.");
  await createSession(req, res, user);
  await writeAuditLog(req, "customer.login_otp.verified", { email });
  return ok(res, { user: sanitizeUser(user) });
}

export async function refresh(req, res) {
  const refreshToken = req.signedCookies?.infibolt_refresh;
  if (!refreshToken) throw createHttpError(401, "Refresh token missing.");
  const payload = verifyRefreshToken(refreshToken);
  if (payload.role !== "customer") throw createHttpError(403, "Invalid session role.");
  const user = await Customer.findById(payload.sub).select("+refreshTokenHash");
  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) throw createHttpError(401, "Refresh token has been invalidated.");
  await rotateRefreshSession(req, res, user, refreshToken);
  return ok(res, { user: sanitizeUser(user) });
}

export async function logout(req, res) {
  const user = req.user && (await Customer.findById(req.user._id).select("+refreshTokenHash"));
  if (user) {
    await revokeUserSessions(user);
    await writeAuditLog(req, "customer.logout");
  }
  clearAuthCookies(res);
  return ok(res, { loggedOut: true });
}

export async function me(req, res) {
  return ok(res, { user: sanitizeUser(req.user) });
}

export async function listProducts(_req, res) {
  const page = Math.max(Number(_req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(_req.query.limit || 24), 1), 60);
  const skip = (page - 1) * limit;
  const publicVisibility = { $or: [{ visibility: "public" }, { visibility: { $exists: false } }] };
  const filter = { ...publicVisibility, status: { $in: ["Ready", "Published", "Preview", "Prototype"] } };
  if (_req.query.category) filter.category = _req.query.category;
  if (_req.query.collection) filter.collection = _req.query.collection;
  if (_req.query.featured === "true") filter.featured = true;
  if (_req.query.search) filter.$text = { $search: String(_req.query.search) };

  const [items, total, categories] = await Promise.all([
    Product.find(filter).sort({ featured: -1, rating: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
    Category.find().lean(),
  ]);
  return ok(res, { items: items.map(productDetails), categories, total, page, pages: Math.ceil(total / limit) || 1 });
}

export async function getProduct(req, res) {
  const product = await Product.findOne({
    slug: req.params.slug,
    status: { $in: ["Ready", "Published", "Preview", "Prototype"] },
    $or: [{ visibility: "public" }, { visibility: { $exists: false } }],
  }).lean();
  if (!product) throw createHttpError(404, "Product not found.");
  return ok(res, productDetails(product));
}

export async function listCollections(_req, res) {
  return ok(res, { items: await Collection.find().lean() });
}

export async function listCategories(_req, res) {
  return ok(res, { items: await Category.find().sort({ name: 1 }).lean() });
}

export async function listFeaturedProducts(_req, res) {
  const publicVisibility = { $or: [{ visibility: "public" }, { visibility: { $exists: false } }] };
  let items = await Product.find({ featured: true, ...publicVisibility, status: { $in: ["Ready", "Published", "Preview"] } })
    .sort({ rating: -1, createdAt: -1 })
    .limit(12)
    .lean();
  if (!items.length) {
    items = await Product.find({ ...publicVisibility, status: { $in: ["Ready", "Published", "Preview", "Prototype"] } })
      .sort({ rating: -1, createdAt: -1 })
      .limit(12)
      .lean();
  }
  return ok(res, { items: items.map(productDetails), total: items.length });
}

export async function getProfile(req, res) {
  return ok(res, { ...sanitizeUser(req.user), city: "Bengaluru", state: "Karnataka" });
}

export async function createLead(req, res) {
  await writeAuditLog(req, "lead.created", { email: req.body.email });
  return ok(res, { id: issueId("LEAD"), status: "received", ...matchedData(req) }, 202);
}

export async function subscribeNewsletter(req, res) {
  return ok(res, { id: issueId("NEWS"), status: "subscribed", ...matchedData(req) }, 202);
}

export async function listSupportTickets(req, res) {
  const filter = req.user?.email ? { email: req.user.email } : {};
  return ok(res, { items: await SupportTicket.find(filter).sort({ updatedAt: -1 }).lean() });
}

export async function createSupportTicket(req, res) {
  const data = matchedData(req);
  const ticket = await SupportTicket.create({
    id: issueId("SCS"),
    status: "Open",
    channel: "Web",
    customer: data.customer || req.user?.name || data.name,
    email: data.email || req.user?.email,
    topic: data.topic,
    message: data.message,
    attachments: data.attachments || [],
    replies: [{ authorName: data.customer || req.user?.name || data.name || "Customer", authorRole: "customer", message: data.message }],
  });
  await writeAuditLog(req, "support.ticket.created", { ticketId: ticket.id });
  return ok(res, ticket, 202);
}

export async function listWarrantyClaims(req, res) {
  const filter = req.user?.email ? { email: req.user.email } : {};
  return ok(res, { items: await WarrantyClaim.find(filter).sort({ updatedAt: -1 }).lean() });
}

export async function createWarrantyClaim(req, res) {
  const data = matchedData(req);
  const existing = await WarrantyClaim.findOne({ serial: data.serial });
  if (existing) throw createHttpError(409, "This serial number already has a warranty claim.");
  const claim = await WarrantyClaim.create({
    id: issueId("SCW"),
    status: "Verification",
    priority: "Normal",
    customer: data.customer || req.user?.name || data.name,
    email: data.email || req.user?.email,
    product: data.product,
    serial: data.serial,
    invoiceNumber: data.invoiceNumber,
    invoiceUrl: data.invoiceUrl,
    purchaseDate: data.purchaseDate,
    warrantyUntil: data.purchaseDate ? new Date(new Date(data.purchaseDate).setFullYear(new Date(data.purchaseDate).getFullYear() + 1)) : undefined,
    statusHistory: [{ status: "Verification", note: "Claim created", actorEmail: data.email || req.user?.email }],
  });
  const otpTarget = claim.email || req.user?.email;
  if (!otpTarget) throw createHttpError(422, "Email or mobile number is required for warranty OTP verification.");
  const otp = await issueOtp({ target: otpTarget, purpose: "warranty", metadata: { claimId: claim.id, serial: claim.serial }, req });
  await writeAuditLog(req, "warranty.claim.created", { claimId: claim.id });
  return ok(res, { ...claim.toJSON(), otpRequired: true, expiresInSeconds: otp.expiresInSeconds, resendAfterSeconds: otp.resendAfterSeconds, message: "Warranty OTP sent successfully." }, 202);
}

export async function verifyWarrantyOtp(req, res) {
  const { id, otp } = matchedData(req);
  const claim = await WarrantyClaim.findOne({ id });
  if (!claim) throw createHttpError(404, "Warranty claim not found.");
  await verifyOtpCode({ target: claim.email || req.user?.email, purpose: "warranty", otp, req });
  claim.otpVerifiedAt = new Date();
  claim.statusHistory.push({ status: claim.status, note: "Warranty OTP verified", actorEmail: claim.email });
  await claim.save();
  return ok(res, claim);
}

export async function lookupWarranty(req, res) {
  const { serial } = matchedData(req);
  const claim = await WarrantyClaim.findOne({ serial }).lean();
  if (!claim) throw createHttpError(404, "Warranty record not found.");
  if (req.user?.email && claim.email && claim.email !== req.user.email) throw createHttpError(403, "Warranty record is not owned by this account.");
  return ok(res, claim);
}

export async function getSupportTicket(req, res) {
  const ticket = await SupportTicket.findOne({ id: req.params.id }).lean();
  if (!ticket) throw createHttpError(404, "Support ticket not found.");
  if (req.user?.email && ticket.email && ticket.email !== req.user.email) throw createHttpError(403, "Ticket is not owned by this account.");
  return ok(res, ticket);
}

export async function replySupportTicket(req, res) {
  const { id, message } = matchedData(req);
  const ticket = await SupportTicket.findOne({ id });
  if (!ticket) throw createHttpError(404, "Support ticket not found.");
  if (ticket.email && ticket.email !== req.user.email) throw createHttpError(403, "Ticket is not owned by this account.");
  ticket.status = "In Progress";
  ticket.replies.push({ authorName: req.user.name, authorRole: req.user.role, message });
  await ticket.save();
  await writeAuditLog(req, "support.ticket.customer_reply", { ticketId: id });
  return ok(res, ticket);
}
