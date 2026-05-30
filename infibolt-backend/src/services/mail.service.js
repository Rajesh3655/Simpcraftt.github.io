import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { AuditLog } from "../models/AuditLog.js";

let transporter;

const supportEmail = "support@infibolt.com";
const brandName = "INFIBOLT";
const provider = "ses-smtp";

function siteUrl() {
  return String(env.frontendOrigin || "https://infibolt.com").replace(/\/$/, "");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured for email delivery.");
  }
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    requireTLS: !env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
  });
  return transporter;
}

function metadataFromReq(req) {
  if (!req) return {};
  return {
    ip: req.ip,
    userAgent: req.get?.("user-agent"),
    requestId: req.id,
  };
}

async function logEmailEvent({ req, to, templateType, status, messageId, error, metadata = {} }) {
  await AuditLog.create({
    actorEmail: normalizeEmail(to) || "system",
    actorRole: "email",
    event: `email.${status}`,
    ip: req?.ip || metadata.ip,
    userAgent: req?.get?.("user-agent") || metadata.userAgent,
    requestId: req?.id || metadata.requestId,
    metadata: {
      recipient: normalizeEmail(to),
      templateType,
      provider,
      messageId,
      error: error ? String(error).slice(0, 500) : undefined,
      ...metadata,
    },
  }).catch(() => {});
}

function layout({ eyebrow = "INFIBOLT", title, body, cta, footerNote }) {
  const safeTitle = escapeHtml(title);
  const ctaHtml = cta?.url
    ? `<a href="${escapeHtml(cta.url)}" style="display:inline-block;margin-top:22px;background:#020617;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 20px;font-size:12px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;box-shadow:0 16px 34px rgba(2,6,23,0.18);">${escapeHtml(cta.label || "Open INFIBOLT")}</a>`
    : "";
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
  </head>
  <body style="margin:0;background:#f4f3ef;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">Official INFIBOLT account notification. Never share OTPs or passwords.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f3ef;padding:34px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;">
            <tr>
              <td style="padding:0 6px 14px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="vertical-align:middle;width:34px;">
                            <span style="display:inline-block;width:26px;height:26px;border-radius:9px;background:#020617;color:#ffffff;text-align:center;font-size:15px;line-height:26px;font-weight:900;font-family:Arial,Helvetica,sans-serif;">I</span>
                          </td>
                          <td style="vertical-align:middle;">
                            <span style="display:block;font-size:13px;line-height:1;font-weight:900;letter-spacing:3.6px;color:#020617;text-transform:uppercase;">INFIBOLT</span>
                            <span style="display:block;margin-top:4px;font-size:9px;line-height:1;font-weight:700;letter-spacing:1.25px;color:#64748b;text-transform:uppercase;">Official care</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;border:1px solid rgba(15,23,42,0.10);background:rgba(255,255,255,0.72);border-radius:999px;padding:8px 12px;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#475569;font-weight:800;">Official mail</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:1px solid #e3e7ee;border-radius:24px;overflow:hidden;box-shadow:0 28px 90px rgba(15,23,42,0.10);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="background:#020617;padding:26px 30px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="vertical-align:middle;">
                            <p style="margin:0 0 11px;font-size:10px;letter-spacing:2.4px;text-transform:uppercase;color:#94a3b8;font-weight:800;">${escapeHtml(eyebrow)}</p>
                            <h1 style="margin:0;font-size:28px;line-height:1.18;color:#ffffff;font-weight:800;">${safeTitle}</h1>
                          </td>
                          <td align="right" style="vertical-align:top;width:34px;">
                            <span style="display:inline-block;width:28px;height:28px;border-radius:10px;background:#111827;color:#ffffff;text-align:center;font-size:15px;line-height:28px;font-weight:900;font-family:Arial,Helvetica,sans-serif;box-shadow:0 10px 20px rgba(0,0,0,0.16);">I</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 30px 30px;background:linear-gradient(180deg,#ffffff 0%,#fbfcfd 100%);">
                      ${body}
                      ${ctaHtml}
                      <div style="margin-top:26px;border:1px solid #e5e7eb;background:#f8fafc;border-radius:18px;padding:16px 16px;font-size:12px;line-height:1.75;color:#64748b;">
                        <strong style="color:#334155;">Anti-phishing notice:</strong> INFIBOLT will never ask for your password, card details, or OTP outside infibolt.com and official INFIBOLT emails.
                        ${footerNote ? `<br>${escapeHtml(footerNote)}` : ""}
                      </div>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;border-top:1px solid #e5e7eb;padding-top:18px;">
                        <tr>
                          <td style="vertical-align:top;">
                            <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;">Need help? <a href="mailto:${supportEmail}" style="color:#0f766e;text-decoration:none;font-weight:700;">${supportEmail}</a></p>
                            <p style="margin:8px 0 0;font-size:11px;line-height:1.6;color:#94a3b8;">© ${new Date().getFullYear()} INFIBOLT. Premium ownership care and account security.</p>
                          </td>
                          <td align="right" style="vertical-align:top;">
                            <a href="${escapeHtml(siteUrl())}" style="font-size:11px;color:#64748b;text-decoration:none;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;">infibolt.com</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function paragraph(text) {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.75;color:#475569;">${escapeHtml(text)}</p>`;
}

function detailBlock(rows = []) {
  const content = rows
    .filter((row) => row?.value)
    .map((row) => `
      <p style="margin:0 0 6px;font-size:12px;color:#64748b;">${escapeHtml(row.label)}</p>
      <p style="margin:0 0 14px;font-size:15px;font-weight:700;color:#020617;">${escapeHtml(row.value)}</p>
    `)
    .join("");
  return `<div style="margin-top:18px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:16px;padding:18px;">${content}</div>`;
}

function otpBody({ otp, minutes }) {
  return [
    paragraph("Use this one-time code to continue. It expires soon and should never be shared with anyone."),
    `<div style="margin-top:22px;background:#020617;color:#ffffff;border-radius:18px;padding:24px 12px;text-align:center;font-size:34px;letter-spacing:8px;font-weight:800;">${escapeHtml(otp)}</div>`,
    `<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#64748b;">This code expires in ${Number(minutes || 5)} minutes. Max verification attempts: 5.</p>`,
  ].join("");
}

export function otpEmailTemplate({ otp, purpose = "verification", minutes = 5, admin = false }) {
  const titleMap = {
    signup: "Verify your INFIBOLT account",
    login: "Verify your INFIBOLT sign in",
    "admin-login": "Verify your admin sign in",
    "email-verification": "Verify your new email",
    "password-reset": "Reset your INFIBOLT password",
    warranty: "Verify your warranty request",
  };
  const title = admin ? "Verify your admin sign in" : titleMap[purpose] || "Your INFIBOLT verification code";
  return {
    subject: admin ? "INFIBOLT admin verification code" : "Your INFIBOLT verification code",
    text: [`${brandName} verification`, "", `Your verification code is ${otp}.`, `This code expires in ${minutes} minutes.`, "", "Never share this code with anyone."].join("\n"),
    html: layout({
      eyebrow: admin ? "INFIBOLT Admin MFA" : "INFIBOLT verification",
      title,
      body: otpBody({ otp, minutes }),
      footerNote: admin ? "If this was not you, stop immediately and report the sign-in attempt." : "If you did not request this code, you can safely ignore this email.",
    }),
  };
}

export function securityAlertTemplate({ title = "Security notification", message, action, details = [], url }) {
  return {
    subject: `INFIBOLT security: ${title}`,
    text: [title, "", message, ...details.map((item) => `${item.label}: ${item.value}`), url ? `Open: ${url}` : ""].filter(Boolean).join("\n"),
    html: layout({
      eyebrow: "INFIBOLT security",
      title,
      body: [paragraph(message), detailBlock(details)].join(""),
      cta: url ? { label: action || "Review account", url } : undefined,
      footerNote: "If you do not recognize this activity, reset your password and contact support.",
    }),
  };
}

export function welcomeTemplate({ name, url }) {
  return {
    subject: "Welcome to INFIBOLT",
    text: [`Welcome to INFIBOLT${name ? `, ${name}` : ""}.`, "Your account is ready."].join("\n"),
    html: layout({
      eyebrow: "INFIBOLT account",
      title: `Welcome${name ? `, ${name}` : ""}`,
      body: [paragraph("Your INFIBOLT account is ready. You can now register ownership, track warranty care, and manage premium support in one secure place.")].join(""),
      cta: url ? { label: "Open account", url } : undefined,
    }),
  };
}

export function passwordResetConfirmationTemplate({ url }) {
  return securityAlertTemplate({
    title: "Your password was changed",
    message: "Your INFIBOLT account password was changed successfully.",
    action: "Open account",
    url,
  });
}

export function notificationTemplate({ title, message, details = [], url, action }) {
  return {
    subject: `INFIBOLT update: ${title}`,
    text: [title, "", message, ...details.map((item) => `${item.label}: ${item.value}`), url ? `Open: ${url}` : ""].filter(Boolean).join("\n"),
    html: layout({
      eyebrow: "INFIBOLT notification",
      title,
      body: [paragraph(message), detailBlock(details)].join(""),
      cta: url ? { label: action || "View update", url } : undefined,
    }),
  };
}

export function statusEmailTemplate({ title, status, product, serial, note, url }) {
  const normalizedStatus = String(status || "").toLowerCase();
  const normalizedTitle = String(title || "").toLowerCase();
  const isRegistration = normalizedTitle.includes("registration");
  const isRejected = ["rejected", "rejected after inspection"].includes(normalizedStatus);
  const copy = {
    active: {
      message: "Your warranty registration has been approved. Your product is now covered under INFIBOLT warranty.",
      nextStep: "You can view the active warranty and raise a claim from the Warranty page whenever support is needed.",
    },
    rejected: isRegistration
      ? {
          message: "Your warranty registration was not approved after invoice and product verification.",
          nextStep: "Please re-register with the correct invoice, valid serial number, and matching purchase details.",
        }
      : {
          message: "Your warranty claim was not approved after review.",
          nextStep: "You can submit a fresh claim only after correcting the details or adding stronger supporting proof.",
        },
    "waiting for customer shipment": {
      message: "Your warranty claim has been approved. Please ship the product to the INFIBOLT service address shown in your warranty workflow.",
      nextStep: "Pack the product securely, include the invoice copy, mention the RMA number on the package, and submit courier tracking in your account.",
    },
    "product received": {
      message: "Your product has reached the INFIBOLT service center.",
      nextStep: "Our technical team will inspect the product and update the final decision after review.",
    },
    "final approved": {
      message: "Your product has passed inspection and your warranty claim has received final approval.",
      nextStep: "INFIBOLT will process the replacement or repair dispatch and share courier tracking once shipped.",
    },
    "replacement approved": {
      message: "Your product has passed inspection and your replacement has been approved.",
      nextStep: "INFIBOLT will dispatch the replacement and share courier tracking once shipped.",
    },
    "rejected after inspection": {
      message: "Your product was inspected and the claim was not approved under warranty.",
      nextStep: "INFIBOLT will return the inspected product if a return shipment is required. Courier tracking will be shared once dispatched.",
    },
    "replacement dispatched": {
      message: "Your replacement has been dispatched.",
      nextStep: "Use the courier details below to track the shipment.",
    },
    "return dispatched": {
      message: "Your inspected product has been dispatched back to you.",
      nextStep: "Use the courier details below to track the return shipment.",
    },
  }[normalizedStatus] || {
    message: "There is an update on your INFIBOLT warranty care record.",
    nextStep: "Open the Warranty page to review the latest status.",
  };
  return notificationTemplate({
    title,
    message: copy.message,
    details: [
      { label: "Status", value: status },
      { label: "Product", value: product || "INFIBOLT product" },
      { label: "Serial", value: serial },
      { label: isRejected ? "Reason" : normalizedStatus.includes("dispatched") ? "Courier details" : "Update", value: note },
      { label: "Next step", value: copy.nextStep },
    ],
    url,
    action: isRegistration ? "Open warranty page" : "View claim updates",
  });
}

async function deliverWithRetry(mailOptions, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await getTransporter().sendMail(mailOptions);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export async function sendEmail({ to, subject, text, html, templateType = "notification", req, metadata = {}, retries = 2 }) {
  const recipient = normalizeEmail(to);
  if (!isValidEmail(recipient)) {
    throw new Error("A valid recipient email is required.");
  }
  try {
    const result = await deliverWithRetry(
      {
        from: env.emailFrom,
        to: recipient,
        subject,
        text,
        html,
        headers: {
          "X-INFIBOLT-Template": templateType,
        },
      },
      retries
    );
    await logEmailEvent({ req, to: recipient, templateType, status: "sent", messageId: result.messageId, metadata: { ...metadata, ...metadataFromReq(req) } });
    return { status: "sent", provider, messageId: result.messageId };
  } catch (error) {
    await logEmailEvent({ req, to: recipient, templateType, status: "failed", error: error.message, metadata: { ...metadata, ...metadataFromReq(req) } });
    return { status: "failed", provider, reason: error.message };
  }
}

export async function queueEmail(payload) {
  setImmediate(() => {
    sendEmail(payload).catch(() => {});
  });
  return { status: "queued", provider };
}

export async function sendOtpEmail({ email, otp, purpose, minutes = 5, req }) {
  const template = otpEmailTemplate({ otp, purpose, minutes, admin: purpose === "admin-login" });
  return sendEmail({ to: email, ...template, templateType: `otp.${purpose}`, req, metadata: { purpose } });
}

export async function sendAdminOtpEmail({ email, otp, minutes = 5, req }) {
  return sendOtpEmail({ email, otp, purpose: "admin-login", minutes, req });
}

export async function sendSecurityNotification({ email, title, message, details = [], url, req }) {
  const template = securityAlertTemplate({ title, message, details, url });
  return sendEmail({ to: email, ...template, templateType: "security.alert", req, metadata: { title } });
}

export async function sendWelcomeEmail({ email, name, req }) {
  const template = welcomeTemplate({ name, url: `${env.frontendOrigin}/profile` });
  return queueEmail({ to: email, ...template, templateType: "account.welcome", req });
}

export async function sendPasswordResetConfirmation({ email, req }) {
  const template = passwordResetConfirmationTemplate({ url: `${env.frontendOrigin}/profile` });
  return queueEmail({ to: email, ...template, templateType: "password.reset.confirmation", req });
}

export async function sendAttendanceConfirmationEmail({ email, name, status, date, req }) {
  const template = notificationTemplate({
    title: "Attendance recorded",
    message: `Attendance has been recorded${name ? ` for ${name}` : ""}.`,
    details: [
      { label: "Status", value: status || "Recorded" },
      { label: "Date", value: date },
    ],
  });
  return queueEmail({ to: email, ...template, templateType: "employee.attendance.confirmation", req });
}

export async function sendLeaveDecisionEmail({ email, name, status, dates, note, req }) {
  const template = notificationTemplate({
    title: `Leave ${String(status || "updated").toLowerCase()}`,
    message: `Your leave request${name ? `, ${name}` : ""} has been ${String(status || "updated").toLowerCase()}.`,
    details: [
      { label: "Dates", value: dates },
      { label: "Status", value: status },
      { label: "Note", value: note },
    ],
  });
  return queueEmail({ to: email, ...template, templateType: "employee.leave.decision", req });
}

export async function sendSystemNotification({ email, title, message, details = [], url, req }) {
  const template = notificationTemplate({ title, message, details, url, action: "View details" });
  return queueEmail({ to: email, ...template, templateType: "system.notification", req });
}

export async function sendStatusEmail({ email, title, status, product, serial, note, url, req }) {
  const template = statusEmailTemplate({ title, status, product, serial, note, url });
  return sendEmail({ to: email, ...template, templateType: "care.status", req, metadata: { status, product, serial } });
}
