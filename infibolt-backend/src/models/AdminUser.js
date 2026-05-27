import mongoose from "mongoose";
import { ADMIN_ROLES } from "../constants/roles.js";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    passwordHash: { type: String, select: false },
    role: { type: String, default: "admin", enum: ADMIN_ROLES },
    status: { type: String, default: "Verified", enum: ["Verified", "Locked"] },
    permissions: [{ type: String, trim: true, maxlength: 80 }],
    googleSub: { type: String, trim: true, select: false },
    avatarUrl: { type: String, trim: true, maxlength: 500 },
    failedLoginCount: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
  },
  schemaDefaults
);

schema.index({ role: 1, status: 1 });
schema.index({ googleSub: 1 }, { unique: true, sparse: true });

export const AdminUser = mongoose.model("AdminUser", schema);
