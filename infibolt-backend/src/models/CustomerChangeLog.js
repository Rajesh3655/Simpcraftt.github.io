import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    field: { type: String, required: true, trim: true, maxlength: 80 },
    previousValue: { type: String, trim: true, maxlength: 240 },
    nextValue: { type: String, trim: true, maxlength: 240 },
    verified: { type: Boolean, default: false },
    actorEmail: { type: String, trim: true, lowercase: true, maxlength: 160 },
    ip: { type: String, trim: true, maxlength: 80 },
    userAgent: { type: String, trim: true, maxlength: 300 },
  },
  schemaDefaults
);

schema.index({ customerId: 1, createdAt: -1 });

export const CustomerChangeLog = mongoose.model("CustomerChangeLog", schema);
