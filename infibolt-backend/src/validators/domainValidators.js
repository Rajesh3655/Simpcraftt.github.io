import { body } from "express-validator";

export const supportTicketValidator = [
  body("customer").optional().trim().isLength({ max: 120 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("topic").trim().isLength({ min: 2, max: 120 }),
  body("message").trim().isLength({ min: 5, max: 3000 }),
  body("attachments").optional().isArray({ max: 5 }),
  body("attachments.*.url").optional().trim().custom((value) => {
    if (/^https?:\/\//i.test(value)) return true;
    if (/^\/uploads\/support\/[a-z0-9-]+\.(jpe?g|png|webp|gif|avif|pdf)$/i.test(value)) return true;
    throw new Error("Attachment must be an uploaded screenshot or PDF.");
  }),
  body("attachments.*.filename").optional().trim().isLength({ max: 240 }),
  body("attachments.*.type").optional().trim().isLength({ max: 120 }),
];

export const warrantyClaimValidator = [
  body("customer").optional().trim().isLength({ max: 120 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("ownershipId").optional().trim().isLength({ min: 3, max: 80 }),
  body("product").trim().isLength({ min: 2, max: 160 }),
  body("productSlug").optional().trim().matches(/^[a-z0-9-]+$/),
  body("serial").trim().isLength({ min: 3, max: 80 }),
  body("source").optional().isIn(["Website", "Amazon", "Flipkart", "Marketplace", "Retail", "Offline"]),
  body("sourceDetail").optional().trim().isLength({ max: 160 }),
  body("storeName").optional().trim().isLength({ max: 160 }),
  body("invoiceNumber").optional().trim().isLength({ max: 80 }),
  body("invoiceUrl").optional().trim().custom((value) => {
    if (!value) return true;
    if (/^https?:\/\//i.test(value)) return true;
    if (/^\/uploads\/warranty\/[a-z0-9-]+\.pdf$/i.test(value)) return true;
    if (/^\/uploads\/temp\/[a-z0-9-]+\.pdf$/i.test(value)) return true;
    throw new Error("Invoice must be an uploaded PDF file.");
  }),
  body("purchaseDate").optional().isISO8601().toDate(),
  body("policyAccepted").isBoolean().toBoolean(),
];

export const warrantyRmaValidator = [
  body("ownershipId").trim().isLength({ min: 3, max: 80 }),
  body("issueType").trim().isLength({ min: 2, max: 120 }),
  body("issueDescription").trim().isLength({ min: 5, max: 3000 }),
  body("attachments").isArray({ min: 1, max: 5 }),
  body("attachments.*.url").trim().custom((value) => {
    if (/^https?:\/\//i.test(value)) return true;
    if (/^\/uploads\/rma\/[a-z0-9-]+\.(jpe?g|png|webp|gif|avif)$/i.test(value)) return true;
    throw new Error("Product photo must be an uploaded image.");
  }),
  body("attachments.*.filename").optional().trim().isLength({ max: 240 }),
  body("attachments.*.type").optional().trim().isLength({ max: 120 }),
  body("policyAccepted").isBoolean().toBoolean(),
];
