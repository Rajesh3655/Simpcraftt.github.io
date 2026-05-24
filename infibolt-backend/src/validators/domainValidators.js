import { body } from "express-validator";

export const supportTicketValidator = [
  body("customer").optional().trim().isLength({ max: 120 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("topic").trim().isLength({ min: 2, max: 120 }),
  body("message").trim().isLength({ min: 5, max: 3000 }),
  body("attachments").optional().isArray({ max: 5 }),
];

export const warrantyClaimValidator = [
  body("customer").optional().trim().isLength({ max: 120 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("product").trim().isLength({ min: 2, max: 160 }),
  body("serial").trim().isLength({ min: 3, max: 80 }),
  body("invoiceNumber").optional().trim().isLength({ max: 80 }),
  body("invoiceUrl").optional().isURL({ require_protocol: true }),
  body("purchaseDate").optional().isISO8601().toDate(),
];
