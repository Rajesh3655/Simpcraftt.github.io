import mongoose from "mongoose";
import { OWNERSHIP_SOURCE, OWNERSHIP_STATUS, WARRANTY_STATUS } from "../constants/status.js";
import { schemaDefaults } from "./base.js";

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, trim: true, maxlength: 80 },
    note: { type: String, trim: true, maxlength: 500 },
    actorEmail: { type: String, trim: true, maxlength: 160 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true },
    customerName: { type: String, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160, index: true },
    phone: { type: String, trim: true, maxlength: 20 },
    productSlug: { type: String, trim: true, lowercase: true, maxlength: 120 },
    product: { type: String, required: true, trim: true, maxlength: 160 },
    serial: { type: String, required: true, uppercase: true, trim: true, maxlength: 80 },
    source: { type: String, default: "Website", enum: OWNERSHIP_SOURCE },
    sourceDetail: { type: String, trim: true, maxlength: 160 },
    invoiceNumber: { type: String, trim: true, maxlength: 80 },
    invoiceUrl: { type: String, trim: true, maxlength: 1000 },
    purchaseDate: { type: Date },
    registeredAt: { type: Date, default: Date.now },
    otpVerifiedAt: { type: Date },
    verifiedAt: { type: Date },
    rejectedAt: { type: Date },
    warrantyStart: { type: Date },
    warrantyUntil: { type: Date },
    warrantyStatus: { type: String, default: "Pending Verification", enum: WARRANTY_STATUS, index: true },
    status: { type: String, default: "Pending Verification", enum: OWNERSHIP_STATUS, index: true },
    reviewNote: { type: String, trim: true, maxlength: 1000 },
    timeline: [timelineSchema],
  },
  schemaDefaults
);

schema.index({ productSlug: 1, serial: 1 }, { unique: true });
schema.index({ serial: 1 });
schema.index({ email: 1, status: 1, updatedAt: -1 });
schema.index({ customerId: 1, status: 1, updatedAt: -1 });

export const ProductOwnership = mongoose.model("ProductOwnership", schema);
