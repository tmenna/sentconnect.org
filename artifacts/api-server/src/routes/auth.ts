import { Router, type IRouter } from "express";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { db, usersTable, organizationsTable } from "@workspace/db";
import { hashPassword } from "../lib/password";
import { logger } from "../lib/logger";
import { sendPasswordResetEmail, emailConfigured } from "../lib/mailer";
import { DEFAULT_LANDING_PAGE_CONTENT, getLandingPageContent } from "../lib/landing-page-content";

const router: IRouter = Router();

router.get("/landing-page", async (_req, res): Promise<void> => {
  try {
    res.json(await getLandingPageContent());
  } catch {
    res.json(DEFAULT_LANDING_PAGE_CONTENT);
  }
});

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
    })
    .from(organizationsTable)
    .where(eq(organizationsTable.subdomain, subdomain));

  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }

  res.json(org);
});

function toUserResponse(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...rest } = user;
  return rest;
}

// POST /auth/signup — create a new organization + first admin user
router.post("/auth/signup", async (req, res): Promise<void> => {
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

  const baseUrl = process.env["APP_BASE_URL"] ?? "https://church-connect-tekimenna.replit.app";
  const resetLink = `/reset-password?token=${token}`;
  const resetUrl = `${baseUrl}${resetLink}`;

  if (emailConfigured) {
    await sendPasswordResetEmail(user.email, resetUrl);
    res.json({ message: "If an account exists, a reset link has been sent." });
  } else {
    logger.info({ email: user.email, resetUrl }, "SMTP not configured — reset link logged");
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

export default router;
