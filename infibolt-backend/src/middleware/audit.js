import { AuditLog } from "../models/AuditLog.js";

export async function writeAuditLog(req, event, metadata = {}) {
  try {
    await AuditLog.create({
      actorEmail: req.user?.email || req.body?.email || "anonymous",
      actorRole: req.user?.role || "anonymous",
      event,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      requestId: req.id,
      metadata,
    });
  } catch (error) {
    console.warn("[audit] failed", error.message);
  }
}
