import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    role: { type: String, required: true, enum: ["customer", "admin"] },
    tokenHash: { type: String, required: true, unique: true, select: false },
    familyId: { type: String, required: true, index: true },
    replacedByHash: { type: String, select: false },
    revokedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    ip: { type: String, trim: true, maxlength: 80 },
    userAgent: { type: String, trim: true, maxlength: 500 },
  },
  schemaDefaults
);

schema.index({ userId: 1, role: 1, revokedAt: 1 });

export const RefreshToken = mongoose.model("RefreshToken", schema);
