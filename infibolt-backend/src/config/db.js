import mongoose from "mongoose";
import { env } from "./env.js";
import {
  categories,
  collections,
  customers,
  featureToggles,
  products,
  supportTickets,
  warrantyClaims,
} from "../data/seed.js";
import { hashPassword } from "../utils/crypto.js";
import { AdminUser } from "../models/AdminUser.js";
import { Category } from "../models/Category.js";
import { Collection } from "../models/Collection.js";
import { Customer } from "../models/Customer.js";
import { FeatureToggle } from "../models/FeatureToggle.js";
import { Product } from "../models/Product.js";
import { SupportTicket } from "../models/SupportTicket.js";
import { WarrantyClaim } from "../models/WarrantyClaim.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoConnectionString(), {
    serverSelectionTimeoutMS: 4000,
    autoIndex: env.nodeEnv !== "production",
  });
  if (!env.isProduction || env.allowProductionSeed) {
    await seedDevelopmentData();
  }
  if (!env.isProduction) {
    console.info(`[db] Mongoose connected: ${env.mongoDb}`);
  }
}

export function mongoConnectionString() {
  const uri = env.mongoUri.trim();
  if (!uri) {
    throw new Error("Missing MONGODB_URI.");
  }
  if (!env.mongoDb) return uri;

  try {
    const parsed = new URL(uri);
    if (parsed.pathname && parsed.pathname !== "/") return uri;
    parsed.pathname = `/${env.mongoDb}`;
    return parsed.toString();
  } catch {
    const [base, query] = uri.split("?", 2);
    const normalizedBase = base.replace(/\/+$/, "");
    return `${normalizedBase}/${env.mongoDb}${query ? `?${query}` : ""}`;
  }
}

export async function seedDevelopmentData() {
  const customerPasswordHash = await hashPassword(env.customerPassword);
  const seededCustomers = customers.map((customer) => ({ ...customer, passwordHash: customerPasswordHash }));
  const seed = [
    [Product, products],
    [Category, categories],
    [Collection, collections],
    [Customer, seededCustomers],
    [SupportTicket, supportTickets],
    [WarrantyClaim, warrantyClaims],
    [FeatureToggle, featureToggles],
  ];

  for (const [Model, items] of seed) {
    if ((await Model.estimatedDocumentCount()) === 0) {
      await Model.insertMany(items);
    }
  }

  if ((await AdminUser.estimatedDocumentCount()) === 0) {
    await AdminUser.create({
      name: "INFIBOLT Admin",
      email: env.adminEmail,
      passwordHash: await hashPassword(env.adminPassword),
      permissions: ["products:write", "support:write", "warranty:write", "users:read", "analytics:read"],
      status: "Verified",
    });
  }

  await Customer.updateMany({ passwordHash: { $exists: false } }, { $set: { passwordHash: customerPasswordHash } });
}

export function dbStatus() {
  return {
    mode: "mongoose",
    database: env.mongoDb,
    readyState: mongoose.connection.readyState,
  };
}
