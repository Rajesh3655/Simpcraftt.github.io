import { SiteSetting } from "../models/SiteSetting.js";

export const defaultContactSettings = {
  mobileNumber: "1234567890",
  phone: "1234567890",
  helpEmail: "support@infibolt.com",
  whatsapp: "https://wa.me/1234567890",
  instagram: "",
  facebook: "",
  x: "",
  youtube: "",
  linkedin: "",
};

export function normalizeContactSettings(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const normalized = Object.fromEntries(
    Object.entries(defaultContactSettings).map(([key, fallback]) => {
      const next = source[key];
      return [key, typeof next === "string" ? next.trim() : fallback];
    })
  );
  if (!normalized.mobileNumber && typeof source.phone === "string") normalized.mobileNumber = source.phone.trim();
  if (!normalized.phone && normalized.mobileNumber) normalized.phone = normalized.mobileNumber;
  if (normalized.mobileNumber && normalized.phone !== normalized.mobileNumber) normalized.phone = normalized.mobileNumber;
  return normalized;
}

export async function getContactSettings() {
  const setting = await SiteSetting.findOne({ key: "contactSettings" }).lean();
  return normalizeContactSettings(setting?.value);
}

export async function saveContactSettings(value) {
  const normalized = normalizeContactSettings(value);
  const setting = await SiteSetting.findOneAndUpdate(
    { key: "contactSettings" },
    { key: "contactSettings", value: normalized },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return setting.value;
}
