import { Router } from "express";
import { body, param } from "express-validator";
import {
  createLead,
  createSupportTicket,
  createWarrantyClaim,
  forgotPassword,
  getProduct,
  listCategories,
  getProfile,
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
  requestLoginOtp,
  replySupportTicket,
  resetPassword,
  signup,
  subscribeNewsletter,
  getSupportTicket,
  verifyWarrantyOtp,
  verifyLoginOtp,
  verifyOtp,
} from "../controllers/customerController.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { customerLoginValidator, customerSignupValidator, emailField, otpValidator, strongPasswordField } from "../validators/authValidators.js";
import { supportTicketValidator, warrantyClaimValidator } from "../validators/domainValidators.js";

export const customerRoutes = Router();

customerRoutes.post("/auth/login", authLimiter, customerLoginValidator, validate, asyncHandler(login));
customerRoutes.post("/auth/login/request-otp", authLimiter, customerLoginValidator, validate, asyncHandler(requestLoginOtp));
customerRoutes.post("/auth/login/verify-otp", authLimiter, [emailField, otpValidator], validate, asyncHandler(verifyLoginOtp));
customerRoutes.post("/auth/signup", authLimiter, customerSignupValidator, validate, asyncHandler(signup));
customerRoutes.post(
  "/auth/verify-otp",
  authLimiter,
  [...customerSignupValidator, otpValidator],
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
customerRoutes.get("/products/:slug", [param("slug").trim().matches(/^[a-z0-9-]+$/)], validate, asyncHandler(getProduct));
customerRoutes.get("/collections", asyncHandler(listCollections));
customerRoutes.get("/categories", asyncHandler(listCategories));
customerRoutes.get("/profile", requireAuth("customer"), asyncHandler(getProfile));

customerRoutes.post("/leads", [body("name").trim().isLength({ min: 2, max: 120 }), emailField, body("message").trim().isLength({ min: 5, max: 2000 })], validate, asyncHandler(createLead));
customerRoutes.post("/newsletter", [emailField], validate, asyncHandler(subscribeNewsletter));

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
customerRoutes.get("/warranty-claims/lookup/:serial", requireAuth("customer"), [param("serial").trim().isLength({ min: 3, max: 80 })], validate, asyncHandler(lookupWarranty));
customerRoutes.post(
  "/warranty-claims",
  warrantyClaimValidator,
  validate,
  asyncHandler(createWarrantyClaim)
);
customerRoutes.post("/warranty-claims/:id/verify-otp", [param("id").trim().isLength({ min: 3, max: 80 }), body("otp").trim().isLength({ min: 6, max: 6 })], validate, asyncHandler(verifyWarrantyOtp));

customerRoutes.get("/support", requireAuth("customer"), asyncHandler(listSupportTickets));
customerRoutes.post("/support", supportTicketValidator, validate, asyncHandler(createSupportTicket));
customerRoutes.get("/warranty", requireAuth("customer"), asyncHandler(listWarrantyClaims));
customerRoutes.post("/warranty", warrantyClaimValidator, validate, asyncHandler(createWarrantyClaim));
