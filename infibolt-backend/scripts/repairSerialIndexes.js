import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { ProductOwnership } from "../src/models/ProductOwnership.js";
import { ProductUnit } from "../src/models/ProductUnit.js";
import { WarrantyClaim } from "../src/models/WarrantyClaim.js";

const models = [ProductOwnership, ProductUnit, WarrantyClaim];

async function dropSerialIndexIfPresent(Model) {
  const indexes = await Model.collection.indexes();
  const serialIndex = indexes.find((index) => index.name === "serial_1");
  if (!serialIndex) return;
  await Model.collection.dropIndex("serial_1");
  console.log(`[indexes] dropped ${Model.collection.name}.serial_1`);
}

try {
  await mongoose.connect(`${env.mongoUri}/${env.mongoDb}`, {
    serverSelectionTimeoutMS: 4000,
    autoIndex: false,
  });

  for (const Model of models) {
    await dropSerialIndexIfPresent(Model);
    await Model.syncIndexes();
    console.log(`[indexes] synced ${Model.collection.name}`);
  }
} finally {
  await mongoose.disconnect();
}
