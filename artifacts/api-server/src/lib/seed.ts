import { db, usersTable, reportsTable, organizationsTable, photosTable, likesTable, commentsTable } from "@workspace/db";
import { eq, and, isNull, inArray, lt } from "drizzle-orm";
import { logger } from "./logger";
import { hashPassword, verifyPassword } from "./password";
import { invalidateUserCache } from "../routes/reports";

const SUPER_ADMIN_EMAIL = "teki.menna@gmail.com";
const SUPER_ADMIN_NAME  = "Platform Admin";
const SUPER_ADMIN_PASSWORD = "Pr@xis188*";

export async function ensureSuperAdmin() {
  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "super_admin"))
    .limit(1);

  if (!existing) {
    await db.insert(usersTable).values({
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      passwordHash: hashPassword(SUPER_ADMIN_PASSWORD),
      role: "super_admin",
      organization: "SentConnect",
    });
    logger.info(`Super-admin created: ${SUPER_ADMIN_EMAIL}`);
    return;
  }

  await db
    .update(usersTable)
    .set({ email: SUPER_ADMIN_EMAIL, name: SUPER_ADMIN_NAME, passwordHash: hashPassword(SUPER_ADMIN_PASSWORD) })
    .where(eq(usersTable.id, existing.id));
  logger.info(`Super-admin synced: ${SUPER_ADMIN_EMAIL}`);
}

const DEMO_ORG_SUBDOMAIN = "demo";
const DEMO_ORG_NAME = "Calvary Community Church";
const DEMO_ADMIN_EMAIL = "demoadmin@sentconnect.org";
const DEMO_ADMIN_PASSWORD = "password123";
const DEMO_ADMIN_EMAIL_LEGACY = "demo@sentconnect.org";

// Sample post photos (stable Unsplash CDN URLs, hotlink-friendly) so new users
// see media when trying the demo. Attached to the church-planting and literacy posts.
const DEMO_POST_CHURCH_TITLE = "A New Church Planted in Achi Village";
const DEMO_POST_LITERACY_TITLE = "Literacy Opens Hearts in San Pedro Village";
const DEMO_PHOTO_CHURCH = "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1000&q=80";
const DEMO_PHOTO_LITERACY = "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000&q=80";

// Maps freshly-inserted demo reports (by title, since RETURNING row order is not
// contractually guaranteed) to their sample photo rows. Safe no-op if a title is missing.
function demoPhotoRows(seededReports: { id: number; title: string | null }[]) {
  const idByTitle = new Map(seededReports.map((r) => [r.title, r.id]));
  const churchId = idByTitle.get(DEMO_POST_CHURCH_TITLE);
  const literacyId = idByTitle.get(DEMO_POST_LITERACY_TITLE);
  const rows: { reportId: number; url: string; caption: string; mimeType: string }[] = [];
  if (churchId) rows.push({ reportId: churchId, url: DEMO_PHOTO_CHURCH, caption: "The first gathering of the Achi Community Church", mimeType: "image/jpeg" });
  if (literacyId) rows.push({ reportId: literacyId, url: DEMO_PHOTO_LITERACY, caption: "Women's literacy class in San Pedro village", mimeType: "image/jpeg" });
  return rows;
}

/**
 * Idempotent demo seed — safe to call on any database state, including production.
 * Always verifies the complete set of demo data exists, not just the org row.
 */
export async function seedIfEmpty() {
  // 1. Find or create the demo org
  let [demoOrg] = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.subdomain, DEMO_ORG_SUBDOMAIN))
    .limit(1);

  if (!demoOrg) {
    logger.info("Seeding demo org…");
    [demoOrg] = await db.insert(organizationsTable).values({
      name: DEMO_ORG_NAME,
      subdomain: DEMO_ORG_SUBDOMAIN,
      plan: "free",
      status: "active",
    }).returning();
  }

  // 2. Find or create demo admin (migrate legacy email if needed)
  let [existingAdmin] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, DEMO_ADMIN_EMAIL))
    .limit(1);

  if (!existingAdmin) {
    // Check for legacy email and migrate it to the canonical one
    const [legacyAdmin] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, DEMO_ADMIN_EMAIL_LEGACY))
      .limit(1);

    if (legacyAdmin) {
      await db.update(usersTable)
        .set({ email: DEMO_ADMIN_EMAIL, passwordHash: hashPassword(DEMO_ADMIN_PASSWORD), organizationId: demoOrg.id, organization: DEMO_ORG_NAME })
        .where(eq(usersTable.id, legacyAdmin.id));
      existingAdmin = legacyAdmin;
      logger.info(`Demo admin email migrated: ${DEMO_ADMIN_EMAIL_LEGACY} → ${DEMO_ADMIN_EMAIL}`);
    } else {
      await db.insert(usersTable).values({
        name: "Demo Admin",
        email: DEMO_ADMIN_EMAIL,
        passwordHash: hashPassword(DEMO_ADMIN_PASSWORD),
        role: "admin",
        bio: "Church administrator at Calvary Community Church, managing missionary outreach since 2015.",
        location: "Dallas, TX",
        organization: DEMO_ORG_NAME,
        organizationId: demoOrg.id,
        status: "active",
      });
      logger.info(`Demo admin created: ${DEMO_ADMIN_EMAIL}`);
    }
  } else if (existingAdmin.id && demoOrg.id) {
    // Ensure admin is linked to the correct org
    await db.update(usersTable)
      .set({ organizationId: demoOrg.id, organization: DEMO_ORG_NAME })
      .where(eq(usersTable.id, existingAdmin.id));
  }

  // 3. Find or create field users
  const DEMO_FIELD_USERS = [
    {
      name: "James Okafor",
      email: "demouser@sentconnect.org",
      passwordHash: hashPassword("password123"),
      bio: "Serving the people of rural Nigeria with church planting and leadership training.",
      location: "Enugu, Nigeria",
      organization: "Africa Inland Mission",
    },
    {
      name: "Maria Santos",
      email: "maria@mission.org",
      passwordHash: hashPassword("password123"),
      bio: "Working in remote villages in Guatemala, focused on education and literacy programs.",
      location: "Huehuetenango, Guatemala",
      organization: "Latin America Mission",
    },
    {
      name: "David Chen",
      email: "david@mission.org",
      passwordHash: hashPassword("password123"),
      bio: "Church planting pioneer working with unreached people groups in Southeast Asia.",
      location: "Chiang Mai, Thailand",
      organization: "OMF International",
    },
  ];

  // Legacy email mapping: old email → new canonical email (for production migrations)
  const DEMO_FIELD_USER_LEGACY: Record<string, string> = {
    "demouser@sentconnect.org": "james@mission.org",
  };

  const userIds: Record<string, number> = {};

  for (const u of DEMO_FIELD_USERS) {
    let [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, u.email))
      .limit(1);

    if (!existing && DEMO_FIELD_USER_LEGACY[u.email]) {
      // Migrate from legacy email to the new canonical email
      const legacyEmail = DEMO_FIELD_USER_LEGACY[u.email]!;
      const [legacy] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, legacyEmail))
        .limit(1);
      if (legacy) {
        await db.update(usersTable)
          .set({ email: u.email, organizationId: demoOrg.id, role: "field_user", organization: u.organization, passwordHash: u.passwordHash })
          .where(eq(usersTable.id, legacy.id));
        existing = legacy;
        logger.info(`Demo field user email migrated: ${legacyEmail} → ${u.email}`);
      }
    }

    if (existing) {
      await db.update(usersTable)
        .set({ organizationId: demoOrg.id, role: "field_user", organization: u.organization, passwordHash: u.passwordHash })
        .where(eq(usersTable.id, existing.id));
      userIds[u.email] = existing.id;
    } else {
      const [created] = await db.insert(usersTable).values({
        ...u,
        role: "field_user",
        organizationId: demoOrg.id,
      }).returning({ id: usersTable.id });
      userIds[u.email] = created.id;
    }
  }

  // 4. Link any org-less reports from field users to the demo org
  for (const userId of Object.values(userIds)) {
    await db.update(reportsTable)
      .set({ organizationId: demoOrg.id })
      .where(and(eq(reportsTable.missionaryId, userId), isNull(reportsTable.organizationId)));
  }

  // 5. Create demo posts if none exist under the demo org
  const [sampleReport] = await db
    .select({ id: reportsTable.id })
    .from(reportsTable)
    .where(eq(reportsTable.organizationId, demoOrg.id))
    .limit(1);

  if (!sampleReport) {
    const seededReports = await db.insert(reportsTable).values([
      {
        missionaryId: userIds["demouser@sentconnect.org"],
        organizationId: demoOrg.id,
        title: DEMO_POST_CHURCH_TITLE,
        description: `Last month, after three years of prayer and relationship-building, we held the first official gathering of the Achi Community Church. Sixty-seven people crowded into Emmanuel's home. The worship was raw and full of joy. Three local men have expressed a calling to pastoral leadership.`,
        category: "post",
        isDemoSeed: true,
        location: "Achi Village, Enugu State, Nigeria",
        reportDate: new Date("2026-03-15"),
        peopleReached: 230,
      },
      {
        missionaryId: userIds["demouser@sentconnect.org"],
        organizationId: demoOrg.id,
        title: "Leadership Training Camp: 18 Emerging Pastors Equipped",
        description: `For two weeks in January, we gathered 18 young leaders from five different villages. These leaders wake before dawn to study. They argued passionately over Scripture. One young woman, Adaeze, is leading a fellowship of 34 women in her village.`,
        category: "post",
        isDemoSeed: true,
        location: "Nsukka, Enugu State, Nigeria",
        reportDate: new Date("2026-02-10"),
        peopleReached: 450,
      },
      {
        missionaryId: userIds["maria@mission.org"],
        organizationId: demoOrg.id,
        title: DEMO_POST_LITERACY_TITLE,
        description: `We launched our first women's literacy program. 28 women gathered every Tuesday and Thursday. By month four, they were reading full sentences. The day Maria Elena — a 52-year-old grandmother — read a verse from John aloud for the first time, the room went silent.`,
        category: "post",
        isDemoSeed: true,
        location: "San Pedro Soloma, Huehuetenango, Guatemala",
        reportDate: new Date("2026-03-20"),
        peopleReached: 340,
      },
      {
        missionaryId: userIds["david@mission.org"],
        organizationId: demoOrg.id,
        title: "Three New House Churches Among the Akha People",
        description: `Over the past eighteen months, God has been doing something quiet and extraordinary. It began with a young man named Amu. Today, there are three house churches among the Akha villages within our reach — small, fragile, and full of the Spirit.`,
        category: "post",
        isDemoSeed: true,
        location: "Chiang Rai Province, Thailand",
        reportDate: new Date("2026-03-08"),
        peopleReached: 180,
      },
    ]).returning({ id: reportsTable.id, title: reportsTable.title });

    // Attach sample photos to the church-planting and literacy posts (mapped by title)
    const photoRows = demoPhotoRows(seededReports);
    if (photoRows.length > 0) await db.insert(photosTable).values(photoRows);
    logger.info("Demo seed complete: demo org, 3 field users, 1 admin, 4 posts, 2 photos");
  } else {
    logger.info(`Demo org '${DEMO_ORG_SUBDOMAIN}' seeded and verified`);
  }
}

const DEMO_RESET_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
let demoLastResetAt: Date | null = null;

/**
 * Resets the demo org only if 1 hour has passed since the last reset.
 * This lets the demo field user's posts remain visible to the admin
 * within the same session window.
 */
export async function maybeResetDemoOrg(): Promise<void> {
  const now = new Date();
  if (demoLastResetAt && now.getTime() - demoLastResetAt.getTime() < DEMO_RESET_INTERVAL_MS) {
    return;
  }
  await resetDemoOrg();
  demoLastResetAt = now;
}

/**
 * Wipes all posts (and their photos/likes/comments) from the demo org,
 * then re-seeds the 4 canonical demo posts.
 */
export async function resetDemoOrg() {
  const [demoOrg] = await db
    .select({ id: organizationsTable.id })
    .from(organizationsTable)
    .where(eq(organizationsTable.subdomain, DEMO_ORG_SUBDOMAIN))
    .limit(1);

  if (!demoOrg) {
    logger.warn("resetDemoOrg: demo org not found — skipping");
    return;
  }

  // Get all report IDs in the demo org
  const reports = await db
    .select({ id: reportsTable.id })
    .from(reportsTable)
    .where(eq(reportsTable.organizationId, demoOrg.id));

  if (reports.length > 0) {
    const reportIds = reports.map(r => r.id);
    await db.delete(photosTable).where(inArray(photosTable.reportId, reportIds));
    await db.delete(likesTable).where(inArray(likesTable.postId, reportIds));
    await db.delete(commentsTable).where(inArray(commentsTable.postId, reportIds));
    await db.delete(reportsTable).where(inArray(reportsTable.id, reportIds));
  }

  // Look up field user IDs
  const fieldEmails = ["demouser@sentconnect.org", "maria@mission.org", "david@mission.org"] as const;
  const fieldUsers = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(inArray(usersTable.email, [...fieldEmails]));

  const userIds = Object.fromEntries(fieldUsers.map(u => [u.email, u.id]));

  if (!userIds["demouser@sentconnect.org"] || !userIds["maria@mission.org"] || !userIds["david@mission.org"]) {
    logger.warn("resetDemoOrg: field users missing — running full seed instead");
    await seedIfEmpty();
    return;
  }

  const seededReports = await db.insert(reportsTable).values([
    {
      missionaryId: userIds["demouser@sentconnect.org"],
      organizationId: demoOrg.id,
      title: DEMO_POST_CHURCH_TITLE,
      description: `Last month, after three years of prayer and relationship-building, we held the first official gathering of the Achi Community Church. Sixty-seven people crowded into Emmanuel's home. The worship was raw and full of joy. Three local men have expressed a calling to pastoral leadership.`,
      category: "post",
        isDemoSeed: true,
      location: "Achi Village, Enugu State, Nigeria",
      reportDate: new Date("2026-03-15"),
      peopleReached: 230,
    },
    {
      missionaryId: userIds["demouser@sentconnect.org"],
      organizationId: demoOrg.id,
      title: "Leadership Training Camp: 18 Emerging Pastors Equipped",
      description: `For two weeks in January, we gathered 18 young leaders from five different villages. These leaders wake before dawn to study. They argued passionately over Scripture. One young woman, Adaeze, is leading a fellowship of 34 women in her village.`,
      category: "post",
        isDemoSeed: true,
      location: "Nsukka, Enugu State, Nigeria",
      reportDate: new Date("2026-02-10"),
      peopleReached: 450,
    },
    {
      missionaryId: userIds["maria@mission.org"],
      organizationId: demoOrg.id,
      title: DEMO_POST_LITERACY_TITLE,
      description: `We launched our first women's literacy program. 28 women gathered every Tuesday and Thursday. By month four, they were reading full sentences. The day Maria Elena — a 52-year-old grandmother — read a verse from John aloud for the first time, the room went silent.`,
      category: "post",
        isDemoSeed: true,
      location: "San Pedro Soloma, Huehuetenango, Guatemala",
      reportDate: new Date("2026-03-20"),
      peopleReached: 340,
    },
    {
      missionaryId: userIds["david@mission.org"],
      organizationId: demoOrg.id,
      title: "Three New House Churches Among the Akha People",
      description: `Over the past eighteen months, God has been doing something quiet and extraordinary. It began with a young man named Amu. Today, there are three house churches among the Akha villages within our reach — small, fragile, and full of the Spirit.`,
      category: "post",
        isDemoSeed: true,
      location: "Chiang Rai Province, Thailand",
      reportDate: new Date("2026-03-08"),
      peopleReached: 180,
    },
  ]).returning({ id: reportsTable.id, title: reportsTable.title });

  // Attach sample photos to the church-planting and literacy posts (mapped by title)
  const photoRows = demoPhotoRows(seededReports);
  if (photoRows.length > 0) await db.insert(photosTable).values(photoRows);

  logger.info("resetDemoOrg: demo feed restored to 4 seed posts with 2 photos");
}

const DEMO_POST_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const DEMO_SWEEP_INTERVAL_MS = 60 * 1000; // check every minute

// ---------------------------------------------------------------------------
// Demo user self-healing
// ---------------------------------------------------------------------------
// The demo org's canonical users (1 admin + 3 field users). The sweeper keeps
// them intact regardless of what a demo admin does:
//  - deleted canonical user       → restored 5 minutes after it goes missing
//  - name/email/password/role/status edited → reverted 5 minutes after the edit
//  - extra users added via admin  → removed 30 minutes after creation
const DEMO_USER_RESTORE_DELAY_MS = 5 * 60 * 1000;   // 5 minutes
const DEMO_EXTRA_USER_MAX_AGE_MS = 30 * 60 * 1000;  // 30 minutes

const DEMO_CANONICAL_USERS = [
  {
    email: DEMO_ADMIN_EMAIL,
    name: "Demo Admin",
    password: DEMO_ADMIN_PASSWORD,
    role: "admin",
    bio: "Church administrator at Calvary Community Church, managing missionary outreach since 2015.",
    location: "Dallas, TX",
    organization: DEMO_ORG_NAME,
  },
  {
    email: "demouser@sentconnect.org",
    name: "James Okafor",
    password: "password123",
    role: "field_user",
    bio: "Serving the people of rural Nigeria with church planting and leadership training.",
    location: "Enugu, Nigeria",
    organization: "Africa Inland Mission",
  },
  {
    email: "maria@mission.org",
    name: "Maria Santos",
    password: "password123",
    role: "field_user",
    bio: "Working in remote villages in Guatemala, focused on education and literacy programs.",
    location: "Huehuetenango, Guatemala",
    organization: "Latin America Mission",
  },
  {
    email: "david@mission.org",
    name: "David Chen",
    password: "password123",
    role: "field_user",
    bio: "Church planting pioneer working with unreached people groups in Southeast Asia.",
    location: "Chiang Mai, Thailand",
    organization: "OMF International",
  },
] as const;

// Tracks when a canonical demo user was first observed missing (in-memory;
// after a restart the clock simply starts over, which is acceptable for a demo).
const demoUserMissingSince = new Map<string, number>();
// Remembers the DB id last seen for each canonical email, so a canonical user
// whose email was edited can still be found and reverted (not treated as deleted).
const demoUserKnownId = new Map<string, number>();

/**
 * Deletes a demo-org user and their demo-org reports (+ attachments).
 * All deletions are scoped to the demo org — records belonging to other
 * organizations are never touched. If the user still owns reports outside
 * the demo org, the user row is left alone (FK would fail) and we log it.
 */
async function deleteDemoUserCompletely(userId: number, demoOrgId: number) {
  const reports = await db
    .select({ id: reportsTable.id })
    .from(reportsTable)
    .where(and(eq(reportsTable.missionaryId, userId), eq(reportsTable.organizationId, demoOrgId)));
  if (reports.length > 0) {
    const ids = reports.map(r => r.id);
    await db.delete(photosTable).where(inArray(photosTable.reportId, ids));
    await db.delete(likesTable).where(inArray(likesTable.postId, ids));
    await db.delete(commentsTable).where(inArray(commentsTable.postId, ids));
    await db.delete(reportsTable).where(inArray(reportsTable.id, ids));
  }
  const [nonDemoReport] = await db
    .select({ id: reportsTable.id })
    .from(reportsTable)
    .where(eq(reportsTable.missionaryId, userId))
    .limit(1);
  if (nonDemoReport) {
    logger.warn(`sweepDemoUsers: user ${userId} owns non-demo reports — skipping user deletion`);
    return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, userId));
  invalidateUserCache(userId);
}

/**
 * Self-heals the demo org's user roster:
 *  - restores deleted canonical users after 5 minutes
 *  - reverts edits to canonical users (name/password/role/status) 5 minutes after the edit
 *  - removes visitor-added users 30 minutes after creation
 */
export async function sweepDemoUsers(): Promise<void> {
  const [demoOrg] = await db
    .select({ id: organizationsTable.id })
    .from(organizationsTable)
    .where(eq(organizationsTable.subdomain, DEMO_ORG_SUBDOMAIN))
    .limit(1);
  if (!demoOrg) return;

  const now = Date.now();
  const orgUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.organizationId, demoOrg.id));
  const byEmail = new Map(orgUsers.map(u => [u.email, u]));
  const byId = new Map(orgUsers.map(u => [u.id, u]));
  const canonicalUserIds = new Set<number>();

  for (const canonical of DEMO_CANONICAL_USERS) {
    // Find the canonical account: by email first, then by the last-known id
    // (covers the case where a demo admin edited the email).
    let existing = byEmail.get(canonical.email);
    if (!existing) {
      const knownId = demoUserKnownId.get(canonical.email);
      if (knownId) existing = byId.get(knownId);
    }

    // 1. Restore deleted canonical users (after a 5-minute grace period)
    if (!existing) {
      const since = demoUserMissingSince.get(canonical.email);
      if (!since) {
        demoUserMissingSince.set(canonical.email, now);
      } else if (now - since >= DEMO_USER_RESTORE_DELAY_MS) {
        // Never insert if the canonical email exists anywhere else (unique
        // constraint; and we must not touch accounts outside the demo org).
        const [conflict] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.email, canonical.email))
          .limit(1);
        if (conflict) {
          logger.warn(`sweepDemoUsers: ${canonical.email} exists outside the demo org — skipping restore`);
        } else {
          const [created] = await db.insert(usersTable).values({
            name: canonical.name,
            email: canonical.email,
            passwordHash: hashPassword(canonical.password),
            role: canonical.role,
            status: "active",
            bio: canonical.bio,
            location: canonical.location,
            organization: canonical.organization,
            organizationId: demoOrg.id,
          }).returning({ id: usersTable.id });
          demoUserKnownId.set(canonical.email, created.id);
          demoUserMissingSince.delete(canonical.email);
          logger.info(`sweepDemoUsers: restored deleted demo user ${canonical.email}`);
        }
      }
      continue;
    }
    demoUserMissingSince.delete(canonical.email);
    demoUserKnownId.set(canonical.email, existing.id);
    canonicalUserIds.add(existing.id);

    // 2. Revert edits to canonical users, 5 minutes after the last change
    const drifted =
      existing.name !== canonical.name ||
      existing.email !== canonical.email ||
      existing.role !== canonical.role ||
      existing.status !== "active" ||
      !verifyPassword(canonical.password, existing.passwordHash);
    if (drifted && now - existing.updatedAt.getTime() >= DEMO_USER_RESTORE_DELAY_MS) {
      await db.update(usersTable).set({
        name: canonical.name,
        email: canonical.email,
        passwordHash: hashPassword(canonical.password),
        role: canonical.role,
        status: "active",
        bio: canonical.bio,
        location: canonical.location,
        organization: canonical.organization,
        organizationId: demoOrg.id,
      }).where(eq(usersTable.id, existing.id));
      invalidateUserCache(existing.id);
      logger.info(`sweepDemoUsers: reverted edits to demo user ${canonical.email}`);
    }
  }

  // 3. Remove visitor-added users 30 minutes after creation
  for (const u of orgUsers) {
    if (canonicalUserIds.has(u.id)) continue;
    if (u.role === "super_admin") continue; // never touch platform admins
    if (now - u.createdAt.getTime() < DEMO_EXTRA_USER_MAX_AGE_MS) continue;
    await deleteDemoUserCompletely(u.id, demoOrg.id);
    logger.info(`sweepDemoUsers: removed visitor-added demo user ${u.email}`);
  }
}

/**
 * Deletes visitor-created posts in the demo org that are older than 30 minutes,
 * along with their photos, likes, and comments. Seed posts are never removed.
 */
export async function sweepDemoVisitorPosts(): Promise<void> {
  const [demoOrg] = await db
    .select({ id: organizationsTable.id })
    .from(organizationsTable)
    .where(eq(organizationsTable.subdomain, DEMO_ORG_SUBDOMAIN))
    .limit(1);
  if (!demoOrg) return;

  const cutoff = new Date(Date.now() - DEMO_POST_MAX_AGE_MS);
  const stale = await db
    .select({ id: reportsTable.id })
    .from(reportsTable)
    .where(and(
      eq(reportsTable.organizationId, demoOrg.id),
      lt(reportsTable.createdAt, cutoff),
      eq(reportsTable.isDemoSeed, false),
    ));

  if (stale.length === 0) return;

  const ids = stale.map(r => r.id);
  await db.delete(photosTable).where(inArray(photosTable.reportId, ids));
  await db.delete(likesTable).where(inArray(likesTable.postId, ids));
  await db.delete(commentsTable).where(inArray(commentsTable.postId, ids));
  await db.delete(reportsTable).where(inArray(reportsTable.id, ids));
  logger.info(`sweepDemoVisitorPosts: removed ${ids.length} demo post(s) older than 30 minutes`);
}

/**
 * Starts the background sweeper that enforces the 30-minute lifetime
 * of visitor-created demo posts, regardless of logins or activity.
 */
export function startDemoPostSweeper(): void {
  const timer = setInterval(() => {
    sweepDemoVisitorPosts().catch(err => logger.error({ err }, "sweepDemoVisitorPosts failed"));
    sweepDemoUsers().catch(err => logger.error({ err }, "sweepDemoUsers failed"));
  }, DEMO_SWEEP_INTERVAL_MS);
  timer.unref?.();
  logger.info("Demo sweeper started (30-min visitor posts/users, 5-min demo user self-heal, checked every minute)");
}

/**
 * Removes specific legacy/test organizations on startup (one-time cleanup).
 * Safe to run repeatedly — becomes a no-op once those orgs are gone.
 */
const PURGE_ORG_SUBDOMAINS = ["gbc", "calvary"];

export async function cleanupDemoOrgs() {
  const allOrgs = await db
    .select({ id: organizationsTable.id, subdomain: organizationsTable.subdomain, name: organizationsTable.name })
    .from(organizationsTable);

  const orgsToDelete = allOrgs.filter(o => PURGE_ORG_SUBDOMAINS.includes(o.subdomain));
  if (orgsToDelete.length === 0) {
    logger.info("cleanupDemoOrgs: nothing to remove");
    return;
  }

  for (const org of orgsToDelete) {
    logger.info(`cleanupDemoOrgs: removing org "${org.name}" (${org.subdomain})`);
    const users = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.organizationId, org.id));
    if (users.length > 0) {
      const ids = users.map(u => u.id);
      await db.delete(reportsTable).where(inArray(reportsTable.missionaryId, ids));
      await db.delete(usersTable).where(inArray(usersTable.id, ids));
      logger.info(`cleanupDemoOrgs: removed ${users.length} user(s) from "${org.name}"`);
    }
    await db.delete(organizationsTable).where(eq(organizationsTable.id, org.id));
    logger.info(`cleanupDemoOrgs: org "${org.name}" deleted`);
  }
}
