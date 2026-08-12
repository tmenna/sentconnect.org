import { Resend } from "resend";
import { logger } from "./logger";
import { getLandingPageContent } from "./landing-page-content";

const BRAND_BLUE = "#1085FD";

const DISPLAY_NAME = "SentConnect Notification";

// Support both FROM_EMAIL (Render convention) and EMAIL_FROM, preferring FROM_EMAIL.
const RAW_FROM = process.env["FROM_EMAIL"] ?? process.env["EMAIL_FROM"];

// Always apply the display name so Gmail shows it correctly in the inbox.
// If the value is already formatted as "Name <addr>" we keep it as-is;
// if it's a bare address like "noreply@sentconnect.org" we wrap it.
function buildFromAddress(raw: string | undefined): string {
  if (!raw) return `${DISPLAY_NAME} <onboarding@resend.dev>`;
  if (raw.includes("<")) return raw;
  return `${DISPLAY_NAME} <${raw.trim()}>`;
}

const FROM_ADDRESS = buildFromAddress(RAW_FROM);

// ─── Replit Connectors credential proxy ──────────────────────────────────────
// When running in Replit dev the API key is served by the connectors proxy
// (the Resend integration), not a plain env var. In production (Render) the
// key is a real env var — we fall back to that so nothing breaks on deploy.

async function getResendApiKey(): Promise<string | null> {
  // 1. Try Replit Connectors proxy first (dev environment)
  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const xReplitToken = process.env["REPL_IDENTITY"]
    ? "repl " + process.env["REPL_IDENTITY"]
    : process.env["WEB_REPL_RENEWAL"]
    ? "depl " + process.env["WEB_REPL_RENEWAL"]
    : null;

  if (hostname && xReplitToken) {
    try {
      const resp = await fetch(
        `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=resend`,
        { headers: { Accept: "application/json", "X-Replit-Token": xReplitToken } }
      );
      const data = await resp.json() as { items?: Array<{ settings?: { api_key?: string } }> };
      const apiKey = data.items?.[0]?.settings?.api_key;
      if (apiKey) return apiKey;
    } catch {
      // fall through to env var
    }
  }

  // 2. Fall back to plain env var (production / Render)
  return process.env["RESEND_API_KEY"] ?? null;
}

export const emailConfigured = true; // always attempt; getResendApiKey() determines at send time

// Warn at startup so misconfigured email is obvious in logs.
if (!RAW_FROM) {
  logger.warn(
    { from: FROM_ADDRESS },
    "[email] Neither FROM_EMAIL nor EMAIL_FROM is set — falling back to onboarding@resend.dev. " +
    "Resend only delivers from this address to the Resend account owner. " +
    "Set FROM_EMAIL in your environment to a verified-domain address (e.g. noreply@sentconnect.org)."
  );
} else {
  logger.info({ from: FROM_ADDRESS, resolvedFrom: "env" }, "[email] mailer ready");
}

// The root domain used for org-specific deep-link URLs (e.g. sentconnect.org).
// Take the first entry from TENANT_ROOT_DOMAINS, or fall back to a sane default.
const CANONICAL_DOMAIN = (process.env["TENANT_ROOT_DOMAINS"] ?? "sentconnect.org")
  .split(",")[0]
  .trim();

// Base URL used only for the logo image and non-org links (footer, etc.).
const APP_URL = process.env["APP_BASE_URL"] ?? `https://${CANONICAL_DOMAIN}`;
// ─── Email logo (platform logo uploaded via super-admin panel) ──────────────
// Resolved at send time from landing_page_content, cached briefly. Falls back
// to a text wordmark when no logo has been uploaded.
let logoCache: { url: string | null; fetchedAt: number } | null = null;

async function getEmailLogoUrl(): Promise<string | null> {
  if (logoCache && Date.now() - logoCache.fetchedAt < 5 * 60 * 1000) return logoCache.url;
  let url: string | null = null;
  try {
    const content = await getLandingPageContent();
    const raw = content.headerLogoUrl || content.logoUrl || "";
    if (raw) {
      if (raw.startsWith("/objects/")) {
        // Use the stable API proxy path — presigned URLs expire and break old emails.
        url = `${APP_URL}/api/storage/objects/${raw.slice("/objects/".length)}`;
      } else if (raw.startsWith("/")) {
        url = `${APP_URL}${raw}`;
      } else {
        url = raw;
      }
    }
  } catch (err) {
    logger.warn({ err }, "[email] failed to resolve platform logo — using text wordmark");
  }
  logoCache = { url, fetchedAt: Date.now() };
  return url;
}

const LOGO_PLACEHOLDER = "%%EMAIL_LOGO_BLOCK%%";

export function logoBlockHtml(logoUrl: string | null): string {
  if (logoUrl) {
    return `<img src="${logoUrl}" alt="SentConnect" height="44" style="height:44px;width:auto;display:block;margin:0 auto;border:0;" />`;
  }
  return `<div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:0.14em;">SENTCONNECT</div>`;
}

/**
 * Builds the deep-link URL for an org-specific post.
 * When an org subdomain is provided, the link goes to
 *   https://<subdomain>.<canonical-domain>/login?next=/post/<id>
 * otherwise falls back to the app root.
 */
function postDeepLink(postId: number, orgSubdomain?: string | null): string {
  const base = orgSubdomain
    ? `https://${orgSubdomain}.${CANONICAL_DOMAIN}`
    : APP_URL;
  return `${base}/login?next=/post/${postId}`;
}

// ─── Shared template helpers ────────────────────────────────────────────────

export function baseTemplate(content: string, orgName?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>SentConnect</title>
</head>
<body style="margin:0;padding:0;background:#F4F6FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FB;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#1085FD 0%,#0059D6 100%);border-radius:16px 16px 0 0;padding:28px 40px 24px;text-align:center;">
        ${LOGO_PLACEHOLDER}
        <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:8px;letter-spacing:0.03em;">Helping Churches stay connected with their missionaries</div>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#fff;padding:36px 40px 32px;border-left:1px solid #E5E9F2;border-right:1px solid #E5E9F2;">
        ${content}
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#F8FAFD;border:1px solid #E5E9F2;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;">
          You are receiving this because you are part of <strong>${orgName ?? "your organization"}</strong> on SentConnect.<br />
          <a href="${APP_URL}" style="color:#1085FD;text-decoration:none;">Manage notification preferences</a> &nbsp;·&nbsp;
          <a href="mailto:support@sentconnect.org" style="color:#1085FD;text-decoration:none;">Contact support</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function ctaButton(href: string, label: string, color = BRAND_BLUE): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
    <tr><td style="background:${color};border-radius:10px;">
      <a href="${href}" style="display:inline-block;padding:13px 28px;color:#fff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.01em;">${label}</a>
    </td></tr>
  </table>`;
}

function avatar(name: string, avatarUrl?: string | null): string {
  const initials = name.trim().charAt(0).toUpperCase();
  if (avatarUrl) {
    return `<img src="${avatarUrl}" alt="${name}" width="44" height="44" style="border-radius:50%;object-fit:cover;vertical-align:middle;" />`;
  }
  // Use a table for centering — flexbox is stripped by Gmail and many email clients.
  return `<table cellpadding="0" cellspacing="0" style="display:inline-table;vertical-align:middle;">
    <tr><td width="44" height="44" align="center" valign="middle"
      style="width:44px;height:44px;border-radius:50%;background:#1085FD;color:#fff;font-size:17px;font-weight:700;line-height:44px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      ${initials}
    </td></tr>
  </table>`;
}

// ─── Email senders ───────────────────────────────────────────────────────────

interface SendResult { sent: boolean; error?: string }

async function sendEmail(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  const apiKey = await getResendApiKey();
  if (!apiKey) {
    logger.info({ to, subject }, "[email] no API key available — email logged only");
    logger.info({ text }, "[email] body");
    return { sent: false, error: "Resend API key not configured" };
  }
  const client = new Resend(apiKey);
  const logoUrl = await getEmailLogoUrl();
  const finalHtml = html.replace(LOGO_PLACEHOLDER, logoBlockHtml(logoUrl));
  try {
    const { error } = await client.emails.send({ from: FROM_ADDRESS, to, subject, html: finalHtml, text });
    if (error) {
      logger.error({ to, from: FROM_ADDRESS, subject, resendError: error }, "[email] send failed — Resend rejected the request");
      return { sent: false, error: error.message };
    }
    logger.info({ to, from: FROM_ADDRESS, subject }, "[email] sent");
    return { sent: true };
  } catch (err: any) {
    logger.error({ to, from: FROM_ADDRESS, subject, err }, "[email] exception during send");
    return { sent: false, error: err?.message ?? "Unknown error" };
  }
}

// ─── 1. Temporary password (admin-generated) ─────────────────────────────────

export async function sendTemporaryPasswordEmail(
  to: string,
  tempPassword: string,
  userName: string,
  loginUrl: string,
  orgName?: string,
): Promise<SendResult> {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Your temporary password</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      Hi <strong>${userName}</strong>, your administrator has reset your <strong>SentConnect</strong> password.
      Use the temporary password below to sign in, then update it from your profile.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
      <tr><td style="background:#F8FAFD;border:1.5px solid #E2E8F0;border-radius:10px;padding:16px 24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94A3B8;letter-spacing:0.08em;text-transform:uppercase;">Temporary Password</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#0F172A;letter-spacing:0.12em;font-family:monospace;">${tempPassword}</p>
      </td></tr>
    </table>
    ${ctaButton(loginUrl, "Sign In Now")}
    <p style="margin:28px 0 0;font-size:13px;color:#94A3B8;line-height:1.6;">
      For your security, please change your password immediately after signing in.<br/>
      If you didn't expect this email, contact your administrator.
    </p>
  `, orgName);

  const text = [
    `Hi ${userName},`,
    "",
    "Your administrator has reset your SentConnect password.",
    "Use the temporary password below to sign in:",
    "",
    `  Temporary password: ${tempPassword}`,
    "",
    `Sign in here: ${loginUrl}`,
    "",
    "Please change your password immediately after signing in.",
    "",
    "— The SentConnect Team",
  ].join("\n");

  return sendEmail(to, "Your temporary SentConnect password", html, text);
}

// ─── 2. Password reset link ───────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, resetUrl: string, orgName?: string): Promise<SendResult> {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Reset your password</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      We received a request to reset your <strong>SentConnect</strong> password. Click the button below to set a new one.
      This link expires in <strong>24 hours</strong>.
    </p>
    ${ctaButton(resetUrl, "Reset Password")}
    <p style="margin:28px 0 0;font-size:13px;color:#94A3B8;line-height:1.6;">
      If you didn't request this, you can safely ignore this email — your password won't change.
    </p>
  `, orgName);

  const text = [
    "Reset your SentConnect password",
    "",
    "We received a request to reset your password. Click the link below (expires in 24 hours):",
    "",
    resetUrl,
    "",
    "If you didn't request this, ignore this email.",
    "",
    "— The SentConnect Team",
  ].join("\n");

  return sendEmail(to, "Reset your SentConnect password", html, text);
}

// ─── 2. New post notification ────────────────────────────────────────────────

export interface NewPostEmailParams {
  to: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  postSnippet: string;
  postImageUrl?: string | null;
  postId: number;
  orgName: string;
  orgSubdomain?: string | null;
  postedAt: Date;
}

export async function sendNewPostEmail(params: NewPostEmailParams): Promise<SendResult> {
  const { to, senderName, senderAvatarUrl, postSnippet, postImageUrl, postId, orgName, orgSubdomain, postedAt } = params;
  const postUrl = postDeepLink(postId, orgSubdomain);
  const timeStr = postedAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const imageBlock = postImageUrl
    ? `<img src="${postImageUrl}" alt="Post image" style="width:100%;max-height:260px;object-fit:cover;border-radius:10px;margin:16px 0 0;" />`
    : "";

  const html = baseTemplate(`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      ${avatar(senderName, senderAvatarUrl)}
      <div style="margin-left:12px;display:inline-block;vertical-align:middle;">
        <div style="font-size:15px;font-weight:700;color:#0F172A;">${senderName}</div>
        <div style="font-size:13px;color:#94A3B8;margin-top:2px;">${timeStr}</div>
      </div>
    </div>
    <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0F172A;">New mission update posted</h2>
    <p style="margin:0;font-size:15px;color:#475569;line-height:1.7;">
      ${postSnippet}
    </p>
    ${imageBlock}
    ${ctaButton(postUrl, "View Update")}
    <p style="margin:20px 0 0;font-size:13px;color:#94A3B8;">
      Posted in <strong>${orgName}</strong>
    </p>
  `, orgName);

  const text = [
    `New mission update from ${senderName}`,
    "",
    postSnippet,
    "",
    `View update: ${postUrl}`,
    "",
    `— SentConnect · ${orgName}`,
  ].join("\n");

  return sendEmail(to, `New Mission Update from ${senderName} · SentConnect`, html, text);
}

// ─── 3. New comment notification ─────────────────────────────────────────────

export interface NewCommentEmailParams {
  to: string;
  commenterName: string;
  commenterAvatarUrl?: string | null;
  commentText: string;
  postSnippet: string;
  postId: number;
  orgName: string;
  orgSubdomain?: string | null;
  commentedAt: Date;
}

export async function sendNewCommentEmail(params: NewCommentEmailParams): Promise<SendResult> {
  const { to, commenterName, commenterAvatarUrl, commentText, postSnippet, postId, orgName, orgSubdomain, commentedAt } = params;
  const postUrl = postDeepLink(postId, orgSubdomain);
  const timeStr = commentedAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0F172A;">Someone commented on your post</h2>

    <!-- Post snippet -->
    <div style="background:#F8FAFD;border-left:3px solid #1085FD;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;font-style:italic;">"${postSnippet}"</p>
    </div>

    <!-- Commenter -->
    <div style="display:flex;align-items:center;margin-bottom:12px;">
      ${avatar(commenterName, commenterAvatarUrl)}
      <div style="margin-left:12px;display:inline-block;vertical-align:middle;">
        <div style="font-size:15px;font-weight:700;color:#0F172A;">${commenterName}</div>
        <div style="font-size:13px;color:#94A3B8;margin-top:2px;">${timeStr}</div>
      </div>
    </div>
    <p style="margin:0 0 4px;font-size:15px;color:#475569;line-height:1.7;">${commentText}</p>

    ${ctaButton(postUrl, "View Conversation")}
  `, orgName);

  const text = [
    `${commenterName} commented on your post`,
    "",
    `Your post: "${postSnippet}"`,
    "",
    `Their comment: "${commentText}"`,
    "",
    `View conversation: ${postUrl}`,
    "",
    `— SentConnect · ${orgName}`,
  ].join("\n");

  return sendEmail(to, `${commenterName} commented on your post · SentConnect`, html, text);
}

// ─── 4. Admin comment-alert notification ──────────────────────────────────────
// Sent to org admins when any member comments on a post in their org.

export interface AdminCommentAlertParams {
  to: string;
  commenterName: string;
  commenterAvatarUrl?: string | null;
  commentText: string;
  postAuthorName: string;
  postSnippet: string;
  postId: number;
  orgName: string;
  orgSubdomain?: string | null;
  commentedAt: Date;
}

export async function sendAdminCommentAlertEmail(params: AdminCommentAlertParams): Promise<SendResult> {
  const { to, commenterName, commenterAvatarUrl, commentText, postAuthorName, postSnippet, postId, orgName, orgSubdomain, commentedAt } = params;
  const postUrl = postDeepLink(postId, orgSubdomain);
  const timeStr = commentedAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

  const html = baseTemplate(`
    <h2 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#0F172A;">New comment on a member's post</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#64748B;">
      In <strong>${orgName}</strong> &nbsp;·&nbsp; ${timeStr}
    </p>

    <!-- Post snippet -->
    <div style="background:#F8FAFD;border-left:3px solid #1085FD;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.06em;">Post by ${postAuthorName}</p>
      <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;font-style:italic;">"${postSnippet}"</p>
    </div>

    <!-- Commenter -->
    <div style="display:flex;align-items:center;margin-bottom:12px;">
      ${avatar(commenterName, commenterAvatarUrl)}
      <div style="margin-left:12px;display:inline-block;vertical-align:middle;">
        <div style="font-size:15px;font-weight:700;color:#0F172A;">${commenterName}</div>
        <div style="font-size:13px;color:#94A3B8;margin-top:2px;">left a comment</div>
      </div>
    </div>
    <p style="margin:0 0 4px;font-size:15px;color:#475569;line-height:1.7;">${commentText}</p>

    ${ctaButton(postUrl, "View Conversation")}
  `, orgName);

  const text = [
    `New comment on ${postAuthorName}'s post in ${orgName}`,
    "",
    `Post: "${postSnippet}"`,
    "",
    `${commenterName} commented: "${commentText}"`,
    "",
    `View conversation: ${postUrl}`,
    "",
    `— SentConnect · ${orgName}`,
  ].join("\n");

  return sendEmail(to, `${commenterName} commented on ${postAuthorName}'s post · SentConnect`, html, text);
}

// ─── 6. Signup request notification (to platform admin) ─────────────────────

export interface SignupRequestEmailParams {
  to: string;
  churchName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
}

export async function sendSignupRequestEmail(params: SignupRequestEmailParams): Promise<SendResult> {
  const { to, churchName, contactName, email, phone, message } = params;

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">New access request</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      A Church has requested access to <strong>SentConnect</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#F8FAFD;border:1.5px solid #E2E8F0;border-radius:10px;">
      <tr><td style="padding:16px 24px;">
        <p style="margin:0 0 10px;font-size:14px;color:#0F172A;"><strong>Church / Organization:</strong> ${churchName}</p>
        <p style="margin:0 0 10px;font-size:14px;color:#0F172A;"><strong>Contact:</strong> ${contactName}</p>
        <p style="margin:0 0 10px;font-size:14px;color:#0F172A;"><strong>Email:</strong> ${email}</p>
        ${phone ? `<p style="margin:0 0 10px;font-size:14px;color:#0F172A;"><strong>Phone:</strong> ${phone}</p>` : ""}
        ${message ? `<p style="margin:0;font-size:14px;color:#475569;line-height:1.6;"><strong>Message:</strong><br/>${message}</p>` : ""}
      </td></tr>
    </table>
    <p style="margin:28px 0 0;font-size:13px;color:#94A3B8;line-height:1.6;">
      Reply directly to ${email} to follow up.
    </p>
  `);

  const text = [
    "New SentConnect access request",
    "",
    `Church / Organization: ${churchName}`,
    `Contact: ${contactName}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : "",
    message ? `Message: ${message}` : "",
    "",
    `Reply directly to ${email} to follow up.`,
  ].filter(Boolean).join("\n");

  return sendEmail(to, `Access request from ${churchName} · SentConnect`, html, text);
}
