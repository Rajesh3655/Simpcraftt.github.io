import mongoose from "mongoose";
import { PRODUCT_UNIT_STATUS } from "../constants/status.js";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    serial: { type: String, required: true, uppercase: true, trim: true, maxlength: 80 },
    productSlug: { type: String, required: true, lowercase: true, trim: true, maxlength: 120 },
    productName: { type: String, required: true, trim: true, maxlength: 160 },
    batch: { type: String, trim: true, maxlength: 80 },
    manufactureDate: { type: Date },
    status: { type: String, default: "Manufactured", enum: PRODUCT_UNIT_STATUS, index: true },
    soldAt: { type: Date },
    soldChannel: { type: String, trim: true, maxlength: 80 },
    ownerCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    ownerEmail: { type: String, trim: true, lowercase: true, maxlength: 160, index: true },
    blockedReason: { type: String, trim: true, maxlength: 500 },
  },
  schemaDefaults
);

schema.index({ productSlug: 1, serial: 1 }, { unique: true });
schema.index({ productSlug: 1, status: 1 });
schema.index({ ownerCustomerId: 1, status: 1 });

export const ProductUnit = mongoose.model("ProductUnit", schema);
