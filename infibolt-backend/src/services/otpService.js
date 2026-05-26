import crypto from "crypto";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { AuditLog } from "../models/AuditLog.js";
import { OTPRecord } from "../models/OTPRecord.js";
import { hashPassword, verifyPassword } from "../utils/crypto.js";
import { createHttpError } from "../utils/httpError.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

async function deliverOtp({ email, otp, purpose }) {
  await new Promise((resolve) => setTimeout(resolve, env.nodeEnv === "test" ? 0 : 350));
  if (env.otpProvider === "local") {
    if (env.isProduction && !env.allowLocalOtp) {
      return { status: "failed", provider: "local", reason: "Local OTP delivery is disabled in production." };
    }
    if (!env.isProduction || env.allowLocalOtp) {
      console.info(`[local-email-otp] purpose=${purpose} email=${email} otp=${otp}`);
    }
    return { status: "sent", provider: "local" };
  }
  if (["resend", "sendgrid", "ses", "smtp", "nodemailer"].includes(env.otpProvider)) {
    return { status: "failed", provider: env.otpProvider, reason: `${env.otpProvider} email provider is not configured yet.` };
  }
  return { status: "failed", provider: env.otpProvider, reason: "Unsupported OTP provider." };
}

async function logOtpEvent(req, event, metadata = {}) {
  await AuditLog.create({
    actorEmail: metadata.target || "anonymous",
    actorRole: "otp",
    event,
    ip: req?.ip,
    userAgent: req?.get?.("user-agent"),
    requestId: req?.id,
    metadata,
  }).catch(() => {});
}

async function enforceRequestLimits({ email, purpose, req }) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const cooldownAgo = new Date(Date.now() - env.otpResendCooldownSeconds * 1000);
  const [targetRequests, ipRequests, recent] = await Promise.all([
    OTPRecord.countDocuments({ email, purpose, createdAt: { $gte: oneHourAgo } }),
    OTPRecord.countDocuments({ ip: req?.ip, purpose, createdAt: { $gte: oneHourAgo } }),
    OTPRecord.findOne({ email, purpose, createdAt: { $gte: cooldownAgo } }).sort({ createdAt: -1 }).lean(),
  ]);

  if (recent) {
    const retryAfter = Math.max(1, env.otpResendCooldownSeconds - Math.floor((Date.now() - new Date(recent.createdAt).getTime()) / 1000));
    throw createHttpError(429, `Please wait ${retryAfter}s before requesting another OTP.`, { retryAfter });
  }
  if (targetRequests >= env.otpMaxRequestsPerHour) {
    await logOtpEvent(req, "otp.request.throttled_email", { target: email, email, purpose, targetRequests });
    throw createHttpError(429, "Too many OTP requests for this account. Please try again later.");
  }
  if (req?.ip && ipRequests >= env.otpMaxRequestsPerHour * 3) {
    await logOtpEvent(req, "otp.request.throttled_ip", { target: email, email, purpose, ipRequests });
    throw createHttpError(429, "Too many OTP requests from this network. Please try again later.");
  }
}

export async function issueOtp({ email, target, purpose, metadata = {}, ttlMinutes = env.otpTtlMinutes, req }) {
  const normalizedEmail = normalizeEmail(email || target);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw createHttpError(422, "A valid email address is required for OTP delivery.");
  }

  await enforceRequestLimits({ email: normalizedEmail, purpose, req });
  const previousOpen = await OTPRecord.countDocuments({ email: normalizedEmail, purpose, consumedAt: { $exists: false } });
  await OTPRecord.updateMany({ email: normalizedEmail, purpose, consumedAt: { $exists: false } }, { consumedAt: new Date() });

  const otp = generateOtp();
  const otpHash = await hashPassword(otp);
  const delivery = await deliverOtp({ email: normalizedEmail, otp, purpose });
  if (delivery.status !== "sent") throw createHttpError(503, "OTP delivery is temporarily unavailable.");

  const record = await OTPRecord.create({
    email: normalizedEmail,
    target: normalizedEmail,
    purpose,
    otpHash,
    resendCount: previousOpen,
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
    deliveredAt: new Date(),
    deliveryStatus: delivery.status,
    provider: delivery.provider,
    ip: req?.ip,
    userAgent: req?.get?.("user-agent"),
    metadata,
  });
  await logOtpEvent(req, "otp.request.sent", { target: normalizedEmail, email: normalizedEmail, purpose, provider: delivery.provider });

  return {
    id: String(record._id),
    email: normalizedEmail,
    target: normalizedEmail,
    purpose,
    expiresInSeconds: ttlMinutes * 60,
    resendAfterSeconds: env.otpResendCooldownSeconds,
    deliveryStatus: delivery.status,
    provider: delivery.provider,
};
}

export async function verifyOtpCode({ email, target, purpose, otp, verificationId, req }) {
  const normalizedEmail = normalizeEmail(email || target);
  if (!/^\d{6}$/.test(String(otp || ""))) throw createHttpError(422, "OTP must be a 6 digit code.");
  if (verificationId && !mongoose.isValidObjectId(verificationId)) throw createHttpError(422, "OTP has expired or does not exist.");

  const record = await OTPRecord.findOne({
    ...(verificationId ? { _id: verificationId } : {}),
    email: normalizedEmail,
    purpose,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .select("+otpHash +attempts");

  if (!record) throw createHttpError(422, "OTP has expired or does not exist.");
  if (record.attempts >= env.otpMaxVerifyAttempts) {
    await logOtpEvent(req, "otp.verify.locked", { target: normalizedEmail, email: normalizedEmail, purpose });
    throw createHttpError(423, "Too many OTP attempts. Request a new code.");
  }
  if (!(await verifyPassword(String(otp), record.otpHash))) {
    record.attempts += 1;
    await record.save();
    await logOtpEvent(req, "otp.verify.failed", { target: normalizedEmail, email: normalizedEmail, purpose, attempts: record.attempts });
    throw createHttpError(422, "Invalid OTP.");
  }

  record.consumedAt = new Date();
  record.verified = true;
  await record.save();
  await logOtpEvent(req, "otp.verify.success", { target: normalizedEmail, email: normalizedEmail, purpose });
  return record;
}
