import { env } from "../config/env.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { hashToken, randomToken } from "../utils/crypto.js";
import { setAuthCookies, signAccessToken, signRefreshToken } from "../utils/cookies.js";
import { createHttpError } from "../utils/httpError.js";

export async function createSession(req, res, user, familyId = randomToken(18)) {
  const refreshId = randomToken(18);
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, refreshId);
  const tokenHash = hashToken(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    role: user.role,
    tokenHash,
    familyId,
    expiresAt: new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000),
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  user.refreshTokenHash = tokenHash;
  await user.save();
  setAuthCookies(res, { accessToken, refreshToken });
  return { refreshToken, tokenHash, familyId };
}

export async function rotateRefreshSession(req, res, user, refreshToken) {
  const currentHash = hashToken(refreshToken);
  const current = await RefreshToken.findOne({ tokenHash: currentHash }).select("+tokenHash +replacedByHash");
  if (!current || current.revokedAt || current.expiresAt <= new Date()) {
    await RefreshToken.updateMany({ userId: user._id, role: user.role, revokedAt: { $exists: false } }, { revokedAt: new Date() });
    throw createHttpError(401, "Refresh token has been invalidated.");
  }

  current.revokedAt = new Date();
  await current.save();
  const next = await createSession(req, res, user, current.familyId);
  current.replacedByHash = next.tokenHash;
  await current.save();
  return next;
}

export async function revokeUserSessions(user) {
  await RefreshToken.updateMany({ userId: user._id, role: user.role, revokedAt: { $exists: false } }, { revokedAt: new Date() });
  user.refreshTokenHash = undefined;
  await user.save();
}
