import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true, lowercase: true },
    slug: { type: String, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    icon: { type: String, trim: true, maxlength: 80 },
    image: { type: String, trim: true, maxlength: 1000 },
    heroBanner: { type: String, trim: true, maxlength: 1000 },
    description: { type: String, trim: true, maxlength: 800 },
    enabled: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
    desktopMenuVisible: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    featuredProducts: [{ type: String, trim: true, lowercase: true, match: /^[a-z0-9-]+$/ }],
  },
  schemaDefaults
);

schema.pre("validate", function normalizeCategory() {
  this.slug = this.slug || this.id;
  this.id = this.id || this.slug;
});

schema.index({ enabled: 1, sortOrder: 1, name: 1 });

export const Category = mongoose.model("Category", schema);
