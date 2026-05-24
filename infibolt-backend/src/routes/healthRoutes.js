import { Router } from "express";
import { healthCheck } from "../controllers/healthController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const healthRoutes = Router();

healthRoutes.get("/", asyncHandler(healthCheck));
