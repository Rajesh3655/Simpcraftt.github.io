import mongoose from "mongoose";
import { PRODUCT_VISIBILITY } from "../constants/status.js";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    collection: { type: String, trim: true, maxlength: 80 },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    badge: { type: String, default: "New", trim: true, maxlength: 40 },
    status: { type: String, default: "Draft", enum: PRODUCT_VISIBILITY, index: true },
    featured: { type: Boolean, default: false, index: true },
    visibility: { type: String, default: "public", enum: ["public", "private", "admin-only"], index: true },
    summary: { type: String, required: true, trim: true, maxlength: 500 },
    description: { type: String, trim: true, maxlength: 2000 },
    image: { type: String, trim: true, maxlength: 1000 },
    gallery: [{ type: String, trim: true, maxlength: 1000 }],
    variants: [{ type: String, trim: true, maxlength: 80 }],
    features: [{ type: String, trim: true, maxlength: 160 }],
    specs: { type: Map, of: String, default: {} },
    seo: {
      title: { type: String, trim: true, maxlength: 160 },
      description: { type: String, trim: true, maxlength: 300 },
      keywords: [{ type: String, trim: true, maxlength: 80 }],
    },
    marketplace: {
      amazon: { type: String, trim: true, maxlength: 1000 },
      flipkart: { type: String, trim: true, maxlength: 1000 },
      custom: { type: String, trim: true, maxlength: 1000 },
    },
  },
  schemaDefaults
);

schema.index({ name: "text", summary: "text", description: "text", category: "text" });
schema.index({ category: 1, collection: 1, status: 1, visibility: 1 });
schema.index({ price: 1, rating: -1 });

export const Product = mongoose.model("Product", schema);
