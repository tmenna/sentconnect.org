import nodemailer from "nodemailer";
import { logger } from "./logger";

function createTransport() {
  const host = process.env["SMTP_HOST"];
  const port = Number(process.env["SMTP_PORT"] ?? 587);
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export const smtpConfigured = !!(
  process.env["SMTP_HOST"] &&
  process.env["SMTP_USER"] &&
  process.env["SMTP_PASS"]
);

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const transport = createTransport();
  if (!transport) {
    logger.warn("SMTP not configured — password reset email not sent");
    return false;
  }
  const from = process.env["SMTP_FROM"] ?? process.env["SMTP_USER"];
  try {
    await transport.sendMail({
      from: `SentConnect <${from}>`,
      to,
      subject: "Reset your SentConnect password",
      text: [
        "You requested a password reset for your SentConnect account.",
        "",
        "Click the link below to set a new password (expires in 1 hour):",
        "",
        resetUrl,
        "",
        "If you didn't request this, you can safely ignore this email.",
        "",
        "— The SentConnect Team",
      ].join("\n"),
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a1a2e">
          <p style="font-size:15px;margin:0 0 16px">You requested a password reset for your <strong>SentConnect</strong> account.</p>
          <p style="font-size:15px;margin:0 0 24px">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#132272;color:#fff;font-weight:700;font-size:15px;padding:12px 28px;border-radius:8px;text-decoration:none">Reset password</a>
          <p style="font-size:13px;color:#888;margin:24px 0 0">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    logger.info({ to }, "Password reset email sent");
    return true;
  } catch (err) {
    logger.error({ err, to }, "Failed to send password reset email");
    return false;
  }
}
