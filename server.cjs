const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const cli = path.join(root, "node_modules", "@react-router", "serve", "dist", "cli.js");
const buildPath = path.join(root, "build", "server", "index.js");
const port = process.env.PORT || "3000";
const host = process.env.HOST || "0.0.0.0";

if (!fs.existsSync(cli)) {
  console.error(`[infibolt] Missing React Router serve CLI: ${cli}`);
  console.error("[infibolt] Run npm install before starting the app.");
  process.exit(1);
}

if (!fs.existsSync(buildPath)) {
  console.error(`[infibolt] Missing production build: ${buildPath}`);
  console.error("[infibolt] Run npm run build before starting the app.");
  process.exit(1);
}

const args = [cli, buildPath, "--port", port, "--host", host];

console.log(`[infibolt] Starting app on ${host}:${port}`);

const child = spawn(process.execPath, args, {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error("[infibolt] Failed to start server process:", error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
