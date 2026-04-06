import { db, usersTable, reportsTable, organizationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export async function seedIfEmpty() {
  const existing = await db.select().from(usersTable).limit(1);
  if (existing.length > 0) {
    return;
  }

  logger.info("Database empty — seeding demo data");

  const [defaultOrg] = await db.insert(organizationsTable).values({
    name: "Calvary Community Church",
    subdomain: "calvary",
    plan: "free",
    status: "active",
  }).returning();

  const DEMO_USERS = [
    {
      name: "Sarah Mitchell",
      email: "admin@calvary.org",
      role: "admin" as const,
      passwordHash: "a2303eaa9f39c4e4a2dc66e4cf080bcd:b1570d98601cc852048eab43d1a868f4118b7ceb62bbf7315f1841bc15ebe4709cd9b8ee2f2fc609ce49a3818cc92e6130156d1716ca534496369304f9181454",
      bio: "Church administrator at Calvary Community Church, managing missionary outreach since 2015.",
      location: "Dallas, TX",
      organization: "Calvary Community Church",
      organizationId: defaultOrg.id,
    },
    {
      name: "James Okafor",
      email: "james@mission.org",
      role: "field_user" as const,
      passwordHash: "0e44db8a79b659cb03b27518e524301e:4f2fe8547195d219cf0fb74f1c0bf2ea56cfbf0740589353a5f1e7c1648d8f61bd5130564613a28302a409efa5f4516cd7dc7f20e1c64ed07ee9016e822aacb8",
      bio: "Serving the people of rural Nigeria with church planting and leadership training.",
      location: "Enugu, Nigeria",
      organization: "Africa Inland Mission",
      organizationId: defaultOrg.id,
    },
    {
      name: "Maria Santos",
      email: "maria@mission.org",
      role: "field_user" as const,
      passwordHash: "20750c2e3781cc77d70730328f8ee260:b3c1a0d5436fb2b8a4812a6fb2fa76c4b469a6dad5abc5ccd5af22c6dbaa4bfcac8c5b19d419501d6058ebf27a82c4c295f8aaf13092682c90d2999e4e1efca8",
      bio: "Working in remote villages in Guatemala, focused on education and literacy programs.",
      location: "Huehuetenango, Guatemala",
      organization: "Latin America Mission",
      organizationId: defaultOrg.id,
    },
    {
      name: "David Chen",
      email: "david@mission.org",
      role: "field_user" as const,
      passwordHash: "4bc4e298eff5cb0f5de695bec16fcb2f:6639b49f86292bdec45311a01d0c0e2f4ee317784e60961bf8105e84d5501fbea43d625301ab14c3812ebc8ba95def912181732f4934b1f268578f8c58b56701",
      bio: "Church planting pioneer working with unreached people groups in Southeast Asia.",
      location: "Chiang Mai, Thailand",
      organization: "OMF International",
      organizationId: defaultOrg.id,
    },
  ];

  const insertedUsers = await db.insert(usersTable).values(DEMO_USERS).returning();
  const userMap = Object.fromEntries(insertedUsers.map((u) => [u.email, u.id]));

  await db.insert(reportsTable).values([
    {
      missionaryId: userMap["james@mission.org"],
      organizationId: defaultOrg.id,
      title: "A New Church Planted in Achi Village",
      description: `Last month, after three years of prayer and relationship-building, we held the first official gathering of the Achi Community Church. Sixty-seven people crowded into Emmanuel's home. The worship was raw and full of joy. Three local men have expressed a calling to pastoral leadership.`,
      category: "post",
      location: "Achi Village, Enugu State, Nigeria",
      reportDate: new Date("2026-03-15"),
      peopleReached: 230,
    },
    {
      missionaryId: userMap["james@mission.org"],
      organizationId: defaultOrg.id,
      title: "Leadership Training Camp: 18 Emerging Pastors Equipped",
      description: `For two weeks in January, we gathered 18 young leaders from five different villages. These leaders wake before dawn to study. They argued passionately over Scripture. One young woman, Adaeze, is leading a fellowship of 34 women in her village.`,
      category: "post",
      location: "Nsukka, Enugu State, Nigeria",
      reportDate: new Date("2026-02-10"),
      peopleReached: 450,
    },
    {
      missionaryId: userMap["maria@mission.org"],
      organizationId: defaultOrg.id,
      title: "Literacy Opens Hearts in San Pedro Village",
      description: `We launched our first women's literacy program. 28 women gathered every Tuesday and Thursday. By month four, they were reading full sentences. The day Maria Elena — a 52-year-old grandmother — read a verse from John aloud for the first time, the room went silent.`,
      category: "post",
      location: "San Pedro Soloma, Huehuetenango, Guatemala",
      reportDate: new Date("2026-03-20"),
      peopleReached: 340,
    },
    {
      missionaryId: userMap["david@mission.org"],
      organizationId: defaultOrg.id,
      title: "Three New House Churches Among the Akha People",
      description: `Over the past eighteen months, God has been doing something quiet and extraordinary. It began with a young man named Amu. Today, there are three house churches among the Akha villages within our reach — small, fragile, and full of the Spirit.`,
      category: "post",
      location: "Chiang Rai Province, Thailand",
      reportDate: new Date("2026-03-08"),
      peopleReached: 180,
    },
  ]);

  logger.info("Demo seed complete: 1 org, 4 users, 4 posts");
}
