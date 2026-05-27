import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { env } from "../config/env.js";

let sesClient;

function getSesClient() {
  if (!sesClient) {
    sesClient = new SESClient({
      region: env.awsRegion || env.awsSesRegion,
      ...(env.awsAccessKeyId && env.awsSecretAccessKey
        ? {
            credentials: {
              accessKeyId: env.awsAccessKeyId,
              secretAccessKey: env.awsSecretAccessKey,
            },
          }
        : {}),
    });
  }
  return sesClient;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function adminOtpEmailTemplate({ otp, minutes = 5 }) {
  const safeOtp = escapeHtml(otp);
  return {
    subject: "INFIBOLT admin verification code",
    text: [
      "INFIBOLT Admin MFA",
      "",
      `Your verification code is ${otp}.`,
      `This code expires in ${minutes} minutes.`,
      "",
      "If you did not request this code, secure your Google account and contact the INFIBOLT owner immediately.",
    ].join("\n"),
    html: `<!doctype html>
<html>
  <body style="margin:0;background:#f6f4ef;font-family:Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:30px 30px 10px;">
                <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;">INFIBOLT Admin MFA</p>
                <h1 style="margin:0;font-size:26px;line-height:1.2;color:#020617;">Verify your admin sign in</h1>
                <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#475569;">Use this one-time code to finish signing in to the INFIBOLT Control Center.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 30px;">
                <div style="background:#020617;color:#ffffff;border-radius:16px;padding:22px;text-align:center;font-size:34px;letter-spacing:10px;font-weight:700;">${safeOtp}</div>
                <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#64748b;">This code expires in ${minutes} minutes. Never share it with anyone.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px 30px;">
                <div style="border-top:1px solid #e5e7eb;padding-top:18px;font-size:12px;line-height:1.7;color:#64748b;">
                  Security notice: if you did not request this code, do not continue. Review your Google account security and contact the INFIBOLT owner immediately.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

export function genericOtpEmailTemplate({ otp, purpose = "verification", minutes = 10 }) {
  const safeOtp = escapeHtml(otp);
  const title = purpose === "password-reset" ? "Reset your INFIBOLT password" : "Verify your INFIBOLT account";
  return {
    subject: "Your INFIBOLT verification code",
    text: [
      "INFIBOLT verification",
      "",
      `Your verification code is ${otp}.`,
      `This code expires in ${minutes} minutes.`,
      "",
      "If you did not request this code, you can safely ignore this email.",
    ].join("\n"),
    html: `<!doctype html>
<html>
  <body style="margin:0;background:#f6f4ef;font-family:Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:30px;">
                <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;">INFIBOLT verification</p>
                <h1 style="margin:0;font-size:26px;line-height:1.2;color:#020617;">${escapeHtml(title)}</h1>
                <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#475569;">Use this one-time code to continue.</p>
                <div style="margin-top:22px;background:#020617;color:#ffffff;border-radius:16px;padding:22px;text-align:center;font-size:34px;letter-spacing:10px;font-weight:700;">${safeOtp}</div>
                <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#64748b;">This code expires in ${minutes} minutes. Never share it with anyone.</p>
                <div style="margin-top:18px;border-top:1px solid #e5e7eb;padding-top:18px;font-size:12px;line-height:1.7;color:#64748b;">If you did not request this code, you can safely ignore this email.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

async function sendSesEmail({ email, template }) {
  if (!env.awsRegion && !env.awsSesRegion) {
    return { status: "failed", provider: "ses", reason: "AWS_REGION is not configured." };
  }
  await getSesClient().send(
    new SendEmailCommand({
      Source: env.sesFromEmail,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: template.subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: template.text, Charset: "UTF-8" },
          Html: { Data: template.html, Charset: "UTF-8" },
        },
      },
    })
  );
  return { status: "sent", provider: "ses" };
}

export async function sendAdminOtpEmail({ email, otp, minutes = 5 }) {
  const template = adminOtpEmailTemplate({ otp, minutes });
  return sendSesEmail({ email, template });
}

export async function sendOtpEmail({ email, otp, purpose, minutes = 10 }) {
  const template = purpose === "admin-login" ? adminOtpEmailTemplate({ otp, minutes }) : genericOtpEmailTemplate({ otp, purpose, minutes });
  return sendSesEmail({ email, template });
}

export function statusEmailTemplate({ title, status, product, serial, note, url }) {
  const safeTitle = escapeHtml(title);
  const safeStatus = escapeHtml(status);
  const safeProduct = escapeHtml(product || "INFIBOLT product");
  const safeSerial = escapeHtml(serial || "");
  const safeNote = escapeHtml(note || "");
  const safeUrl = escapeHtml(url);
  return {
    subject: `INFIBOLT update: ${status}`,
    text: [
      safeTitle,
      "",
      `Status: ${status}`,
      `Product: ${product || "INFIBOLT product"}`,
      serial ? `Serial: ${serial}` : "",
      note ? `Note: ${note}` : "",
      "",
      `For regular updates, visit: ${url}`,
    ].filter(Boolean).join("\n"),
    html: `<!doctype html>
<html>
  <body style="margin:0;background:#f6f4ef;font-family:Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f4ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:30px;">
                <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;font-weight:700;">INFIBOLT care update</p>
                <h1 style="margin:0;font-size:26px;line-height:1.2;color:#020617;">${safeTitle}</h1>
                <div style="margin-top:20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:18px;">
                  <p style="margin:0;font-size:13px;color:#64748b;">Status</p>
                  <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#020617;">${safeStatus}</p>
                  <p style="margin:16px 0 0;font-size:13px;color:#64748b;">Product</p>
                  <p style="margin:6px 0 0;font-size:15px;font-weight:700;color:#020617;">${safeProduct}${safeSerial ? ` / ${safeSerial}` : ""}</p>
                  ${safeNote ? `<p style="margin:16px 0 0;font-size:13px;color:#64748b;">Update</p><p style="margin:6px 0 0;font-size:14px;line-height:1.7;color:#334155;">${safeNote}</p>` : ""}
                </div>
                <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#475569;">For regular updates, visit your INFIBOLT warranty care page.</p>
                <a href="${safeUrl}" style="display:inline-block;margin-top:18px;background:#020617;color:#ffffff;text-decoration:none;border-radius:999px;padding:13px 18px;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">View claim updates</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

export async function sendStatusEmail({ email, title, status, product, serial, note, url }) {
  const template = statusEmailTemplate({ title, status, product, serial, note, url });
  return sendSesEmail({ email, template });
}
