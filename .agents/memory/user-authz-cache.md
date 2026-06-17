---
name: User authz cache
description: api-server caches user records in memory; authz-affecting mutations must invalidate it.
---

The api-server `reports.ts` keeps an in-memory user cache (`getCurrentUser`, ~30s TTL) used on hot read paths and for authorization decisions (role, status, JSON `permissions`).

**Rule:** Any endpoint that mutates a user's role, status, or permissions must call `invalidateUserCache(userId)` (exported from `reports.ts`) after the update, or the change won't take effect until the cache expires (up to ~30s).

**Why:** Permission grants/revokes appeared to "not work" because a freshly-logged-in user was cached without the new permission. Admin PATCH of `users.permissions` had no effect for up to 30s.

**How to apply:** When adding/editing user-mutating routes (admin user management, profile updates that touch role/status/permissions, impersonation), import and call `invalidateUserCache`. Watch for the reverse coupling (route module importing from `reports.ts`) — currently no circular import.
