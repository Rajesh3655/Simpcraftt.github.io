import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    actorEmail: { type: String, trim: true, maxlength: 160 },
    actorRole: { type: String, trim: true, maxlength: 40 },
    event: { type: String, required: true, trim: true, maxlength: 160 },
    ip: { type: String, trim: true, maxlength: 80 },
    userAgent: { type: String, trim: true, maxlength: 500 },
    requestId: { type: String, trim: true, maxlength: 120 },
    metadata: { type: Object, default: {} },
  },
  schemaDefaults
);

export const AuditLog = mongoose.model("AuditLog", schema);
