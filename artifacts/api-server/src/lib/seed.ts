import { db, usersTable, reportsTable } from "@workspace/db";
import { logger } from "./logger";

const DEMO_USERS = [
  {
    name: "Sarah Mitchell",
    email: "admin@calvary.org",
    role: "admin" as const,
    passwordHash: "a2303eaa9f39c4e4a2dc66e4cf080bcd:b1570d98601cc852048eab43d1a868f4118b7ceb62bbf7315f1841bc15ebe4709cd9b8ee2f2fc609ce49a3818cc92e6130156d1716ca534496369304f9181454",
    bio: "Church administrator at Calvary Community Church, managing missionary outreach since 2015.",
    location: "Dallas, TX",
    organization: "Calvary Community Church",
  },
  {
    name: "James Okafor",
    email: "james@mission.org",
    role: "missionary" as const,
    passwordHash: "0e44db8a79b659cb03b27518e524301e:4f2fe8547195d219cf0fb74f1c0bf2ea56cfbf0740589353a5f1e7c1648d8f61bd5130564613a28302a409efa5f4516cd7dc7f20e1c64ed07ee9016e822aacb8",
    bio: "Serving the people of rural Nigeria with church planting and leadership training. Five years in the field, committed to equipping local leaders.",
    location: "Enugu, Nigeria",
    organization: "Africa Inland Mission",
  },
  {
    name: "Maria Santos",
    email: "maria@mission.org",
    role: "missionary" as const,
    passwordHash: "20750c2e3781cc77d70730328f8ee260:b3c1a0d5436fb2b8a4812a6fb2fa76c4b469a6dad5abc5ccd5af22c6dbaa4bfcac8c5b19d419501d6058ebf27a82c4c295f8aaf13092682c90d2999e4e1efca8",
    bio: "Working in remote villages in Guatemala, focused on education and literacy programs that open doors to the Gospel.",
    location: "Huehuetenango, Guatemala",
    organization: "Latin America Mission",
  },
  {
    name: "David Chen",
    email: "david@mission.org",
    role: "missionary" as const,
    passwordHash: "4bc4e298eff5cb0f5de695bec16fcb2f:6639b49f86292bdec45311a01d0c0e2f4ee317784e60961bf8105e84d5501fbea43d625301ab14c3812ebc8ba95def912181732f4934b1f268578f8c58b56701",
    bio: "Church planting pioneer working with unreached people groups in Southeast Asia. Building communities of faith one relationship at a time.",
    location: "Chiang Mai, Thailand",
    organization: "OMF International",
  },
];

export async function seedIfEmpty() {
  const existing = await db.select().from(usersTable).limit(1);
  if (existing.length > 0) {
    return;
  }

  logger.info("Database empty — seeding demo data");

  const insertedUsers = await db.insert(usersTable).values(DEMO_USERS).returning();
  const userMap = Object.fromEntries(insertedUsers.map((u) => [u.email, u.id]));

  await db.insert(reportsTable).values([
    {
      missionaryId: userMap["james@mission.org"],
      title: "A New Church Planted in Achi Village",
      description: `Last month, after three years of prayer, relationship-building, and countless hours gathered under the mango trees with the elders of Achi Village, we held the first official gathering of what is now the Achi Community Church.

Sixty-seven people crowded into Emmanuel's home — the first believer in the village — sitting on wooden benches, plastic chairs, and mats on the floor. Children perched on windowsills. Grandmothers who had walked miles arrived before anyone else.

The worship was raw and full of joy. A teenage boy named Chukwudi played the drum. A woman named Grace led the singing in Igbo, and I watched grown men weep as the Holy Spirit moved through that small room.

We are still meeting in homes, but the community has committed to building a proper structure by year's end. Three local men have expressed a calling to pastoral leadership. I'm walking with them weekly in Bible study and prayer.

This village was considered "resistant" when I first arrived. Today, it is a testimony to the patience of God and the faithfulness of this community.`,
      category: "church_planting",
      location: "Achi Village, Enugu State, Nigeria",
      reportDate: new Date("2026-03-15"),
      peopleReached: 230,
      leadersTrainer: 3,
      communitiesServed: 1,
    },
    {
      missionaryId: userMap["james@mission.org"],
      title: "Leadership Training Camp: 18 Emerging Pastors Equipped",
      description: `For two weeks in January, we gathered 18 young leaders from five different villages at our training center in Nsukka. These are men and women who are already leading home fellowships, Bible studies, and small congregations — but who have had limited formal discipleship.

The curriculum focused on Biblical foundations of pastoral leadership, conflict resolution in community settings, practical theology for the African context, and evangelism strategies for resistant communities.

What struck me most was their hunger. These leaders wake before dawn to study. They argued passionately over Scripture. They prayed for each other with a depth that humbled me.

One young woman, Adaeze, is leading a fellowship of 34 women in her village. She had never been told she was a leader before. By the end of the two weeks, she was teaching the rest of us.

We closed the camp with a commissioning service. Watching them return to their communities with new tools, new confidence, and deepened conviction — this is why we are here.`,
      category: "leadership_training",
      location: "Nsukka, Enugu State, Nigeria",
      reportDate: new Date("2026-02-10"),
      peopleReached: 450,
      leadersTrainer: 18,
      communitiesServed: 5,
    },
    {
      missionaryId: userMap["maria@mission.org"],
      title: "Literacy Opens Hearts in San Pedro Village",
      description: `When I arrived in San Pedro Soloma three years ago, over 60% of women in the village could not read. Most had never been to school. Their children were beginning to break that cycle, but the mothers were left behind — unable to help with homework, unable to read the Bible, unable to participate fully in the growing church fellowship.

This year, we launched our first women's literacy program. We gathered 28 women every Tuesday and Thursday morning in the church building. We started with the alphabet. We progressed to simple words. By month four, they were reading full sentences.

The day Maria Elena — a 52-year-old grandmother — read a verse from the Gospel of John aloud for the first time, the room went silent. Then everyone cried together.

She told me afterward, "I always thought the Bible was not for me. That it was for educated people. Now I know it is mine."

The literacy program has created something we didn't fully anticipate: a deeper hunger for Scripture among women who now feel ownership of the Word. Several of the women are now leading Bible studies in their homes.

We are planning to expand to two neighboring villages next quarter.`,
      category: "education",
      location: "San Pedro Soloma, Huehuetenango, Guatemala",
      reportDate: new Date("2026-03-20"),
      peopleReached: 340,
      leadersTrainer: 5,
      communitiesServed: 1,
    },
    {
      missionaryId: userMap["maria@mission.org"],
      title: "Emergency Food Distribution After Flooding",
      description: `Heavy rains in late February caused severe flooding across three villages in our region. Homes were damaged, crops were destroyed, and many families lost everything they owned in a matter of hours.

Our mission team coordinated with local church leaders to organize an emergency food distribution effort. Within 48 hours of the flooding, we had connected with partner organizations and mobilized volunteers from every church fellowship in the area.

Over four days, we distributed food packages to 127 families — rice, beans, cooking oil, and water purification tablets. We also provided basic medical supplies and connected three families with more urgent medical care.

The distribution points became something unexpected: places of prayer and community. Volunteers stayed long after the food was handed out, sitting with families, listening to stories of loss, and praying together. The local pastor told me he had never seen the community show up for each other this way.

Suffering opened a door that we walked through together. Several families who had shown no interest in the church before the flooding have now joined the Sunday gathering.

This is not the gospel by itself — but it is the gospel with hands and feet.`,
      category: "humanitarian_work",
      location: "Nentón District, Huehuetenango, Guatemala",
      reportDate: new Date("2026-02-28"),
      peopleReached: 890,
      communitiesServed: 3,
    },
    {
      missionaryId: userMap["david@mission.org"],
      title: "Three New House Churches Among the Akha People",
      description: `The Akha people of northern Thailand have been on my heart for six years. When I first arrived in this region, there were no known believers in the Akha villages within two hours of Chiang Rai. The community was closed — not hostile, but deeply committed to the traditional spirit worship that defines Akha identity and social structure.

Conversion among the Akha carries a heavy cost. To follow Jesus is often seen as abandoning your people.

Over the past eighteen months, God has been doing something quiet and extraordinary.

It began with a young man named Amu, who worked at a tea farm where our team volunteered. He started asking questions about Jesus. Then his questions became prayer. Then prayer became faith. He was baptized in a river last April — the first believer from his village in living memory.

Amu didn't leave his people. He stayed and lived differently. Slowly, his family began to watch. His mother came to faith this January. Two months later, his uncle and three cousins.

Today, there are three house churches among the Akha villages within our reach — small, fragile, and full of the Spirit. We meet with them weekly for discipleship and prayer. The leaders are Akha men and women who are learning to lead in their own language and cultural forms.

Please pray for these communities. The pressure to return to traditional practices is real and constant. But so is the grace that holds them.`,
      category: "church_planting",
      location: "Chiang Rai Province, Thailand",
      reportDate: new Date("2026-03-08"),
      peopleReached: 180,
      leadersTrainer: 6,
      communitiesServed: 3,
    },
  ]);

  logger.info("Demo seed complete: 4 users, 5 reports");
}
