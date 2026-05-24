import mongoose from "mongoose";
import { schemaDefaults } from "./base.js";

const schema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
  },
  schemaDefaults
);

export const Category = mongoose.model("Category", schema);
