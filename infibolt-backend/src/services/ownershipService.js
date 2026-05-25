import { Product } from "../models/Product.js";
import { ProductOwnership } from "../models/ProductOwnership.js";
import { ProductUnit } from "../models/ProductUnit.js";
import { RMARequest } from "../models/RMARequest.js";
import { createHttpError } from "../utils/httpError.js";

export function normalizeSerial(serial) {
  return String(serial || "").trim().toUpperCase();
}

export function normalizeProductSlug(product, productSlug) {
  const slug = String(productSlug || "").trim().toLowerCase();
  if (slug) return slug;
  return String(product || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function assertValidSerial(serial) {
  const normalized = normalizeSerial(serial);
  if (normalized.length < 3 || normalized.length > 80) {
    throw createHttpError(422, "Enter a valid INFIBOLT serial number.", {
      fields: { serial: "Enter the serial number printed on the product, box, or invoice." },
    });
  }
  return normalized;
}

export function warrantyEndFromPurchase(purchaseDate, months = 12) {
  const start = purchaseDate ? new Date(purchaseDate) : new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  return { start, end };
}

export async function resolveProductForOwnership({ product, productSlug }) {
  const found = productSlug
    ? await Product.findOne({ slug: productSlug }).lean()
    : await Product.findOne({ name: product }).lean();
  if (found) return { product: found.name, productSlug: found.slug };
  return { product, productSlug: normalizeProductSlug(product, productSlug) };
}

export async function assertSerialAvailable(serial, customerId, productSlug, excludeOwnershipId) {
  const ownership = await ProductOwnership.findOne({
    serial,
    productSlug,
    ...(excludeOwnershipId ? { _id: { $ne: excludeOwnershipId } } : {}),
  }).lean();
  if (!ownership) return;
  const sameOwner = customerId && ownership.customerId && String(ownership.customerId) === String(customerId);
  throw createHttpError(409, sameOwner ? "This product is already in your ownership space." : "This serial number is already registered.", {
    fields: {
      serial: sameOwner
        ? "This device is already linked to your account."
        : "This product and serial number are already registered.",
    },
  });
}

export async function ensureProductUnit({ serial, product, productSlug, customer, source }) {
  const resolvedProductSlug = normalizeProductSlug(product, productSlug);
  const unit = await ProductUnit.findOne({ serial, productSlug: resolvedProductSlug });
  if (unit && unit.status === "Blocked") {
    throw createHttpError(422, "This serial number cannot be registered.", {
      fields: { serial: unit.blockedReason || "This serial is blocked." },
    });
  }
  if (unit) return unit;
  return ProductUnit.create({
    serial,
    productName: product,
    productSlug: resolvedProductSlug,
    status: source === "Website" ? "Sold" : "Manufactured",
    soldChannel: source,
    ownerCustomerId: customer?._id,
    ownerEmail: customer?.email,
  });
}

export async function syncUnitOwner({ serial, ownership, status = "Registered" }) {
  await ProductUnit.findOneAndUpdate(
    { serial, productSlug: normalizeProductSlug(ownership.product, ownership.productSlug) },
    {
      status,
      ownerCustomerId: ownership.customerId,
      ownerEmail: ownership.email,
      soldAt: ownership.purchaseDate || ownership.registeredAt,
      soldChannel: ownership.source,
    },
    { new: true }
  );
}

export function warrantyPolicyForClaim(ownership, issueType) {
  const purchaseDate = ownership.purchaseDate || ownership.warrantyStart || ownership.createdAt;
  const daysOwned = Math.floor((Date.now() - new Date(purchaseDate).getTime()) / 86400000);
  const normalizedIssue = String(issueType || "").toLowerCase();
  if (["physical", "water", "misuse"].some((word) => normalizedIssue.includes(word))) {
    return "Not covered by standard warranty policy";
  }
  if (daysOwned <= 7 && (normalizedIssue.includes("dead") || normalizedIssue.includes("major") || normalizedIssue.includes("doa"))) {
    return "Eligible for 7-day replacement review";
  }
  if (new Date(ownership.warrantyUntil || 0) >= new Date()) {
    return "Eligible for manufacturing defect warranty review";
  }
  return "Warranty expired - paid service review";
}

export async function createRmaId() {
  const year = new Date().getFullYear();
  const count = await RMARequest.countDocuments({ createdAt: { $gte: new Date(`${year}-01-01T00:00:00.000Z`) } });
  return `INF-RMA-${year}-${String(count + 1).padStart(4, "0")}`;
}
