import { Router, type IRouter } from "express";
import { eq, and, gt, sql } from "drizzle-orm";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { db, usersTable, organizationsTable } from "@workspace/db";
import { hashPassword } from "../lib/password";
import { maybeResetDemoOrg } from "../lib/seed";
import { logger } from "../lib/logger";
import { sendPasswordResetEmail, sendSignupRequestEmail, emailConfigured } from "../lib/mailer";
import { resolveObjectUrl } from "../lib/r2Storage";
import { verifyTurnstileToken } from "../lib/turnstile";

const PLATFORM_ADMIN_NOTIFY_EMAIL = process.env.SIGNUP_REQUEST_NOTIFY_EMAIL || "teki.menna@gmail.com";

// Demo endpoints: max 8 attempts per IP per 15 minutes.
// trust proxy is set to 1 in app.ts so req.ip is the real client IP.
const demoRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many demo requests. Please wait a few minutes before trying again." },
});

const router: IRouter = Router();

async function resolveLogoUrl(url: string): Promise<string> {
  if (!url) return url;
  const resolved = await resolveObjectUrl(url);
  return resolved || url;
}

router.get("/orgs/resolve", async (req, res): Promise<void> => {
  const subdomain = typeof req.query.subdomain === "string" ? req.query.subdomain.trim().toLowerCase() : "";
  if (!/^[a-z0-9-]{2,40}$/.test(subdomain)) {
    res.status(400).json({ error: "Invalid organization subdomain" });
    return;
  }

  const [org] = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      subdomain: organizationsTable.subdomain,
      status: organizationsTable.status,
      logoUrl: organizationsTable.logoUrl,
    })
    .from(organizationsTable)
    .where(eq(organizationsTable.subdomain, subdomain));

  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }

  const resolvedLogoUrl = org.logoUrl ? await resolveLogoUrl(org.logoUrl) : null;
  res
    .set("Cache-Control", "public, max-age=60, stale-while-revalidate=30")
    .json({ ...org, logoUrl: resolvedLogoUrl || org.logoUrl });
});

function toUserResponse(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...rest } = user;
  return rest;
}

// POST /signup-requests — public "request access" form (signup is invite-only for now)
const signupRequestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a few minutes before trying again." },
});

router.post("/signup-requests", signupRequestRateLimit, async (req, res): Promise<void> => {
  const { churchName, contactName, email, phone, message } = req.body ?? {};

  if (!churchName || typeof churchName !== "string" || churchName.trim().length < 2) {
    res.status(400).json({ error: "Church or organization name must be at least 2 characters" }); return;
  }
  if (!contactName || typeof contactName !== "string" || contactName.trim().length < 2) {
    res.status(400).json({ error: "Contact name must be at least 2 characters" }); return;
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" }); return;
  }
  const cleanPhone = typeof phone === "string" ? phone.trim().slice(0, 40) : null;
  const cleanMessage = typeof message === "string" ? message.trim().slice(0, 2000) : null;

  try {
    await db.execute(sql`
      INSERT INTO signup_requests (church_name, contact_name, email, phone, message)
      VALUES (${churchName.trim().slice(0, 200)}, ${contactName.trim().slice(0, 120)}, ${email.trim().toLowerCase().slice(0, 200)}, ${cleanPhone}, ${cleanMessage})
    `);
  } catch (err) {
    req.log.error({ err }, "Failed to store signup request");
    res.status(500).json({ error: "Something went wrong. Please try again." }); return;
  }

  // Best-effort notification to the platform admin — don't block the response on it
  sendSignupRequestEmail({
    to: PLATFORM_ADMIN_NOTIFY_EMAIL,
    churchName: churchName.trim(),
    contactName: contactName.trim(),
    email: email.trim().toLowerCase(),
    phone: cleanPhone,
    message: cleanMessage,
  }).catch((err) => logger.error({ err }, "Failed to send signup request email"));

  res.status(201).json({ ok: true });
});

// Self-serve signup is disabled — onboarding is request-only (see /signup-requests).
// Set SELF_SERVE_SIGNUP_ENABLED=true to re-enable.
export const selfServeSignupEnabled = process.env.SELF_SERVE_SIGNUP_ENABLED === "true";

// POST /auth/signup — create a new organization + first admin user
router.post("/auth/signup", async (req, res): Promise<void> => {
  if (!selfServeSignupEnabled) {
    res.status(410).json({ error: "Self-serve signup is disabled. Please request access at /signup and we'll get in touch." });
    return;
  }
  const { orgName, subdomain, plan, name, email, password } = req.body ?? {};
  const orgPlan = plan === "paid" ? "paid" : "trial";

  if (!orgName || typeof orgName !== "string" || orgName.trim().length < 2) {
    res.status(400).json({ error: "Organization name must be at least 2 characters" }); return;
  }
  if (!subdomain || typeof subdomain !== "string" || !/^[a-z0-9-]{2,30}$/.test(subdomain.trim())) {
    res.status(400).json({ error: "Subdomain must be 2-30 lowercase letters, numbers, or hyphens" }); return;
  }
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ error: "Name must be at least 2 characters" }); return;
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" }); return;
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" }); return;
  }

  // Check subdomain uniqueness
  const [existingOrg] = await db.select().from(organizationsTable).where(eq(organizationsTable.subdomain, subdomain.trim().toLowerCase()));
  if (existingOrg) {
    res.status(409).json({ error: "That subdomain is already taken" }); return;
  }

  // Check email uniqueness
  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email.trim().toLowerCase()));
  if (existingUser) {
    res.status(409).json({ error: "An account with that email already exists" }); return;
  }

  // Create org
  const [org] = await db.insert(organizationsTable).values({
    name: orgName.trim(),
    subdomain: subdomain.trim().toLowerCase(),
    plan: orgPlan,
    status: "active",
  }).returning();

  // Create first admin user
  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role: "admin",
    organizationId: org.id,
    organization: orgName.trim(),
  }).returning();

  req.session.userId = user.id;
  res.status(201).json({ user: toUserResponse(user), organization: org });
});

// POST /auth/forgot-password — generate a reset token
router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body ?? {};
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" }); return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.trim().toLowerCase()));

  // Always respond 200 to not leak account existence
  if (!user) {
    res.json({ message: "If an account exists, a reset link has been sent." }); return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.update(usersTable)
    .set({ resetToken: token, resetTokenExpiry: expiry })
    .where(eq(usersTable.id, user.id));

  // Look up the user's org subdomain so the reset link lands on their org's domain.
  let orgSubdomain: string | null = null;
  if (user.organizationId) {
    const [org] = await db.select({ subdomain: organizationsTable.subdomain })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, user.organizationId));
    orgSubdomain = org?.subdomain ?? null;
  }

  // Build the reset URL.
  // Priority: APP_BASE_URL → first REPLIT_DOMAINS entry → TENANT_ROOT_DOMAINS → fallback.
  const canonicalDomain = (process.env["TENANT_ROOT_DOMAINS"] ?? "sentconnect.org").split(",")[0].trim();
  const replitDomain = process.env["REPLIT_DOMAINS"]?.split(",")[0]?.trim();
  const baseUrl = process.env["APP_BASE_URL"]
    ?? (replitDomain ? `https://${replitDomain}` : `https://${canonicalDomain}`);

  // For the email link, use the org's canonical subdomain URL (production routing).
  // Embed org= so the reset page can redirect back to the right org login after success.
  const emailBase = orgSubdomain
    ? `https://${orgSubdomain}.${canonicalDomain}`
    : baseUrl;
  const orgParam = orgSubdomain ? `&org=${orgSubdomain}` : "";
  const resetLink = `/reset-password?token=${token}${orgParam}`;
  const resetUrl = `${emailBase}${resetLink}`;

  const isDev = process.env["NODE_ENV"] !== "production";

  if (emailConfigured) {
    const { sent, error: emailError } = await sendPasswordResetEmail(user.email, resetUrl);
    if (!sent) {
      req.log.error(
        { to: user.email, from: process.env["FROM_EMAIL"] ?? process.env["EMAIL_FROM"] ?? "onboarding@resend.dev", emailError },
        "[forgot-password] email send failed — check FROM_EMAIL/RESEND_API_KEY"
      );
    }
    // In dev, always expose the link so testers can use it even if Resend isn't fully configured.
    res.json({
      message: "If an account exists, a reset link has been sent.",
      ...(isDev ? { devResetLink: resetLink, devToken: token } : {}),
    });
  } else {
    req.log.warn({ email: user.email, resetUrl }, "[forgot-password] RESEND_API_KEY not set — reset link logged only");
    res.json({
      message: "If an account exists, a reset link has been sent.",
      devResetLink: resetLink,
      devToken: token,
    });
  }
});

// POST /auth/reset-password — consume token, set new password
router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, password } = req.body ?? {};
  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Token is required" }); return;
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" }); return;
  }

  const now = new Date();
  const [user] = await db.select().from(usersTable)
    .where(and(eq(usersTable.resetToken, token), gt(usersTable.resetTokenExpiry!, now)));

  if (!user) {
    res.status(400).json({ error: "Invalid or expired reset token" }); return;
  }

  const passwordHash = hashPassword(password);
  await db.update(usersTable)
    .set({ passwordHash, resetToken: null, resetTokenExpiry: null })
    .where(eq(usersTable.id, user.id));

  res.json({ message: "Password reset successfully. You can now log in." });
});

const DEMO_ORG_SUBDOMAIN = "demo";
const DEMO_ORG_NAME = "Demo Organization";
const DEMO_USER_EMAIL = "demoadmin@sentconnect.org";
const DEMO_USER_NAME = "Demo Admin";
const DEMO_USER_PASSWORD = "password123";

router.post("/auth/demo-login", demoRateLimit, async (req, res): Promise<void> => {
  const cfIp = req.headers["cf-connecting-ip"] as string | undefined;
  const ip = cfIp ?? req.ip;
  const tokenOk = await verifyTurnstileToken(req.body?.turnstileToken, ip);
  if (!tokenOk) {
    res.status(403).json({ error: "Security check failed. Please refresh and try again." });
    return;
  }

  try {
    // Find or create demo org
    let [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.subdomain, DEMO_ORG_SUBDOMAIN));
    if (!org) {
      [org] = await db.insert(organizationsTable).values({
        name: DEMO_ORG_NAME,
        subdomain: DEMO_ORG_SUBDOMAIN,
        plan: "starter",
        status: "active",
      }).returning();
    }

    // Find or create demo user — email is globally unique, so look up without org filter
    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, DEMO_USER_EMAIL));
    if (!user) {
      [user] = await db.insert(usersTable).values({
        name: DEMO_USER_NAME,
        email: DEMO_USER_EMAIL,
        passwordHash: hashPassword(DEMO_USER_PASSWORD),
        role: "admin",
        organizationId: org.id,
        organization: DEMO_ORG_NAME,
        status: "active",
      }).returning();
    } else if (user.organizationId !== org.id) {
      // Migrate user to the correct demo org if it changed
      [user] = await db.update(usersTable)
        .set({ organizationId: org.id, organization: DEMO_ORG_NAME })
        .where(eq(usersTable.id, user.id))
        .returning();
    }

    // Reset demo feed only if 1 hour has passed — preserves field-user posts within the window
    await maybeResetDemoOrg();

    req.session.userId = user.id;
    res.json({ subdomain: DEMO_ORG_SUBDOMAIN });
  } catch (err) {
    logger.error({ err }, "demo-login failed");
    res.status(500).json({ error: "Demo is temporarily unavailable. Please try again." });
  }
});

const DEMO_FIELD_USER_EMAIL = "demouser@sentconnect.org";

router.post("/auth/demo-user-login", demoRateLimit, async (req, res): Promise<void> => {
  const cfIp = req.headers["cf-connecting-ip"] as string | undefined;
  const ip = cfIp ?? req.ip;
  const tokenOk = await verifyTurnstileToken(req.body?.turnstileToken, ip);
  if (!tokenOk) {
    res.status(403).json({ error: "Security check failed. Please refresh and try again." });
    return;
  }

  try {
    // Reset demo feed only if 1 hour has passed
    await maybeResetDemoOrg();

    const [user] = await db
      .select({ id: usersTable.id, status: usersTable.status })
      .from(usersTable)
      .where(eq(usersTable.email, DEMO_FIELD_USER_EMAIL))
      .limit(1);

    if (!user) {
      res.status(503).json({ error: "Demo is temporarily unavailable. Please try again shortly." });
      return;
    }

    if (user.status !== "active") {
      await db.update(usersTable).set({ status: "active" }).where(eq(usersTable.id, user.id));
    }

    req.session.userId = user.id;
    res.json({ subdomain: DEMO_ORG_SUBDOMAIN });
  } catch (err) {
    logger.error({ err }, "demo-user-login failed");
    res.status(500).json({ error: "Demo is temporarily unavailable. Please try again." });
  }
});

export default router;
