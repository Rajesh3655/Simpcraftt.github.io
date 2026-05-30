import { matchedData } from "express-validator";
import { Category } from "../models/Category.js";
import { Collection } from "../models/Collection.js";
import { Customer } from "../models/Customer.js";
import { CustomerChangeLog } from "../models/CustomerChangeLog.js";
import { HomepageSection } from "../models/HomepageSection.js";
import { LaunchLead } from "../models/LaunchLead.js";
import { Manual } from "../models/Manual.js";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber.js";
import { Product } from "../models/Product.js";
import { ProductOwnership } from "../models/ProductOwnership.js";
import { RMARequest } from "../models/RMARequest.js";
import { SiteSetting } from "../models/SiteSetting.js";
import { SupportTicket } from "../models/SupportTicket.js";
import { WarrantyClaim } from "../models/WarrantyClaim.js";
import { getContactSettings } from "../services/siteSettingsService.js";
import { writeAuditLog } from "../middleware/audit.js";
import { env } from "../config/env.js";
import { hashPassword, hashToken, randomToken, verifyPassword } from "../utils/crypto.js";
import { clearAuthCookies, refreshCookieCandidates, verifyRefreshToken } from "../utils/cookies.js";
import { createHttpError } from "../utils/httpError.js";
import { ok, productDetails, sanitizeUser } from "../utils/response.js";
import { createSession, revokeUserSessions, rotateRefreshSession } from "../services/sessionService.js";
import { issueOtp, verifyOtpCode } from "../services/otpService.js";
import { verifyGoogleCredential } from "../services/googleAuthService.js";
import { moveLocalUpload } from "../services/uploadService.js";
import { sendPasswordResetConfirmation, sendSecurityNotification, sendWelcomeEmail } from "../services/emailService.js";
import {
  assertSerialAvailable,
  assertWarrantyClaimAvailable,
  assertWarrantyRegistrationWindow,
  assertValidSerial,
  createRmaId,
  ensureProductUnit,
  expireOwnershipIfNeeded,
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

function homepageProductFilter(extra = {}) {
  const and = [
    { $or: [{ status: { $in: storefrontStatuses } }, { homepageVisible: true }, { heroVisible: true }, { featured: true }] },
    { productPageVisible: { $ne: false } },
    { $or: [{ visibility: "public" }, { visibility: { $exists: false } }] },
  ];
  if (extra.category) and.push({ $or: [{ category: extra.category }, { categorySlug: extra.category }] });
  if (extra.collection) and.push({ collectionVisible: { $ne: false } }, { $or: [{ collection: extra.collection }, { collectionSlug: extra.collection }] });
  return { $and: and };
}

function selectedHomepageProductFilter(extra = {}) {
  const and = [{ productPageVisible: { $ne: false } }, { $or: [{ visibility: "public" }, { visibility: { $exists: false } }] }];
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
  const email = raw.toLowerCase();
  const phone = raw.replace(/\D/g, "");
  if (/^\S+@\S+\.\S+$/.test(raw)) return { query: { email }, audit: email };
  if (/^[1-9]\d{7,14}$/.test(phone)) return { query: { phone }, audit: phone };
  throw createHttpError(422, "Enter a valid email address or phone number.");
}

async function customerProfilePayload(user) {
  const authState = await Customer.findById(user._id).select("+passwordHash +googleSub").lean();
  const hasPassword = Boolean(authState?.passwordHash);
  const googleLinked = Boolean(authState?.googleSub);
  return {
    ...sanitizeUser(user),
    hasPassword,
    authProvider: googleLinked && !hasPassword ? "google" : googleLinked ? "password_google" : "password",
  };
}

async function getSignupConflictFields(email, phone) {
  const existingCustomers = await Customer.find({ $or: [{ email }, { phone }] }).select("email phone").lean();
  return existingCustomers.reduce((fields, customer) => {
    if (customer.email === email) fields.email = "This email is already registered.";
    if (customer.phone === phone) fields.phone = "This phone number is already registered.";
    return fields;
  }, {});
}

function assertSignupIdentityAvailable(fields) {
  const conflictKeys = Object.keys(fields);
  if (!conflictKeys.length) return;
  const message = conflictKeys.length > 1 ? "Email and phone number are already registered." : fields.email || fields.phone || "Account details already exist.";
  throw createHttpError(409, message, { fields });
}

async function resolvePasswordResetAccount(identifier) {
  const resolved = resolveAccountIdentifier({ identifier });
  return Customer.findOne(resolved.query).select("+passwordHash +resetTokenHash +resetTokenExpiresAt");
}

async function syncCustomerEmailAcrossRecords({ customerId, previousEmail, nextEmail }) {
  await Promise.all([
    ProductOwnership.updateMany({ $or: [{ customerId }, { email: previousEmail }] }, { email: nextEmail }),
    RMARequest.updateMany({ $or: [{ customerId }, { email: previousEmail }] }, { email: nextEmail }),
    WarrantyClaim.updateMany({ $or: [{ customerId }, { email: previousEmail }] }, { email: nextEmail }),
    SupportTicket.updateMany({ email: previousEmail }, { email: nextEmail }),
    NewsletterSubscriber.updateMany({ email: previousEmail }, { email: nextEmail }),
    LaunchLead.updateMany({ email: previousEmail }, { email: nextEmail }),
  ]);
}

export async function login(req, res) {
  const data = matchedData(req);
  const { password } = data;
  const identifier = resolveAccountIdentifier(data);
  const user = await Customer.findOne(identifier.query).select("+passwordHash +failedLoginCount +lockUntil +refreshTokenHash");
  if (!user) throw createHttpError(401, "Invalid email or password.");
  if (user.status === "Locked") throw createHttpError(423, "Account is blocked. Contact INFIBOLT support.");
  await assertUnlocked(user);
  if (!user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    await recordFailedLogin(user);
    await writeAuditLog(req, "customer.login.failed", { identifier: identifier.audit });
    if ((user.failedLoginCount || 0) >= 3) {
      await sendSecurityNotification({
        email: user.email,
        title: "Failed sign-in attempts detected",
        message: "We noticed repeated failed sign-in attempts on your INFIBOLT account.",
        details: [
          { label: "IP address", value: req.ip },
          { label: "Device", value: req.get("user-agent") },
        ],
        url: `${env.frontendOrigin}/profile`,
        req,
      });
    }
    throw createHttpError(401, "Invalid email or password.");
  }
  user.failedLoginCount = 0;
  user.lockUntil = undefined;
  await createSession(req, res, user);
  await writeAuditLog(req, "customer.login.success", { identifier: identifier.audit });
  return ok(res, { user: await customerProfilePayload(user) });
}

export async function signup(req, res) {
  const data = matchedData(req);
  const phone = String(data.phone || "").replace(/\D/g, "");
  assertSignupIdentityAvailable(await getSignupConflictFields(data.email, phone));
  const otp = await issueOtp({ email: data.email, purpose: "signup", metadata: { name: data.name, email: data.email, phone }, req });
  await writeAuditLog(req, "customer.signup.requested", { email: data.email, phone });
  return ok(res, {
    verificationId: otp.id,
    channel: "email",
    expiresInSeconds: otp.expiresInSeconds,
    resendAfterSeconds: otp.resendAfterSeconds,
    message: "Email OTP sent successfully.",
  }, 202);
}

export async function verifyOtp(req, res) {
  const data = matchedData(req);
  const phone = String(data.phone || "").replace(/\D/g, "");
  await verifyOtpCode({ email: data.email, purpose: "signup", otp: data.otp, verificationId: data.verificationId, req });
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
      emailVerifiedAt: new Date(),
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  ).select("+refreshTokenHash");
  await createSession(req, res, user);
  await writeAuditLog(req, "customer.email.verified", { email: data.email });
  await sendWelcomeEmail({ email: user.email, name: user.name, req });
  return ok(res, { user: await customerProfilePayload(user) }, 201);
}

export async function googleLogin(req, res) {
  const { credential, flow = "login" } = matchedData(req);
  const googleProfile = await verifyGoogleCredential(credential);
  let user = await Customer.findOne({
    $or: [{ googleSub: googleProfile.sub }, { email: googleProfile.email }],
  }).select("+refreshTokenHash +googleSub");

  if (user?.status === "Locked") throw createHttpError(423, "Account is blocked. Contact INFIBOLT support.");
  if (!user && flow !== "signup") {
    await writeAuditLog(req, "customer.google_login.failed", { email: googleProfile.email, reason: "account_not_found" });
    throw createHttpError(404, "No INFIBOLT account is linked to this Google email. Create an account first.");
  }

  if (!user) {
    user = await Customer.create({
      name: googleProfile.name,
      email: googleProfile.email,
      googleSub: googleProfile.sub,
      avatarUrl: googleProfile.picture,
      status: "Verified",
      role: "customer",
      emailVerifiedAt: new Date(),
    });
    user = await Customer.findById(user._id).select("+refreshTokenHash +googleSub");
    await writeAuditLog(req, "customer.google_signup.success", { email: googleProfile.email });
    await sendWelcomeEmail({ email: user.email, name: user.name, req });
  } else {
    let changed = false;
    if (!user.googleSub) {
      user.googleSub = googleProfile.sub;
      changed = true;
    }
    if (!user.emailVerifiedAt) {
      user.emailVerifiedAt = new Date();
      changed = true;
    }
    if (googleProfile.picture && user.avatarUrl !== googleProfile.picture) {
      user.avatarUrl = googleProfile.picture;
      changed = true;
    }
    if (changed) await user.save();
    await writeAuditLog(req, "customer.google_login.success", { email: googleProfile.email });
  }

  await createSession(req, res, user);
  return ok(res, { user: await customerProfilePayload(user) });
}

export async function forgotPassword(req, res) {
  const data = matchedData(req);
  const identifier = data.identifier || data.email;
  const user = await resolvePasswordResetAccount(identifier);
  let resendAfterSeconds = env.otpResendCooldownSeconds;
  if (user) {
    const token = randomToken(24);
    user.resetTokenHash = hashToken(token);
    user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const otp = await issueOtp({ email: user.email, purpose: "password-reset", metadata: { resetTokenHint: token.slice(0, 8) }, ttlMinutes: env.otpTtlMinutes, req });
    resendAfterSeconds = otp.resendAfterSeconds;
    await writeAuditLog(req, "customer.password_reset.requested", { identifier, email: user.email });
  }
  return ok(res, { message: "If the account exists, an OTP has been sent.", resendAfterSeconds });
}

export async function resetPassword(req, res) {
  const data = matchedData(req);
  const identifier = data.identifier || data.email;
  const user = await resolvePasswordResetAccount(identifier);
  if (!user) throw createHttpError(404, "Account not found.");
  await verifyOtpCode({ email: user.email, purpose: "password-reset", otp: data.otp, req });
  user.passwordHash = await hashPassword(data.password);
  user.resetTokenHash = undefined;
  user.resetTokenExpiresAt = undefined;
  user.failedLoginCount = 0;
  user.lockUntil = undefined;
  await user.save();
  await revokeUserSessions(user);
  await writeAuditLog(req, "customer.password_reset.completed", { identifier, email: user.email });
  await sendPasswordResetConfirmation({ email: user.email, req });
  return ok(res, { reset: true });
}

export async function requestLoginOtp(req, res) {
  const data = matchedData(req);
  const { password } = data;
  const identifier = resolveAccountIdentifier(data);
  const user = await Customer.findOne(identifier.query).select("+passwordHash +failedLoginCount +lockUntil");
  if (!user) throw createHttpError(401, "Invalid email or password.");
  if (user.status === "Locked") throw createHttpError(423, "Account is blocked. Contact INFIBOLT support.");
  await assertUnlocked(user);
  if (!user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    await recordFailedLogin(user);
    await writeAuditLog(req, "customer.login_otp.failed", { identifier: identifier.audit });
    if ((user.failedLoginCount || 0) >= 3) {
      await sendSecurityNotification({
        email: user.email,
        title: "Failed sign-in attempts detected",
        message: "Someone attempted to request login verification for your INFIBOLT account with an invalid password.",
        details: [
          { label: "IP address", value: req.ip },
          { label: "Device", value: req.get("user-agent") },
        ],
        url: `${env.frontendOrigin}/profile`,
        req,
      });
    }
    throw createHttpError(401, "Invalid email or password.");
  }
  const otp = await issueOtp({ email: user.email, purpose: "login", metadata: { userId: String(user._id), identifier: identifier.audit }, req });
  await writeAuditLog(req, "customer.login_otp.requested", { identifier: identifier.audit });
  return ok(res, {
    otpRequired: true,
    verificationId: otp.id,
    expiresInSeconds: otp.expiresInSeconds,
    resendAfterSeconds: otp.resendAfterSeconds,
    message: "Login email OTP sent successfully.",
  }, 202);
}

export async function verifyLoginOtp(req, res) {
  const data = matchedData(req);
  const { otp } = data;
  const identifier = resolveAccountIdentifier(data);
  const user = await Customer.findOne(identifier.query).select("+refreshTokenHash");
  if (!user) throw createHttpError(404, "Account not found.");
  await verifyOtpCode({ email: user.email, purpose: "login", otp, req });
  await createSession(req, res, user);
  await writeAuditLog(req, "customer.login_otp.verified", { identifier: identifier.audit });
  return ok(res, { user: await customerProfilePayload(user) });
}

export async function refresh(req, res) {
  const refreshToken = refreshCookieCandidates("customer").map((name) => req.signedCookies?.[name]).find(Boolean);
  if (!refreshToken) throw createHttpError(401, "Refresh token missing.");
  const payload = verifyRefreshToken(refreshToken);
  if (payload.role !== "customer") throw createHttpError(403, "Invalid session role.");
  const user = await Customer.findById(payload.sub).select("+refreshTokenHash");
  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) throw createHttpError(401, "Refresh token has been invalidated.");
  await rotateRefreshSession(req, res, user, refreshToken);
  return ok(res, { user: await customerProfilePayload(user) });
}

export async function logout(req, res) {
  const user = req.user && (await Customer.findById(req.user._id).select("+refreshTokenHash"));
  if (user) {
    await revokeUserSessions(user);
    await writeAuditLog(req, "customer.logout");
  }
  clearAuthCookies(res, req.user?.role || "customer");
  return ok(res, { loggedOut: true });
}

export async function me(req, res) {
  return ok(res, { user: await customerProfilePayload(req.user) });
}

export async function listProducts(_req, res) {
  const page = Math.max(Number(_req.query.page || 1), 1);
  const warrantyRegistration = _req.query.warrantyRegistration === "true";
  const limit = Math.min(Math.max(Number(_req.query.limit || (warrantyRegistration ? 200 : 24)), 1), warrantyRegistration ? 200 : 60);
  const skip = (page - 1) * limit;
  const filter = warrantyRegistration ? {} : publicProductFilter({ category: _req.query.category, collection: _req.query.collection });
  if (!warrantyRegistration && _req.query.featured === "true") filter.featured = true;
  if (!warrantyRegistration && _req.query.newLaunch === "true") filter.newLaunch = true;
  if (!warrantyRegistration && _req.query.bestseller === "true") filter.bestseller = true;
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
  const sections = await HomepageSection.find({ enabled: true }).sort({ sortOrder: 1 }).lean();
  const featuredSection = sections.find((section) => section.key === "home-featured");
  const selectedFeaturedSlugs = featuredSection?.productSlugs?.length ? featuredSection.productSlugs.slice(0, 4) : [];
  const [heroProducts, featuredProductsRaw, newLaunches, bestsellers, categories, collections] = await Promise.all([
    Product.find({ ...homepageProductFilter(), heroVisible: true }).sort({ sortOrder: 1, updatedAt: -1 }).limit(6).lean(),
    Product.find(selectedFeaturedSlugs.length ? { ...selectedHomepageProductFilter(), slug: { $in: selectedFeaturedSlugs } } : { ...homepageProductFilter(), $or: [{ featured: true }, { homepageVisible: true }] }).sort({ sortOrder: 1, updatedAt: -1 }).limit(4).lean(),
    Product.find({ ...publicProductFilter(), newLaunch: true }).sort({ sortOrder: 1, updatedAt: -1 }).limit(12).lean(),
    Product.find({ ...publicProductFilter(), bestseller: true }).sort({ sortOrder: 1, updatedAt: -1 }).limit(12).lean(),
    Category.find({ enabled: { $ne: false } }).sort({ sortOrder: 1, name: 1 }).lean(),
    Collection.find({ enabled: { $ne: false }, homepageVisible: true }).sort({ sortOrder: 1, name: 1 }).lean(),
  ]);
  const featuredProducts = selectedFeaturedSlugs.length
    ? [...featuredProductsRaw].sort((a, b) => selectedFeaturedSlugs.indexOf(a.slug) - selectedFeaturedSlugs.indexOf(b.slug))
    : featuredProductsRaw;
  if (selectedFeaturedSlugs.length && featuredProducts.length < 1) {
    const fallbackFeatured = await Product.find({ ...homepageProductFilter(), $or: [{ featured: true }, { homepageVisible: true }] }).sort({ sortOrder: 1, updatedAt: -1 }).limit(4).lean();
    if (fallbackFeatured.length) featuredProducts.push(...fallbackFeatured);
    else featuredProducts.push(...(await Product.find(homepageProductFilter()).sort({ sortOrder: 1, updatedAt: -1 }).limit(4).lean()));
  }

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

export async function getPublicSiteSettings(_req, res) {
  return ok(res, { contactSettings: await getContactSettings() });
}

function manualFilterFromQuery(query = {}) {
  const filter = { isVisible: true };
  if (query.category) filter.category = String(query.category).trim();
  if (query.featured === "true") filter.featured = true;
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

export async function listManuals(req, res) {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 24), 1), 80);
  const filter = manualFilterFromQuery(req.query);
  const [items, total, categories] = await Promise.all([
    Manual.find(filter).sort(manualSortFromQuery(req.query)).skip((page - 1) * limit).limit(limit).lean(),
    Manual.countDocuments(filter),
    Manual.distinct("category", { isVisible: true }),
  ]);
  return ok(res, { items, total, page, pages: Math.ceil(total / limit) || 1, categories: categories.filter(Boolean).sort() });
}

export async function getManual(req, res) {
  const manual = await Manual.findOne({ _id: req.params.id, isVisible: true }).lean();
  if (!manual) throw createHttpError(404, "Manual not found.");
  return ok(res, manual);
}

export async function getProfile(req, res) {
  return ok(res, { ...(await customerProfilePayload(req.user)), address: req.user.address || "", city: req.user.city || "", state: req.user.state || "", postalCode: req.user.postalCode || "" });
}

export async function updateProfile(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  const allowed = ["name", "address", "city", "state", "postalCode"];
  const update = {};
  const passwordChangeRequested = Boolean(data.currentPassword || data.newPassword);
  if (data.phone !== undefined) {
    if (req.user.phone && data.phone !== req.user.phone) {
      throw createHttpError(403, "Phone number cannot be changed after it is set.");
    }
    if (!req.user.phone) {
      const existing = await Customer.findOne({ phone: data.phone, _id: { $ne: req.user._id } }).select("_id").lean();
      if (existing) throw createHttpError(409, "This phone number is already registered.", { fields: { phone: "This phone number is already registered." } });
      update.phone = data.phone;
    }
  }
  for (const field of allowed) {
    if (data[field] !== undefined && data[field] !== req.user[field]) {
      update[field] = data[field];
    }
  }
  if (passwordChangeRequested) {
    const customerWithPassword = await Customer.findById(req.user._id).select("+passwordHash +googleSub");
    if (customerWithPassword?.googleSub) {
      throw createHttpError(403, "Password changes are available only for email/password accounts. Please continue using Google sign in.");
    }
    if (!customerWithPassword?.passwordHash) {
      throw createHttpError(403, "Password changes are available only for email/password accounts.");
    }
    if (!data.currentPassword) {
      throw createHttpError(422, "Enter your current password.");
    }
    if (!(await verifyPassword(data.currentPassword, customerWithPassword.passwordHash))) {
      await writeAuditLog(req, "customer.password_change.failed", { reason: "invalid_current_password" });
      throw createHttpError(401, "Current password is incorrect.");
    }
    if (await verifyPassword(data.newPassword, customerWithPassword.passwordHash)) {
      throw createHttpError(422, "New password must be different from your current password.");
    }
    update.passwordHash = await hashPassword(data.newPassword);
    update.failedLoginCount = 0;
    update.lockUntil = undefined;
  }
  if (!Object.keys(update).length) {
    return ok(res, { ...(await customerProfilePayload(req.user)), address: req.user.address || "", city: req.user.city || "", state: req.user.state || "", postalCode: req.user.postalCode || "" });
  }
  const customer = await Customer.findOneAndUpdate(
    { _id: req.user._id, ...(update.phone ? { $or: [{ phone: { $exists: false } }, { phone: "" }, { phone: null }] } : {}) },
    update,
    { returnDocument: "after", runValidators: true }
  );
  if (!customer) throw createHttpError(409, "Phone number is already set for this account.");
  const profileChangeFields = Object.keys(update).filter((field) => !["passwordHash", "failedLoginCount", "lockUntil"].includes(field));
  await Promise.all(profileChangeFields.map((field) => CustomerChangeLog.create({
    customerId: req.user._id,
    field,
    previousValue: req.user[field],
    nextValue: update[field],
    verified: true,
    actorEmail: req.user.email,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  })));
  if (passwordChangeRequested) {
    await writeAuditLog(req, "customer.password.changed");
    await sendSecurityNotification({
      email: customer.email,
      title: "Your INFIBOLT password was changed",
      message: "Your account password was changed from profile settings.",
      details: [
        { label: "IP address", value: req.ip },
        { label: "Device", value: req.get("user-agent") },
      ],
      url: `${env.frontendOrigin}/profile`,
      req,
    });
  }
  if (profileChangeFields.length) {
    await writeAuditLog(req, "customer.profile.updated", { fields: profileChangeFields });
  }
  return ok(res, { ...(await customerProfilePayload(customer)), address: customer.address || "", city: customer.city || "", state: customer.state || "", postalCode: customer.postalCode || "" });
}

export async function requestProfileContactUpdate(req, res) {
  throw createHttpError(403, "Email and phone number cannot be changed from profile settings.");
}

export async function verifyProfileContactUpdate(req, res) {
  throw createHttpError(403, "Email and phone number cannot be changed from profile settings.");
}

export async function createLead(req, res) {
  await writeAuditLog(req, "lead.created", { email: req.body.email });
  return ok(res, { id: issueId("LEAD"), status: "received", ...matchedData(req) }, 202);
}

export async function requestLaunchNotification(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  const email = data.email || undefined;
  if (!email) throw createHttpError(422, "Enter an email for launch updates.");
  const lead = await LaunchLead.findOneAndUpdate(
    {
      productSlug: data.productSlug,
      email,
    },
    {
      id: issueId("LAUNCH"),
      product: data.product,
      productSlug: data.productSlug,
      email,
      phone: undefined,
      source: data.source || "Product page",
      status: "Subscribed",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  await writeAuditLog(req, "launch_notification.requested", { productSlug: data.productSlug, email });
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
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
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
  const [ownershipDocs, rmas] = await Promise.all([
    ProductOwnership.find(filter).sort({ updatedAt: -1 }),
    RMARequest.find(req.user?._id ? { customerId: req.user._id } : { email: req.user?.email }).sort({ updatedAt: -1 }).lean(),
  ]);
  await Promise.all(ownershipDocs.map((ownership) => expireOwnershipIfNeeded(ownership, req.user?.email)));
  const items = ownershipDocs.map((ownership) => ownership.toObject());
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
  const existingRejectedOwnership = await ProductOwnership.findOne({
    serial,
    productSlug: productInfo.productSlug,
    ...(req.user?._id ? { customerId: req.user._id } : { email: data.email || req.user?.email }),
    status: "Rejected",
    warrantyStatus: "Rejected",
  });
  await assertSerialAvailable(serial, req.user?._id, productInfo.productSlug, existingRejectedOwnership?._id);
  assertWarrantyRegistrationWindow(data.purchaseDate);
  const { start, end } = warrantyEndFromPurchase(data.purchaseDate);
  await ensureProductUnit({ serial, ...productInfo, customer: req.user, source });
  const invoiceUrl = data.invoiceUrl?.startsWith("/uploads/temp/")
    ? await moveLocalUpload(data.invoiceUrl, "warranty")
    : data.invoiceUrl;
  if (existingRejectedOwnership) {
    existingRejectedOwnership.customerName = data.customer || req.user?.name;
    existingRejectedOwnership.email = data.email || req.user?.email;
    existingRejectedOwnership.phone = req.user?.phone;
    existingRejectedOwnership.product = productInfo.product;
    existingRejectedOwnership.productSlug = productInfo.productSlug;
    existingRejectedOwnership.source = source;
    existingRejectedOwnership.sourceDetail = data.sourceDetail || data.storeName;
    existingRejectedOwnership.invoiceNumber = data.invoiceNumber;
    existingRejectedOwnership.invoiceUrl = invoiceUrl;
    existingRejectedOwnership.purchaseDate = data.purchaseDate || start;
    existingRejectedOwnership.registeredAt = new Date();
    existingRejectedOwnership.otpVerifiedAt = new Date();
    existingRejectedOwnership.verifiedAt = undefined;
    existingRejectedOwnership.rejectedAt = undefined;
    existingRejectedOwnership.warrantyStart = start;
    existingRejectedOwnership.warrantyUntil = end;
    existingRejectedOwnership.status = "Pending Verification";
    existingRejectedOwnership.warrantyStatus = "Pending Verification";
    existingRejectedOwnership.reviewNote = undefined;
    existingRejectedOwnership.timeline.push({ status: "Pending Verification", note: "Warranty registration re-submitted. Waiting for admin invoice review.", actorEmail: data.email || req.user?.email });
    await existingRejectedOwnership.save();
    await writeAuditLog(req, "ownership.registration.resubmitted", { ownershipId: existingRejectedOwnership.id, serial, source });
    return ok(res, existingRejectedOwnership, 202);
  }
  const ownership = await ProductOwnership.create({
    id: issueId("OWN"),
    customerId: req.user?._id,
    customerName: data.customer || req.user?.name,
    email: data.email || req.user?.email,
    phone: req.user?.phone,
    ...productInfo,
    serial,
    source,
    sourceDetail: data.sourceDetail || data.storeName,
    invoiceNumber: data.invoiceNumber,
    invoiceUrl,
    purchaseDate: data.purchaseDate || start,
    registeredAt: new Date(),
    otpVerifiedAt: new Date(),
    warrantyStart: start,
    warrantyUntil: end,
    status: "Pending Verification",
    warrantyStatus: "Pending Verification",
    timeline: [{ status: "Pending Verification", note: "Warranty registration submitted. Waiting for admin invoice review.", actorEmail: data.email || req.user?.email }],
  });
  await writeAuditLog(req, "ownership.registration.submitted", { ownershipId: ownership.id, serial, source });
  return ok(res, ownership, 201);
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
  await assertWarrantyClaimAvailable(ownership, req.user.email);
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
    customerAddress: data.customerAddress,
    attachments: data.attachments || [],
    policyDecision,
    claimStatus: "Under Review",
    timeline: [{ status: "Requested", note: policyDecision, actorEmail: req.user.email }],
  });
  ownership.warrantyStatus = "Claim Under Review";
  ownership.timeline.push({ status: "Claim Under Review", note: `${rma.id} created`, actorEmail: req.user.email });
  await ownership.save();
  await writeAuditLog(req, "warranty.rma.created", { rmaId: rma.id, ownershipId: ownership.id });
  return ok(res, rma, 202);
}

export async function submitWarrantyShipment(req, res) {
  const data = matchedData(req, { locations: ["body"] });
  const rma = await RMARequest.findOne({ id: req.params.id, customerId: req.user._id });
  if (!rma) throw createHttpError(404, "Warranty claim not found.");
  if (rma.status !== "Waiting for Customer Shipment" && rma.status !== "Approved") {
    throw createHttpError(422, "Shipment details can be submitted after the claim is approved.");
  }
  if (rma.returnShipment?.trackingId) {
    throw createHttpError(409, "Shipment details have already been submitted.");
  }
  rma.returnShipment = {
    courierName: data.courierName,
    trackingId: data.trackingId,
    notes: data.notes,
    shippedAt: new Date(),
  };
  rma.status = "Tracking Submitted";
  rma.claimStatus = "Shipment Sent";
  rma.timeline.push({ status: "Tracking Submitted", note: `${data.courierName} AWB ${data.trackingId}`, actorEmail: req.user.email });
  await rma.save();
  await writeAuditLog(req, "warranty.rma.shipment_submitted", { rmaId: rma.id });
  return ok(res, rma);
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
