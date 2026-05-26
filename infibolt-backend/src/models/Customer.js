import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 20 },
    address: { type: String, trim: true, maxlength: 240 },
    city: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 },
    passwordHash: { type: String, select: false },
    role: { type: String, default: "customer", enum: ["customer"] },
    status: { type: String, default: "Verified", enum: ["Pending", "Verified", "Locked"] },
    products: { type: Number, default: 0, min: 0 },
    tickets: { type: Number, default: 0, min: 0 },
    failedLoginCount: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerifiedAt: { type: Date },
    googleSub: { type: String, trim: true, select: false },
    avatarUrl: { type: String, trim: true, maxlength: 500 },
  },
  schemaDefaults
);

schema.index({ email: 1, status: 1 });
schema.index({ googleSub: 1 }, { unique: true, sparse: true });

export const Customer = mongoose.model("Customer", schema);
