import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

export type PlatformPermissions = {
  canViewOrganizations: boolean;
  canManageOrganizations: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
  canResetPasswords: boolean;
  canLockUnlockUsers: boolean;
  canSuspendUsers: boolean;
  canImpersonateUsers: boolean;
};

export const DEFAULT_PERMISSIONS: PlatformPermissions = {
  canViewOrganizations: false,
  canManageOrganizations: false,
  canViewUsers: false,
  canManageUsers: false,
  canResetPasswords: false,
  canLockUnlockUsers: false,
  canSuspendUsers: false,
  canImpersonateUsers: false,
};

export function parsePermissions(raw: string | null | undefined): PlatformPermissions {
  if (!raw) return { ...DEFAULT_PERMISSIONS };
  try {
    return { ...DEFAULT_PERMISSIONS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PERMISSIONS };
  }
}

export const PLATFORM_ROLES = ["super_admin", "platform_admin", "platform_manager"] as const;
export type PlatformRole = typeof PLATFORM_ROLES[number];

export function isPlatformRole(role: string): role is PlatformRole {
  return (PLATFORM_ROLES as readonly string[]).includes(role);
}

declare module "express-serve-static-core" {
  interface Request {
    platformUser?: typeof usersTable.$inferSelect;
  }
}

async function loadPlatformUser(req: Request, res: Response): Promise<typeof usersTable.$inferSelect | null> {
  const userId = req.session?.userId as number | undefined;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || !isPlatformRole(user.role)) {
    res.status(403).json({ error: "Platform access required" });
    return null;
  }
  return user;
}

export async function requirePlatformAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await loadPlatformUser(req, res);
  if (!user) return;
  req.platformUser = user;
  next();
}

export function requirePermission(key: keyof PlatformPermissions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await loadPlatformUser(req, res);
    if (!user) return;
    req.platformUser = user;

    if (user.role === "super_admin" || user.role === "platform_admin") {
      next();
      return;
    }

    const perms = parsePermissions(user.permissions);
    if (!perms[key]) {
      res.status(403).json({ error: `Permission denied: ${key}` });
      return;
    }
    next();
  };
}

export async function requireSuperOrPlatformAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await loadPlatformUser(req, res);
  if (!user) return;
  if (user.role !== "super_admin" && user.role !== "platform_admin") {
    res.status(403).json({ error: "super_admin or platform_admin required" });
    return;
  }
  req.platformUser = user;
  next();
}
