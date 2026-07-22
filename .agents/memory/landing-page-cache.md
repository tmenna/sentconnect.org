---
name: Landing page content caching
description: Why landing page copy changes appear stale for up to 5 minutes
---

The public landing-page content API responds with `Cache-Control: public, max-age=300, stale-while-revalidate=60`. Browsers hold the JSON for ~5 minutes, so copy changes (hero title, description, etc.) look like they "didn't apply" even when the server already returns the new values.

**Why:** Burned time debugging a "stale headline" that was just the browser HTTP cache; server, code, and API were all correct.

**How to apply:** Frontend fetches of landing content use `{ cache: "no-store" }` so edits show immediately. When verifying copy changes via screenshots, confirm with `curl` against the API first — a stale screenshot does not mean the change failed. Note the landing content table is empty by default; defaults live in code in BOTH the frontend and api-server, and the api-server must be restarted to serve new defaults (it runs a built bundle, not watch mode).
