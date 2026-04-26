import { Resend } from "resend";
import { logger } from "./logger";

const resend = process.env["RESEND_API_KEY"]
  ? new Resend(process.env["RESEND_API_KEY"])
  : null;

export const emailConfigured = !!process.env["RESEND_API_KEY"];

const FROM_ADDRESS = process.env["EMAIL_FROM"] ?? "SentConnect-Notification <onboarding@resend.dev>";

// The root domain used for org-specific deep-link URLs (e.g. sentconnect.org).
// Take the first entry from TENANT_ROOT_DOMAINS, or fall back to a sane default.
const CANONICAL_DOMAIN = (process.env["TENANT_ROOT_DOMAINS"] ?? "sentconnect.org")
  .split(",")[0]
  .trim();

// Base URL used only for the logo image and non-org links (footer, etc.).
const APP_URL = process.env["APP_BASE_URL"] ?? `https://${CANONICAL_DOMAIN}`;
const LOGO_URL = `${APP_URL}/public/images/logo-white.png`;

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

function baseTemplate(content: string, orgName?: string): string {
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
      <tr><td style="background:linear-gradient(135deg,#0047A8 0%,#0268CE 60%,#1A80E0 100%);border-radius:16px 16px 0 0;padding:28px 40px 24px;text-align:center;">
        <img src="${LOGO_URL}" alt="SentConnect" width="180" style="height:auto;max-width:180px;display:block;margin:0 auto;" />
        <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:8px;letter-spacing:0.03em;">Stay connected with your field teams</div>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#fff;padding:36px 40px 32px;border-left:1px solid #E5E9F2;border-right:1px solid #E5E9F2;">
        ${content}
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#F8FAFD;border:1px solid #E5E9F2;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6;">
          You are receiving this because you are part of <strong>${orgName ?? "your organization"}</strong> on SentConnect.<br />
          <a href="${APP_URL}" style="color:#0268CE;text-decoration:none;">Manage notification preferences</a> &nbsp;·&nbsp;
          <a href="mailto:support@sentconnect.org" style="color:#0268CE;text-decoration:none;">Contact support</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function ctaButton(href: string, label: string, color = "#0268CE"): string {
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
  return `<div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:#0268CE;color:#fff;font-size:17px;font-weight:700;vertical-align:middle;">${initials}</div>`;
}

// ─── Email senders ───────────────────────────────────────────────────────────

interface SendResult { sent: boolean; error?: string }

async function sendEmail(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  if (!resend) {
    logger.info({ to, subject }, "[email] RESEND_API_KEY not configured — email logged only");
    logger.info({ text }, "[email] body");
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }
  try {
    const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject, html, text });
    if (error) {
      logger.error({ to, subject, error }, "[email] send failed");
      return { sent: false, error: error.message };
    }
    logger.info({ to, subject }, "[email] sent");
    return { sent: true };
  } catch (err: any) {
    logger.error({ to, subject, err }, "[email] exception");
    return { sent: false, error: err?.message ?? "Unknown error" };
  }
}

// ─── 1. Password reset ───────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, resetUrl: string, orgName?: string): Promise<boolean> {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0F172A;">Reset your password</h2>
    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
      We received a request to reset your <strong>SentConnect</strong> password. Click the button below to set a new one.
      This link expires in <strong>1 hour</strong>.
    </p>
    ${ctaButton(resetUrl, "Reset Password")}
    <p style="margin:28px 0 0;font-size:13px;color:#94A3B8;line-height:1.6;">
      If you didn't request this, you can safely ignore this email — your password won't change.
    </p>
  `, orgName);

  const text = [
    "Reset your SentConnect password",
    "",
    "We received a request to reset your password. Click the link below (expires in 1 hour):",
    "",
    resetUrl,
    "",
    "If you didn't request this, ignore this email.",
    "",
    "— The SentConnect Team",
  ].join("\n");

  const { sent } = await sendEmail(to, "Reset your SentConnect password", html, text);
  return sent;
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
    <div style="background:#F8FAFD;border-left:3px solid #0268CE;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
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
    <div style="background:#F8FAFD;border-left:3px solid #0268CE;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
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
