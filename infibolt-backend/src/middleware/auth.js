import { env } from "../config/env.js";
import { AdminUser } from "../models/AdminUser.js";
import { Customer } from "../models/Customer.js";
import { accessAudiencesForRoles, accessCookieCandidates, isAdminRole, verifyAccessToken } from "../utils/cookies.js";
import { createHttpError } from "../utils/httpError.js";

export function requireAuth(roles = []) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return async (req, _res, next) => {
    try {
      const token = accessCookieCandidates(allowedRoles).map((name) => req.signedCookies?.[name]).find(Boolean);
      if (!token) throw createHttpError(401, "Authentication required.");
      const payload = verifyAccessToken(token, accessAudiencesForRoles(allowedRoles));
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        throw createHttpError(403, "Insufficient permissions.");
      }
      const Model = isAdminRole(payload.role) ? AdminUser : Customer;
      const user = await Model.findById(payload.sub);
      if (!user || user.status === "Locked") throw createHttpError(401, "Session is no longer valid.");
      if (isAdminRole(payload.role) && !env.adminWhitelist.includes(String(user.email || "").toLowerCase())) {
        throw createHttpError(401, "Admin access has been revoked.");
      }
      req.user = user;
      return next();
    } catch (error) {
      return next(error.statusCode ? error : createHttpError(401, "Session is invalid or expired."));
    }
  };
}

export const verifyAdminAuth = requireAuth(["admin"]);
export const verifyAdminRole = verifyAdminAuth;
export const verifySession = requireAuth;
