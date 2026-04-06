import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  ListUsersQueryParams,
  CreateUserBody,
  GetUserParams,
  UpdateUserParams,
  UpdateUserBody,
  LoginUserBody,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword } from "../lib/password";

const router: IRouter = Router();

function toUserResponse(user: typeof usersTable.$inferSelect) {
  const { passwordHash: _pw, resetToken: _rt, resetTokenExpiry: _rte, ...rest } = user;
  return rest;
}

router.get("/users", async (req, res): Promise<void> => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Determine caller's org
  const currentUserId = req.session?.userId as number | undefined;
  let callerOrgId: number | null = null;
  let isAdmin = false;
  let isSuperAdmin = false;
  if (currentUserId) {
    const [caller] = await db.select().from(usersTable).where(eq(usersTable.id, currentUserId));
    callerOrgId = caller?.organizationId ?? null;
    isAdmin = caller?.role === "admin";
    isSuperAdmin = caller?.role === "super_admin";
  }

  let users;
  if (isSuperAdmin) {
    // Super admin sees all users
    users = parsed.data.role
      ? await db.select().from(usersTable).where(eq(usersTable.role, parsed.data.role))
      : await db.select().from(usersTable);
  } else if (callerOrgId !== null) {
    // Scoped to org
    const conditions = [eq(usersTable.organizationId, callerOrgId)];
    if (parsed.data.role) conditions.push(eq(usersTable.role, parsed.data.role));
    users = await db.select().from(usersTable).where(and(...conditions));
  } else {
    users = await db.select().from(usersTable);
  }

  res.json(users.map(toUserResponse));
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { password, ...rest } = parsed.data;
  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({ ...rest, passwordHash }).returning();
  res.status(201).json(toUserResponse(user));
});

router.post("/users/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // When an org context is resolved (via X-Org-Subdomain header), scope the
  // login to that org — preventing cross-org credential reuse.
  // SWAP POINT: req.resolvedOrg is populated by the org-resolver middleware,
  // which will later read from req.hostname instead of the header.
  const orgId = req.resolvedOrg?.id;
  const whereClause = orgId
    ? and(eq(usersTable.email, parsed.data.email), eq(usersTable.organizationId, orgId))
    : eq(usersTable.email, parsed.data.email);

  const [user] = await db.select().from(usersTable).where(whereClause);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (user.status === "inactive") {
    res.status(403).json({ error: "Your account has been deactivated. Contact your admin." });
    return;
  }
  req.session.userId = user.id;
  res.json({ user: toUserResponse(user) });
});

router.get("/users/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(toUserResponse(user));
});

router.delete("/users/me", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.sendStatus(204);
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(toUserResponse(user));
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateUserBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (body.data.name != null) updates.name = body.data.name;
  if (body.data.bio !== undefined) updates.bio = body.data.bio;
  if (body.data.location !== undefined) updates.location = body.data.location;
  if (body.data.avatarUrl !== undefined) updates.avatarUrl = body.data.avatarUrl;
  if (body.data.organization !== undefined) updates.organization = body.data.organization;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(toUserResponse(user));
});

export default router;
