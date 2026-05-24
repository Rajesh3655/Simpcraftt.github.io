import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true, maxlength: 120 },
    enabled: { type: Boolean, default: false },
  },
  schemaDefaults
);

export const FeatureToggle = mongoose.model("FeatureToggle", schema);
