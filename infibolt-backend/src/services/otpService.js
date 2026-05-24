import crypto from "crypto";
import { env } from "../config/env.js";
import { AuditLog } from "../models/AuditLog.js";
import { OTPRecord } from "../models/OTPRecord.js";
import { hashPassword, verifyPassword } from "../utils/crypto.js";
import { createHttpError } from "../utils/httpError.js";

const purposeLabels = {
  signup: "signup verification",
  login: "login verification",
  "password-reset": "password reset",
  warranty: "warranty verification",
  "email-verification": "email verification",
};

function normalizeTarget(target) {
  return String(target || "").trim().toLowerCase();
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

async function deliverOtp({ target, purpose, otp, req }) {
  await new Promise((resolve) => setTimeout(resolve, env.nodeEnv === "test" ? 0 : 350));
  if (env.otpProvider === "local") {
    if (!env.isProduction) {
      console.info(`[otp:local] ${purposeLabels[purpose] || purpose} for ${target}: ${otp} requestId=${req?.id || "n/a"}`);
    }
    return { status: "sent", provider: "local" };
  }
  if (env.otpProvider === "msg91") {
    return { status: "failed", provider: "msg91", reason: "MSG91 provider is not configured yet." };
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

async function enforceRequestLimits({ target, purpose, req }) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const cooldownAgo = new Date(Date.now() - env.otpResendCooldownSeconds * 1000);
  const [targetRequests, ipRequests, recent] = await Promise.all([
    OTPRecord.countDocuments({ target, purpose, createdAt: { $gte: oneHourAgo } }),
    OTPRecord.countDocuments({ ip: req?.ip, purpose, createdAt: { $gte: oneHourAgo } }),
    OTPRecord.findOne({ target, purpose, createdAt: { $gte: cooldownAgo } }).sort({ createdAt: -1 }).lean(),
  ]);

  if (recent) {
    const retryAfter = Math.max(1, env.otpResendCooldownSeconds - Math.floor((Date.now() - new Date(recent.createdAt).getTime()) / 1000));
    throw createHttpError(429, `Please wait ${retryAfter}s before requesting another OTP.`, { retryAfter });
  }
  if (targetRequests >= env.otpMaxRequestsPerHour) {
    await logOtpEvent(req, "otp.request.throttled_target", { target, purpose, targetRequests });
    throw createHttpError(429, "Too many OTP requests for this account. Please try again later.");
  }
  if (req?.ip && ipRequests >= env.otpMaxRequestsPerHour * 3) {
    await logOtpEvent(req, "otp.request.throttled_ip", { target, purpose, ipRequests });
    throw createHttpError(429, "Too many OTP requests from this network. Please try again later.");
  }
}

export async function issueOtp({ target, purpose, metadata = {}, ttlMinutes = env.otpTtlMinutes, req }) {
  const normalizedTarget = normalizeTarget(target);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedTarget) && !/^\+?[1-9]\d{7,14}$/.test(normalizedTarget)) {
    throw createHttpError(422, "A valid email address or mobile number is required for OTP delivery.");
  }

  await enforceRequestLimits({ target: normalizedTarget, purpose, req });
  await OTPRecord.updateMany({ target: normalizedTarget, purpose, consumedAt: { $exists: false } }, { consumedAt: new Date() });

  const otp = generateOtp();
  const otpHash = await hashPassword(otp);
  const delivery = await deliverOtp({ target: normalizedTarget, purpose, otp, req });
  if (delivery.status !== "sent") throw createHttpError(503, "OTP delivery is temporarily unavailable.");

  const record = await OTPRecord.create({
    target: normalizedTarget,
    purpose,
    otpHash,
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
    deliveredAt: new Date(),
    deliveryStatus: delivery.status,
    provider: delivery.provider,
    ip: req?.ip,
    userAgent: req?.get?.("user-agent"),
    metadata,
  });
  await logOtpEvent(req, "otp.request.sent", { target: normalizedTarget, purpose, provider: delivery.provider });

  return {
    id: String(record._id),
    target: normalizedTarget,
    purpose,
    expiresInSeconds: ttlMinutes * 60,
    resendAfterSeconds: env.otpResendCooldownSeconds,
    deliveryStatus: delivery.status,
    provider: delivery.provider,
  };
}

export async function verifyOtpCode({ target, purpose, otp, req }) {
  const normalizedTarget = normalizeTarget(target);
  if (!/^\d{6}$/.test(String(otp || ""))) throw createHttpError(422, "OTP must be a 6 digit code.");

  const record = await OTPRecord.findOne({
    target: normalizedTarget,
    purpose,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .select("+otpHash +attempts");

  if (!record) throw createHttpError(422, "OTP has expired or does not exist.");
  if (record.attempts >= env.otpMaxVerifyAttempts) {
    await logOtpEvent(req, "otp.verify.locked", { target: normalizedTarget, purpose });
    throw createHttpError(423, "Too many OTP attempts. Request a new code.");
  }
  if (!(await verifyPassword(String(otp), record.otpHash))) {
    record.attempts += 1;
    await record.save();
    if (!env.isProduction) {
      console.warn(`[otp:failed] purpose=${purpose} target=${normalizedTarget} attempts=${record.attempts} requestId=${req?.id || "n/a"}`);
    }
    await logOtpEvent(req, "otp.verify.failed", { target: normalizedTarget, purpose, attempts: record.attempts });
    throw createHttpError(422, "Invalid OTP.");
  }

  record.consumedAt = new Date();
  await record.save();
  await logOtpEvent(req, "otp.verify.success", { target: normalizedTarget, purpose });
  return record;
}
