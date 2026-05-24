import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    productSlugs: [{ type: String, trim: true }],
  },
  schemaDefaults
);

export const Collection = mongoose.model("Collection", schema);
