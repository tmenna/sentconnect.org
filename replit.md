# SentConnect — Private Social Feed for Field Teams

## Overview

A Twitter/Instagram-style private social feed for missionary field teams. Users post short updates with drag-and-drop photos/videos, like and comment on posts, and set posts as public or private. Admins can view all users and stats. Public feed is accessible without login.

## Users & Access

- **field_user (missionaries)** — post updates, like/comment, manage own posts
- **admin** — org-level: add/edit/deactivate/delete users, view all reports/stats
- **super_admin** — platform-wide full access: manage all organizations, platform users, impersonate
- **platform_admin** — platform-wide full access (same as super_admin minus the role promotion gate)
- **platform_manager** — platform access gated by a JSON `permissions` field on the user record

### Platform Permissions (platform_manager only)
`canViewOrganizations`, `canManageOrganizations`, `canViewUsers`, `canManageUsers`,
`canResetPasswords`, `canLockUnlockUsers`, `canSuspendUsers`, `canImpersonateUsers`

### User Status Values
`active` | `inactive` | `locked` | `suspended`

**Demo accounts:**
- Platform Admin (super_admin): `superadmin@sentconnect.org` / `password123`
- Org Admin: `admin@calvary.org` / `password123`
- User: `james@mission.org` / `password123`
- User: `maria@mission.org` / `password123`
- User: `david@mission.org` / `password123`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Fonts**: Inter (300/400/500/600/700) — used for both `font-sans` and `font-serif` aliases
- **Design system**: Linear/Vercel-inspired SaaS aesthetic — white cards on `hsl(220 20% 97%)` bg, 1px `border-border` borders, `shadow-sm` depth, `rounded-xl` cards, `rounded-full` filter pills, category colors (amber/blue/rose/emerald/slate)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: Session-based (express-session + crypto PBKDF2)
- **Build**: esbuild (ESM bundle); `connect-pg-simple` is externalized so Render can read its packaged `table.sql` asset for session table setup

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Multi-Tenant Subdomain Simulation

Path-based routing simulates subdomain multi-tenancy during development. The first URL segment is treated as the org slug if it is not a reserved route name. Production custom domains use real hostname routing, e.g. `calvary.sentconnect.org/login`.

| URL pattern | Meaning |
|---|---|
| `/ep2/login` | Login scoped to the "ep2" org |
| `/ep2/admin` | Admin dashboard for "ep2" org |
| `/ep2/feed` | Activity feed for "ep2" org |
| `/login` | Global login (no org scoping) |

**How it works:**
1. Frontend (`src/lib/org.ts`) extracts the org slug from the URL path
2. `OrgProvider` calls `setOrgSubdomain(slug)` which injects `X-Org-Subdomain: ep2` on every API request
3. Backend middleware (`middleware/org-resolver.ts`) reads the header, resolves the org, and attaches it to `req.resolvedOrg`
4. Login and other routes use `req.resolvedOrg` to scope DB queries

**Production hostname routing:** Set `USE_HOSTNAME_ROUTING=true` on Render. The API derives tenant context from hostnames ending in `sentconnect.org` by default; add `TENANT_ROOT_DOMAINS=sentconnect.org,example.org` for additional root domains. The frontend also recognizes `VITE_TENANT_ROOT_DOMAINS` at build time.

## User Identity & Profiles
- **Profile photo upload**: Users click "Upload Photo" on their profile page — a hidden `<input type="file">` triggers the presigned URL flow (metadata → `/api/storage/uploads/request-url` → PUT directly to GCS → avatar URL auto-saved via `PATCH /api/users/:id`). Avatar shown as circular image in feed, post cards, and admin table. Falls back to initials if no photo.
- **Object storage**: `@workspace/object-storage-web` `useUpload` hook used in profile.tsx. Stored URL format: `/api/storage/objects/<uuid>`. Package installed in mission-reports, tsconfig references updated.
- **Summary (bio)**: `bio` text column on `users` table. Editable by the user on their Profile page (max 250 chars, counter shown). Admins can also edit any member's summary inline from the Team table (hover row → pencil icon → inline textarea → Save).
- **Post card identity**: Each post shows avatar → author name (bold link) → 1-line truncated summary (if set, muted text, tooltip on hover) → timestamp + location. If no summary, the line is simply absent.
- **Public profile** (`/missionaries/:id`): Shows avatar, name, summary, location, joined date, and all posts. Accessible by admins and the user themselves.
- **Profile settings** (`/profile`): Name, avatar URL, location, sent-from church, and Summary field — available to all roles.

## Post Features
- **Composer**: single text input + optional media (drag & drop), location (with auto-detect), impact (people reached number), and ⭐ highlight toggle. No visibility selector — all posts are public by default.
- **Editing**: post authors click the 3-dot menu → Edit to open an inline editor; fields: text, location, people reached, highlight toggle. Saved via `PATCH /api/reports/:id`.
- **Highlight**: `is_highlight` boolean on `reports` table. Highlighted posts show an amber banner and are outlined in amber in the feed.
- **Impact**: `people_reached` integer on `reports` table, shown as an emerald badge on the post card.

## App Pages

- `/` — Timeline feed (main dashboard): chronological social-style feed of all missionary reports
- `/reports/:id` — Report detail: full story, photo gallery, impact metrics
- `/missionaries/:id` — Missionary profile: bio, location, report history
- `/submit` — Submit report form (field users only)
- `/login` — Login
- `/signup` — Create a new organization + first admin account
- `/forgot-password` — Request a password reset link
- `/reset-password` — Set a new password via token
- `/admin` — Admin dashboard: Team tab (add/manage users) + Activity Feed tab with filters
- `/super-admin` — Platform-wide admin (super_admin role only)
- `/profile` — Current user profile

## DB Schema

Tables: `organizations`, `users`, `reports`, `photos`

- `organizations`: id, name, subdomain, plan, status, createdAt
- `users`: id, name, email, passwordHash, role (admin|field_user|super_admin), status (active|inactive), bio, location, avatarUrl, organization, organizationId, resetToken, resetTokenExpiry, createdAt, updatedAt
- `reports`: id, content, location, peopleReached, authorId, organizationId, createdAt, updatedAt

## Artifacts

- `artifacts/api-server` — Express 5 API server (port auto-assigned, path `/api`)
- `artifacts/mission-reports` — React + Vite frontend (path `/`)

## Environment Variables

- `SESSION_SECRET` — Required for express-session
- `DATABASE_URL` — PostgreSQL connection string

## API Routes

**Auth**
- `GET /api/orgs/resolve?subdomain=calvary` — Public tenant existence/status check used before showing org login
- `POST /api/auth/signup` — Create org + first admin user
- `POST /api/auth/forgot-password` — Generate password reset token
- `POST /api/auth/reset-password` — Reset password via token
- `POST /api/users/login` — Login (returns session cookie)
- `DELETE /api/users/me` — Logout

**Users**
- `GET /api/users` — List org users (org-scoped)
- `GET /api/users/me` — Current user
- `GET /api/users/:id` — Get user
- `PATCH /api/users/:id` — Update user profile

**Admin — Team Management** (admin role required)
- `POST /api/admin/users` — Create user in same org
- `PATCH /api/admin/users/:id` — Update role or status (active/inactive)
- `DELETE /api/admin/users/:id` — Delete user
- `POST /api/admin/users/:id/reset-password` — Generate 24-hour reset link

**Reports**
- `GET/POST /api/reports` — List/create reports (org-scoped)
- `GET /api/reports/export` — Download all org reports as CSV (admin only)
- `GET/PATCH/DELETE /api/reports/:id` — Get/update/delete report
- `POST /api/reports/:id/photos` — Add photo
- `DELETE /api/photos/:id` — Delete photo
- `GET /api/timeline` — Paginated timeline feed
- `GET /api/recent-activity` — Recent reports
- `GET /api/stats` — Impact statistics

**Super Admin** (super_admin role required)
- `GET /api/super-admin/orgs` — List all organizations
- `PATCH /api/super-admin/orgs/:id` — Update org status
- `GET /api/super-admin/stats` — Platform-wide stats
- `POST /api/super-admin/impersonate/:userId` — Impersonate a user
