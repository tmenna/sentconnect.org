import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { db, usersTable, reportsTable } from "@workspace/db";
import { hashPassword } from "../lib/password";
import { logger } from "../lib/logger";

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

// POST /admin/users/:id/reset-password — generate reset link for a user
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
  const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours for admin-generated links

  await db.update(usersTable)
    .set({ resetToken: token, resetTokenExpiry: expiry })
    .where(eq(usersTable.id, userId));

  const resetLink = `/reset-password?token=${token}`;
  logger.info({ userId, email: target.email, resetLink }, "Admin-generated password reset link");

  res.json({
    message: "Reset link generated",
    resetLink,
    expiresIn: "24 hours",
  });
});

export default router;
