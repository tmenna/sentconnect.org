import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, organizationsTable, usersTable, reportsTable } from "@workspace/db";

const router: IRouter = Router();

async function requireSuperAdmin(req: any, res: any): Promise<boolean> {
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return false; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, currentUserId));
  if (!user || user.role !== "super_admin") {
    res.status(403).json({ error: "Super admin access required" }); return false;
  }
  return true;
}

// GET /super-admin/orgs — list all organizations with stats
router.get("/super-admin/orgs", async (req, res): Promise<void> => {
  if (!await requireSuperAdmin(req, res)) return;

  const orgs = await db.select().from(organizationsTable).orderBy(organizationsTable.createdAt);

  const orgsWithStats = await Promise.all(orgs.map(async (org) => {
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(usersTable).where(eq(usersTable.organizationId, org.id));
    const [postCount] = await db.select({ count: sql<number>`count(*)::int` })
      .from(reportsTable).where(eq(reportsTable.organizationId, org.id));
    return {
      ...org,
      userCount: userCount?.count ?? 0,
      postCount: postCount?.count ?? 0,
    };
  }));

  res.json(orgsWithStats);
});

// PATCH /super-admin/orgs/:id — activate/deactivate
router.patch("/super-admin/orgs/:id", async (req, res): Promise<void> => {
  if (!await requireSuperAdmin(req, res)) return;

  const orgId = Number(req.params.id);
  if (isNaN(orgId)) { res.status(400).json({ error: "Invalid org id" }); return; }

  const { status } = req.body ?? {};
  if (status !== "active" && status !== "inactive") {
    res.status(400).json({ error: "status must be 'active' or 'inactive'" }); return;
  }

  const [org] = await db.update(organizationsTable)
    .set({ status })
    .where(eq(organizationsTable.id, orgId))
    .returning();

  if (!org) { res.status(404).json({ error: "Organization not found" }); return; }
  res.json(org);
});

// GET /super-admin/stats — platform-wide totals
router.get("/super-admin/stats", async (req, res): Promise<void> => {
  if (!await requireSuperAdmin(req, res)) return;

  const [orgCount] = await db.select({ count: sql<number>`count(*)::int` }).from(organizationsTable);
  const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [postCount] = await db.select({ count: sql<number>`count(*)::int` }).from(reportsTable);

  res.json({
    totalOrgs: orgCount?.count ?? 0,
    totalUsers: userCount?.count ?? 0,
    totalPosts: postCount?.count ?? 0,
  });
});

// GET /super-admin/users — list all users across all orgs
router.get("/super-admin/users", async (req, res): Promise<void> => {
  if (!await requireSuperAdmin(req, res)) return;

  const users = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    status: usersTable.status,
    organizationId: usersTable.organizationId,
    organization: usersTable.organization,
    createdAt: usersTable.createdAt,
    avatarUrl: usersTable.avatarUrl,
    location: usersTable.location,
  }).from(usersTable).orderBy(usersTable.organizationId, usersTable.name);

  res.json(users);
});

// POST /super-admin/impersonate/:userId — set session to another user
router.post("/super-admin/impersonate/:userId", async (req, res): Promise<void> => {
  if (!await requireSuperAdmin(req, res)) return;

  const userId = Number(req.params.userId);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  req.session.userId = user.id;
  const { passwordHash: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...userData } = user;
  res.json({ message: `Now impersonating ${user.name}`, user: userData });
});

export default router;
