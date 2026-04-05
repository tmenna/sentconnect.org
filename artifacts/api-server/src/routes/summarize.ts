import { Router, type IRouter } from "express";
import { gte, desc } from "drizzle-orm";
import { db, reportsTable, usersTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// POST /summarize — admin only: generate an AI summary of recent posts
router.post("/summarize", async (req, res): Promise<void> => {
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, currentUserId));
  if (!currentUser || currentUser.role !== "admin") {
    res.status(403).json({ error: "Admin access required" }); return;
  }

  const { range = "30d", startDate, endDate } = req.body as {
    range?: "7d" | "30d" | "custom";
    startDate?: string;
    endDate?: string;
  };

  let since: Date;
  let label: string;
  const now = new Date();

  if (range === "7d") {
    since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    label = "Last 7 Days";
  } else if (range === "custom" && startDate) {
    since = new Date(startDate);
    label = endDate
      ? `${since.toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}`
      : `Since ${since.toLocaleDateString()}`;
  } else {
    since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    label = "Last 30 Days";
  }

  const posts = await db
    .select({
      description: reportsTable.description,
      location: reportsTable.location,
      createdAt: reportsTable.createdAt,
      authorName: usersTable.name,
    })
    .from(reportsTable)
    .leftJoin(usersTable, eq(reportsTable.missionaryId, usersTable.id))
    .where(gte(reportsTable.createdAt, since.toISOString()))
    .orderBy(desc(reportsTable.createdAt))
    .limit(60);

  if (posts.length === 0) {
    res.json({ summary: null, label, postCount: 0 });
    return;
  }

  const postsText = posts
    .map((p, i) => {
      const date = new Date(p.createdAt).toLocaleDateString();
      const loc = p.location ? ` (${p.location})` : "";
      const author = p.authorName ?? "Team member";
      return `${i + 1}. [${date}] ${author}${loc}: ${p.description ?? "(no text)"}`;
    })
    .join("\n");

  const prompt = `You are summarizing field team updates for a mission organization admin.

Summarize the following ${posts.length} field update(s) into a concise, encouraging report. Include:
• Key activities happening across the team
• Main themes or focus areas
• Any measurable impact or numbers if mentioned
• Notable highlights worth sharing

Keep the summary under 200 words. Use short bullet points. Be warm and supportive in tone — these are missionaries serving in the field.

Field updates (${label}):
${postsText}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: "You are a helpful assistant that summarizes missionary field reports for church leadership." },
      { role: "user", content: prompt },
    ],
  });

  const summary = response.choices[0]?.message?.content ?? "Could not generate summary.";
  res.json({ summary, label, postCount: posts.length });
});

export default router;
