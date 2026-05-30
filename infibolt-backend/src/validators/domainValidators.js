import { body } from "express-validator";
import { OWNERSHIP_SOURCE } from "../constants/status.js";

const uploadFilenamePattern = "[0-9]+-[0-9a-f-]+-[a-z0-9-]+";

function uploadedFilePattern(folder, extensions) {
  return new RegExp(`^/uploads/${folder}/${uploadFilenamePattern}\\.(${extensions})$`, "i");
}

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
  body("source").optional().isIn(OWNERSHIP_SOURCE),
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
  body("purchaseDate").exists({ checkFalsy: true }).withMessage("Purchase date is required.").bail().isISO8601().withMessage("Enter a valid purchase date.").toDate(),
  body("policyAccepted").isBoolean().toBoolean(),
];

export const warrantyRmaValidator = [
  body("ownershipId").trim().isLength({ min: 3, max: 80 }),
  body("issueType").trim().isLength({ min: 2, max: 120 }),
  body("issueDescription").trim().isLength({ min: 5, max: 3000 }),
  body("attachments").isArray({ min: 1, max: 5 }),
  body("attachments.*.url").trim().custom((value) => {
    if (/^https?:\/\//i.test(value)) return true;
    if (uploadedFilePattern("rma", "jpe?g|png|webp|gif|avif").test(value)) return true;
    throw new Error("Product photo must be an uploaded image.");
  }),
  body("attachments.*.filename").optional().trim().isLength({ max: 240 }),
  body("attachments.*.type").optional().trim().isLength({ max: 120 }),
  body("policyAccepted").isBoolean().toBoolean(),
  body("customerAddress.name").trim().isLength({ min: 2, max: 120 }),
  body("customerAddress.phone")
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10 digit Indian mobile number."),
  body("customerAddress.line1").trim().isLength({ min: 5, max: 180 }),
  body("customerAddress.line2").optional().trim().isLength({ max: 180 }),
  body("customerAddress.city").trim().isLength({ min: 2, max: 80 }),
  body("customerAddress.state").trim().isLength({ min: 2, max: 80 }),
  body("customerAddress.postalCode")
    .trim()
    .matches(/^[1-9]\d{5}$/)
    .withMessage("Enter a valid 6 digit PIN code."),
];

export const warrantyShipmentValidator = [
  body("courierName").trim().isLength({ min: 2, max: 120 }),
  body("trackingId").trim().isLength({ min: 3, max: 120 }),
  body("notes").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 500 }),
];
