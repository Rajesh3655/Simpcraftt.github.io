import { validationResult } from "express-validator";
import { createHttpError } from "../utils/httpError.js";

export function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(createHttpError(422, "Validation failed.", result.array({ onlyFirstError: true })));
  }
  return next();
}
