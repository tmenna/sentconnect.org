# SentTrack — Private Social Feed for Field Teams

## Overview

A Twitter/Instagram-style private social feed for missionary field teams. Users post short updates with drag-and-drop photos/videos, like and comment on posts, and set posts as public or private. Admins can view all users and stats. Public feed is accessible without login.

## Users & Access

- **Users (missionaries)** — post updates, like/comment, manage own posts
- **Admins** — view all reports/stats, see all users

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
- `/submit` — Submit report form (missionaries only)
- `/login` — Login
- `/admin` — Admin dashboard: all reports, filters, stats
- `/profile` — Current user profile

## DB Schema

Tables: `users`, `reports`, `photos`

## Artifacts

- `artifacts/api-server` — Express 5 API server (port auto-assigned, path `/api`)
- `artifacts/mission-reports` — React + Vite frontend (path `/`)

## Environment Variables

- `SESSION_SECRET` — Required for express-session
- `DATABASE_URL` — PostgreSQL connection string

## API Routes

- `GET /api/users` — List users (filter by role)
- `POST /api/users` — Create user
- `POST /api/users/login` — Login
- `GET /api/users/me` — Current user
- `DELETE /api/users/me` — Logout
- `GET /api/users/:id` — Get user
- `PATCH /api/users/:id` — Update user
- `GET /api/users/:id/reports` — User's reports
- `GET/POST /api/reports` — List/create reports
- `GET/PATCH/DELETE /api/reports/:id` — Get/update/delete report
- `POST /api/reports/:id/photos` — Add photo
- `DELETE /api/photos/:id` — Delete photo
- `GET /api/timeline` — Paginated timeline feed
- `GET /api/recent-activity` — Recent reports
- `GET /api/stats` — Impact statistics
