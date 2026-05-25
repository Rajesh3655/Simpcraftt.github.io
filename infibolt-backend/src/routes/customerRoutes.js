import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createLead,
  createSupportTicket,
  createWarrantyClaim,
  createWarrantyRma,
  forgotPassword,
  getHomepageProducts,
  getProduct,
  getWarrantyPolicy,
  listCategories,
  getProfile,
  requestProfileContactUpdate,
  listFeaturedProducts,
  listCollections,
  listProducts,
  listSupportTickets,
  listWarrantyClaims,
  lookupWarranty,
  login,
  logout,
  me,
  refresh,
  requestLaunchNotification,
  requestLoginOtp,
  replySupportTicket,
  resetPassword,
  signup,
  subscribeNewsletter,
  getSupportTicket,
  updateProfile,
  verifyProfileContactUpdate,
  verifyWarrantyOtp,
  verifyLoginOtp,
  verifyOtp,
} from "../controllers/customerController.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { accountIdentifierField, customerLoginValidator, customerSignupValidator, emailField, otpValidator, strongPasswordField, verificationIdField } from "../validators/authValidators.js";
import { supportTicketValidator, warrantyClaimValidator, warrantyRmaValidator } from "../validators/domainValidators.js";

export const customerRoutes = Router();

customerRoutes.post("/auth/login", authLimiter, customerLoginValidator, validate, asyncHandler(login));
customerRoutes.post("/auth/login/request-otp", authLimiter, customerLoginValidator, validate, asyncHandler(requestLoginOtp));
customerRoutes.post("/auth/login/verify-otp", authLimiter, [accountIdentifierField, body("email").optional().isEmail().normalizeEmail(), otpValidator], validate, asyncHandler(verifyLoginOtp));
customerRoutes.post("/auth/signup", authLimiter, customerSignupValidator, validate, asyncHandler(signup));
customerRoutes.post(
  "/auth/verify-otp",
  authLimiter,
  [...customerSignupValidator, otpValidator, verificationIdField],
  validate,
  asyncHandler(verifyOtp)
);
customerRoutes.post("/auth/forgot-password", authLimiter, [emailField], validate, asyncHandler(forgotPassword));
customerRoutes.post("/auth/reset-password", authLimiter, [emailField, otpValidator, strongPasswordField], validate, asyncHandler(resetPassword));
customerRoutes.post("/auth/refresh", authLimiter, asyncHandler(refresh));
customerRoutes.post("/auth/logout", requireAuth("customer"), asyncHandler(logout));
customerRoutes.get("/auth/me", requireAuth("customer"), asyncHandler(me));

customerRoutes.get("/products", asyncHandler(listProducts));
customerRoutes.get("/products/featured", asyncHandler(listFeaturedProducts));
customerRoutes.get("/homepage", asyncHandler(getHomepageProducts));
customerRoutes.get("/products/:slug", [param("slug").trim().matches(/^[a-z0-9-]+$/)], validate, asyncHandler(getProduct));
customerRoutes.get("/warranty-policy", asyncHandler(getWarrantyPolicy));
customerRoutes.get("/collections", asyncHandler(listCollections));
customerRoutes.get("/categories", asyncHandler(listCategories));
customerRoutes.get("/profile", requireAuth("customer"), asyncHandler(getProfile));
customerRoutes.patch(
  "/profile",
  requireAuth("customer"),
  [
    body("name").optional({ nullable: true }).trim().isLength({ min: 2, max: 120 }),
    body("address").optional({ nullable: true }).trim().isLength({ max: 240 }),
    body("city").optional({ nullable: true }).trim().isLength({ max: 80 }),
    body("state").optional({ nullable: true }).trim().isLength({ max: 80 }),
  ],
  validate,
  asyncHandler(updateProfile)
);
customerRoutes.post(
  "/profile/contact-update",
  requireAuth("customer"),
  [
    body("email").optional({ nullable: true }).isEmail().normalizeEmail(),
    body("phone").optional({ nullable: true }).trim().isLength({ min: 8, max: 20 }),
  ],
  validate,
  asyncHandler(requestProfileContactUpdate)
);
customerRoutes.post(
  "/profile/contact-update/verify",
  requireAuth("customer"),
  [
    body("email").optional({ nullable: true }).isEmail().normalizeEmail(),
    body("phone").optional({ nullable: true }).trim().isLength({ min: 8, max: 20 }),
    body("verificationId").trim().isLength({ min: 12, max: 80 }),
    body("otp").trim().isLength({ min: 6, max: 6 }),
  ],
  validate,
  asyncHandler(verifyProfileContactUpdate)
);

customerRoutes.post("/leads", [body("name").trim().isLength({ min: 2, max: 120 }), emailField, body("message").trim().isLength({ min: 5, max: 2000 })], validate, asyncHandler(createLead));
customerRoutes.post(
  "/launch-notify",
  [
    body("product").trim().isLength({ min: 2, max: 160 }),
    body("productSlug").trim().matches(/^[a-z0-9-]+$/),
    body("email").optional({ nullable: true }).isEmail().normalizeEmail(),
    body("phone").optional({ nullable: true }).trim().isLength({ min: 8, max: 20 }),
    body("source").optional({ nullable: true }).trim().isLength({ max: 120 }),
  ],
  validate,
  asyncHandler(requestLaunchNotification)
);
customerRoutes.post("/newsletter", [emailField, body("source").optional({ nullable: true }).trim().isLength({ max: 80 })], validate, asyncHandler(subscribeNewsletter));

customerRoutes.get("/support-tickets", requireAuth("customer"), asyncHandler(listSupportTickets));
customerRoutes.get("/support-tickets/:id", requireAuth("customer"), [param("id").trim().isLength({ min: 3, max: 80 })], validate, asyncHandler(getSupportTicket));
customerRoutes.post("/support-tickets/:id/replies", requireAuth("customer"), [param("id").trim().isLength({ min: 3, max: 80 }), body("message").trim().isLength({ min: 2, max: 3000 })], validate, asyncHandler(replySupportTicket));
customerRoutes.post(
  "/support-tickets",
  supportTicketValidator,
  validate,
  asyncHandler(createSupportTicket)
);

customerRoutes.get("/warranty-claims", requireAuth("customer"), asyncHandler(listWarrantyClaims));
customerRoutes.get(
  "/warranty-claims/lookup/:serial",
  requireAuth("customer"),
  [param("serial").trim().isLength({ min: 3, max: 80 }), query("productSlug").optional().trim().matches(/^[a-z0-9-]+$/)],
  validate,
  asyncHandler(lookupWarranty)
);
customerRoutes.post(
  "/warranty-claims",
  requireAuth("customer"),
  warrantyClaimValidator,
  validate,
  asyncHandler(createWarrantyClaim)
);
customerRoutes.post("/warranty-claims/:id/verify-otp", requireAuth("customer"), [param("id").trim().isLength({ min: 3, max: 80 }), body("otp").trim().isLength({ min: 6, max: 6 })], validate, asyncHandler(verifyWarrantyOtp));
customerRoutes.post("/warranty-claims/rma", requireAuth("customer"), warrantyRmaValidator, validate, asyncHandler(createWarrantyRma));

customerRoutes.get("/support", requireAuth("customer"), asyncHandler(listSupportTickets));
customerRoutes.post("/support", supportTicketValidator, validate, asyncHandler(createSupportTicket));
customerRoutes.get("/warranty", requireAuth("customer"), asyncHandler(listWarrantyClaims));
customerRoutes.post("/warranty", requireAuth("customer"), warrantyClaimValidator, validate, asyncHandler(createWarrantyClaim));
