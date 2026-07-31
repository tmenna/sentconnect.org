---
name: Signup flow modes
description: How self-serve paid signup vs request-access onboarding are gated
---

Self-serve paid signup (org creation + Stripe checkout) is gated by `SELF_SERVE_SIGNUP_ENABLED=true` — it gates both `POST /api/auth/signup` and `POST /api/billing/create-checkout-session`.

**Status (July 2026):** BOTH flows are now active. `/signup` → paid self-serve signup (Stripe subscription checkout, org created only after payment via webhook); `/request-access` → request-access form (stores request + emails platform admin). Nav/login pages show both buttons.

**Why:** User first disabled self-serve (request-only onboarding), then in July 2026 asked to bring signup back alongside request access.

**How to apply:** Checkout also requires `STRIPE_PRICE_ID` (set to the live "SentConnect Platform" $79/mo price). If deploying to Render/production, set `SELF_SERVE_SIGNUP_ENABLED=true` and `STRIPE_PRICE_ID` there too or signup returns 410. Stripe key is LIVE mode.
