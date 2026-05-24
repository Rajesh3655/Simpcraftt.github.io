import crypto from "crypto";
import { env } from "../config/env.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function issueCsrfToken(_req, res) {
  const token = crypto.randomBytes(32).toString("base64url");
  res.cookie("infibolt_csrf", token, {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 1000,
  });
  res.json({ csrfToken: token });
}

export function csrfProtection(req, res, next) {
  if (!unsafeMethods.has(req.method)) return next();
  const cookieToken = req.cookies?.infibolt_csrf;
  const headerToken = req.get("x-csrf-token");
  if (cookieToken && headerToken && cookieToken === headerToken) return next();
  return res.status(403).json({ message: "CSRF validation failed." });
}
