import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { db, usersTable, reportsTable, organizationsTable } from "@workspace/db";
import { hashPassword } from "../lib/password";
import { logger } from "../lib/logger";
import { sendPasswordResetEmail, emailConfigured } from "../lib/mailer";

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
  const { role, status, permissions } = req.body ?? {};
  if (role === "admin" || role === "field_user") updates.role = role;
  if (status === "active" || status === "inactive") updates.status = status;
  if (permissions !== undefined) {
    updates.permissions = JSON.stringify(permissions);
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

// POST /admin/users/:id/reset-password — send a password reset email directly to the user
router.post("/admin/users/:id/reset-password", async (req, res): Promise<void> => {
  const caller = await requireOrgAdmin(req, res);
  if (!caller) return;

  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }

  const conditions = [eq(usersTable.id, userId)];
  if (caller.role !== "super_admin" && caller.organizationId) {
    conditions.push(eq(usersTable.organizationId, caller.organizationId));
  }
  const [target] = await db.select().from(usersTable).where(and(...conditions));
  if (!target) { res.status(404).json({ error: "User not found" }); return; }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  await db.update(usersTable)
    .set({ resetToken: token, resetTokenExpiry: expiry })
    .where(eq(usersTable.id, userId));

  // Build the full reset URL the same way auth.ts does
  const canonicalDomain = (process.env["TENANT_ROOT_DOMAINS"] ?? "sentconnect.org").split(",")[0].trim();
  const replitDomain = process.env["REPLIT_DOMAINS"]?.split(",")[0]?.trim();
  const baseUrl = process.env["APP_BASE_URL"]
    ?? (replitDomain ? `https://${replitDomain}` : `https://${canonicalDomain}`);
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  // Resolve org name for the email template
  let orgName: string | undefined;
  if (target.organizationId) {
    const [org] = await db.select({ name: organizationsTable.name })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, target.organizationId));
    orgName = org?.name;
  }

  if (emailConfigured) {
    const { sent, error: emailError } = await sendPasswordResetEmail(target.email, resetUrl, orgName);
    if (!sent) {
      req.log.warn({ userId, email: target.email, emailError }, "Admin reset-password: email send failed");
    } else {
      req.log.info({ userId, email: target.email }, "Admin reset-password: email sent");
    }
  } else {
    req.log.warn({ userId, email: target.email, resetUrl }, "Admin reset-password: email not configured — reset URL logged only");
  }

  res.json({ message: "Password reset email sent", expiresIn: "24 hours" });
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
