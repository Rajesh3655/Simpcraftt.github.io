import "../src/config/env.js";
import mongoose from "mongoose";
import { connectDatabase, seedDevelopmentData } from "../src/config/db.js";
import { AdminUser } from "../src/models/AdminUser.js";
import { Category } from "../src/models/Category.js";
import { Collection } from "../src/models/Collection.js";
import { Customer } from "../src/models/Customer.js";
import { FeatureToggle } from "../src/models/FeatureToggle.js";
import { Product } from "../src/models/Product.js";
import { SupportTicket } from "../src/models/SupportTicket.js";
import { WarrantyClaim } from "../src/models/WarrantyClaim.js";

const models = [Product, Category, Collection, Customer, SupportTicket, WarrantyClaim, FeatureToggle, AdminUser];

try {
  await connectDatabase();
  for (const Model of models) {
    await Model.deleteMany({});
  }
  await seedDevelopmentData();
  console.log("[seed] reset and seeded development data");
} finally {
  await mongoose.disconnect();
}
