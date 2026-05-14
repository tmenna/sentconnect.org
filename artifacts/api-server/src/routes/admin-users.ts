import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { db, usersTable, reportsTable, organizationsTable } from "@workspace/db";
import { hashPassword } from "../lib/password";
import { logger } from "../lib/logger";
import { sendTemporaryPasswordEmail, emailConfigured } from "../lib/mailer";

const router: IRouter = Router();

function toUserResponse(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...rest } = user;
  return rest;
}

async function requireOrgAdmin(req: any, res: any): Promise<typeof usersTable.$inferSelect | null> {
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return null; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, currentUserId));
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    res.status(403).json({ error: "Admin access required" }); return null;
  }
  return user;
}

// POST /admin/users — create a new team member in the same org
router.post("/admin/users", async (req, res): Promise<void> => {
  const caller = await requireOrgAdmin(req, res);
  if (!caller) return;

  const { name, email, password, role } = req.body ?? {};

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ error: "Name must be at least 2 characters" }); return;
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" }); return;
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" }); return;
  }

  const assignedRole = role === "admin" ? "admin" : "field_user";

  // Email uniqueness check
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.trim().toLowerCase()));
  if (existing) {
    res.status(409).json({ error: "An account with that email already exists" }); return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role: assignedRole,
    status: "active",
    organizationId: caller.organizationId,
  }).returning();

  res.status(201).json(toUserResponse(user));
});

// PATCH /admin/users/:id — update role or status
router.patch("/admin/users/:id", async (req, res): Promise<void> => {
  const caller = await requireOrgAdmin(req, res);
  if (!caller) return;

  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }

  // Only allow editing users in the same org (super_admin has no org restriction)
  const conditions = [eq(usersTable.id, userId)];
  if (caller.role !== "super_admin" && caller.organizationId) {
    conditions.push(eq(usersTable.organizationId, caller.organizationId));
  }
  const [target] = await db.select().from(usersTable).where(and(...conditions));
  if (!target) { res.status(404).json({ error: "User not found" }); return; }

  // Prevent self-demotion
  if (target.id === caller.id && req.body.role && req.body.role !== "admin") {
    res.status(400).json({ error: "You cannot change your own role" }); return;
  }

  const updates: Record<string, unknown> = {};
  const { role, status, permissions, newPassword } = req.body ?? {};
  if (role === "admin" || role === "field_user") updates.role = role;
  if (status === "active" || status === "inactive") updates.status = status;
  if (permissions !== undefined) updates.permissions = JSON.stringify(permissions);
  if (newPassword !== undefined) {
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" }); return;
    }
    updates.passwordHash = hashPassword(newPassword);
    updates.resetToken = null;
    updates.resetTokenExpiry = null;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No valid fields to update" }); return;
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  res.json(toUserResponse(updated));
});

// DELETE /admin/users/:id — remove a user from the org
router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  const caller = await requireOrgAdmin(req, res);
  if (!caller) return;

  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }
  if (userId === caller.id) { res.status(400).json({ error: "You cannot delete your own account" }); return; }

  const conditions = [eq(usersTable.id, userId)];
  if (caller.role !== "super_admin" && caller.organizationId) {
    conditions.push(eq(usersTable.organizationId, caller.organizationId));
  }
  const [target] = await db.select().from(usersTable).where(and(...conditions));
  if (!target) { res.status(404).json({ error: "User not found" }); return; }

  // Guard: cannot remove the last admin from an org
  if (target.role === "admin" && target.organizationId) {
    const orgAdmins = await db.select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.organizationId, target.organizationId), eq(usersTable.role, "admin")));
    const otherAdmins = orgAdmins.filter(a => a.id !== userId);
    if (otherAdmins.length === 0) {
      res.status(400).json({
        error: "Cannot remove the only administrator. Please promote another member to Admin first.",
      });
      return;
    }
  }

  // Delete user's reports first (foreign key constraint — missionaryId is notNull)
  await db.delete(reportsTable).where(eq(reportsTable.missionaryId, target.id));

  await db.delete(usersTable).where(eq(usersTable.id, target.id));
  res.sendStatus(204);
});

// POST /admin/users/:id/reset-password
// Body: { action?: "email" | "generate" }
//   "email"    (default) — generate temp password, set it, send to user's email
//   "generate"           — generate temp password, set it, return it to admin (no email sent)
router.post("/admin/users/:id/reset-password", async (req, res): Promise<void> => {
  const caller = await requireOrgAdmin(req, res);
  if (!caller) return;

  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }

  const action: "email" | "generate" = req.body?.action === "generate" ? "generate" : "email";

  const conditions = [eq(usersTable.id, userId)];
  if (caller.role !== "super_admin" && caller.organizationId) {
    conditions.push(eq(usersTable.organizationId, caller.organizationId));
  }
  const [target] = await db.select().from(usersTable).where(and(...conditions));
  if (!target) { res.status(404).json({ error: "User not found" }); return; }

  // Generate a readable temporary password: e.g. "Kp7#rmxQ4!sv"
  const upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower   = "abcdefghjkmnpqrstuvwxyz";
  const digits  = "23456789";
  const special = "!@#$";
  const rand = (set: string) => set[crypto.randomInt(set.length)];
  const tempPassword = [
    rand(upper), rand(lower), rand(lower), rand(lower),
    rand(digits), rand(special),
    rand(lower), rand(lower), rand(digits),
    rand(lower), rand(upper), rand(digits),
  ].sort(() => crypto.randomInt(3) - 1).join("");

  // Save the hashed temp password and clear any pending reset token
  await db.update(usersTable)
    .set({ passwordHash: hashPassword(tempPassword), resetToken: null, resetTokenExpiry: null })
    .where(eq(usersTable.id, userId));

  if (action === "generate") {
    req.log.info({ userId, email: target.email }, "Admin reset-password: temp password generated (shown to admin)");
    res.json({ message: "Temporary password generated", tempPassword });
    return;
  }

  // action === "email" — resolve org and send the email
  let orgName: string | undefined;
  let orgSubdomain: string | null = null;
  if (target.organizationId) {
    const [org] = await db.select({ name: organizationsTable.name, subdomain: organizationsTable.subdomain })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, target.organizationId));
    orgName = org?.name;
    orgSubdomain = org?.subdomain ?? null;
  }

  const canonicalDomain = (process.env["TENANT_ROOT_DOMAINS"] ?? "sentconnect.org").split(",")[0].trim();
  const replitDomain = process.env["REPLIT_DOMAINS"]?.split(",")[0]?.trim();
  const baseUrl = process.env["APP_BASE_URL"]
    ?? (replitDomain ? `https://${replitDomain}` : `https://${canonicalDomain}`);
  const loginUrl = orgSubdomain
    ? `https://${orgSubdomain}.${canonicalDomain}/login`
    : `${baseUrl}/login`;

  if (emailConfigured) {
    const { sent, error: emailError } = await sendTemporaryPasswordEmail(
      target.email, tempPassword, target.name, loginUrl, orgName,
    );
    if (!sent) {
      req.log.warn({ userId, email: target.email, emailError }, "Admin reset-password: email send failed");
    } else {
      req.log.info({ userId, email: target.email }, "Admin reset-password: temporary password emailed");
    }
  } else {
    req.log.warn({ userId, email: target.email, tempPassword }, "Admin reset-password: email not configured — temp password logged only");
  }

  res.json({ message: "Temporary password sent to user's email" });
});

// GET /admin/branding — return the current org's logo URL
router.get("/admin/branding", async (req, res): Promise<void> => {
  const caller = await requireOrgAdmin(req, res);
  if (!caller) return;
  if (!caller.organizationId) {
    res.status(400).json({ error: "No organization associated with your account" }); return;
  }
  const [org] = await db.select({ logoUrl: organizationsTable.logoUrl }).from(organizationsTable).where(eq(organizationsTable.id, caller.organizationId));
  res.json({ logoUrl: org?.logoUrl ?? null });
});

// PATCH /admin/branding — update the current org's logo URL
router.patch("/admin/branding", async (req, res): Promise<void> => {
  const caller = await requireOrgAdmin(req, res);
  if (!caller) return;
  if (!caller.organizationId) {
    res.status(400).json({ error: "No organization associated with your account" }); return;
  }
  const { logoUrl } = req.body ?? {};
  if (logoUrl !== null && logoUrl !== undefined && typeof logoUrl !== "string") {
    res.status(400).json({ error: "logoUrl must be a string or null" }); return;
  }
  const [updated] = await db
    .update(organizationsTable)
    .set({ logoUrl: logoUrl || null })
    .where(eq(organizationsTable.id, caller.organizationId))
    .returning({ logoUrl: organizationsTable.logoUrl });
  res.json({ logoUrl: updated?.logoUrl ?? null });
});

export default router;
