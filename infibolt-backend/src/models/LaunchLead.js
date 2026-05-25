import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    product: { type: String, trim: true, maxlength: 160 },
    productSlug: { type: String, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ },
    email: { type: String, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 20 },
    channel: { type: String, default: "Web", trim: true, maxlength: 40 },
    source: { type: String, default: "Product page", trim: true, maxlength: 120 },
    status: { type: String, default: "Subscribed", enum: ["Subscribed", "Contacted", "Converted", "Unsubscribed"], index: true },
  },
  schemaDefaults
);

schema.index({ productSlug: 1, email: 1 });
schema.index({ productSlug: 1, phone: 1 });
schema.index({ updatedAt: -1 });

export const LaunchLead = mongoose.model("LaunchLead", schema);
