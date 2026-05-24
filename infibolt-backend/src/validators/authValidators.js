import { body } from "express-validator";

export const emailField = body("email").isEmail().normalizeEmail();
export const strongPasswordField = body("password")
  .isStrongPassword({ minLength: 8, minSymbols: 1 })
  .withMessage("Password must be at least 8 characters and include a symbol.");

export const customerLoginValidator = [emailField, body("password").isLength({ min: 8 }).trim()];
export const customerSignupValidator = [
  body("name").trim().isLength({ min: 2, max: 120 }),
  emailField,
  body("phone").optional().trim().isLength({ min: 7, max: 20 }),
  strongPasswordField,
];
export const otpValidator = body("otp").trim().isLength({ min: 6, max: 6 });
