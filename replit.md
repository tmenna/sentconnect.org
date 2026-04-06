# SentConnect — Private Social Feed for Field Teams

## Overview

A Twitter/Instagram-style private social feed for missionary field teams. Users post short updates with drag-and-drop photos/videos, like and comment on posts, and set posts as public or private. Admins can view all users and stats. Public feed is accessible without login.

## Users & Access

- **field_user (missionaries)** — post updates, like/comment, manage own posts
- **admin** — full team management: add/edit/deactivate/delete users, view all reports/stats
- **super_admin** — platform-wide access: manage all organizations, impersonate users

**Demo accounts:**
- Admin: `admin@calvary.org` / `password123`
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
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

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
