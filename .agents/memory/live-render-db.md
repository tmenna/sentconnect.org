---
name: Live Render database
description: The real production app runs on Render with a separate database from Replit's "production" DB.
---
The live site (sentconnect.org) is hosted on Render (deployed via git), NOT Replit deployments.

**Key facts:**
- Replit's "production" database is NOT the live DB — it only has org 12 (Rancho Community Church, `rcc`). Do not treat it as live data.
- The real live DB is reachable read-only via the `LIVE_DATABASE_URL` secret (Render external Postgres URL), e.g. `psql "$LIVE_DATABASE_URL" -Atc "..."`.
- Live active orgs (as of Aug 2026): Redeemer Church SCV (`rc`), Demo Organization (`demo`).
- **Why:** avoids wrongly concluding "org X doesn't exist" from Replit DBs.
- **How to apply:** for any "check live/production data" request, query LIVE_DATABASE_URL, read-only only. Render app logs are not accessible without a Render API key.
