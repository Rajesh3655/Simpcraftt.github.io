import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true, maxlength: 160, index: true },
    category: { type: String, required: true, trim: true, maxlength: 80, index: true },
    description: { type: String, trim: true, maxlength: 1200, default: "" },
    pdfUrl: { type: String, required: true, trim: true, maxlength: 500 },
    thumbnail: { type: String, trim: true, maxlength: 500, default: "" },
    featured: { type: Boolean, default: false, index: true },
    isVisible: { type: Boolean, default: true, index: true },
    uploadedBy: { type: String, trim: true, lowercase: true, maxlength: 180 },
  },
  schemaDefaults
);

schema.index({ productName: "text", category: "text", description: "text" });
schema.index({ isVisible: 1, featured: -1, createdAt: -1 });

export const Manual = mongoose.model("Manual", schema);
