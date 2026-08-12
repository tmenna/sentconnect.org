---
name: Landing page content caching
description: Why landing page copy changes appear stale for up to 5 minutes
---

The landing page, About page, and platform logos are now STATIC — bundled with the frontend (`DEFAULT_LANDING_PAGE_CONTENT` / `DEFAULT_ABOUT_PAGE_CONTENT` in App.tsx, static logo assets in logo-provider). The CMS layer (Platform Admin tabs "Landing Page", "About Page", "Logos & Branding") and the public `/api/landing-page` + `/api/about-page` routes were removed at the user's request to eliminate content-swap flicker. Platform Admin keeps only Platform Users, Organizations, All Users.

**Why:** Content fetched at runtime painted defaults first, then swapped — visible lag/flash. Content tables were empty in both dev and prod, so removal lost nothing.

**How to apply:** To change public site copy or platform logos, edit the constants/assets in code — do not rebuild a CMS or re-add the routes. Per-org logos are still dynamic via `/api/orgs/resolve` (cached in localStorage `sc-org-logos-v1`). `mailer.ts` still uses the api-server's `landing-page-content` lib for email branding — keep that lib. PDF export uses the bundled blue/black logo (white header background). When verifying copy changes via screenshots, confirm with `curl` against the API first — a stale screenshot does not mean the change failed. Note the landing content table is empty by default; defaults live in code in BOTH the frontend and api-server, and the api-server must be restarted to serve new defaults (it runs a built bundle, not watch mode).
