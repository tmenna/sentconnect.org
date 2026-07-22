---
name: Signup is request-only
description: Self-serve signup/Stripe checkout are gated off; onboarding goes through a request-access form.
---

Onboarding is request-only: `/signup` shows a Request Access form (stores to `signup_requests`, emails platform admin). Self-serve org creation (`POST /api/auth/signup`) and Stripe checkout creation are gated behind `SELF_SERVE_SIGNUP_ENABLED=true` and return 410 otherwise.

**Why:** Owner wanted the paid pricing/signup page hidden — churches should be vetted manually before getting an org.

**How to apply:** Don't re-link or re-route the old paid signup page; if payments/self-serve return, flip the env flag rather than deleting the gate. Landing CTA labels ("Request Access") live in code defaults AND prod DB rows — DB changes need a migrate.ts UPDATE.
