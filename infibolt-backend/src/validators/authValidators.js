import { body } from "express-validator";

export const emailField = body("email").isEmail().normalizeEmail();
export const accountIdentifierField = body("identifier")
  .optional()
  .trim()
  .custom((value) => {
    const normalized = String(value || "").trim();
    const phone = normalized.replace(/\D/g, "");
    if (/^\S+@\S+\.\S+$/.test(normalized) || /^[1-9]\d{7,14}$/.test(phone)) return true;
    throw new Error("Enter a valid email address or phone number.");
  });
export const strongPasswordField = body("password")
  .isStrongPassword({ minLength: 8, minSymbols: 1 })
  .withMessage("Password must be at least 8 characters and include a symbol.");

export const customerLoginValidator = [
  accountIdentifierField,
  body("email").optional().trim(),
  body("password").isLength({ min: 8 }).trim(),
];
export const customerSignupValidator = [
  body("name").trim().isLength({ min: 2, max: 120 }),
  emailField,
  body("phone").trim().custom((value) => {
    const phone = String(value || "").replace(/\D/g, "");
    if (/^[1-9]\d{7,14}$/.test(phone)) return true;
    throw new Error("Enter a valid phone number.");
  }),
  strongPasswordField,
];
export const otpValidator = body("otp").trim().isLength({ min: 6, max: 6 });
export const verificationIdField = body("verificationId").optional().trim().isLength({ min: 12, max: 80 });
