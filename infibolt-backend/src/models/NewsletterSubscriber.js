import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    status: { type: String, default: "Subscribed", enum: ["Subscribed", "Unsubscribed"], index: true },
    source: { type: String, default: "Footer", trim: true, maxlength: 80 },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
    ipHash: { type: String, select: false },
    userAgent: { type: String, maxlength: 300, select: false },
  },
  schemaDefaults
);

schema.index({ status: 1, updatedAt: -1 });

export const NewsletterSubscriber = mongoose.model("NewsletterSubscriber", schema);
