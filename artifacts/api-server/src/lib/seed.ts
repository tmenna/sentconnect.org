import { db, usersTable, reportsTable, organizationsTable, photosTable, likesTable, commentsTable } from "@workspace/db";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { logger } from "./logger";
import { hashPassword } from "./password";

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
const DEMO_ADMIN_EMAIL = "demo@sentconnect.org";
const DEMO_ADMIN_PASSWORD = "demo123";

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

  // 2. Find or create demo admin
  const [existingAdmin] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, DEMO_ADMIN_EMAIL))
    .limit(1);

  if (!existingAdmin) {
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
      email: "james@mission.org",
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

  const userIds: Record<string, number> = {};

  for (const u of DEMO_FIELD_USERS) {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, u.email))
      .limit(1);

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
    await db.insert(reportsTable).values([
      {
        missionaryId: userIds["james@mission.org"],
        organizationId: demoOrg.id,
        title: "A New Church Planted in Achi Village",
        description: `Last month, after three years of prayer and relationship-building, we held the first official gathering of the Achi Community Church. Sixty-seven people crowded into Emmanuel's home. The worship was raw and full of joy. Three local men have expressed a calling to pastoral leadership.`,
        category: "post",
        location: "Achi Village, Enugu State, Nigeria",
        reportDate: new Date("2026-03-15"),
        peopleReached: 230,
      },
      {
        missionaryId: userIds["james@mission.org"],
        organizationId: demoOrg.id,
        title: "Leadership Training Camp: 18 Emerging Pastors Equipped",
        description: `For two weeks in January, we gathered 18 young leaders from five different villages. These leaders wake before dawn to study. They argued passionately over Scripture. One young woman, Adaeze, is leading a fellowship of 34 women in her village.`,
        category: "post",
        location: "Nsukka, Enugu State, Nigeria",
        reportDate: new Date("2026-02-10"),
        peopleReached: 450,
      },
      {
        missionaryId: userIds["maria@mission.org"],
        organizationId: demoOrg.id,
        title: "Literacy Opens Hearts in San Pedro Village",
        description: `We launched our first women's literacy program. 28 women gathered every Tuesday and Thursday. By month four, they were reading full sentences. The day Maria Elena — a 52-year-old grandmother — read a verse from John aloud for the first time, the room went silent.`,
        category: "post",
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
        location: "Chiang Rai Province, Thailand",
        reportDate: new Date("2026-03-08"),
        peopleReached: 180,
      },
    ]);
    logger.info("Demo seed complete: demo org, 3 field users, 1 admin, 4 posts");
  } else {
    logger.info(`Demo org '${DEMO_ORG_SUBDOMAIN}' seeded and verified`);
  }
}

/**
 * Wipes all posts (and their photos/likes/comments) from the demo org,
 * then re-seeds the 4 canonical demo posts.
 * Called on every demo-login so each visitor starts with a pristine feed.
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
  const fieldEmails = ["james@mission.org", "maria@mission.org", "david@mission.org"] as const;
  const fieldUsers = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(inArray(usersTable.email, [...fieldEmails]));

  const userIds = Object.fromEntries(fieldUsers.map(u => [u.email, u.id]));

  if (!userIds["james@mission.org"] || !userIds["maria@mission.org"] || !userIds["david@mission.org"]) {
    logger.warn("resetDemoOrg: field users missing — running full seed instead");
    await seedIfEmpty();
    return;
  }

  await db.insert(reportsTable).values([
    {
      missionaryId: userIds["james@mission.org"],
      organizationId: demoOrg.id,
      title: "A New Church Planted in Achi Village",
      description: `Last month, after three years of prayer and relationship-building, we held the first official gathering of the Achi Community Church. Sixty-seven people crowded into Emmanuel's home. The worship was raw and full of joy. Three local men have expressed a calling to pastoral leadership.`,
      category: "post",
      location: "Achi Village, Enugu State, Nigeria",
      reportDate: new Date("2026-03-15"),
      peopleReached: 230,
    },
    {
      missionaryId: userIds["james@mission.org"],
      organizationId: demoOrg.id,
      title: "Leadership Training Camp: 18 Emerging Pastors Equipped",
      description: `For two weeks in January, we gathered 18 young leaders from five different villages. These leaders wake before dawn to study. They argued passionately over Scripture. One young woman, Adaeze, is leading a fellowship of 34 women in her village.`,
      category: "post",
      location: "Nsukka, Enugu State, Nigeria",
      reportDate: new Date("2026-02-10"),
      peopleReached: 450,
    },
    {
      missionaryId: userIds["maria@mission.org"],
      organizationId: demoOrg.id,
      title: "Literacy Opens Hearts in San Pedro Village",
      description: `We launched our first women's literacy program. 28 women gathered every Tuesday and Thursday. By month four, they were reading full sentences. The day Maria Elena — a 52-year-old grandmother — read a verse from John aloud for the first time, the room went silent.`,
      category: "post",
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
      location: "Chiang Rai Province, Thailand",
      reportDate: new Date("2026-03-08"),
      peopleReached: 180,
    },
  ]);

  logger.info("resetDemoOrg: demo feed restored to 4 seed posts");
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
