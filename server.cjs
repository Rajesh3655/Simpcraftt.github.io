// Hostinger/cPanel-safe bootstrap for ESM server bundles.
(async () => {
  await import("./build/server/index.js");
})().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
