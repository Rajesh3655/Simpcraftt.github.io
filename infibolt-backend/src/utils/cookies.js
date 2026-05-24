import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const cookieBase = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  signed: true,
  path: "/",
};

export function signAccessToken(user) {
  const adminAudience = user.role === "admin" || user.role === "super-admin";
  return jwt.sign({ sub: String(user._id), role: user.role, email: user.email, name: user.name }, env.jwtAccessSecret, {
    expiresIn: env.accessTokenTtl,
    issuer: "infibolt-api",
    audience: adminAudience ? "infibolt-admin" : "infibolt-frontend",
  });
}

export function signRefreshToken(user, tokenId) {
  const adminAudience = user.role === "admin" || user.role === "super-admin";
  return jwt.sign({ sub: String(user._id), role: user.role, jti: tokenId }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshTokenDays}d`,
    issuer: "infibolt-api",
    audience: adminAudience ? "infibolt-admin-refresh" : "infibolt-frontend-refresh",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret, { issuer: "infibolt-api" });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret, { issuer: "infibolt-api" });
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie("infibolt_access", accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie("infibolt_refresh", refreshToken, { ...cookieBase, maxAge: env.refreshTokenDays * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookies(res) {
  res.clearCookie("infibolt_access", { ...cookieBase, maxAge: 0 });
  res.clearCookie("infibolt_refresh", { ...cookieBase, maxAge: 0 });
}
