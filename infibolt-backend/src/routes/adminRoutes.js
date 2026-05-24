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
  deleteProduct,
  listAdminProducts,
  listCategoriesAdmin,
  listCollectionsAdmin,
  listSupportTicketsAdmin,
  listUsers,
  listWarrantyClaimsAdmin,
  overview,
  replySupportTicket,
  settings,
  updateProduct,
  updateWarrantyStatus,
} from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ADMIN_ROLES } from "../constants/roles.js";

export const adminRoutes = Router();

const protectAdmin = requireAuth(ADMIN_ROLES);
const productValidation = (partial = false) => {
  const optional = partial ? { nullable: true } : false;
  const field = (name) => (partial ? body(name).optional(optional) : body(name));
  return [
    field("name").trim().isLength({ min: 2, max: 120 }),
    body("slug").optional({ nullable: true }).trim().matches(/^[a-z0-9-]+$/),
    field("category").trim().isLength({ min: 2, max: 60 }),
    body("collection").optional({ nullable: true }).trim().isLength({ max: 80 }),
    field("price").isFloat({ min: 0 }).toFloat(),
    body("rating").optional({ nullable: true }).isFloat({ min: 0, max: 5 }).toFloat(),
    body("reviewCount").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
    body("badge").optional({ nullable: true }).trim().isLength({ max: 40 }),
    body("status").optional({ nullable: true }).isIn(["Draft", "Preview", "Ready", "Published", "Prototype", "Archived"]),
    body("featured").optional({ nullable: true }).isBoolean().toBoolean(),
    body("visibility").optional({ nullable: true }).isIn(["public", "private", "admin-only"]),
    field("summary").trim().isLength({ min: 5, max: 500 }),
    body("description").optional({ nullable: true }).trim().isLength({ max: 2000 }),
    body("image").optional({ nullable: true }).isURL({ require_protocol: true }),
    body("gallery").optional({ nullable: true }).isArray({ max: 10 }),
    body("variants").optional({ nullable: true }).isArray({ max: 20 }),
    body("features").optional({ nullable: true }).isArray({ max: 20 }),
    body("seo.title").optional({ nullable: true }).trim().isLength({ max: 160 }),
    body("seo.description").optional({ nullable: true }).trim().isLength({ max: 300 }),
    body("seo.keywords").optional({ nullable: true }).isArray({ max: 20 }),
    body("marketplace.amazon").optional({ nullable: true }).isURL({ require_protocol: true }),
    body("marketplace.flipkart").optional({ nullable: true }).isURL({ require_protocol: true }),
    body("marketplace.custom").optional({ nullable: true }).isURL({ require_protocol: true }),
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
adminRoutes.get("/categories", asyncHandler(listCategoriesAdmin));
adminRoutes.post("/categories", [body("id").trim().matches(/^[a-z0-9-]+$/), body("name").trim().isLength({ min: 2, max: 120 })], validate, asyncHandler(createCategory));
adminRoutes.get("/collections", asyncHandler(listCollectionsAdmin));
adminRoutes.post("/collections", [body("slug").trim().matches(/^[a-z0-9-]+$/), body("name").trim().isLength({ min: 2, max: 120 }), body("productSlugs").optional().isArray({ max: 100 })], validate, asyncHandler(createCollection));
adminRoutes.get("/products", asyncHandler(listAdminProducts));
adminRoutes.post("/products", productValidation(), validate, asyncHandler(createProduct));
adminRoutes.put("/products/:slug", [param("slug").matches(/^[a-z0-9-]+$/), ...productValidation(true)], validate, asyncHandler(updateProduct));
adminRoutes.patch("/products/:slug", [param("slug").matches(/^[a-z0-9-]+$/), ...productValidation(true)], validate, asyncHandler(updateProduct));
adminRoutes.delete("/products/:slug", [param("slug").matches(/^[a-z0-9-]+$/)], validate, asyncHandler(deleteProduct));
adminRoutes.get("/warranty-claims", asyncHandler(listWarrantyClaimsAdmin));
adminRoutes.patch("/warranty-claims/:id", [param("id").trim().isLength({ min: 3, max: 80 }), body("status").optional().isIn(["Verification", "Approved", "Rejected", "Pending Invoice", "Resolved"]), body("priority").optional().isIn(["Low", "Normal", "High", "Urgent"]), body("notes").optional().trim().isLength({ max: 2000 })], validate, asyncHandler(updateWarrantyStatus));
adminRoutes.get("/support-tickets", asyncHandler(listSupportTicketsAdmin));
adminRoutes.patch("/support-tickets/:id/reply", [param("id").trim().isLength({ min: 3, max: 80 }), body("message").trim().isLength({ min: 2, max: 3000 }), body("status").optional().isIn(["Open", "In Progress", "Replied", "Resolved"])], validate, asyncHandler(replySupportTicket));
adminRoutes.post("/support-tickets/:id/reply", [param("id").trim().isLength({ min: 3, max: 80 }), body("message").trim().isLength({ min: 2, max: 3000 }), body("status").optional().isIn(["Open", "In Progress", "Replied", "Resolved", "Closed"])], validate, asyncHandler(replySupportTicket));

adminRoutes.get("/warranty", asyncHandler(listWarrantyClaimsAdmin));
adminRoutes.get("/support", asyncHandler(listSupportTicketsAdmin));
