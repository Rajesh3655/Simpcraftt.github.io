import { matchedData } from "express-validator";
import { writeAuditLog } from "../middleware/audit.js";
import { env } from "../config/env.js";
import { AdminLoginLog } from "../models/AdminLoginLog.js";
import { AdminUser } from "../models/AdminUser.js";
import { Category } from "../models/Category.js";
import { Collection } from "../models/Collection.js";
import { Customer } from "../models/Customer.js";
import { FeatureToggle } from "../models/FeatureToggle.js";
import { HomepageSection } from "../models/HomepageSection.js";
import { LaunchLead } from "../models/LaunchLead.js";
import { Manual } from "../models/Manual.js";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber.js";
import { Product } from "../models/Product.js";
import { ProductOwnership } from "../models/ProductOwnership.js";
import { ProductUnit } from "../models/ProductUnit.js";
import { RMARequest } from "../models/RMARequest.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { SupportTicket } from "../models/SupportTicket.js";
import { WarrantyClaim } from "../models/WarrantyClaim.js";
import { AuditLog } from "../models/AuditLog.js";
import { OTPRecord } from "../models/OTPRecord.js";
import { hashToken } from "../utils/crypto.js";
import { clearAuthCookies, refreshCookieCandidates, verifyRefreshToken } from "../utils/cookies.js";
import { createHttpError } from "../utils/httpError.js";
import { ok, sanitizeAdminUser, sanitizeUser } from "../utils/response.js";
import { createSession, revokeUserSessions, rotateRefreshSession } from "../services/sessionService.js";
import { issueOtp, verifyOtpCode } from "../services/otpService.js";
import { getContactSettings, saveContactSettings } from "../services/siteSettingsService.js";
import { verifyGoogleCredential } from "../services/googleAuthService.js";
import { sendSecurityNotification, sendStatusEmail } from "../services/emailService.js";
import { assertSerialAvailable, assertValidSerial, ensureProductUnit, resolveProductForOwnership, syncUnitOwner, warrantyEndFromPurchase } from "../services/ownershipService.js";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function csvEscape(value) {
  const normalized = value === undefined || value === null ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function sendCsv(res, filename, rows) {
  const body = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.status(200).send(body);
}

async function sendCareDecisionEmail({ email, title, status, product, serial, note, req }) {
  if (!email) return;
  try {
    await sendStatusEmail({
      email,
      title,
      status,
      product,
      serial,
      note,
      url: `${env.frontendOrigin.replace(/\/$/, "")}/warranty`,
      req,
    });
  } catch (error) {
    console.warn("[care-email] failed", error.message);
    await writeAuditLog(req, "care.email.failed", { email, status, reason: error.message || "email_failed" });
  }
}

function queueCareDecisionEmail(payload) {
  setImmediate(() => {
    sendCareDecisionEmail(payload).catch((error) => {
      console.warn("[care-email] queue failed", error.message);
    });
  });
}

function rmaEmailPayloadForStatus(rma, status, data = {}, req) {
  const allowedStatuses = ["Waiting for Customer Shipment", "Rejected", "Product Received", "Final Approved", "Replacement Approved", "Rejected After Inspection", "Replacement Dispatched", "Return Dispatched"];
  if (!allowedStatuses.includes(status)) return null;
  const noteByStatus = {
    "Waiting for Customer Shipment": data.notes || "Your claim is approved. Return-shipment instructions are available in your warranty workflow.",
    Rejected: data.rejectionReason || data.notes || rma.rejectionReason || "Your claim was rejected after review.",
    "Product Received": data.notes || "Product received at INFIBOLT service center.",
    "Final Approved": data.notes || "Final inspection approved.",
    "Replacement Approved": data.notes || "Replacement approved after inspection.",
    "Rejected After Inspection": data.rejectionReason || data.notes || rma.rejectionReason || "Rejected after technical inspection.",
    "Replacement Dispatched": shipmentEmailNote("Replacement", rma.replacementShipment, data.deliveryNotes || data.notes),
    "Return Dispatched": shipmentEmailNote("Return", rma.returnToCustomerShipment, data.deliveryNotes || data.notes),
  };
  return {
    email: rma.email,
    title: emailTitleForRmaStatus(status),
    status,
    product: rma.product,
    serial: rma.serial,
    note: noteByStatus[status],
    req,
  };
}

function shipmentEmailNote(label, shipment = {}, note = "") {
  const parts = [
    shipment?.courierName ? `${label} courier: ${shipment.courierName}` : "",
    shipment?.trackingId ? `Tracking ID: ${shipment.trackingId}` : "",
    shipment?.estimatedDelivery ? `Estimated delivery: ${new Date(shipment.estimatedDelivery).toLocaleDateString("en-IN")}` : "",
    note,
  ].filter(Boolean);
  return parts.join(". ");
}

function isWhitelistedAdmin(email) {
  return env.adminWhitelist.includes(String(email || "").toLowerCase());
}

function logAdminWhitelistCheck(email) {
  if (env.isProduction) return;
  console.info(`[admin-google-login] email=${email || "unknown"} whitelisted=${isWhitelistedAdmin(email)} whitelist=${env.adminWhitelist.join(",") || "(empty)"}`);
}

async function writeAdminLoginLog(req, { email, status, reason }) {
  try {
    await AdminLoginLog.create({
      email: email || "unknown",
      status,
      reason,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      requestId: req.id,
      loggedInAt: new Date(),
    });
  } catch (error) {
    console.warn("[admin-login-log] failed", error.message);
  }
}

async function resolveVerifiedGoogleAdmin(req, googleProfile) {
  const email = googleProfile.email;
  logAdminWhitelistCheck(email);
  if (!isWhitelistedAdmin(email)) {
    await writeAdminLoginLog(req, { email, status: "failure", reason: "not_whitelisted" });
    await writeAuditLog(req, "admin.google_login.denied", { email, reason: "not_whitelisted" });
    await sendSecurityNotification({
      email: env.adminEmail,
      title: "Suspicious admin login blocked",
      message: "A Google account that is not whitelisted attempted to access the INFIBOLT Control Center.",
      details: [
        { label: "Attempted email", value: email },
        { label: "IP address", value: req.ip },
        { label: "Device", value: req.get("user-agent") },
      ],
      url: env.adminOrigin,
      req,
    });
    throw createHttpError(403, `This Google account is not authorized for admin access: ${email}`);
  }

  let user = await AdminUser.findOne({ email }).select("+refreshTokenHash +googleSub +failedLoginCount +lockUntil");
  if (!user) {
    user = await AdminUser.create({
      email,
      name: googleProfile.name,
      role: "admin",
      status: "Verified",
      googleSub: googleProfile.sub,
      avatarUrl: googleProfile.picture,
    });
  }
  if (user.status === "Locked") {
    await writeAdminLoginLog(req, { email, status: "failure", reason: "account_locked" });
    throw createHttpError(423, "Admin account is blocked.");
  }
  if (user.lockUntil && user.lockUntil > new Date()) {
    await writeAdminLoginLog(req, { email, status: "failure", reason: "temporary_lock" });
    throw createHttpError(423, "Admin account temporarily locked.");
  }

  let changed = false;
  if (!user.googleSub) {
    user.googleSub = googleProfile.sub;
    changed = true;
  } else if (user.googleSub !== googleProfile.sub) {
    await writeAdminLoginLog(req, { email, status: "failure", reason: "google_sub_mismatch" });
    await writeAuditLog(req, "admin.google_login.denied", { email, reason: "google_sub_mismatch" });
    throw createHttpError(403, "This Google account is not linked to the admin user.");
  }
  if (googleProfile.name && user.name !== googleProfile.name) {
    user.name = googleProfile.name;
    changed = true;
  }
  if (googleProfile.picture && user.avatarUrl !== googleProfile.picture) {
    user.avatarUrl = googleProfile.picture;
    changed = true;
  }
  user.failedLoginCount = 0;
  user.lockUntil = undefined;
  if (changed) await user.save();
  return user;
}

export async function adminGoogleLogin(req, res) {
  const { credential } = matchedData(req);
  let email = "unknown";
  try {
    const googleProfile = await verifyGoogleCredential(credential);
    email = googleProfile.email;
    const user = await resolveVerifiedGoogleAdmin(req, googleProfile);
    const otp = await issueOtp({
      email,
      purpose: "admin-login",
      ttlMinutes: 5,
      metadata: {
        adminUserId: String(user._id),
        googleSub: googleProfile.sub,
        phase: "admin_mfa",
      },
      req,
    });
    await writeAdminLoginLog(req, { email, status: "success", reason: "google_verified_otp_sent" });
    await writeAuditLog(req, "admin.google_login.success", { email, mfa: "otp_sent" });
    return ok(
      res,
      {
        mfaRequired: true,
        email,
        verificationId: otp.id,
        expiresInSeconds: otp.expiresInSeconds,
        resendAfterSeconds: otp.resendAfterSeconds,
        deliveryStatus: otp.deliveryStatus,
      },
      202
    );
  } catch (error) {
    if (![403, 423].includes(error.statusCode)) {
      await writeAdminLoginLog(req, { email, status: "failure", reason: error.message || "google_verification_failed" });
      await writeAuditLog(req, "admin.google_login.failed", { email, reason: error.message || "google_verification_failed" });
    }
    throw error;
  }
}

export async function adminVerifyOtp(req, res) {
  const { email, otp, verificationId } = matchedData(req);
  const normalizedEmail = String(email || "").toLowerCase();
  try {
    const otpRecord = await verifyOtpCode({
      email: normalizedEmail,
      purpose: "admin-login",
      otp,
      verificationId,
      req,
    });
    const adminUserId = otpRecord.metadata?.adminUserId;
    const user = adminUserId
      ? await AdminUser.findOne({ _id: adminUserId, email: normalizedEmail }).select("+refreshTokenHash +googleSub")
      : await AdminUser.findOne({ email: normalizedEmail }).select("+refreshTokenHash +googleSub");
    if (!user || user.status === "Locked") throw createHttpError(401, "Admin session could not be created.");

    await OTPRecord.deleteMany({ email: normalizedEmail, purpose: "admin-login" });
    await createSession(req, res, user);
    await writeAdminLoginLog(req, { email: normalizedEmail, status: "success", reason: "otp_verified" });
    await writeAuditLog(req, "admin.otp_login.success", { email: normalizedEmail });
    await sendSecurityNotification({
      email: normalizedEmail,
      title: "Admin login confirmed",
      message: "A new INFIBOLT Control Center session was created after MFA verification.",
      details: [
        { label: "IP address", value: req.ip },
        { label: "Device", value: req.get("user-agent") },
      ],
      url: env.adminOrigin,
      req,
    });
    return ok(res, { user: sanitizeAdminUser(user) });
  } catch (error) {
    await writeAdminLoginLog(req, { email: normalizedEmail, status: "failure", reason: `otp_${error.message || "failed"}` });
    await writeAuditLog(req, "admin.otp_login.failed", { email: normalizedEmail, reason: error.message || "otp_failed" });
    throw error;
  }
}

export async function adminResendOtp(req, res) {
  const { email, verificationId } = matchedData(req);
  const normalizedEmail = String(email || "").toLowerCase();
  const previous = await OTPRecord.findOne({
    _id: verificationId,
    email: normalizedEmail,
    purpose: "admin-login",
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).lean();
  if (!previous) throw createHttpError(422, "OTP challenge has expired. Sign in with Google again.");
  const otp = await issueOtp({
    email: normalizedEmail,
    purpose: "admin-login",
    ttlMinutes: 5,
    metadata: previous.metadata || {},
    req,
  });
  await writeAuditLog(req, "admin.otp_login.resent", { email: normalizedEmail });
  return ok(res, {
    mfaRequired: true,
    email: normalizedEmail,
    verificationId: otp.id,
    expiresInSeconds: otp.expiresInSeconds,
    resendAfterSeconds: otp.resendAfterSeconds,
    deliveryStatus: otp.deliveryStatus,
  });
}

export async function adminRefresh(req, res) {
  const refreshToken = refreshCookieCandidates("admin").map((name) => req.signedCookies?.[name]).find(Boolean);
  if (!refreshToken) throw createHttpError(401, "Refresh token missing.");
  const payload = verifyRefreshToken(refreshToken, "infibolt-admin-refresh");
  if (payload.role !== "admin") throw createHttpError(403, "Invalid session role.");
  const user = await AdminUser.findById(payload.sub).select("+refreshTokenHash");
  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) throw createHttpError(401, "Refresh token has been invalidated.");
  if (!isWhitelistedAdmin(user.email)) {
    await revokeUserSessions(user);
    clearAuthCookies(res, "admin");
    throw createHttpError(401, "Admin access has been revoked.");
  }
  await rotateRefreshSession(req, res, user, refreshToken);
  return ok(res, { user: sanitizeAdminUser(user) });
}

export async function adminLogout(req, res) {
  const user = req.user && (await AdminUser.findById(req.user._id).select("+refreshTokenHash"));
  if (user) {
    await revokeUserSessions(user);
    await writeAuditLog(req, "admin.logout");
  }
  clearAuthCookies(res, user?.role || "admin");
  return ok(res, { loggedOut: true });
}

export async function adminMe(req, res) {
  return ok(res, { user: sanitizeAdminUser(req.user) });
}

export async function overview(_req, res) {
  const verifiedOwnershipFilter = { otpVerifiedAt: { $exists: true } };
  const [products, warrantyClaims, ownerships, rmas, supportTickets] = await Promise.all([
    Product.find().lean(),
    WarrantyClaim.find().lean(),
    ProductOwnership.find(verifiedOwnershipFilter).lean(),
    RMARequest.find().lean(),
    SupportTicket.find().lean(),
  ]);
  return ok(res, {
    stats: [
      { label: "Products", value: products.length, trend: "Local catalogue", status: "live" },
      { label: "Registered Devices", value: ownerships.length, trend: "Ownership records", status: "live" },
      { label: "Warranty Claims", value: rmas.length + warrantyClaims.length, trend: "RMA queue", status: "attention" },
      { label: "Complaints", value: supportTickets.length, trend: "Support queue", status: "attention" },
    ],
    products,
    warrantyClaims: ownerships,
    rmas,
    supportTickets,
  });
}

export async function listAdminProducts(_req, res) {
  const page = Math.max(Number(_req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(_req.query.limit || 50), 1), 500);
  const filter = {};
  if (_req.query.category) filter.category = _req.query.category;
  if (_req.query.status) filter.status = _req.query.status;
  if (_req.query.featured === "true") filter.featured = true;
  if (_req.query.newLaunch === "true") filter.newLaunch = true;
  if (_req.query.homepageVisible === "true") filter.homepageVisible = true;
  if (_req.query.search) filter.$text = { $search: String(_req.query.search) };
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ sortOrder: 1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);
  return ok(res, { items, total, page, pages: Math.ceil(total / limit) || 1 });
}

export async function createProduct(req, res) {
  const data = matchedData(req, { locations: ["body"], includeOptionals: true });
  const slug = data.slug;
  applyProductPublicationDefaults(data);
  let product;
  try {
    product = await Product.create({ ...data, slug });
  } catch (error) {
    if (error?.code === 11000) {
      throw createHttpError(409, `A product with slug "${slug}" already exists. Use a different product name or slug.`);
    }
    throw error;
  }
  await writeAuditLog(req, "admin.product.created", { slug });
  return ok(res, product, 201);
}

export async function createWebsitePurchaseOwnership(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  const serial = assertValidSerial(data.serial);
  const customer = await Customer.findOne({ email: data.email });
  if (!customer) throw createHttpError(404, "Customer account not found for website purchase ownership.");
  const productInfo = await resolveProductForOwnership({ product: data.product, productSlug: data.productSlug });
  await assertSerialAvailable(serial, customer._id, productInfo.productSlug);
  await ensureProductUnit({ serial, ...productInfo, customer, source: "Website" });
  const { start, end } = warrantyEndFromPurchase(data.purchaseDate);
  const ownership = await ProductOwnership.create({
    id: `OWN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    customerId: customer._id,
    customerName: customer.name,
    email: customer.email,
    phone: customer.phone,
    ...productInfo,
    serial,
    source: "Website",
    sourceDetail: "infibolt.com",
    invoiceNumber: data.invoiceNumber,
    invoiceUrl: data.invoiceUrl,
    purchaseDate: data.purchaseDate || start,
    registeredAt: new Date(),
    otpVerifiedAt: new Date(),
    verifiedAt: new Date(),
    warrantyStart: start,
    warrantyUntil: end,
    status: "Active",
    warrantyStatus: "Active",
    timeline: [{ status: "Active", note: "Website purchase automatically linked and activated.", actorEmail: req.user.email }],
  });
  await syncUnitOwner({ serial, ownership });
  await writeAuditLog(req, "admin.website_ownership.created", { ownershipId: ownership.id, serial, email: customer.email });
  return ok(res, ownership, 201);
}

export async function updateProduct(req, res) {
  const data = matchedData(req, { locations: ["body"], includeOptionals: true });
  if (data.name && !data.slug) data.slug = req.params.slug;
  applyProductPublicationDefaults(data);
  const product = await Product.findOneAndUpdate({ slug: req.params.slug }, data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!product) throw createHttpError(404, "Product not found.");
  await writeAuditLog(req, "admin.product.updated", { slug: req.params.slug });
  return ok(res, product);
}

function applyProductPublicationDefaults(data) {
  const storefrontVisibleStatuses = ["Preview", "Ready", "Published", "Prototype", "Upcoming", "Out of Stock"];
  if (!data.status) return data;
  if (storefrontVisibleStatuses.includes(data.status)) {
    data.productPageVisible = true;
    data.visibility = "public";
  }
  if (["Draft", "Hidden", "Archived", "Discontinued"].includes(data.status)) {
    data.productPageVisible = false;
    data.visibility = "private";
  }
  return data;
}

export async function deleteProduct(req, res) {
  const product = await Product.findOneAndUpdate(
    { slug: req.params.slug },
    { status: "Archived", visibility: "private", productPageVisible: false, homepageVisible: false, heroVisible: false, featured: false },
    { returnDocument: "after", runValidators: true }
  );
  if (!product) throw createHttpError(404, "Product not found.");
  await writeAuditLog(req, "admin.product.deleted", { slug: req.params.slug });
  return ok(res, { deleted: true, archived: true, product });
}

export async function reorderProducts(req, res) {
  const { items = [] } = matchedData(req, { locations: ["body"] });
  await Promise.all(
    items.map((item, index) =>
      Product.findOneAndUpdate({ slug: item.slug }, { sortOrder: Number.isFinite(item.sortOrder) ? item.sortOrder : index }, { runValidators: true })
    )
  );
  await writeAuditLog(req, "admin.products.reordered", { count: items.length });
  return ok(res, { reordered: true, count: items.length });
}

export async function listUsers(_req, res) {
  const items = await Customer.find().sort({ createdAt: -1 }).lean();
  return ok(res, { items });
}

export async function listOtpAuditLogs(_req, res) {
  const [records, events] = await Promise.all([
    OTPRecord.find()
      .select("email purpose +attempts verified resendCount consumedAt expiresAt deliveredAt deliveryStatus provider ip createdAt updatedAt metadata")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean(),
    AuditLog.find({ event: /^otp\./ }).sort({ createdAt: -1 }).limit(200).lean(),
  ]);
  return ok(res, { records, events });
}

export async function resendActivationEmail(req, res) {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw createHttpError(404, "Customer not found.");
  if (customer.status === "Locked") throw createHttpError(423, "This account is disabled.");
  const otp = await issueOtp({
    email: customer.email,
    purpose: customer.emailVerifiedAt ? "login" : "email-verification",
    metadata: { customerId: String(customer._id), source: "admin-resend-activation" },
    req,
  });
  await writeAuditLog(req, "admin.customer_activation_email.resent", { customerId: String(customer._id), email: customer.email });
  return ok(res, { sent: true, email: customer.email, verificationId: otp.id, resendAfterSeconds: otp.resendAfterSeconds }, 202);
}

export async function updateCustomerSecurityStatus(req, res) {
  const { status } = matchedData(req, { locations: ["body"] });
  const customer = await Customer.findById(req.params.id).select("+refreshTokenHash");
  if (!customer) throw createHttpError(404, "Customer not found.");
  customer.status = status;
  if (status === "Locked") await revokeUserSessions(customer);
  else await customer.save();
  await writeAuditLog(req, "admin.customer_security_status.updated", { customerId: String(customer._id), email: customer.email, status });
  return ok(res, sanitizeUser(customer));
}

export async function listNewsletterSubscribers(_req, res) {
  const items = await NewsletterSubscriber.find().sort({ updatedAt: -1 }).lean();
  return ok(res, { items });
}

export async function listLaunchLeads(_req, res) {
  const items = await LaunchLead.find().sort({ updatedAt: -1 }).lean();
  return ok(res, { items });
}

export async function listAuditLogs(_req, res) {
  const items = await AuditLog.find().sort({ createdAt: -1 }).limit(200).lean();
  return ok(res, { items });
}

export async function exportUsers(req, res) {
  const type = req.query.type || "users";
  const header = ["name", "email", "phone", "status", "products", "tickets", "createdAt"];
  let rows = [];
  let filename = "infibolt-users.csv";
  if (type === "newsletter") {
    const subscribers = await NewsletterSubscriber.find().sort({ updatedAt: -1 }).lean();
    filename = "infibolt-newsletter-subscribers.csv";
    rows = [["email", "status", "source", "subscribedAt"], ...subscribers.map((item) => [item.email, item.status, item.source, item.subscribedAt])];
  } else if (type === "warranty") {
    const ownerships = await ProductOwnership.find({ otpVerifiedAt: { $exists: true } }).sort({ updatedAt: -1 }).lean();
    filename = "infibolt-warranty-customers.csv";
    rows = [["name", "email", "phone", "product", "serial", "status"], ...ownerships.map((item) => [item.customerName, item.email, item.phone, item.product, item.serial, item.warrantyStatus || item.status])];
  } else if (type === "support") {
    const tickets = await SupportTicket.find().sort({ updatedAt: -1 }).lean();
    filename = "infibolt-support-customers.csv";
    rows = [["customer", "email", "topic", "status", "channel"], ...tickets.map((item) => [item.customer, item.email, item.topic, item.status, item.channel])];
  } else {
    const users = await Customer.find().sort({ createdAt: -1 }).lean();
    rows = [header, ...users.map((item) => [item.name, item.email, item.phone, item.status, item.products, item.tickets, item.createdAt])];
  }
  await writeAuditLog(req, "admin.users.exported", { type });
  return sendCsv(res, filename, rows);
}

export async function listWarrantyClaimsAdmin(_req, res) {
  const [items, rmas, units] = await Promise.all([
    ProductOwnership.find({ otpVerifiedAt: { $exists: true } }).sort({ updatedAt: -1 }).lean(),
    RMARequest.find().sort({ updatedAt: -1 }).lean(),
    ProductUnit.find().sort({ updatedAt: -1 }).limit(200).lean(),
  ]);
  return ok(res, { items, rmas: await enrichRmasWithCustomerContact(rmas), units });
}

async function enrichRmasWithCustomerContact(rmas = []) {
  const customerIds = rmas.map((rma) => rma.customerId).filter(Boolean);
  const ownershipIds = rmas.map((rma) => rma.ownershipId).filter(Boolean);
  const emails = rmas.map((rma) => rma.email).filter(Boolean);
  const [customers, ownerships] = await Promise.all([
    Customer.find({ $or: [{ _id: { $in: customerIds } }, { email: { $in: emails } }] }).select("_id email phone").lean(),
    ProductOwnership.find({ $or: [{ id: { $in: ownershipIds } }, { email: { $in: emails } }] }).select("id email phone").lean(),
  ]);
  const customerById = new Map(customers.map((customer) => [String(customer._id), customer]));
  const customerByEmail = new Map(customers.map((customer) => [customer.email, customer]));
  const ownershipById = new Map(ownerships.map((ownership) => [ownership.id, ownership]));
  const ownershipByEmail = new Map(ownerships.map((ownership) => [ownership.email, ownership]));

  return rmas.map((rma) => {
    const customer = customerById.get(String(rma.customerId || "")) || customerByEmail.get(rma.email) || {};
    const ownership = ownershipById.get(rma.ownershipId) || ownershipByEmail.get(rma.email) || {};
    const customerPhone = rma.customerAddress?.phone || customer.phone || ownership.phone || "";
    return { ...rma, customerPhone };
  });
}

export async function listSupportTicketsAdmin(_req, res) {
  return ok(res, { items: await SupportTicket.find().sort({ updatedAt: -1 }).lean() });
}

export async function markSupportTicketRead(req, res) {
  const ticket = await SupportTicket.findOneAndUpdate(
    { id: req.params.id },
    { status: "Read" },
    { returnDocument: "after", runValidators: true }
  ).lean();
  if (!ticket) throw createHttpError(404, "Support ticket not found.");
  await writeAuditLog(req, "admin.support_ticket.read", { ticketId: req.params.id });
  return ok(res, ticket);
}

export const analytics = overview;

function manualFilterFromQuery(query = {}, admin = false) {
  const filter = {};
  if (!admin) filter.isVisible = true;
  if (query.category) filter.category = String(query.category).trim();
  if (query.featured === "true") filter.featured = true;
  if (admin && query.visibility === "visible") filter.isVisible = true;
  if (admin && query.visibility === "hidden") filter.isVisible = false;
  if (query.search) {
    const search = String(query.search).trim();
    filter.$or = [
      { productName: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  return filter;
}

function manualSortFromQuery(query = {}) {
  if (query.sort === "oldest") return { createdAt: 1 };
  if (query.sort === "name") return { productName: 1, createdAt: -1 };
  return { featured: -1, createdAt: -1 };
}

function manualPayload(data, req, partial = false) {
  const payload = {};
  const assign = (key, value) => {
    if (value !== undefined && value !== null) payload[key] = value;
  };
  assign("productName", data.productName?.trim());
  assign("category", data.category?.trim());
  assign("description", data.description?.trim() || "");
  assign("pdfUrl", data.pdfUrl);
  assign("thumbnail", data.thumbnail || "");
  assign("featured", data.featured);
  assign("isVisible", data.isVisible);
  if (!partial) {
    payload.featured = Boolean(data.featured);
    payload.isVisible = data.isVisible !== false;
    payload.uploadedBy = req.user?.email;
  }
  return payload;
}

export async function listAdminManuals(req, res) {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 40), 1), 120);
  const filter = manualFilterFromQuery(req.query, true);
  const [items, total, categories] = await Promise.all([
    Manual.find(filter).sort(manualSortFromQuery(req.query)).skip((page - 1) * limit).limit(limit).lean(),
    Manual.countDocuments(filter),
    Manual.distinct("category"),
  ]);
  return ok(res, { items, total, page, pages: Math.ceil(total / limit) || 1, categories: categories.filter(Boolean).sort() });
}

export async function getAdminManual(req, res) {
  const manual = await Manual.findById(req.params.id).lean();
  if (!manual) throw createHttpError(404, "Manual not found.");
  return ok(res, manual);
}

export async function createManual(req, res) {
  const data = matchedData(req, { locations: ["body"], includeOptionals: true });
  const existing = await Manual.findOne({ productName: data.productName, pdfUrl: data.pdfUrl }).lean();
  if (existing) throw createHttpError(409, "This manual PDF is already linked to the product.");
  const manual = await Manual.create(manualPayload(data, req));
  await writeAuditLog(req, "admin.manual.created", { manualId: String(manual._id), productName: manual.productName });
  return ok(res, manual, 201);
}

export async function updateManual(req, res) {
  const data = matchedData(req, { locations: ["body"], includeOptionals: true });
  const manual = await Manual.findByIdAndUpdate(req.params.id, manualPayload(data, req, true), {
    returnDocument: "after",
    runValidators: true,
  });
  if (!manual) throw createHttpError(404, "Manual not found.");
  await writeAuditLog(req, "admin.manual.updated", { manualId: req.params.id, productName: manual.productName });
  return ok(res, manual);
}

export async function deleteManual(req, res) {
  const manual = await Manual.findByIdAndDelete(req.params.id);
  if (!manual) throw createHttpError(404, "Manual not found.");
  await writeAuditLog(req, "admin.manual.deleted", { manualId: req.params.id, productName: manual.productName });
  return ok(res, { deleted: true, manual });
}

export async function settings(_req, res) {
  const [featureToggles, contactSettings] = await Promise.all([
    FeatureToggle.find().lean(),
    getContactSettings(),
  ]);
  return ok(res, { featureToggles, contactSettings });
}

export async function updateContactSettings(req, res) {
  const data = matchedData(req, { locations: ["body"], includeOptionals: true });
  const value = await saveContactSettings(data);
  await writeAuditLog(req, "admin.contact_settings.updated", {
    fields: Object.keys(data).filter((key) => data[key] !== undefined),
  });
  return ok(res, value);
}

export async function getWarrantyPolicyAdmin(_req, res) {
  const setting = await SiteSetting.findOne({ key: "warrantyPolicy" }).lean();
  return ok(res, setting?.value || null);
}

export async function updateWarrantyPolicy(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  const existing = await SiteSetting.findOne({ key: "warrantyPolicy" }).lean();
  const existingValue = existing?.value || {};
  const value = {
    ...existingValue,
    title: data.title || existingValue.title || "INFIBOLT Warranty Policy",
    url: data.url || existingValue.url,
    filename: data.filename || existingValue.filename,
    originalName: data.originalName || existingValue.originalName,
    uploadedAt: data.url ? new Date() : existingValue.uploadedAt,
    uploadedBy: req.user.email,
    returnAddress: {
      ...(existingValue.returnAddress || {}),
      ...(data.returnAddress || {}),
    },
  };
  const setting = await SiteSetting.findOneAndUpdate(
    { key: "warrantyPolicy" },
    { key: "warrantyPolicy", value },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  await writeAuditLog(req, "admin.warranty_policy.updated", { url: value.url, returnAddressUpdated: Boolean(data.returnAddress) });
  return ok(res, setting.value);
}

export async function listCategoriesAdmin(_req, res) {
  return ok(res, { items: await Category.find().sort({ sortOrder: 1, name: 1 }).lean() });
}

export async function createCategory(req, res) {
  const data = matchedData(req, { locations: ["body"], includeOptionals: true });
  const slug = slugify(data.slug || data.id || data.name);
  const existing = await Category.findOne({ $or: [{ id: slug }, { slug }] }).lean();
  if (existing) throw createHttpError(409, `Category "${data.name}" already exists. Use a different category name or slug.`);
  const category = await Category.create(categoryPayload(data, slug));
  await writeAuditLog(req, "admin.category.created", { id: category.id });
  return ok(res, category, 201);
}

export async function updateCategory(req, res) {
  const data = matchedData(req, { locations: ["body"], includeOptionals: true });
  const nextSlug = data.slug || data.id ? slugify(data.slug || data.id) : "";
  if (nextSlug && nextSlug !== req.params.id) {
    const existing = await Category.findOne({ $or: [{ id: nextSlug }, { slug: nextSlug }] }).lean();
    if (existing) throw createHttpError(409, `Category slug "${nextSlug}" is already used.`);
  }
  const category = await Category.findOneAndUpdate(
    { $or: [{ id: req.params.id }, { slug: req.params.id }] },
    categoryPayload(data, nextSlug || undefined, true),
    { returnDocument: "after", runValidators: true }
  );
  if (!category) throw createHttpError(404, "Category not found.");
  await writeAuditLog(req, "admin.category.updated", { id: category.id });
  return ok(res, category);
}

function categoryPayload(data, slug, partial = false) {
  const payload = {};
  const assign = (key, value) => {
    if (value !== undefined && value !== null) payload[key] = value;
  };
  const has = (key) => Object.prototype.hasOwnProperty.call(data, key);

  if (slug) {
    payload.id = slug;
    payload.slug = slug;
  }
  if (has("name")) assign("name", data.name?.trim());
  if (has("description")) assign("description", data.description?.trim() || "");
  if (has("icon")) assign("icon", data.icon?.trim() || "");
  if (has("image")) assign("image", data.image);
  if (has("heroBanner")) assign("heroBanner", data.heroBanner);
  if (has("enabled")) assign("enabled", data.enabled);
  if (has("featured")) assign("featured", data.featured);
  if (has("desktopMenuVisible")) assign("desktopMenuVisible", data.desktopMenuVisible);
  if (has("sortOrder")) assign("sortOrder", data.sortOrder);
  if (has("featuredProducts")) assign("featuredProducts", data.featuredProducts);

  if (!partial) {
    payload.enabled = data.enabled !== false;
    payload.featured = Boolean(data.featured);
    payload.desktopMenuVisible = Boolean(data.desktopMenuVisible);
    payload.sortOrder = Number(data.sortOrder || 0);
    payload.featuredProducts = Array.isArray(data.featuredProducts) ? data.featuredProducts : [];
  }

  return payload;
}

export async function deleteCategory(req, res) {
  const category = await Category.findOne({ $or: [{ id: req.params.id }, { slug: req.params.id }] });
  if (!category) throw createHttpError(404, "Category not found.");
  const productCount = await Product.countDocuments({
    $or: [
      { category: category.id },
      { category: category.slug },
      { category: category.name },
      { categorySlug: category.id },
      { categorySlug: category.slug },
    ],
  });
  if (productCount > 0) {
    throw createHttpError(409, `Delete products from this category first. ${productCount} product${productCount === 1 ? "" : "s"} still use it.`);
  }
  await category.deleteOne();
  await writeAuditLog(req, "admin.category.deleted", { id: category.id });
  return ok(res, { deleted: true, category });
}

export async function listCollectionsAdmin(_req, res) {
  return ok(res, { items: await Collection.find().sort({ sortOrder: 1, name: 1 }).lean() });
}

export async function createCollection(req, res) {
  const data = matchedData(req, { locations: ["body"], includeOptionals: true });
  const collection = await Collection.create({ ...data, slug: data.slug || slugify(data.name) });
  await writeAuditLog(req, "admin.collection.created", { slug: collection.slug });
  return ok(res, collection, 201);
}

export async function updateCollection(req, res) {
  const data = matchedData(req, { locations: ["body"], includeOptionals: true });
  const collection = await Collection.findOneAndUpdate({ slug: req.params.slug }, data, { returnDocument: "after", runValidators: true });
  if (!collection) throw createHttpError(404, "Collection not found.");
  await writeAuditLog(req, "admin.collection.updated", { slug: collection.slug });
  return ok(res, collection);
}

export async function deleteCollection(req, res) {
  const collection = await Collection.findOneAndDelete({ slug: req.params.slug });
  if (!collection) throw createHttpError(404, "Collection not found.");
  await writeAuditLog(req, "admin.collection.deleted", { slug: collection.slug });
  return ok(res, { deleted: true, collection });
}

export async function listHomepageSectionsAdmin(_req, res) {
  return ok(res, { items: await HomepageSection.find().sort({ sortOrder: 1, updatedAt: -1 }).lean() });
}

export async function upsertHomepageSection(req, res) {
  const data = matchedData(req, { locations: ["body"], includeOptionals: true });
  const key = req.params.key || data.key || slugify(data.title);
  const section = await HomepageSection.findOneAndUpdate(
    { key },
    { ...data, key },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
  );
  await writeAuditLog(req, "admin.homepage_section.upserted", { key });
  return ok(res, section, req.params.key ? 200 : 201);
}

export async function deleteHomepageSection(req, res) {
  const section = await HomepageSection.findOneAndDelete({ key: req.params.key });
  if (!section) throw createHttpError(404, "Homepage section not found.");
  await writeAuditLog(req, "admin.homepage_section.deleted", { key: req.params.key });
  return ok(res, { deleted: true, section });
}

export async function updateWarrantyStatus(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  const ownership = await ProductOwnership.findOne({ id: req.params.id });
  if (ownership) {
    const previousStatus = ownership.warrantyStatus;
    if (data.status) {
      ownership.status = ["Active", "Rejected", "Pending Verification"].includes(data.status) ? data.status : ownership.status;
      ownership.warrantyStatus = data.status;
      if (data.status === "Active") {
        ownership.verifiedAt = new Date();
        ownership.rejectedAt = undefined;
        await syncUnitOwner({ serial: ownership.serial, ownership });
      }
      if (data.status === "Rejected") ownership.rejectedAt = new Date();
      if (data.status === "Pending Verification") {
        ownership.verifiedAt = undefined;
        ownership.rejectedAt = undefined;
      }
      ownership.timeline.push({ status: data.status, note: data.notes || "Admin warranty update", actorEmail: req.user.email });
    }
    if (data.notes) ownership.reviewNote = data.notes;
    await ownership.save();
    if (["Active", "Rejected"].includes(data.status) && previousStatus !== data.status) {
      queueCareDecisionEmail({
        email: ownership.email,
        title: data.status === "Active" ? "Your warranty registration is approved" : "Your warranty registration was rejected",
        status: data.status,
        product: ownership.product,
        serial: ownership.serial,
        note: data.notes || ownership.reviewNote,
        req,
      });
    }
    await writeAuditLog(req, "admin.ownership.updated", { ownershipId: req.params.id, status: data.status });
    return ok(res, ownership);
  }

  const rma = await RMARequest.findOne({ id: req.params.id });
  if (rma) {
    const previousStatus = rma.status;
    if (data.status) {
      rma.status = data.status;
      rma.timeline.push({ status: data.status, note: data.notes || "Admin RMA update", actorEmail: req.user.email });
      rma.claimStatus = data.status;
    }
    if (data.notes) {
      rma.notes = data.notes;
      rma.adminNotes = data.notes;
    }
    if (data.rejectionReason) {
      rma.rejectionReason = data.rejectionReason;
      rma.notes = data.rejectionReason;
    }
    if (data.adminNotes) rma.adminNotes = data.adminNotes;
    if (data.inspectionStatus) rma.inspectionStatus = data.inspectionStatus;
    if (data.status === "Approved") {
      rma.status = "Waiting for Customer Shipment";
      rma.claimStatus = "Claim Approved";
      rma.timeline.push({ status: "Waiting for Customer Shipment", note: "Return shipping address shared with customer.", actorEmail: req.user.email });
    }
    if (data.status === "Rejected") {
      rma.claimStatus = "Claim Rejected";
      rma.rejectionReason = data.rejectionReason || data.notes || rma.rejectionReason;
    }
    if (data.status === "Product Received") {
      rma.serviceCenterReceivedAt = rma.serviceCenterReceivedAt || new Date();
      rma.claimStatus = "Product Received at Service Center";
      rma.inspectionStatus = rma.inspectionStatus || "Inspection in Progress";
    }
    if (data.status === "Inspection in Progress") {
      rma.inspectionStatus = "Inspection in Progress";
      rma.claimStatus = "Inspection in Progress";
    }
    if (data.status === "Final Approved" || data.status === "Replacement Approved") {
      rma.claimStatus = "Final Approval";
      rma.inspectionStatus = "Approved";
    }
    if (data.status === "Rejected After Inspection") {
      rma.claimStatus = "Rejected After Inspection";
      rma.inspectionStatus = "Rejected";
      rma.rejectionReason = data.rejectionReason || data.notes || rma.rejectionReason;
    }
    if (data.replacementCourierName || data.replacementTrackingId || data.replacementEstimatedDelivery || data.replacementDispatchedAt) {
      rma.replacementShipment = {
        ...(rma.replacementShipment?.toObject?.() || rma.replacementShipment || {}),
        courierName: data.replacementCourierName || rma.replacementShipment?.courierName,
        trackingId: data.replacementTrackingId || rma.replacementShipment?.trackingId,
        dispatchedAt: data.replacementDispatchedAt || rma.replacementShipment?.dispatchedAt || new Date(),
        estimatedDelivery: data.replacementEstimatedDelivery || rma.replacementShipment?.estimatedDelivery,
      };
      rma.status = data.status || "Replacement Dispatched";
      rma.claimStatus = "Replacement Dispatched";
      rma.deliveryStatus = "Replacement Dispatched";
      rma.timeline.push({ status: "Replacement Dispatched", note: `Replacement shipped via ${rma.replacementShipment.courierName || "courier"}.`, actorEmail: req.user.email });
    }
    if (data.returnCourierName || data.returnTrackingId || data.returnEstimatedDelivery || data.returnDispatchedAt) {
      rma.returnToCustomerShipment = {
        ...(rma.returnToCustomerShipment?.toObject?.() || rma.returnToCustomerShipment || {}),
        courierName: data.returnCourierName || rma.returnToCustomerShipment?.courierName,
        trackingId: data.returnTrackingId || rma.returnToCustomerShipment?.trackingId,
        dispatchedAt: data.returnDispatchedAt || rma.returnToCustomerShipment?.dispatchedAt || new Date(),
        estimatedDelivery: data.returnEstimatedDelivery || rma.returnToCustomerShipment?.estimatedDelivery,
      };
      rma.status = "Return Dispatched";
      rma.claimStatus = "Product Return Dispatched";
      rma.deliveryStatus = "Return Dispatched";
      rma.timeline.push({ status: "Return Dispatched", note: `Product return shipped via ${rma.returnToCustomerShipment.courierName || "courier"}.`, actorEmail: req.user.email });
    }
    if (data.deliveryStatus) {
      rma.deliveryStatus = data.deliveryStatus;
      rma.deliveryNotes = data.deliveryNotes || rma.deliveryNotes;
      rma.deliveryTimeline.push({ status: data.deliveryStatus, note: data.deliveryNotes || "Delivery status updated.", actorEmail: req.user.email });
      if (["Out for Delivery", "Delivered"].includes(data.deliveryStatus)) {
        rma.status = data.deliveryStatus;
        rma.claimStatus = data.deliveryStatus;
        rma.timeline.push({ status: data.deliveryStatus, note: data.deliveryNotes || (rma.returnToCustomerShipment?.trackingId ? "Product return delivery updated." : "Replacement delivery updated."), actorEmail: req.user.email });
      }
    }
    await rma.save();
    if (data.status) {
      const ownershipWarrantyStatus = ["Replacement Approved", "Repaired", "Replaced"].includes(data.status)
        ? data.status
        : ["Rejected", "Rejected After Inspection", "Closed"].includes(data.status)
          ? "Active"
          : "Claim Under Review";
      await ProductOwnership.findOneAndUpdate(
        { id: rma.ownershipId },
        {
          warrantyStatus: ownershipWarrantyStatus,
          $push: { timeline: { status: ownershipWarrantyStatus, note: `${rma.id} updated: ${data.status}`, actorEmail: req.user.email } },
        },
        { returnDocument: "after" }
      );
    }
    const emailStatus = rma.status || data.status;
    const emailPayload = previousStatus !== emailStatus ? rmaEmailPayloadForStatus(rma, emailStatus, data, req) : null;
    if (emailPayload) queueCareDecisionEmail(emailPayload);
    await writeAuditLog(req, "admin.rma.updated", { rmaId: req.params.id, status: data.status });
    return ok(res, rma);
  }

  const claim = await WarrantyClaim.findOneAndUpdate(
    { id: req.params.id },
    {
      $set: data,
      ...(data.status
        ? { $push: { statusHistory: { status: data.status, note: data.notes || "Admin status update", actorEmail: req.user.email } } }
        : {}),
    },
    { returnDocument: "after", runValidators: true }
  );
  if (!claim) throw createHttpError(404, "Claim not found.");
  await writeAuditLog(req, "admin.warranty.updated", { claimId: req.params.id });
  return ok(res, claim);
}

function emailTitleForRmaStatus(status) {
  return {
    "Waiting for Customer Shipment": "Your warranty claim is approved",
    Rejected: "Your warranty claim was rejected",
    "Product Received": "Your product reached INFIBOLT service center",
    "Final Approved": "Your warranty claim passed inspection",
    "Replacement Approved": "Your warranty replacement is approved",
    "Rejected After Inspection": "Warranty inspection update",
    "Replacement Dispatched": "Your replacement has been dispatched",
    "Return Dispatched": "Your product return has been dispatched",
  }[status] || "Warranty claim update";
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
    { returnDocument: "after", runValidators: true }
  );
  if (!ticket) throw createHttpError(404, "Ticket not found.");
  await writeAuditLog(req, "admin.support.replied", { ticketId: req.params.id });
  return ok(res, ticket);
}
