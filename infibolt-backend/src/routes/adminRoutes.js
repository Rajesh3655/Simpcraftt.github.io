import { Router } from "express";
import { body, param } from "express-validator";
import {
  adminGoogleLogin,
  adminLogout,
  adminMe,
  adminRefresh,
  adminResendOtp,
  adminVerifyOtp,
  analytics,
  createCategory,
  createCollection,
  createProduct,
  createWebsitePurchaseOwnership,
  deleteCategory,
  deleteCollection,
  deleteHomepageSection,
  deleteProduct,
  getWarrantyPolicyAdmin,
  exportUsers,
  listAuditLogs,
  listHomepageSectionsAdmin,
  listLaunchLeads,
  listAdminProducts,
  listCategoriesAdmin,
  listCollectionsAdmin,
  listNewsletterSubscribers,
  listSupportTicketsAdmin,
  listUsers,
  listOtpAuditLogs,
  listWarrantyClaimsAdmin,
  markSupportTicketRead,
  overview,
  reorderProducts,
  replySupportTicket,
  resendActivationEmail,
  settings,
  updateContactSettings,
  updateCustomerSecurityStatus,
  updateCategory,
  updateCollection,
  upsertHomepageSection,
  updateProduct,
  updateWarrantyPolicy,
  updateWarrantyStatus,
} from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ADMIN_ROLES } from "../constants/roles.js";
import { DELIVERY_STATUS, RMA_STATUS, WARRANTY_STATUS } from "../constants/status.js";

export const adminRoutes = Router();

const protectAdmin = requireAuth(ADMIN_ROLES);

const uploadedOrUrl = (value) => {
  if (!value) return true;
  if (/^https?:\/\//i.test(value)) return true;
  if (/^\/uploads\/[a-z-]+\/[a-z0-9-]+\.(png|jpe?g|webp|gif|avif|pdf)$/i.test(value)) return true;
  throw new Error("Must be a valid URL or uploaded asset path.");
};

const urlOrEmpty = (value) => {
  if (!value) return true;
  if (/^https?:\/\//i.test(value)) {
    const parsed = new URL(value);
    if (["http:", "https:"].includes(parsed.protocol)) return true;
  }
  throw new Error("Must be a valid URL.");
};

const productValidation = (partial = false) => {
  const optional = partial ? { nullable: true, checkFalsy: true } : { nullable: true, checkFalsy: true };
  const field = (name) => (partial ? body(name).optional(optional) : body(name));
  return [
    field("name").trim().isLength({ min: 2, max: 120 }).withMessage("Enter 2 to 120 characters."),
    (partial ? body("slug").optional(optional) : body("slug")).trim().matches(/^[a-z0-9-]+$/).withMessage("Use lowercase letters, numbers, and hyphens only."),
    field("category").trim().isLength({ min: 2, max: 60 }).withMessage("Select a valid category."),
    body("categorySlug").optional(optional).trim().matches(/^[a-z0-9-]+$/),
    body("collection").optional(optional).trim().isLength({ max: 80 }),
    body("collectionSlug").optional(optional).trim().matches(/^[a-z0-9-]+$/),
    body("sku").optional(optional).trim().isLength({ max: 80 }),
    body("serialPrefix").optional(optional).trim().isLength({ max: 30 }),
    field("price").isFloat({ min: 0 }).withMessage("Enter a valid price.").toFloat(),
    body("comparePrice").optional(optional).isFloat({ min: 0 }).toFloat(),
    body("stock").optional(optional).isInt({ min: 0 }).toInt(),
    body("rating").optional(optional).isFloat({ min: 0, max: 5 }).toFloat(),
    body("reviewCount").optional(optional).isInt({ min: 0 }).toInt(),
    body("badge").optional(optional).trim().isLength({ max: 40 }),
    body("subtitle").optional(optional).trim().isLength({ max: 180 }),
    body("status").optional(optional).isIn(["Draft", "Preview", "Ready", "Published", "Prototype", "Archived", "Hidden", "Out of Stock", "Upcoming", "Discontinued"]),
    body("featured").optional(optional).isBoolean().toBoolean(),
    body("newLaunch").optional(optional).isBoolean().toBoolean(),
    body("bestseller").optional(optional).isBoolean().toBoolean(),
    body("trending").optional(optional).isBoolean().toBoolean(),
    body("homepageVisible").optional(optional).isBoolean().toBoolean(),
    body("heroVisible").optional(optional).isBoolean().toBoolean(),
    body("desktopMenuFeatured").optional(optional).isBoolean().toBoolean(),
    body("collectionVisible").optional(optional).isBoolean().toBoolean(),
    body("productPageVisible").optional(optional).isBoolean().toBoolean(),
    body("mobileFeatured").optional(optional).isBoolean().toBoolean(),
    body("supportWarrantyEnabled").optional(optional).isBoolean().toBoolean(),
    body("sortOrder").optional(optional).isInt().toInt(),
    body("visibility").optional(optional).isIn(["public", "private", "admin-only"]),
    field("summary").trim().isLength({ min: 5, max: 500 }).withMessage("Enter 5 to 500 characters."),
    body("shortDescription").optional({ nullable: true }).trim().isLength({ max: 500 }),
    body("description").optional({ nullable: true }).trim().isLength({ max: 2000 }).withMessage("Keep the description under 2000 characters."),
    body("fullDescription").optional({ nullable: true }).trim().isLength({ max: 6000 }),
    body("image").optional({ nullable: true }).custom(uploadedOrUrl),
    body("coverImage").optional({ nullable: true }).custom(uploadedOrUrl),
    body("hoverImage").optional({ nullable: true }).custom(uploadedOrUrl),
    body("thumbnail").optional({ nullable: true }).custom(uploadedOrUrl),
    body("mobileHeroImage").optional({ nullable: true }).custom(uploadedOrUrl),
    body("gallery").optional({ nullable: true }).isArray({ max: 20 }),
    body("gallery.*").optional({ nullable: true }).custom(uploadedOrUrl),
    body("galleryImages").optional({ nullable: true }).isArray({ max: 20 }),
    body("galleryImages.*").optional({ nullable: true }).custom(uploadedOrUrl),
    body("variants").optional({ nullable: true }).isArray({ max: 20 }),
    body("variants.*").optional({ nullable: true }).trim().isLength({ max: 80 }),
    body("features").optional({ nullable: true }).isArray({ max: 20 }),
    body("features.*").optional({ nullable: true }).trim().isLength({ max: 180 }).withMessage("Each highlight must be under 180 characters."),
    body("highlights").optional({ nullable: true }).isArray({ max: 20 }),
    body("highlights.*").optional({ nullable: true }).trim().isLength({ max: 180 }),
    body("premiumHighlights").optional({ nullable: true }).isArray({ max: 5 }),
    body("premiumHighlights.*.label").optional({ nullable: true }).trim().isLength({ max: 80 }),
    body("premiumHighlights.*.icon").optional({ nullable: true }).trim().isLength({ max: 40 }),
    body("premiumHighlights.*.order").optional({ nullable: true }).isInt().toInt(),
    body("storySection.title").optional({ nullable: true }).trim().isLength({ max: 140 }),
    body("storySection.subtitle").optional({ nullable: true }).trim().isLength({ max: 360 }),
    body("storySection.backgroundImage").optional({ nullable: true }).custom(uploadedOrUrl),
    body("storySection.alignment").optional({ nullable: true }).isIn(["left", "center", "right"]),
    body("specs").optional({ nullable: true }).isObject(),
    body("specs.*").optional({ nullable: true }).trim().isLength({ max: 300 }),
    body("specifications").optional({ nullable: true }).isArray({ max: 40 }),
    body("specifications.*.label").optional({ nullable: true }).trim().isLength({ max: 100 }),
    body("specifications.*.value").optional({ nullable: true }).trim().isLength({ max: 300 }),
    body("specifications.*.group").optional({ nullable: true }).trim().isLength({ max: 80 }),
    body("specifications.*.order").optional({ nullable: true }).isInt().toInt(),
    body("featureBlocks").optional({ nullable: true }).isArray({ max: 4 }),
    body("featureBlocks.*.title").optional({ nullable: true }).trim().isLength({ max: 120 }),
    body("featureBlocks.*.body").optional({ nullable: true }).trim().isLength({ max: 600 }),
    body("featureBlocks.*.description").optional({ nullable: true }).trim().isLength({ max: 600 }),
    body("featureBlocks.*.image").optional({ nullable: true }).custom(uploadedOrUrl),
    body("featureBlocks.*.order").optional({ nullable: true }).isInt().toInt(),
    body("faqs").optional({ nullable: true }).isArray({ max: 12 }),
    body("faqs.*.question").optional({ nullable: true }).trim().isLength({ max: 180 }),
    body("faqs.*.answer").optional({ nullable: true }).trim().isLength({ max: 800 }),
    body("faqs.*.order").optional({ nullable: true }).isInt().toInt(),
    body("recommendations").optional({ nullable: true }).isArray({ max: 12 }),
    body("relatedProducts").optional({ nullable: true }).isArray({ max: 4 }),
    body("relatedProducts.*").optional({ nullable: true }).trim().matches(/^[a-z0-9-]+$/),
    body("warrantyMonths").optional({ nullable: true }).isInt({ min: 0, max: 120 }).toInt(),
    body("replacementDays").optional({ nullable: true }).isInt({ min: 0, max: 365 }).toInt(),
    body("supportPriority").optional({ nullable: true }).isIn(["Low", "Normal", "High", "Flagship"]),
    body("seo.title").optional({ nullable: true }).trim().isLength({ max: 160 }),
    body("seo.description").optional({ nullable: true }).trim().isLength({ max: 300 }),
    body("seo.keywords").optional({ nullable: true }).isArray({ max: 20 }),
    body("metaTitle").optional({ nullable: true }).trim().isLength({ max: 160 }),
    body("metaDescription").optional({ nullable: true }).trim().isLength({ max: 300 }),
    body("keywords").optional({ nullable: true }).isArray({ max: 20 }),
    body("amazonLink").optional({ nullable: true }).custom(urlOrEmpty),
    body("flipkartLink").optional({ nullable: true }).custom(urlOrEmpty),
    body("externalBuyEnabled").optional({ nullable: true }).isBoolean().toBoolean(),
    body("marketplace.amazon").optional({ nullable: true }).custom(urlOrEmpty).withMessage("Enter a valid URL or leave it blank."),
    body("marketplace.flipkart").optional({ nullable: true }).custom(urlOrEmpty).withMessage("Enter a valid URL or leave it blank."),
    body("marketplace.croma").optional({ nullable: true }).custom(urlOrEmpty).withMessage("Enter a valid URL or leave it blank."),
    body("marketplace.relianceDigital").optional({ nullable: true }).custom(urlOrEmpty).withMessage("Enter a valid URL or leave it blank."),
    body("marketplace.retail").optional({ nullable: true }).custom(uploadedOrUrl),
    body("marketplace.custom").optional({ nullable: true }).custom(urlOrEmpty),
    body("marketplace.customLabel").optional({ nullable: true }).trim().isLength({ max: 80 }),
    body("marketplace.externalBuyEnabled").optional({ nullable: true }).isBoolean().toBoolean(),
    body("marketplace.visible").optional({ nullable: true }).isBoolean().toBoolean(),
    body("marketplace.priority").optional({ nullable: true }).isIn(["Amazon", "Flipkart", "Croma", "Reliance Digital", "Retail", "Custom"]),
    body("marketplace.regionalAvailability").optional({ nullable: true }).isArray({ max: 20 }),
    body("marketplace.launchStatus").optional({ nullable: true }).trim().isLength({ max: 120 }),
  ];
};

const categoryValidation = (partial = false) => {
  const optional = partial ? { nullable: true } : false;
  const field = (name) => (partial ? body(name).optional(optional) : body(name));
  return [
  body("id").optional({ nullable: true }).trim().matches(/^[a-z0-9-]+$/),
  body("slug").optional({ nullable: true }).trim().matches(/^[a-z0-9-]+$/),
  field("name").trim().isLength({ min: 2, max: 120 }),
  body("icon").optional({ nullable: true }).trim().isLength({ max: 80 }),
  body("image").optional({ nullable: true }).custom(uploadedOrUrl),
  body("heroBanner").optional({ nullable: true }).custom(uploadedOrUrl),
  body("description").optional({ nullable: true }).trim().isLength({ max: 800 }),
  body("enabled").optional({ nullable: true }).isBoolean().toBoolean(),
  body("featured").optional({ nullable: true }).isBoolean().toBoolean(),
  body("desktopMenuVisible").optional({ nullable: true }).isBoolean().toBoolean(),
  body("sortOrder").optional({ nullable: true }).isInt().toInt(),
  body("featuredProducts").optional({ nullable: true }).isArray({ max: 40 }),
  ];
};

const collectionValidation = (partial = false) => {
  const optional = partial ? { nullable: true } : false;
  const field = (name) => (partial ? body(name).optional(optional) : body(name));
  return [
  body("slug").optional({ nullable: true }).trim().matches(/^[a-z0-9-]+$/),
  field("name").trim().isLength({ min: 2, max: 120 }),
  body("description").optional({ nullable: true }).trim().isLength({ max: 1200 }),
  body("image").optional({ nullable: true }).custom(uploadedOrUrl),
  body("heroBanner").optional({ nullable: true }).custom(uploadedOrUrl),
  body("enabled").optional({ nullable: true }).isBoolean().toBoolean(),
  body("featured").optional({ nullable: true }).isBoolean().toBoolean(),
  body("homepageVisible").optional({ nullable: true }).isBoolean().toBoolean(),
  body("sortOrder").optional({ nullable: true }).isInt().toInt(),
  body("productSlugs").optional({ nullable: true }).isArray({ max: 100 }),
  ];
};

const homepageSectionValidation = (partial = false) => {
  const optional = partial ? { nullable: true } : false;
  const field = (name) => (partial ? body(name).optional(optional) : body(name));
  return [
  body("key").optional({ nullable: true }).trim().matches(/^[a-z0-9-]+$/),
  field("title").trim().isLength({ min: 2, max: 140 }),
  body("subtitle").optional({ nullable: true }).trim().isLength({ max: 500 }),
  field("type").isIn(["hero", "products", "collections", "categories", "banner", "spotlight"]),
  body("enabled").optional({ nullable: true }).isBoolean().toBoolean(),
  body("sortOrder").optional({ nullable: true }).isInt().toInt(),
  body("productSlugs").optional({ nullable: true }).isArray({ max: 40 }),
  body("categorySlugs").optional({ nullable: true }).isArray({ max: 40 }),
  body("collectionSlugs").optional({ nullable: true }).isArray({ max: 40 }),
  body("settings").optional({ nullable: true }).isObject(),
  ];
};

adminRoutes.post("/auth/google", authLimiter, [body("credential").trim().isLength({ min: 100, max: 4096 })], validate, asyncHandler(adminGoogleLogin));
adminRoutes.post("/auth/otp/verify", authLimiter, [body("email").trim().isEmail().bail().customSanitizer((value) => String(value).toLowerCase()), body("verificationId").isMongoId(), body("otp").trim().matches(/^\d{6}$/)], validate, asyncHandler(adminVerifyOtp));
adminRoutes.post("/auth/otp/resend", authLimiter, [body("email").trim().isEmail().bail().customSanitizer((value) => String(value).toLowerCase()), body("verificationId").isMongoId()], validate, asyncHandler(adminResendOtp));
adminRoutes.post("/auth/refresh", authLimiter, asyncHandler(adminRefresh));
adminRoutes.post("/auth/logout", protectAdmin, asyncHandler(adminLogout));
adminRoutes.get("/auth/me", protectAdmin, asyncHandler(adminMe));

adminRoutes.use(protectAdmin);
adminRoutes.get("/overview", asyncHandler(overview));
adminRoutes.get("/analytics", asyncHandler(analytics));
adminRoutes.get("/settings", asyncHandler(settings));
adminRoutes.put(
  "/contact-settings",
  [
    body("mobileNumber").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 30 }),
    body("phone").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 30 }),
    body("helpEmail").optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail(),
    body("whatsapp").optional({ nullable: true, checkFalsy: true }).trim().custom(urlOrEmpty),
    body("instagram").optional({ nullable: true, checkFalsy: true }).trim().custom(urlOrEmpty),
    body("facebook").optional({ nullable: true, checkFalsy: true }).trim().custom(urlOrEmpty),
    body("x").optional({ nullable: true, checkFalsy: true }).trim().custom(urlOrEmpty),
    body("youtube").optional({ nullable: true, checkFalsy: true }).trim().custom(urlOrEmpty),
    body("linkedin").optional({ nullable: true, checkFalsy: true }).trim().custom(urlOrEmpty),
  ],
  validate,
  asyncHandler(updateContactSettings)
);
adminRoutes.get("/users", asyncHandler(listUsers));
adminRoutes.get("/users/otp-audit", asyncHandler(listOtpAuditLogs));
adminRoutes.get("/users/export", asyncHandler(exportUsers));
adminRoutes.post("/users/:id/resend-activation", [param("id").isMongoId()], validate, asyncHandler(resendActivationEmail));
adminRoutes.patch("/users/:id/security-status", [param("id").isMongoId(), body("status").isIn(["Pending", "Verified", "Locked"])], validate, asyncHandler(updateCustomerSecurityStatus));
adminRoutes.get("/newsletter-subscribers", asyncHandler(listNewsletterSubscribers));
adminRoutes.get("/launch-leads", asyncHandler(listLaunchLeads));
adminRoutes.get("/audit-logs", asyncHandler(listAuditLogs));
adminRoutes.get("/categories", asyncHandler(listCategoriesAdmin));
adminRoutes.post("/categories", categoryValidation(), validate, asyncHandler(createCategory));
adminRoutes.patch("/categories/:id", [param("id").trim().matches(/^[a-z0-9-]+$/), ...categoryValidation(true)], validate, asyncHandler(updateCategory));
adminRoutes.delete("/categories/:id", [param("id").trim().matches(/^[a-z0-9-]+$/)], validate, asyncHandler(deleteCategory));
adminRoutes.get("/collections", asyncHandler(listCollectionsAdmin));
adminRoutes.post("/collections", collectionValidation(), validate, asyncHandler(createCollection));
adminRoutes.patch("/collections/:slug", [param("slug").trim().matches(/^[a-z0-9-]+$/), ...collectionValidation(true)], validate, asyncHandler(updateCollection));
adminRoutes.delete("/collections/:slug", [param("slug").trim().matches(/^[a-z0-9-]+$/)], validate, asyncHandler(deleteCollection));
adminRoutes.get("/products", asyncHandler(listAdminProducts));
adminRoutes.post("/products", productValidation(), validate, asyncHandler(createProduct));
adminRoutes.post("/products/reorder", [body("items").isArray({ min: 1, max: 500 }), body("items.*.slug").trim().matches(/^[a-z0-9-]+$/), body("items.*.sortOrder").optional().isInt().toInt()], validate, asyncHandler(reorderProducts));
adminRoutes.put("/products/:slug", [param("slug").matches(/^[a-z0-9-]+$/), ...productValidation(true)], validate, asyncHandler(updateProduct));
adminRoutes.patch("/products/:slug", [param("slug").matches(/^[a-z0-9-]+$/), ...productValidation(true)], validate, asyncHandler(updateProduct));
adminRoutes.delete("/products/:slug", [param("slug").matches(/^[a-z0-9-]+$/)], validate, asyncHandler(deleteProduct));
adminRoutes.get("/homepage-sections", asyncHandler(listHomepageSectionsAdmin));
adminRoutes.post("/homepage-sections", homepageSectionValidation(), validate, asyncHandler(upsertHomepageSection));
adminRoutes.patch("/homepage-sections/:key", [param("key").trim().matches(/^[a-z0-9-]+$/), ...homepageSectionValidation(true)], validate, asyncHandler(upsertHomepageSection));
adminRoutes.delete("/homepage-sections/:key", [param("key").trim().matches(/^[a-z0-9-]+$/)], validate, asyncHandler(deleteHomepageSection));
adminRoutes.get("/warranty-claims", asyncHandler(listWarrantyClaimsAdmin));
adminRoutes.get("/warranty-policy", asyncHandler(getWarrantyPolicyAdmin));
adminRoutes.put(
  "/warranty-policy",
  [
    body("title").optional().trim().isLength({ max: 120 }),
    body("url").trim().custom((value) => {
      if (/^\/uploads\/policies\/[a-z0-9-]+\.pdf$/i.test(value)) return true;
      throw new Error("Warranty policy must be an uploaded PDF file.");
    }),
    body("filename").optional().trim().isLength({ max: 240 }),
    body("originalName").optional().trim().isLength({ max: 240 }),
  ],
  validate,
  asyncHandler(updateWarrantyPolicy)
);
adminRoutes.patch("/warranty-claims/:id", [
  param("id").trim().isLength({ min: 3, max: 80 }),
  body("status").optional().isIn([...WARRANTY_STATUS, ...RMA_STATUS]),
  body("notes").optional().trim().isLength({ max: 2000 }),
  body("deliveryStatus").optional().isIn(DELIVERY_STATUS),
  body("deliveryNotes").optional().trim().isLength({ max: 1000 }),
], validate, asyncHandler(updateWarrantyStatus));
adminRoutes.post(
  "/ownership/website-purchase",
  [
    body("email").isEmail().normalizeEmail(),
    body("product").trim().isLength({ min: 2, max: 160 }),
    body("productSlug").optional().trim().matches(/^[a-z0-9-]+$/),
    body("serial").trim().isLength({ min: 3, max: 80 }),
    body("invoiceNumber").optional().trim().isLength({ max: 80 }),
    body("invoiceUrl").optional().trim().custom((value) => {
      if (!value) return true;
      if (/^https?:\/\//i.test(value)) return true;
      if (/^\/uploads\/warranty\/[a-z0-9-]+\.pdf$/i.test(value)) return true;
      throw new Error("Invoice must be an uploaded PDF file.");
    }),
    body("purchaseDate").optional().isISO8601().toDate(),
  ],
  validate,
  asyncHandler(createWebsitePurchaseOwnership)
);
adminRoutes.get("/support-tickets", asyncHandler(listSupportTicketsAdmin));
adminRoutes.patch("/support-tickets/:id/read", [param("id").trim().isLength({ min: 3, max: 80 })], validate, asyncHandler(markSupportTicketRead));
adminRoutes.patch("/support-tickets/:id/reply", [param("id").trim().isLength({ min: 3, max: 80 }), body("message").trim().isLength({ min: 2, max: 3000 }), body("status").optional().isIn(["Open", "In Progress", "Replied", "Resolved"])], validate, asyncHandler(replySupportTicket));
adminRoutes.post("/support-tickets/:id/reply", [param("id").trim().isLength({ min: 3, max: 80 }), body("message").trim().isLength({ min: 2, max: 3000 }), body("status").optional().isIn(["Open", "In Progress", "Replied", "Resolved", "Closed"])], validate, asyncHandler(replySupportTicket));

adminRoutes.get("/warranty", asyncHandler(listWarrantyClaimsAdmin));
adminRoutes.get("/support", asyncHandler(listSupportTicketsAdmin));
