import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1200 },
    image: { type: String, trim: true, maxlength: 1000 },
    heroBanner: { type: String, trim: true, maxlength: 1000 },
    enabled: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
    homepageVisible: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    productSlugs: [{ type: String, trim: true }],
  },
  schemaDefaults
);

schema.index({ enabled: 1, homepageVisible: -1, featured: -1, sortOrder: 1 });

export const Collection = mongoose.model("Collection", schema);
