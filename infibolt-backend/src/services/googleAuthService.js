import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { createHttpError } from "../utils/httpError.js";

const googleClient = new OAuth2Client(env.googleClientId);

export async function verifyGoogleCredential(credential) {
  if (!env.googleClientId) throw createHttpError(503, "Google login is not configured.");
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
  } catch {
    throw createHttpError(401, "Google sign in could not be verified.");
  }
  const profile = ticket.getPayload();
  if (!profile) throw createHttpError(401, "Google sign in could not be verified.");
  if (profile.aud !== env.googleClientId) throw createHttpError(401, "Google sign in was issued for another app.");
  if (!profile.email_verified) throw createHttpError(401, "Google account email is not verified.");
  if (!profile.sub || !profile.email) throw createHttpError(401, "Google account details are incomplete.");
  if (profile.exp && profile.exp * 1000 <= Date.now()) throw createHttpError(401, "Google sign in has expired.");
  return {
    sub: String(profile.sub),
    email: String(profile.email).toLowerCase(),
    name: String(profile.name || profile.given_name || profile.email.split("@")[0]).trim(),
    picture: profile.picture ? String(profile.picture) : undefined,
  };
}
