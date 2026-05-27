import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    email: { type: String, trim: true, lowercase: true, maxlength: 160 },
    provider: { type: String, default: "google", enum: ["google"] },
    status: { type: String, required: true, enum: ["success", "failure"] },
    reason: { type: String, trim: true, maxlength: 240 },
    ip: { type: String, trim: true, maxlength: 80 },
    userAgent: { type: String, trim: true, maxlength: 500 },
    requestId: { type: String, trim: true, maxlength: 120 },
    loggedInAt: { type: Date, default: Date.now },
  },
  schemaDefaults
);

schema.index({ email: 1, loggedInAt: -1 });
schema.index({ status: 1, loggedInAt: -1 });

export const AdminLoginLog = mongoose.model("AdminLoginLog", schema);
