const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);

function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (!value || typeof value !== "object") return value;

  for (const key of Object.keys(value)) {
    if (blockedKeys.has(key) || key.startsWith("$") || key.includes(".")) {
      delete value[key];
      continue;
    }
    value[key] = clean(value[key]);
  }
  return value;
}

export function sanitizePayload(req, _res, next) {
  clean(req.body);
  clean(req.query);
  clean(req.params);
  next();
}
