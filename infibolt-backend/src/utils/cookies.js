import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const cookieBase = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.cookieSameSite,
  signed: true,
  path: "/",
  ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
};

export const LEGACY_COOKIE_NAMES = {
  access: "infibolt_access",
  refresh: "infibolt_refresh",
};

export const COOKIE_NAMES = {
  admin: {
    access: "infibolt_admin_access",
    refresh: "infibolt_admin_refresh",
  },
  customer: {
    access: "infibolt_customer_access",
    refresh: "infibolt_customer_refresh",
  },
};

export function isAdminRole(role) {
  return role === "admin";
}

export function cookieNamesForRole(role) {
  return isAdminRole(role) ? COOKIE_NAMES.admin : COOKIE_NAMES.customer;
}

export function accessCookieCandidates(roles = []) {
  const roleList = Array.isArray(roles) ? roles : [roles];
  const candidates = [];
  if (roleList.some(isAdminRole)) candidates.push(COOKIE_NAMES.admin.access);
  if (roleList.includes("customer")) candidates.push(COOKIE_NAMES.customer.access);
  candidates.push(LEGACY_COOKIE_NAMES.access);
  return [...new Set(candidates)];
}

export function refreshCookieCandidates(role) {
  return [cookieNamesForRole(role).refresh, LEGACY_COOKIE_NAMES.refresh];
}

export function signAccessToken(user) {
  const adminAudience = isAdminRole(user.role);
  return jwt.sign({ sub: String(user._id), role: user.role, email: user.email, name: user.name }, env.jwtAccessSecret, {
    expiresIn: env.accessTokenTtl,
    issuer: "infibolt-api",
    audience: adminAudience ? "infibolt-admin" : "infibolt-frontend",
  });
}

export function signRefreshToken(user, tokenId) {
  const adminAudience = isAdminRole(user.role);
  return jwt.sign({ sub: String(user._id), role: user.role, jti: tokenId }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshTokenDays}d`,
    issuer: "infibolt-api",
    audience: adminAudience ? "infibolt-admin-refresh" : "infibolt-frontend-refresh",
  });
}

export function accessAudiencesForRoles(roles = []) {
  const roleList = Array.isArray(roles) ? roles : [roles];
  const audiences = [];
  if (roleList.some(isAdminRole)) audiences.push("infibolt-admin");
  if (roleList.includes("customer")) audiences.push("infibolt-frontend");
  return audiences;
}

export function verifyAccessToken(token, audiences = []) {
  const options = { issuer: "infibolt-api" };
  if (audiences.length) options.audience = audiences;
  return jwt.verify(token, env.jwtAccessSecret, options);
}

export function verifyRefreshToken(token, audience) {
  const options = { issuer: "infibolt-api" };
  if (audience) options.audience = audience;
  return jwt.verify(token, env.jwtRefreshSecret, options);
}

export function setAuthCookies(res, { accessToken, refreshToken, role }) {
  const names = cookieNamesForRole(role);
  res.cookie(names.access, accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie(names.refresh, refreshToken, { ...cookieBase, maxAge: env.refreshTokenDays * 24 * 60 * 60 * 1000 });
  res.clearCookie(LEGACY_COOKIE_NAMES.access, { ...cookieBase, maxAge: 0 });
  res.clearCookie(LEGACY_COOKIE_NAMES.refresh, { ...cookieBase, maxAge: 0 });
}

export function clearAuthCookies(res, role) {
  const groups = role ? [cookieNamesForRole(role)] : Object.values(COOKIE_NAMES);
  groups.forEach((names) => {
    res.clearCookie(names.access, { ...cookieBase, maxAge: 0 });
    res.clearCookie(names.refresh, { ...cookieBase, maxAge: 0 });
  });
  res.clearCookie(LEGACY_COOKIE_NAMES.access, { ...cookieBase, maxAge: 0 });
  res.clearCookie(LEGACY_COOKIE_NAMES.refresh, { ...cookieBase, maxAge: 0 });
}
