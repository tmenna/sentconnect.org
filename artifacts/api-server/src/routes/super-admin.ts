import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";
import { db, organizationsTable, usersTable, reportsTable } from "@workspace/db";
import { hashPassword } from "../lib/password";
import {
  requirePlatformAccess,
  requirePermission,
  requireSuperOrPlatformAdmin,
  parsePermissions,
  type PlatformPermissions,
} from "../middleware/platform-access";

const router: IRouter = Router();

function toSafeUser(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...rest } = user;
  return rest;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

router.get("/super-admin/stats", requirePlatformAccess, async (req, res): Promise<void> => {
  const [orgCount] = await db.select({ count: sql<number>`count(*)::int` }).from(organizationsTable);
  const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [postCount] = await db.select({ count: sql<number>`count(*)::int` }).from(reportsTable);
  res.json({
    totalOrgs: orgCount?.count ?? 0,
    totalUsers: userCount?.count ?? 0,
    totalPosts: postCount?.count ?? 0,
  });
});

// ─── Organizations ────────────────────────────────────────────────────────────

router.get("/super-admin/orgs", requirePermission("canViewOrganizations"), async (req, res): Promise<void> => {
  const orgs = await db.select().from(organizationsTable).orderBy(organizationsTable.createdAt);
  const orgsWithStats = await Promise.all(orgs.map(async (org) => {
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(usersTable).where(eq(usersTable.organizationId, org.id));
    const [postCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(reportsTable).where(eq(reportsTable.organizationId, org.id));
    return { ...org, userCount: userCount?.count ?? 0, postCount: postCount?.count ?? 0 };
  }));
  res.json(orgsWithStats);
});

router.patch("/super-admin/orgs/:id", requirePermission("canManageOrganizations"), async (req, res): Promise<void> => {
  const orgId = Number(req.params.id);
  if (isNaN(orgId)) { res.status(400).json({ error: "Invalid org id" }); return; }
  const { status } = req.body ?? {};
  if (status !== "active" && status !== "inactive") {
    res.status(400).json({ error: "status must be 'active' or 'inactive'" }); return;
  }
  const [org] = await db.update(organizationsTable).set({ status })
    .where(eq(organizationsTable.id, orgId)).returning();
  if (!org) { res.status(404).json({ error: "Organization not found" }); return; }
  res.json(org);
});

// ─── All Users (cross-org view) ───────────────────────────────────────────────

router.get("/super-admin/users", requirePermission("canViewUsers"), async (req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    status: usersTable.status,
    organizationId: usersTable.organizationId,
    organization: usersTable.organization,
    permissions: usersTable.permissions,
    createdAt: usersTable.createdAt,
    avatarUrl: usersTable.avatarUrl,
    location: usersTable.location,
  }).from(usersTable).orderBy(usersTable.organizationId, usersTable.name);
  res.json(users);
});

// ─── Platform User Management ─────────────────────────────────────────────────

// POST /super-admin/users — create a platform-level user
router.post("/super-admin/users", requireSuperOrPlatformAdmin, async (req, res): Promise<void> => {
  const { name, email, password, role, permissions } = req.body ?? {};
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password are required" }); return;
  }
  const validPlatformRoles = ["platform_admin", "platform_manager"];
  if (!validPlatformRoles.includes(role)) {
    res.status(400).json({ error: "role must be platform_admin or platform_manager" }); return;
  }
  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
  if (existing) { res.status(409).json({ error: "Email already in use" }); return; }

  const permsJson = role === "platform_manager" && permissions
    ? JSON.stringify(permissions)
    : null;

  const [created] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    permissions: permsJson,
    organization: "SentConnect Platform",
  }).returning();

  res.status(201).json(toSafeUser(created));
});

// PATCH /super-admin/users/:id — update role, permissions, or status
router.patch("/super-admin/users/:id", requireSuperOrPlatformAdmin, async (req, res): Promise<void> => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }

  const caller = req.platformUser!;
  if (caller.id === userId && caller.role !== "super_admin") {
    res.status(403).json({ error: "Cannot modify your own account" }); return;
  }

  const { role, permissions, status } = req.body ?? {};
  const updates: Partial<typeof usersTable.$inferInsert> = {};

  if (role !== undefined) {
    const allowed = ["platform_admin", "platform_manager"];
    if (caller.role !== "super_admin") allowed.push(); // only super_admin can promote to super_admin
    if (!["platform_admin", "platform_manager", "super_admin"].includes(role)) {
      res.status(400).json({ error: "Invalid role" }); return;
    }
    if (role === "super_admin" && caller.role !== "super_admin") {
      res.status(403).json({ error: "Only super_admin can assign super_admin role" }); return;
    }
    updates.role = role;
  }

  if (permissions !== undefined) {
    updates.permissions = JSON.stringify(permissions);
  }

  if (status !== undefined) {
    if (!["active", "inactive", "locked", "suspended"].includes(status)) {
      res.status(400).json({ error: "Invalid status" }); return;
    }
    updates.status = status;
  }

  const [updated] = await db.update(usersTable).set(updates)
    .where(eq(usersTable.id, userId)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json(toSafeUser(updated));
});

// ─── User Actions ─────────────────────────────────────────────────────────────

// POST /super-admin/users/:id/reset-password
router.post("/super-admin/users/:id/reset-password", requirePermission("canResetPasswords"), async (req, res): Promise<void> => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.update(usersTable).set({ resetToken: token, resetTokenExpiry: expiry })
    .where(eq(usersTable.id, userId));

  const resetUrl = `${process.env["FRONTEND_URL"] ?? "https://sentconnect.org"}/reset-password?token=${token}`;
  res.json({ message: "Password reset link generated", resetUrl, expiresAt: expiry });
});

// POST /super-admin/users/:id/lock
router.post("/super-admin/users/:id/lock", requirePermission("canLockUnlockUsers"), async (req, res): Promise<void> => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }
  const [updated] = await db.update(usersTable).set({ status: "locked" })
    .where(eq(usersTable.id, userId)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ message: "User locked", user: toSafeUser(updated) });
});

// POST /super-admin/users/:id/unlock
router.post("/super-admin/users/:id/unlock", requirePermission("canLockUnlockUsers"), async (req, res): Promise<void> => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }
  const [updated] = await db.update(usersTable).set({ status: "active" })
    .where(eq(usersTable.id, userId)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ message: "User unlocked", user: toSafeUser(updated) });
});

// POST /super-admin/users/:id/suspend
router.post("/super-admin/users/:id/suspend", requirePermission("canSuspendUsers"), async (req, res): Promise<void> => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }
  const [updated] = await db.update(usersTable).set({ status: "suspended" })
    .where(eq(usersTable.id, userId)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ message: "User suspended", user: toSafeUser(updated) });
});

// POST /super-admin/users/:id/unsuspend
router.post("/super-admin/users/:id/unsuspend", requirePermission("canSuspendUsers"), async (req, res): Promise<void> => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }
  const [updated] = await db.update(usersTable).set({ status: "active" })
    .where(eq(usersTable.id, userId)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ message: "User unsuspended", user: toSafeUser(updated) });
});

// ─── Impersonation ────────────────────────────────────────────────────────────

router.post("/super-admin/impersonate/:userId", requirePermission("canImpersonateUsers"), async (req, res): Promise<void> => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  req.session.userId = user.id;
  res.json({ message: `Now impersonating ${user.name}`, user: toSafeUser(user) });
});

export default router;
