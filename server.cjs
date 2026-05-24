const { spawn } = require("node:child_process");
const path = require("node:path");

const root = __dirname;
const cli = path.join(root, "node_modules", "@react-router", "serve", "dist", "cli.js");
const buildPath = path.join(root, "build", "server", "index.js");
const port = process.env.PORT || "3000";
const host = process.env.HOST || "0.0.0.0";

const args = [cli, buildPath, "--port", port, "--host", host];

const child = spawn(process.execPath, args, {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
