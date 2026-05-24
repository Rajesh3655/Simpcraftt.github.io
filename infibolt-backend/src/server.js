import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

await connectDatabase();

const server = app.listen(env.port, env.host, () => {
  console.log(`INFIBOLT API running on http://${env.host}:${env.port}`);
});

const shutdown = async (signal) => {
  console.log(`[server] ${signal} received. Closing HTTP server.`);
  server.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
