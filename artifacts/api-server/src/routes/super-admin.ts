import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
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

async function requireSuperAdminOnly(req: any, res: any): Promise<boolean> {
  const caller = req.platformUser;
  if (caller?.role === "super_admin") return true;
  res.status(403).json({ error: "Only super_admin can perform this action" });
  return false;
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

// POST /super-admin/orgs — create a new organization
router.post("/super-admin/orgs", requireSuperOrPlatformAdmin, async (req, res): Promise<void> => {
  const { name, subdomain, plan } = req.body ?? {};
  if (!name || !subdomain) {
    res.status(400).json({ error: "name and subdomain are required" }); return;
  }
  const slug = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
  if (!/^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(slug)) {
    res.status(400).json({ error: "subdomain must be lowercase letters, numbers, and hyphens" }); return;
  }
  const [existing] = await db.select({ id: organizationsTable.id })
    .from(organizationsTable).where(eq(organizationsTable.subdomain, slug));
  if (existing) { res.status(409).json({ error: "Subdomain already in use" }); return; }

  const [org] = await db.insert(organizationsTable)
    .values({ name: name.trim(), subdomain: slug, plan: plan ?? "free" })
    .returning();
  res.status(201).json(org);
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

// DELETE /super-admin/orgs/:id — permanently delete an organization
router.delete("/super-admin/orgs/:id", requireSuperOrPlatformAdmin, async (req, res): Promise<void> => {
  if (!await requireSuperAdminOnly(req, res)) return;

  const orgId = Number(req.params.id);
  if (isNaN(orgId)) { res.status(400).json({ error: "Invalid org id" }); return; }

  const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.id, orgId));
  if (!org) { res.status(404).json({ error: "Organization not found" }); return; }

  await db.delete(organizationsTable).where(eq(organizationsTable.id, orgId));
  res.json({ message: `Organization "${org.name}" deleted`, id: orgId });
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

// POST /super-admin/users — create a platform-level or org user
router.post("/super-admin/users", requireSuperOrPlatformAdmin, async (req, res): Promise<void> => {
  const { name, email, password, role, permissions, organizationId } = req.body ?? {};
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password are required" }); return;
  }

  const platformRoles = ["platform_admin", "platform_manager"];
  const orgRoles = ["admin", "field_user"];
  const allValidRoles = [...platformRoles, ...orgRoles];

  if (!allValidRoles.includes(role)) {
    res.status(400).json({ error: `role must be one of: ${allValidRoles.join(", ")}` }); return;
  }

  // Org roles require an organizationId
  if (orgRoles.includes(role) && !organizationId) {
    res.status(400).json({ error: "organizationId is required for admin and field_user roles" }); return;
  }

  const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
  if (existing) { res.status(409).json({ error: "Email already in use" }); return; }

  let orgRecord: typeof organizationsTable.$inferSelect | undefined;
  if (organizationId) {
    const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.id, Number(organizationId)));
    if (!org) { res.status(404).json({ error: "Organization not found" }); return; }
    orgRecord = org;
  }

  const permsJson = role === "platform_manager" && permissions
    ? JSON.stringify(permissions)
    : null;

  const [created] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    permissions: permsJson,
    organizationId: orgRecord?.id ?? null,
    organization: orgRecord?.name ?? "SentConnect Platform",
  }).returning();

  res.status(201).json(toSafeUser(created));
});

// PATCH /super-admin/users/:id — update role, permissions, status, or organizationId
router.patch("/super-admin/users/:id", requireSuperOrPlatformAdmin, async (req, res): Promise<void> => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }

  const caller = req.platformUser!;
  if (caller.id === userId && caller.role !== "super_admin") {
    res.status(403).json({ error: "Cannot modify your own account" }); return;
  }

  const { role, permissions, status, organizationId } = req.body ?? {};
  const updates: Partial<typeof usersTable.$inferInsert> = {};

  if (role !== undefined) {
    if (!["platform_admin", "platform_manager", "super_admin", "admin", "field_user"].includes(role)) {
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

  // organizationId: null removes from org; number assigns to org
  if ("organizationId" in (req.body ?? {})) {
    if (organizationId === null) {
      updates.organizationId = null;
      updates.organization = null;
    } else {
      const orgId = Number(organizationId);
      if (isNaN(orgId)) { res.status(400).json({ error: "Invalid organizationId" }); return; }
      const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.id, orgId));
      if (!org) { res.status(404).json({ error: "Organization not found" }); return; }
      updates.organizationId = org.id;
      updates.organization = org.name;
    }
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

// DELETE /super-admin/users/:id — permanently delete a user
// super_admin: can delete any non-super_admin user
// platform_admin: can delete org-level users (admin, field_user) only
router.delete("/super-admin/users/:id", requireSuperOrPlatformAdmin, async (req, res): Promise<void> => {
  const caller = req.platformUser!;

  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }
  if (caller.id === userId) { res.status(403).json({ error: "Cannot delete your own account" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const isPlatformRole = (r: string) => ["super_admin", "platform_admin", "platform_manager"].includes(r);

  // super_admin: cannot delete other super_admins
  if (user.role === "super_admin") {
    res.status(403).json({ error: "Cannot delete another super_admin" }); return;
  }

  // platform_admin: can only delete org-level roles (admin, field_user), not other platform users
  if (caller.role === "platform_admin" && isPlatformRole(user.role)) {
    res.status(403).json({ error: "Platform administrators can only delete organization users" }); return;
  }

  // Guard: cannot remove the only admin from an org
  if (user.role === "admin" && user.organizationId) {
    const orgAdmins = await db.select({ id: usersTable.id })
      .from(usersTable)
      .where(and(eq(usersTable.organizationId, user.organizationId), eq(usersTable.role, "admin")));
    const otherAdmins = orgAdmins.filter(a => a.id !== userId);
    if (otherAdmins.length === 0) {
      res.status(400).json({
        error: "Cannot remove the only administrator. Please promote another member to Admin first.",
      });
      return;
    }
  }

  // Delete user's reports first (foreign key constraint)
  await db.delete(reportsTable).where(eq(reportsTable.missionaryId, userId));

  await db.delete(usersTable).where(eq(usersTable.id, userId));
  res.json({ message: `User "${user.name}" deleted`, id: userId });
});

// ─── Own Profile ──────────────────────────────────────────────────────────────

// PATCH /super-admin/profile — update the signed-in platform user's own name, email, or password
router.patch("/super-admin/profile", requirePlatformAccess, async (req, res): Promise<void> => {
  const caller = req.platformUser!;
  const { name, email, newPassword } = req.body ?? {};

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name && typeof name === "string" && name.trim()) updates.name = name.trim();
  if (email && typeof email === "string" && email.trim()) {
    // Ensure no other user has this email
    const [conflict] = await db.select({ id: usersTable.id })
      .from(usersTable).where(and(eq(usersTable.email, email.trim()), eq(usersTable.id, caller.id)));
    // conflict means it's already their own email — fine; if a different user has it, block it
    const [otherConflict] = await db.select({ id: usersTable.id })
      .from(usersTable).where(eq(usersTable.email, email.trim()));
    if (otherConflict && otherConflict.id !== caller.id) {
      res.status(409).json({ error: "Email already in use by another account" }); return;
    }
    updates.email = email.trim();
  }
  if (newPassword && typeof newPassword === "string" && newPassword.length >= 8) {
    updates.passwordHash = hashPassword(newPassword);
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No valid fields to update" }); return;
  }

  const [updated] = await db.update(usersTable).set(updates)
    .where(eq(usersTable.id, caller.id)).returning();
  res.json(toSafeUser(updated));
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
