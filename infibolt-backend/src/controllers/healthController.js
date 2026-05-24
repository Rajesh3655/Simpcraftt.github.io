import { env } from "../config/env.js";
import { dbStatus } from "../config/db.js";

export const healthCheck = async (_req, res) =>
  res.json({
    status: "ok",
    service: "infibolt-backend",
    apiOrigin: env.apiOrigin,
    database: dbStatus(),
  });
