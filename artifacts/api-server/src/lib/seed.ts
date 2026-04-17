import { db, usersTable, reportsTable, organizationsTable } from "@workspace/db";
import { eq, and, isNull, inArray, notInArray } from "drizzle-orm";
import { logger } from "./logger";
import { hashPassword } from "./password";

/**
 * Ensures at least one super_admin exists in the database.
 * Called at every startup — safe to run repeatedly (no-ops if already present).
 * In production, change the default password immediately after first login.
 */
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

  // Always sync email, name and password so credentials defined here always work.
  await db
    .update(usersTable)
    .set({
      email: SUPER_ADMIN_EMAIL,
      name: SUPER_ADMIN_NAME,
      passwordHash: hashPassword(SUPER_ADMIN_PASSWORD),
    })
    .where(eq(usersTable.id, existing.id));
  logger.info(`Super-admin synced: ${SUPER_ADMIN_EMAIL}`);
}

/**
 * Idempotent demo seed — safe to call on any database state, including production.
 *
 * What it does:
 *  1. Checks for the "calvary" demo org by subdomain — skips everything if it already exists.
 *  2. Creates Calvary Community Church org.
 *  3. Creates admin@calvary.org if not present.
 *  4. Creates/updates demo field users (james, maria, david) linked to the Calvary org.
 *  5. Links any existing unattached reports for those users to the Calvary org.
 *  6. Creates demo posts if those users currently have none under the Calvary org.
 */
export async function seedIfEmpty() {
  // --- Guard: skip if the Calvary demo org already exists ---
  const [calvaryOrg] = await db
    .select({ id: organizationsTable.id })
    .from(organizationsTable)
    .where(eq(organizationsTable.subdomain, "calvary"))
    .limit(1);

  if (calvaryOrg) {
    // Org already exists — but still ensure admin@calvary.org exists
    const [existingAdmin] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, "admin@calvary.org"))
      .limit(1);

    if (!existingAdmin) {
      await db.insert(usersTable).values({
        name: "Sarah Mitchell",
        email: "admin@calvary.org",
        passwordHash: hashPassword("password123"),
        role: "admin",
        bio: "Church administrator at Calvary Community Church, managing missionary outreach since 2015.",
        location: "Dallas, TX",
        organization: "Calvary Community Church",
        organizationId: calvaryOrg.id,
      });
      logger.info("Calvary admin user created (was missing): admin@calvary.org");
    } else {
      logger.info("Demo org 'calvary' already present — skipping seed");
    }
    return;
  }

  logger.info("Seeding Calvary demo org and field users…");

  // 1. Create the Calvary org
  const [defaultOrg] = await db.insert(organizationsTable).values({
    name: "Calvary Community Church",
    subdomain: "calvary",
    plan: "free",
    status: "active",
  }).returning();

  // 2. Ensure demo field users exist and are linked to the org
  const DEMO_FIELD_USERS = [
    {
      name: "James Okafor",
      email: "james@mission.org",
      passwordHash: "0e44db8a79b659cb03b27518e524301e:4f2fe8547195d219cf0fb74f1c0bf2ea56cfbf0740589353a5f1e7c1648d8f61bd5130564613a28302a409efa5f4516cd7dc7f20e1c64ed07ee9016e822aacb8",
      bio: "Serving the people of rural Nigeria with church planting and leadership training.",
      location: "Enugu, Nigeria",
      organization: "Africa Inland Mission",
    },
    {
      name: "Maria Santos",
      email: "maria@mission.org",
      passwordHash: "20750c2e3781cc77d70730328f8ee260:b3c1a0d5436fb2b8a4812a6fb2fa76c4b469a6dad5abc5ccd5af22c6dbaa4bfcac8c5b19d419501d6058ebf27a82c4c295f8aaf13092682c90d2999e4e1efca8",
      bio: "Working in remote villages in Guatemala, focused on education and literacy programs.",
      location: "Huehuetenango, Guatemala",
      organization: "Latin America Mission",
    },
    {
      name: "David Chen",
      email: "david@mission.org",
      passwordHash: "4bc4e298eff5cb0f5de695bec16fcb2f:6639b49f86292bdec45311a01d0c0e2f4ee317784e60961bf8105e84d5501fbea43d625301ab14c3812ebc8ba95def912181732f4934b1f268578f8c58b56701",
      bio: "Church planting pioneer working with unreached people groups in Southeast Asia.",
      location: "Chiang Mai, Thailand",
      organization: "OMF International",
    },
  ];

  const userIds: Record<string, number> = {};

  for (const u of DEMO_FIELD_USERS) {
    // Check if user already exists by email
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, u.email))
      .limit(1);

    if (existing) {
      // Update them to link to the new org and ensure correct role
      await db.update(usersTable)
        .set({ organizationId: defaultOrg.id, role: "field_user", organization: u.organization })
        .where(eq(usersTable.id, existing.id));
      userIds[u.email] = existing.id;
    } else {
      const [created] = await db.insert(usersTable).values({
        ...u,
        role: "field_user",
        organizationId: defaultOrg.id,
      }).returning({ id: usersTable.id });
      userIds[u.email] = created.id;
    }
  }

  // 3. Ensure admin user for Calvary exists
  const [existingAdmin] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, "admin@calvary.org"))
    .limit(1);

  if (!existingAdmin) {
    await db.insert(usersTable).values({
      name: "Sarah Mitchell",
      email: "admin@calvary.org",
      passwordHash: "a2303eaa9f39c4e4a2dc66e4cf080bcd:b1570d98601cc852048eab43d1a868f4118b7ceb62bbf7315f1841bc15ebe4709cd9b8ee2f2fc609ce49a3818cc92e6130156d1716ca534496369304f9181454",
      role: "admin",
      bio: "Church administrator at Calvary Community Church, managing missionary outreach since 2015.",
      location: "Dallas, TX",
      organization: "Calvary Community Church",
      organizationId: defaultOrg.id,
    });
  }

  // 4. Link any existing org-less reports from these users to the Calvary org
  for (const email of Object.keys(userIds)) {
    const userId = userIds[email];
    await db.update(reportsTable)
      .set({ organizationId: defaultOrg.id })
      .where(and(
        eq(reportsTable.missionaryId, userId),
        isNull(reportsTable.organizationId)
      ));
  }

  // 5. Check if any reports already exist under Calvary — if not, create demo posts
  const [sampleReport] = await db
    .select({ id: reportsTable.id })
    .from(reportsTable)
    .where(eq(reportsTable.organizationId, defaultOrg.id))
    .limit(1);

  if (!sampleReport) {
    await db.insert(reportsTable).values([
      {
        missionaryId: userIds["james@mission.org"],
        organizationId: defaultOrg.id,
        title: "A New Church Planted in Achi Village",
        description: `Last month, after three years of prayer and relationship-building, we held the first official gathering of the Achi Community Church. Sixty-seven people crowded into Emmanuel's home. The worship was raw and full of joy. Three local men have expressed a calling to pastoral leadership.`,
        category: "post",
        location: "Achi Village, Enugu State, Nigeria",
        reportDate: new Date("2026-03-15"),
        peopleReached: 230,
      },
      {
        missionaryId: userIds["james@mission.org"],
        organizationId: defaultOrg.id,
        title: "Leadership Training Camp: 18 Emerging Pastors Equipped",
        description: `For two weeks in January, we gathered 18 young leaders from five different villages. These leaders wake before dawn to study. They argued passionately over Scripture. One young woman, Adaeze, is leading a fellowship of 34 women in her village.`,
        category: "post",
        location: "Nsukka, Enugu State, Nigeria",
        reportDate: new Date("2026-02-10"),
        peopleReached: 450,
      },
      {
        missionaryId: userIds["maria@mission.org"],
        organizationId: defaultOrg.id,
        title: "Literacy Opens Hearts in San Pedro Village",
        description: `We launched our first women's literacy program. 28 women gathered every Tuesday and Thursday. By month four, they were reading full sentences. The day Maria Elena — a 52-year-old grandmother — read a verse from John aloud for the first time, the room went silent.`,
        category: "post",
        location: "San Pedro Soloma, Huehuetenango, Guatemala",
        reportDate: new Date("2026-03-20"),
        peopleReached: 340,
      },
      {
        missionaryId: userIds["david@mission.org"],
        organizationId: defaultOrg.id,
        title: "Three New House Churches Among the Akha People",
        description: `Over the past eighteen months, God has been doing something quiet and extraordinary. It began with a young man named Amu. Today, there are three house churches among the Akha villages within our reach — small, fragile, and full of the Spirit.`,
        category: "post",
        location: "Chiang Rai Province, Thailand",
        reportDate: new Date("2026-03-08"),
        peopleReached: 180,
      },
    ]);
  }

  logger.info("Demo seed complete: Calvary org, 3 field users, 1 admin, demo posts");
}

/**
 * One-shot cleanup: removes any demo/test organizations that are NOT in the
 * keep list, along with all their users and those users' reports.
 *
 * Safe to run on every startup — once the orgs are gone it becomes a no-op.
 */
const KEEP_ORG_SUBDOMAINS = ["gbc"];

export async function cleanupDemoOrgs() {
  // Find orgs that are NOT in the keep list
  const allOrgs = await db
    .select({ id: organizationsTable.id, subdomain: organizationsTable.subdomain, name: organizationsTable.name })
    .from(organizationsTable);

  const orgsToDelete = allOrgs.filter(o => !KEEP_ORG_SUBDOMAINS.includes(o.subdomain));
  if (orgsToDelete.length === 0) {
    logger.info("cleanupDemoOrgs: nothing to remove");
    return;
  }

  for (const org of orgsToDelete) {
    logger.info(`cleanupDemoOrgs: removing org "${org.name}" (${org.subdomain})`);

    // Find all users in this org
    const users = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.organizationId, org.id));

    if (users.length > 0) {
      const userIds = users.map(u => u.id);

      // Delete all reports posted by these users
      await db.delete(reportsTable).where(inArray(reportsTable.missionaryId, userIds));

      // Delete the users themselves
      await db.delete(usersTable).where(inArray(usersTable.id, userIds));

      logger.info(`cleanupDemoOrgs: removed ${users.length} user(s) from "${org.name}"`);
    }

    // Delete the org
    await db.delete(organizationsTable).where(eq(organizationsTable.id, org.id));
    logger.info(`cleanupDemoOrgs: org "${org.name}" deleted`);
  }
}
