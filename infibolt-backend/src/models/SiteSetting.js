import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  schemaDefaults
);

export const SiteSetting = mongoose.model("SiteSetting", schema);
