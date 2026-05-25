import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    subtitle: { type: String, trim: true, maxlength: 500 },
    type: {
      type: String,
      required: true,
      enum: ["hero", "products", "collections", "categories", "banner", "spotlight"],
      index: true,
    },
    enabled: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    productSlugs: [{ type: String, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ }],
    categorySlugs: [{ type: String, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ }],
    collectionSlugs: [{ type: String, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ }],
    settings: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  },
  schemaDefaults
);

schema.index({ enabled: 1, sortOrder: 1, type: 1 });

export const HomepageSection = mongoose.model("HomepageSection", schema);
