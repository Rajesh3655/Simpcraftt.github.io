import rateLimit from "express-rate-limit";

const rateLimitResponse = {
  message: "Too many requests. Please wait and try again.",
};

function rateLimitHandler(message) {
  return (req, res, _next, options) => {
    res.status(options.statusCode).json({
      message,
      requestId: req.id,
    });
  };
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => req.path === "/health" || req.path === "/api/v1/health",
  handler: rateLimitHandler(rateLimitResponse.message),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler("Too many authentication attempts. Please try again later."),
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler(rateLimitResponse.message),
});
