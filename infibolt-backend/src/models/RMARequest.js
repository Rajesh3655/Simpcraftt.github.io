import mongoose from "mongoose";
import { PRIORITIES, RMA_STATUS } from "../constants/status.js";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    ownershipId: { type: String, required: true, trim: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true },
    customerName: { type: String, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160, index: true },
    product: { type: String, required: true, trim: true, maxlength: 160 },
    serial: { type: String, required: true, uppercase: true, trim: true, maxlength: 80 },
    issueType: { type: String, required: true, trim: true, maxlength: 120 },
    issueDescription: { type: String, trim: true, maxlength: 3000 },
    attachments: [
      {
        url: { type: String, trim: true, maxlength: 1000 },
        filename: { type: String, trim: true, maxlength: 240 },
        type: { type: String, trim: true, maxlength: 120 },
      },
    ],
    status: { type: String, default: "Requested", enum: RMA_STATUS, index: true },
    priority: { type: String, default: "Normal", enum: PRIORITIES, index: true },
    policyDecision: { type: String, trim: true, maxlength: 160 },
    notes: { type: String, trim: true, maxlength: 2000 },
    timeline: [
      {
        status: { type: String, enum: RMA_STATUS },
        note: { type: String, trim: true, maxlength: 500 },
        actorEmail: { type: String, trim: true, maxlength: 160 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  schemaDefaults
);

schema.index({ serial: 1, status: 1 });
schema.index({ email: 1, updatedAt: -1 });

export const RMARequest = mongoose.model("RMARequest", schema);
