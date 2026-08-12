---
name: demo demo-org seeding dual path
description: Why demo-org seed data (posts, photos) must be edited in two places in the api-server seed module.
---

# Demo org seeding has two code paths that must stay in sync

The demo org's feed is seeded by two separate functions in the api-server seed
module: an idempotent "seed if empty" path (runs when the demo org has no
reports) and an hourly "reset" path (wipes ALL demo posts + their photos/likes/
comments, then reinserts the same canonical posts). Both insert the identical set
of demo posts.

**Rule:** Any change to demo seed content (add a post, add sample photos, edit
copy) must be applied to BOTH functions, or it will silently disappear on the
next hourly reset.

**Why:** the reset path deletes demo photos every cycle, so photos added only to
the "seed if empty" path (or inserted directly into the DB) get wiped within an
hour.

**How to apply:** when seeding related child rows (e.g. photos) after inserting
reports, use `.returning({ id, title })` and map children by a stable key like
title — Postgres multi-row `INSERT ... RETURNING` order is not contractually
guaranteed, so index-based mapping is fragile.

**Sweeper note:** visitor-created demo posts are also deleted by a background
sweeper 30 minutes after posting (checked every minute). Seed posts are exempt
via the `is_demo_seed` flag on reports — any new seed post insert (in BOTH seed
paths) must set that flag true, or the sweeper removes it after 30 minutes. Do
not identify seed posts by title: titles are nullable and visitor-spoofable.

**Production note:** on Render, a redeploy restarts the server (reset timer =
null), so the first demo login after deploy triggers the reset immediately —
new seed content appears right away rather than waiting an hour.
