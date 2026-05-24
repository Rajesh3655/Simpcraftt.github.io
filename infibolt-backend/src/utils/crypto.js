import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../config/env.js";

export const hashPassword = (password) => bcrypt.hash(password, env.bcryptRounds);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
export const randomToken = (bytes = 48) => crypto.randomBytes(bytes).toString("base64url");
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
