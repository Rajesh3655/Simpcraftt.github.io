import mongoose from "mongoose";
import { PRIORITIES, WARRANTY_STATUS } from "../constants/status.js";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    customer: { type: String, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, maxlength: 160 },
    product: { type: String, required: true, trim: true, maxlength: 160 },
    serial: { type: String, required: true, trim: true, maxlength: 80 },
    invoiceNumber: { type: String, trim: true, maxlength: 80 },
    invoiceUrl: { type: String, trim: true, maxlength: 1000 },
    otpVerifiedAt: { type: Date },
    purchaseDate: { type: Date },
    warrantyUntil: { type: Date },
    status: { type: String, default: "Verification", enum: WARRANTY_STATUS, index: true },
    priority: { type: String, default: "Normal", enum: PRIORITIES, index: true },
    notes: { type: String, trim: true, maxlength: 2000 },
    statusHistory: [
      {
        status: { type: String, enum: WARRANTY_STATUS },
        note: { type: String, trim: true, maxlength: 500 },
        actorEmail: { type: String, trim: true, maxlength: 160 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  schemaDefaults
);

schema.index({ serial: 1 }, { unique: true });
schema.index({ email: 1, status: 1, updatedAt: -1 });

export const WarrantyClaim = mongoose.model("WarrantyClaim", schema);
