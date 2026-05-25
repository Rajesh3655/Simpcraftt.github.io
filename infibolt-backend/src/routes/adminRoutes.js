import { Router } from "express";
import { body, param } from "express-validator";
import {
  adminLogin,
  adminLogout,
  adminMe,
  adminRefresh,
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
  listWarrantyClaimsAdmin,
  overview,
  reorderProducts,
  replySupportTicket,
  settings,
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
import { RMA_STATUS, WARRANTY_STATUS } from "../constants/status.js";

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
  if (/^https?:\/\//i.test(value)) return true;
  throw new Error("Must be a valid URL.");
};

const productValidation = (partial = false) => {
  const optional = partial ? { nullable: true } : false;
  const field = (name) => (partial ? body(name).optional(optional) : body(name));
  return [
    field("name").trim().isLength({ min: 2, max: 120 }),
    body("slug").optional({ nullable: true }).trim().matches(/^[a-z0-9-]+$/),
    field("category").trim().isLength({ min: 2, max: 60 }),
    body("categorySlug").optional({ nullable: true }).trim().matches(/^[a-z0-9-]+$/),
    body("collection").optional({ nullable: true }).trim().isLength({ max: 80 }),
    body("collectionSlug").optional({ nullable: true }).trim().matches(/^[a-z0-9-]+$/),
    body("sku").optional({ nullable: true }).trim().isLength({ max: 80 }),
    body("serialPrefix").optional({ nullable: true }).trim().isLength({ max: 30 }),
    field("price").isFloat({ min: 0 }).toFloat(),
    body("comparePrice").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
    body("stock").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
    body("rating").optional({ nullable: true }).isFloat({ min: 0, max: 5 }).toFloat(),
    body("reviewCount").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
    body("badge").optional({ nullable: true }).trim().isLength({ max: 40 }),
    body("status").optional({ nullable: true }).isIn(["Draft", "Preview", "Ready", "Published", "Prototype", "Archived", "Hidden", "Out of Stock", "Upcoming", "Discontinued"]),
    body("featured").optional({ nullable: true }).isBoolean().toBoolean(),
    body("newLaunch").optional({ nullable: true }).isBoolean().toBoolean(),
    body("bestseller").optional({ nullable: true }).isBoolean().toBoolean(),
    body("trending").optional({ nullable: true }).isBoolean().toBoolean(),
    body("homepageVisible").optional({ nullable: true }).isBoolean().toBoolean(),
    body("heroVisible").optional({ nullable: true }).isBoolean().toBoolean(),
    body("collectionVisible").optional({ nullable: true }).isBoolean().toBoolean(),
    body("productPageVisible").optional({ nullable: true }).isBoolean().toBoolean(),
    body("mobileFeatured").optional({ nullable: true }).isBoolean().toBoolean(),
    body("supportWarrantyEnabled").optional({ nullable: true }).isBoolean().toBoolean(),
    body("sortOrder").optional({ nullable: true }).isInt().toInt(),
    body("visibility").optional({ nullable: true }).isIn(["public", "private", "admin-only"]),
    field("summary").trim().isLength({ min: 5, max: 500 }),
    body("shortDescription").optional({ nullable: true }).trim().isLength({ max: 500 }),
    body("description").optional({ nullable: true }).trim().isLength({ max: 2000 }),
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
    body("features.*").optional({ nullable: true }).trim().isLength({ max: 180 }),
    body("highlights").optional({ nullable: true }).isArray({ max: 20 }),
    body("highlights.*").optional({ nullable: true }).trim().isLength({ max: 180 }),
    body("specifications").optional({ nullable: true }).isArray({ max: 40 }),
    body("featureBlocks").optional({ nullable: true }).isArray({ max: 12 }),
    body("recommendations").optional({ nullable: true }).isArray({ max: 12 }),
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
    body("marketplace.amazon").optional({ nullable: true }).custom(urlOrEmpty),
    body("marketplace.flipkart").optional({ nullable: true }).custom(urlOrEmpty),
    body("marketplace.croma").optional({ nullable: true }).custom(urlOrEmpty),
    body("marketplace.relianceDigital").optional({ nullable: true }).custom(urlOrEmpty),
    body("marketplace.retail").optional({ nullable: true }).custom(uploadedOrUrl),
    body("marketplace.custom").optional({ nullable: true }).custom(urlOrEmpty),
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

adminRoutes.post("/auth/login", authLimiter, [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 8 }).trim()], validate, asyncHandler(adminLogin));
adminRoutes.post("/auth/refresh", authLimiter, asyncHandler(adminRefresh));
adminRoutes.post("/auth/logout", protectAdmin, asyncHandler(adminLogout));
adminRoutes.get("/auth/me", protectAdmin, asyncHandler(adminMe));

adminRoutes.use(protectAdmin);
adminRoutes.get("/overview", asyncHandler(overview));
adminRoutes.get("/analytics", asyncHandler(analytics));
adminRoutes.get("/settings", asyncHandler(settings));
adminRoutes.get("/users", asyncHandler(listUsers));
adminRoutes.get("/users/export", asyncHandler(exportUsers));
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
adminRoutes.patch("/warranty-claims/:id", [param("id").trim().isLength({ min: 3, max: 80 }), body("status").optional().isIn([...WARRANTY_STATUS, ...RMA_STATUS]), body("priority").optional().isIn(["Low", "Normal", "High", "Urgent"]), body("notes").optional().trim().isLength({ max: 2000 })], validate, asyncHandler(updateWarrantyStatus));
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
adminRoutes.patch("/support-tickets/:id/reply", [param("id").trim().isLength({ min: 3, max: 80 }), body("message").trim().isLength({ min: 2, max: 3000 }), body("status").optional().isIn(["Open", "In Progress", "Replied", "Resolved"])], validate, asyncHandler(replySupportTicket));
adminRoutes.post("/support-tickets/:id/reply", [param("id").trim().isLength({ min: 3, max: 80 }), body("message").trim().isLength({ min: 2, max: 3000 }), body("status").optional().isIn(["Open", "In Progress", "Replied", "Resolved", "Closed"])], validate, asyncHandler(replySupportTicket));

adminRoutes.get("/warranty", asyncHandler(listWarrantyClaimsAdmin));
adminRoutes.get("/support", asyncHandler(listSupportTicketsAdmin));
