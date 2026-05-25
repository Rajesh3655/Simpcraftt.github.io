import { matchedData } from "express-validator";
import { Category } from "../models/Category.js";
import { Collection } from "../models/Collection.js";
import { Customer } from "../models/Customer.js";
import { CustomerChangeLog } from "../models/CustomerChangeLog.js";
import { HomepageSection } from "../models/HomepageSection.js";
import { LaunchLead } from "../models/LaunchLead.js";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber.js";
import { Product } from "../models/Product.js";
import { ProductOwnership } from "../models/ProductOwnership.js";
import { RMARequest } from "../models/RMARequest.js";
import { SiteSetting } from "../models/SiteSetting.js";
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
import { moveLocalUpload } from "../services/uploadService.js";
import {
  assertSerialAvailable,
  assertValidSerial,
  createRmaId,
  ensureProductUnit,
  resolveProductForOwnership,
  syncUnitOwner,
  warrantyEndFromPurchase,
  warrantyPolicyForClaim,
} from "../services/ownershipService.js";

const lockMinutes = 15;
const maxFailedLogins = 5;
const storefrontStatuses = ["Ready", "Published", "Preview", "Prototype", "Upcoming", "Out of Stock"];

function publicProductFilter(extra = {}) {
  const and = [{ status: { $in: storefrontStatuses } }, { productPageVisible: { $ne: false } }, { $or: [{ visibility: "public" }, { visibility: { $exists: false } }] }];
  if (extra.category) and.push({ $or: [{ category: extra.category }, { categorySlug: extra.category }] });
  if (extra.collection) and.push({ collectionVisible: { $ne: false } }, { $or: [{ collection: extra.collection }, { collectionSlug: extra.collection }] });
  return { $and: and };
}

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

function resolveAccountIdentifier(data) {
  const raw = String(data.identifier || data.email || "").trim();
  const mobile = raw.replace(/\D/g, "");
  if (/^\S+@\S+\.\S+$/.test(raw)) {
    return { query: { email: raw.toLowerCase() }, audit: raw.toLowerCase(), otpTarget: raw.toLowerCase() };
  }
  if (/^[1-9]\d{7,14}$/.test(mobile)) {
    return { query: { phone: mobile }, audit: mobile, otpTarget: mobile };
  }
  throw createHttpError(422, "Enter a valid email address or mobile number.");
}

async function getSignupConflictFields(email, phone) {
  const existingCustomers = await Customer.find({ $or: [{ email }, { phone }] }).select("email phone").lean();
  return existingCustomers.reduce((fields, customer) => {
    if (customer.email === email) fields.email = "This email is already registered.";
    if (customer.phone === phone) fields.phone = "This mobile number is already registered.";
    return fields;
  }, {});
}

function assertSignupIdentityAvailable(fields) {
  const conflictKeys = Object.keys(fields);
  if (!conflictKeys.length) return;
  const message =
    conflictKeys.length > 1
      ? "Email and mobile number are already registered."
      : fields.email || fields.phone || "Account details already exist.";
  throw createHttpError(409, message, { fields });
}

export async function login(req, res) {
  const data = matchedData(req);
  const { password } = data;
  const identifier = resolveAccountIdentifier(data);
  const user = await Customer.findOne(identifier.query).select("+passwordHash +failedLoginCount +lockUntil +refreshTokenHash");
  if (!user) throw createHttpError(401, "Invalid email or password.");
  await assertUnlocked(user);
  if (!user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    await recordFailedLogin(user);
    await writeAuditLog(req, "customer.login.failed", { identifier: identifier.audit });
    throw createHttpError(401, "Invalid email or password.");
  }
  user.failedLoginCount = 0;
  user.lockUntil = undefined;
  await createSession(req, res, user);
  await writeAuditLog(req, "customer.login.success", { identifier: identifier.audit });
  return ok(res, { user: sanitizeUser(user) });
}

export async function signup(req, res) {
  const data = matchedData(req);
  const phone = String(data.phone || "").replace(/\D/g, "");
  assertSignupIdentityAvailable(await getSignupConflictFields(data.email, phone));
  const otp = await issueOtp({ target: phone, purpose: "signup", metadata: { name: data.name, email: data.email }, req });
  await writeAuditLog(req, "customer.signup.requested", { email: data.email, phone });
  return ok(res, {
    verificationId: otp.id,
    channel: "sms",
    expiresInSeconds: otp.expiresInSeconds,
    resendAfterSeconds: otp.resendAfterSeconds,
    message: "OTP sent successfully.",
  }, 202);
}

export async function verifyOtp(req, res) {
  const data = matchedData(req);
  const phone = String(data.phone || "").replace(/\D/g, "");
  await verifyOtpCode({ target: phone, purpose: "signup", otp: data.otp, verificationId: data.verificationId, req });
  assertSignupIdentityAvailable(await getSignupConflictFields(data.email, phone));
  const passwordHash = await hashPassword(data.password);
  const user = await Customer.findOneAndUpdate(
    { email: data.email },
    {
      name: data.name,
      email: data.email,
      phone,
      passwordHash,
      status: "Verified",
      role: "customer",
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
  const data = matchedData(req);
  const { password } = data;
  const identifier = resolveAccountIdentifier(data);
  const user = await Customer.findOne(identifier.query).select("+passwordHash +failedLoginCount +lockUntil");
  if (!user) throw createHttpError(401, "Invalid email or password.");
  await assertUnlocked(user);
  if (!user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    await recordFailedLogin(user);
    await writeAuditLog(req, "customer.login_otp.failed", { identifier: identifier.audit });
    throw createHttpError(401, "Invalid email or password.");
  }
  const otp = await issueOtp({ target: identifier.otpTarget, purpose: "login", metadata: { userId: String(user._id) }, req });
  await writeAuditLog(req, "customer.login_otp.requested", { identifier: identifier.audit });
  return ok(res, {
    otpRequired: true,
    verificationId: otp.id,
    expiresInSeconds: otp.expiresInSeconds,
    resendAfterSeconds: otp.resendAfterSeconds,
    message: "Login OTP sent successfully.",
  }, 202);
}

export async function verifyLoginOtp(req, res) {
  const data = matchedData(req);
  const { otp } = data;
  const identifier = resolveAccountIdentifier(data);
  await verifyOtpCode({ target: identifier.otpTarget, purpose: "login", otp, req });
  const user = await Customer.findOne(identifier.query).select("+refreshTokenHash");
  if (!user) throw createHttpError(404, "Account not found.");
  await createSession(req, res, user);
  await writeAuditLog(req, "customer.login_otp.verified", { identifier: identifier.audit });
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
  const filter = publicProductFilter({ category: _req.query.category, collection: _req.query.collection });
  if (_req.query.featured === "true") filter.featured = true;
  if (_req.query.newLaunch === "true") filter.newLaunch = true;
  if (_req.query.bestseller === "true") filter.bestseller = true;
  if (_req.query.search) filter.$text = { $search: String(_req.query.search) };

  const [items, total, categories] = await Promise.all([
    Product.find(filter).sort({ featured: -1, sortOrder: 1, rating: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
    Category.find({ enabled: { $ne: false } }).sort({ sortOrder: 1, name: 1 }).lean(),
  ]);
  return ok(res, { items: items.map(productDetails), categories, total, page, pages: Math.ceil(total / limit) || 1 });
}

export async function getProduct(req, res) {
  const product = await Product.findOne({
    slug: req.params.slug,
    ...publicProductFilter(),
  }).lean();
  if (!product) throw createHttpError(404, "Product not found.");
  return ok(res, productDetails(product));
}

export async function listCollections(_req, res) {
  return ok(res, { items: await Collection.find({ enabled: { $ne: false } }).sort({ sortOrder: 1, name: 1 }).lean() });
}

export async function listCategories(_req, res) {
  return ok(res, { items: await Category.find({ enabled: { $ne: false } }).sort({ sortOrder: 1, name: 1 }).lean() });
}

export async function listFeaturedProducts(_req, res) {
  let items = await Product.find({ featured: true, ...publicProductFilter() })
    .sort({ sortOrder: 1, rating: -1, createdAt: -1 })
    .limit(12)
    .lean();
  if (!items.length) {
    items = await Product.find(publicProductFilter())
      .sort({ sortOrder: 1, rating: -1, createdAt: -1 })
      .limit(12)
      .lean();
  }
  return ok(res, { items: items.map(productDetails), total: items.length });
}

export async function getHomepageProducts(_req, res) {
  const [sections, heroProducts, featuredProducts, newLaunches, bestsellers, categories, collections] = await Promise.all([
    HomepageSection.find({ enabled: true }).sort({ sortOrder: 1 }).lean(),
    Product.find({ ...publicProductFilter(), heroVisible: true }).sort({ sortOrder: 1, updatedAt: -1 }).limit(6).lean(),
    Product.find({ ...publicProductFilter(), featured: true }).sort({ sortOrder: 1, updatedAt: -1 }).limit(12).lean(),
    Product.find({ ...publicProductFilter(), newLaunch: true }).sort({ sortOrder: 1, updatedAt: -1 }).limit(12).lean(),
    Product.find({ ...publicProductFilter(), bestseller: true }).sort({ sortOrder: 1, updatedAt: -1 }).limit(12).lean(),
    Category.find({ enabled: { $ne: false } }).sort({ sortOrder: 1, name: 1 }).lean(),
    Collection.find({ enabled: { $ne: false }, homepageVisible: true }).sort({ sortOrder: 1, name: 1 }).lean(),
  ]);

  const fallbackHero = heroProducts.length ? heroProducts : featuredProducts.slice(0, 3);
  return ok(res, {
    sections,
    heroProducts: fallbackHero.map(productDetails),
    featuredProducts: featuredProducts.map(productDetails),
    newLaunches: newLaunches.map(productDetails),
    bestsellers: bestsellers.map(productDetails),
    categories,
    collections,
  });
}

export async function getWarrantyPolicy(_req, res) {
  const setting = await SiteSetting.findOne({ key: "warrantyPolicy" }).lean();
  return ok(res, setting?.value || null);
}

export async function getProfile(req, res) {
  return ok(res, { ...sanitizeUser(req.user), address: req.user.address, city: req.user.city || "Bengaluru", state: req.user.state || "Karnataka" });
}

export async function updateProfile(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  const allowed = ["name", "address", "city", "state"];
  const update = {};
  for (const field of allowed) {
    if (data[field] !== undefined && data[field] !== req.user[field]) {
      update[field] = data[field];
      await CustomerChangeLog.create({
        customerId: req.user._id,
        field,
        previousValue: req.user[field],
        nextValue: data[field],
        verified: true,
        actorEmail: req.user.email,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      });
    }
  }
  const customer = await Customer.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
  await writeAuditLog(req, "customer.profile.updated", { fields: Object.keys(update) });
  return ok(res, { ...sanitizeUser(customer), address: customer.address, city: customer.city, state: customer.state });
}

export async function requestProfileContactUpdate(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  if (!data.email && !data.phone) throw createHttpError(422, "Email or mobile number is required.");
  const field = data.email ? "email" : "phone";
  const target = field === "email" ? data.email : String(data.phone).replace(/\D/g, "");
  if (field === "email") {
    const existing = await Customer.findOne({ email: target, _id: { $ne: req.user._id } }).lean();
    if (existing) throw createHttpError(409, "This email is already used by another account.");
  }
  if (field === "phone") {
    const existing = await Customer.findOne({ phone: target, _id: { $ne: req.user._id } }).lean();
    if (existing) throw createHttpError(409, "This mobile number is already used by another account.");
  }
  const otp = await issueOtp({ target, purpose: "email-verification", metadata: { customerId: String(req.user._id), field }, req });
  await writeAuditLog(req, "customer.profile_contact_update.requested", { field, target });
  return ok(res, { verificationId: otp.id, field, target, expiresInSeconds: otp.expiresInSeconds }, 202);
}

export async function verifyProfileContactUpdate(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  if (!data.email && !data.phone) throw createHttpError(422, "Email or mobile number is required.");
  const field = data.email ? "email" : "phone";
  const target = field === "email" ? data.email : String(data.phone).replace(/\D/g, "");
  await verifyOtpCode({ target, purpose: "email-verification", otp: data.otp, verificationId: data.verificationId, req });
  const previousValue = req.user[field];
  const update = field === "email" ? { email: target, emailVerifiedAt: new Date() } : { phone: target, phoneVerifiedAt: new Date() };
  const customer = await Customer.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
  await CustomerChangeLog.create({
    customerId: req.user._id,
    field,
    previousValue,
    nextValue: target,
    verified: true,
    actorEmail: customer.email,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  await writeAuditLog(req, "customer.profile_contact_update.verified", { field });
  return ok(res, { ...sanitizeUser(customer), address: customer.address, city: customer.city, state: customer.state });
}

export async function createLead(req, res) {
  await writeAuditLog(req, "lead.created", { email: req.body.email });
  return ok(res, { id: issueId("LEAD"), status: "received", ...matchedData(req) }, 202);
}

export async function requestLaunchNotification(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  const email = data.email || undefined;
  const phone = data.phone ? String(data.phone).replace(/\D/g, "") : undefined;
  if (!email && !phone) throw createHttpError(422, "Enter an email or mobile number for launch updates.");
  const lead = await LaunchLead.findOneAndUpdate(
    {
      productSlug: data.productSlug,
      ...(email ? { email } : { phone }),
    },
    {
      id: issueId("LAUNCH"),
      product: data.product,
      productSlug: data.productSlug,
      email,
      phone,
      source: data.source || "Product page",
      status: "Subscribed",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await writeAuditLog(req, "launch_notification.requested", { productSlug: data.productSlug, email, phone });
  return ok(res, { id: lead.id, status: lead.status, message: "Launch updates enabled." }, 202);
}

export async function subscribeNewsletter(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  const subscriber = await NewsletterSubscriber.findOneAndUpdate(
    { email: data.email },
    {
      email: data.email,
      status: "Subscribed",
      source: data.source || "Footer",
      subscribedAt: new Date(),
      unsubscribedAt: undefined,
      userAgent: req.get("user-agent"),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await writeAuditLog(req, "newsletter.subscribed", { email: data.email });
  return ok(res, { id: String(subscriber._id), status: subscriber.status, email: subscriber.email }, 202);
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
  const filter = {
    ...(req.user?._id ? { customerId: req.user._id } : { email: req.user?.email }),
    otpVerifiedAt: { $exists: true },
  };
  const [items, rmas] = await Promise.all([
    ProductOwnership.find(filter).sort({ updatedAt: -1 }).lean(),
    RMARequest.find(req.user?._id ? { customerId: req.user._id } : { email: req.user?.email }).sort({ updatedAt: -1 }).lean(),
  ]);
  return ok(res, { items, rmas });
}

export async function createWarrantyClaim(req, res) {
  const data = matchedData(req);
  if (!data.policyAccepted) {
    throw createHttpError(422, "Please acknowledge the INFIBOLT warranty policy before registration.", {
      fields: { policyAccepted: "Warranty policy acknowledgement is required." },
    });
  }
  const serial = assertValidSerial(data.serial);
  const source = data.source || "Marketplace";
  const productInfo = await resolveProductForOwnership({ product: data.product, productSlug: data.productSlug });
  await assertSerialAvailable(serial, req.user?._id, productInfo.productSlug);
  const { start, end } = warrantyEndFromPurchase(data.purchaseDate);
  const otpTarget = req.user?.phone || req.user?.email || data.email;
  const draft = {
    customerId: String(req.user?._id || ""),
    customerName: data.customer || req.user?.name,
    email: data.email || req.user?.email,
    phone: req.user?.phone,
    ...productInfo,
    serial,
    source,
    sourceDetail: data.sourceDetail || data.storeName,
    invoiceNumber: data.invoiceNumber,
    invoiceUrl: data.invoiceUrl,
    purchaseDate: data.purchaseDate || start,
    warrantyStart: start,
    warrantyUntil: end,
  };
  const otp = await issueOtp({ target: otpTarget, purpose: "warranty", metadata: { draft }, req });
  await writeAuditLog(req, "ownership.registration.otp_requested", { serial, source });
  return ok(res, {
    id: otp.id,
    verificationId: otp.id,
    ...draft,
    otpTarget,
    otpRequired: true,
    expiresInSeconds: otp.expiresInSeconds,
    resendAfterSeconds: otp.resendAfterSeconds,
    message: "Warranty OTP sent successfully.",
  }, 202);
}

export async function verifyWarrantyOtp(req, res) {
  const { id, otp } = matchedData(req);
  const otpTarget = req.user?.phone || req.user?.email;
  const record = await verifyOtpCode({ target: otpTarget, purpose: "warranty", otp, verificationId: id, req });
  const draft = record.metadata?.draft;
  if (!draft?.serial || !draft?.product) throw createHttpError(422, "Warranty registration details expired. Please start again.");
  const serial = assertValidSerial(draft.serial);
  const productInfo = await resolveProductForOwnership({ product: draft.product, productSlug: draft.productSlug });
  await assertSerialAvailable(serial, req.user?._id, productInfo.productSlug);
  await ensureProductUnit({ serial, ...productInfo, customer: req.user, source: draft.source });
  const invoiceUrl = draft.invoiceUrl?.startsWith("/uploads/temp/")
    ? await moveLocalUpload(draft.invoiceUrl, "warranty")
    : draft.invoiceUrl;
  const ownership = await ProductOwnership.create({
    id: issueId("OWN"),
    customerId: req.user?._id,
    customerName: draft.customerName || req.user?.name,
    email: draft.email || req.user?.email,
    phone: draft.phone || req.user?.phone,
    ...productInfo,
    serial,
    source: draft.source,
    sourceDetail: draft.sourceDetail,
    invoiceNumber: draft.invoiceNumber,
    invoiceUrl,
    purchaseDate: draft.purchaseDate,
    registeredAt: new Date(),
    otpVerifiedAt: new Date(),
    warrantyStart: draft.warrantyStart,
    warrantyUntil: draft.warrantyUntil,
    status: "Pending Verification",
    warrantyStatus: "Pending Verification",
    timeline: [{ status: "Pending Verification", note: "Mobile OTP verified. Waiting for admin invoice review.", actorEmail: draft.email || req.user?.email }],
  });
  await ownership.save();
  await writeAuditLog(req, "ownership.otp.verified", { ownershipId: ownership.id, serial: ownership.serial });
  return ok(res, ownership);
}

export async function lookupWarranty(req, res) {
  const serial = assertValidSerial(req.params.serial);
  const productSlug = String(req.query.productSlug || "").trim().toLowerCase();
  const ownerFilter = req.user?._id ? { customerId: req.user._id } : { email: req.user?.email };
  const matches = await ProductOwnership.find({
    ...ownerFilter,
    serial,
    ...(productSlug ? { productSlug } : {}),
  })
    .limit(2)
    .lean();
  if (matches.length > 1) {
    throw createHttpError(409, "Select a product to look up this serial number.", {
      fields: { productSlug: "This serial exists for more than one registered product." },
    });
  }
  const ownership = matches[0];
  if (!ownership) throw createHttpError(404, "Warranty record not found.");
  return ok(res, ownership);
}

export async function createWarrantyRma(req, res) {
  const data = matchedData(req);
  if (!data.policyAccepted) {
    throw createHttpError(422, "Please acknowledge the INFIBOLT warranty policy before submitting a claim.", {
      fields: { policyAccepted: "Warranty policy acknowledgement is required." },
    });
  }
  const ownership = await ProductOwnership.findOne({ id: data.ownershipId, customerId: req.user._id });
  if (!ownership) throw createHttpError(404, "Registered product not found.");
  if (!["Active", "Claim Under Review", "Replacement Approved", "Repaired", "Replaced"].includes(ownership.warrantyStatus)) {
    throw createHttpError(422, "Warranty must be active before a claim can be opened.");
  }
  const existingRma = await RMARequest.findOne({ ownershipId: ownership.id, status: { $nin: ["Closed", "Rejected"] } }).lean();
  if (existingRma) {
    throw createHttpError(409, "A warranty claim is already active for this product.", {
      fields: { ownershipId: `${existingRma.id} is already ${existingRma.status}.` },
    });
  }
  const policyDecision = warrantyPolicyForClaim(ownership, data.issueType);
  const rma = await RMARequest.create({
    id: await createRmaId(),
    ownershipId: ownership.id,
    customerId: req.user._id,
    customerName: req.user.name,
    email: req.user.email,
    product: ownership.product,
    serial: ownership.serial,
    issueType: data.issueType,
    issueDescription: data.issueDescription,
    attachments: data.attachments || [],
    policyDecision,
    timeline: [{ status: "Requested", note: policyDecision, actorEmail: req.user.email }],
  });
  ownership.warrantyStatus = "Claim Under Review";
  ownership.timeline.push({ status: "Claim Under Review", note: `${rma.id} created`, actorEmail: req.user.email });
  await ownership.save();
  await writeAuditLog(req, "warranty.rma.created", { rmaId: rma.id, ownershipId: ownership.id });
  return ok(res, rma, 202);
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
