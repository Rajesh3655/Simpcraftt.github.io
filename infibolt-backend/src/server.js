import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

await connectDatabase();

const server = app.listen(env.port, env.host, () => {
  const origin = env.isProduction ? env.apiOrigin : `http://${env.host}:${env.port}`;
  if (!env.isProduction) {
    console.info(`INFIBOLT API running on ${origin}`);
  }
});

const shutdown = async (signal) => {
  if (!env.isProduction) {
    console.info(`[server] ${signal} received. Closing HTTP server.`);
  }
  server.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
