import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 180, index: true },
    target: { type: String, lowercase: true, trim: true, maxlength: 180, index: true },
    purpose: { type: String, required: true, enum: ["signup", "login", "admin-login", "email-verification", "password-reset", "warranty"] },
    otpHash: { type: String, required: true, select: false },
    attempts: { type: Number, default: 0, min: 0, select: false },
    verified: { type: Boolean, default: false, index: true },
    resendCount: { type: Number, default: 0, min: 0 },
    consumedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    deliveredAt: { type: Date },
    deliveryStatus: { type: String, default: "pending", enum: ["pending", "sent", "failed"] },
    provider: { type: String, default: "local", trim: true, maxlength: 40 },
    ip: { type: String, trim: true, maxlength: 80 },
    userAgent: { type: String, trim: true, maxlength: 500 },
    metadata: { type: Object, default: {} },
  },
  schemaDefaults
);

schema.index({ email: 1, purpose: 1, createdAt: -1 });
schema.index({ target: 1, purpose: 1, createdAt: -1 });
schema.index({ ip: 1, purpose: 1, createdAt: -1 });

export const OTPRecord = mongoose.model("OTPRecord", schema);
