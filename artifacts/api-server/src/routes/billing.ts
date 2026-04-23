import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, organizationsTable, usersTable } from "@workspace/db";
import { stripe } from "../lib/stripe";
import { hashPassword } from "../lib/password";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// POST /billing/create-checkout-session
// Validates form data, then redirects to Stripe Checkout.
// The org + user are created ONLY after payment succeeds (via webhook).
router.post("/billing/create-checkout-session", async (req, res): Promise<void> => {
  const { organizationName, subdomain, fullName, email, password } = req.body ?? {};

  // Basic validation
  if (!organizationName || typeof organizationName !== "string" || organizationName.trim().length < 2) {
    res.status(400).json({ error: "Organization name must be at least 2 characters" }); return;
  }
  if (!subdomain || typeof subdomain !== "string" || !/^[a-z0-9-]{2,30}$/.test(subdomain.trim())) {
    res.status(400).json({ error: "Subdomain must be 2–30 lowercase letters, numbers, or hyphens" }); return;
  }
  if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
    res.status(400).json({ error: "Full name must be at least 2 characters" }); return;
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" }); return;
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" }); return;
  }

  const cleanSubdomain = subdomain.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  // Check for duplicates before creating a Stripe session
  const [existingOrg] = await db.select({ id: organizationsTable.id })
    .from(organizationsTable)
    .where(eq(organizationsTable.subdomain, cleanSubdomain));
  if (existingOrg) {
    res.status(409).json({ error: "That subdomain is already taken" }); return;
  }

  const [existingUser] = await db.select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, cleanEmail));
  if (existingUser) {
    res.status(409).json({ error: "An account with that email already exists" }); return;
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    res.status(500).json({ error: "Stripe price not configured" }); return;
  }

  // Determine the base URL for redirect links
  const appBaseUrl = process.env.APP_BASE_URL ?? `https://${process.env.REPLIT_DOMAINS?.split(",")[0] ?? "sentconnect.org"}`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: cleanEmail,
    success_url: `${appBaseUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appBaseUrl}/signup`,
    metadata: {
      organizationName: organizationName.trim(),
      subdomain: cleanSubdomain,
      fullName: fullName.trim(),
      email: cleanEmail,
      // Store hashed password in metadata so the webhook can create the user
      passwordHash: hashPassword(password),
    },
  });

  logger.info({ sessionId: session.id, subdomain: cleanSubdomain }, "Stripe checkout session created");
  res.json({ checkoutUrl: session.url });
});

// POST /webhooks/stripe
// Receives Stripe events. Must be registered with express.raw() (handled in app.ts).
// On checkout.session.completed → create org + admin user.
router.post("/webhooks/stripe", async (req, res): Promise<void> => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).json({ error: "Missing stripe signature or webhook secret" }); return;
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err: any) {
    logger.warn({ err: err.message }, "Stripe webhook signature verification failed");
    res.status(400).json({ error: `Webhook signature invalid: ${err.message}` }); return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata ?? {};

    const { organizationName, subdomain, fullName, email, passwordHash } = meta;

    if (!organizationName || !subdomain || !fullName || !email || !passwordHash) {
      logger.error({ sessionId: session.id }, "Webhook metadata incomplete — cannot create org");
      res.status(200).json({ received: true }); return;
    }

    // Idempotency — skip if org already exists (webhook may fire more than once)
    const [existing] = await db.select({ id: organizationsTable.id })
      .from(organizationsTable)
      .where(eq(organizationsTable.subdomain, subdomain));

    if (existing) {
      logger.info({ subdomain }, "Org already exists — skipping duplicate webhook");
      res.status(200).json({ received: true }); return;
    }

    const [org] = await db.insert(organizationsTable).values({
      name: organizationName,
      subdomain,
      plan: "paid",
      status: "active",
    }).returning();

    await db.insert(usersTable).values({
      name: fullName,
      email,
      passwordHash,
      role: "admin",
      organizationId: org.id,
      organization: organizationName,
    });

    logger.info({ orgId: org.id, subdomain }, "Org + admin user created via Stripe webhook");
  }

  res.status(200).json({ received: true });
});

// GET /billing/session-status?session_id=...
// Polled by the success page to check if the webhook has created the org yet.
router.get("/billing/session-status", async (req, res): Promise<void> => {
  const sessionId = typeof req.query.session_id === "string" ? req.query.session_id : null;
  if (!sessionId) { res.status(400).json({ error: "session_id required" }); return; }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const subdomain = session.metadata?.subdomain ?? null;

  if (!subdomain) { res.json({ ready: false }); return; }

  const [org] = await db.select({ id: organizationsTable.id, subdomain: organizationsTable.subdomain })
    .from(organizationsTable)
    .where(eq(organizationsTable.subdomain, subdomain));

  res.json({ ready: !!org, subdomain: org?.subdomain ?? null });
});

export default router;
