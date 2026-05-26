import mongoose from "mongoose";
import { PRIORITIES, SUPPORT_STATUS } from "../constants/status.js";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    customer: { type: String, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, maxlength: 160 },
    topic: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 3000 },
    status: { type: String, default: "Open", enum: SUPPORT_STATUS, index: true },
    priority: { type: String, default: "Normal", enum: PRIORITIES, index: true },
    channel: { type: String, default: "Web", trim: true, maxlength: 40 },
    lastReply: { type: String, trim: true, maxlength: 3000 },
    attachments: [
      {
        url: { type: String, trim: true, maxlength: 1000 },
        filename: { type: String, trim: true, maxlength: 240 },
        type: { type: String, trim: true, maxlength: 120 },
      },
    ],
    replies: [
      {
        authorName: { type: String, trim: true, maxlength: 120 },
        authorRole: { type: String, enum: ["customer", "admin"], default: "customer" },
        message: { type: String, required: true, trim: true, maxlength: 3000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  schemaDefaults
);

schema.index({ email: 1, status: 1, updatedAt: -1 });
schema.index({ id: 1, email: 1 });

export const SupportTicket = mongoose.model("SupportTicket", schema);
