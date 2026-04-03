import { Router, type IRouter } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db, reportsTable, usersTable, photosTable } from "@workspace/db";
import {
  ListReportsQueryParams,
  CreateReportBody,
  GetReportParams,
  UpdateReportParams,
  UpdateReportBody,
  DeleteReportParams,
  GetUserReportsParams,
  AddReportPhotoParams,
  AddReportPhotoBody,
  DeletePhotoParams,
  GetTimelineQueryParams,
  GetRecentActivityQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getReportWithDetails(reportId: number) {
  const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, reportId));
  if (!report) return null;
  const [missionary] = await db.select().from(usersTable).where(eq(usersTable.id, report.missionaryId));
  if (!missionary) return null;
  const photos = await db.select().from(photosTable).where(eq(photosTable.reportId, reportId));
  const { passwordHash: _pw, ...missionaryData } = missionary;
  return { ...report, missionary: missionaryData, photos };
}

async function getReportsWithDetails(reportsList: typeof reportsTable.$inferSelect[]) {
  return await Promise.all(reportsList.map(async (report) => {
    const [missionary] = await db.select().from(usersTable).where(eq(usersTable.id, report.missionaryId));
    const photos = await db.select().from(photosTable).where(eq(photosTable.reportId, report.id));
    const { passwordHash: _pw, ...missionaryData } = missionary ?? { passwordHash: "", id: 0, name: "Unknown", email: "", role: "missionary", bio: null, location: null, avatarUrl: null, organization: null, createdAt: new Date(), updatedAt: new Date() };
    return { ...report, missionary: missionaryData, photos };
  }));
}

router.get("/users/:id/reports", async (req, res): Promise<void> => {
  const params = GetUserReportsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const reports = await db.select().from(reportsTable)
    .where(eq(reportsTable.missionaryId, params.data.id))
    .orderBy(desc(reportsTable.reportDate));
  const result = await getReportsWithDetails(reports);
  res.json(result);
});

router.get("/reports", async (req, res): Promise<void> => {
  const parsed = ListReportsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const conditions = [];
  if (parsed.data.missionaryId) {
    conditions.push(eq(reportsTable.missionaryId, parsed.data.missionaryId));
  }
  if (parsed.data.category && parsed.data.category !== "null") {
    conditions.push(eq(reportsTable.category, parsed.data.category));
  }
  const limit = parsed.data.limit ?? 20;
  const offset = parsed.data.offset ?? 0;
  const reports = await db.select().from(reportsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reportsTable.reportDate))
    .limit(limit)
    .offset(offset);
  const result = await getReportsWithDetails(reports);
  res.json(result);
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [report] = await db.insert(reportsTable).values({
    ...parsed.data,
    reportDate: new Date(parsed.data.reportDate),
  }).returning();
  const details = await getReportWithDetails(report.id);
  res.status(201).json(details);
});

router.get("/reports/:id", async (req, res): Promise<void> => {
  const params = GetReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const details = await getReportWithDetails(params.data.id);
  if (!details) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(details);
});

router.patch("/reports/:id", async (req, res): Promise<void> => {
  const params = UpdateReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateReportBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (body.data.title != null) updates.title = body.data.title;
  if (body.data.description != null) updates.description = body.data.description;
  if (body.data.category != null) updates.category = body.data.category;
  if (body.data.reportDate != null) updates.reportDate = new Date(body.data.reportDate);
  if (body.data.peopleReached !== undefined) updates.peopleReached = body.data.peopleReached;
  if (body.data.leadersTrainer !== undefined) updates.leadersTrainer = body.data.leadersTrainer;
  if (body.data.communitiesServed !== undefined) updates.communitiesServed = body.data.communitiesServed;
  if (body.data.location !== undefined) updates.location = body.data.location;

  const [report] = await db.update(reportsTable).set(updates).where(eq(reportsTable.id, params.data.id)).returning();
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  const details = await getReportWithDetails(report.id);
  res.json(details);
});

router.delete("/reports/:id", async (req, res): Promise<void> => {
  const params = DeleteReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [report] = await db.delete(reportsTable).where(eq(reportsTable.id, params.data.id)).returning();
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/reports/:id/photos", async (req, res): Promise<void> => {
  const params = AddReportPhotoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = AddReportPhotoBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, params.data.id));
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  const [photo] = await db.insert(photosTable).values({ reportId: params.data.id, url: body.data.url, caption: body.data.caption ?? null }).returning();
  res.status(201).json(photo);
});

router.delete("/photos/:id", async (req, res): Promise<void> => {
  const params = DeletePhotoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [photo] = await db.delete(photosTable).where(eq(photosTable.id, params.data.id)).returning();
  if (!photo) {
    res.status(404).json({ error: "Photo not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/timeline", async (req, res): Promise<void> => {
  const parsed = GetTimelineQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const limit = parsed.data.limit ?? 20;
  const offset = parsed.data.offset ?? 0;
  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(reportsTable);
  const total = countResult?.count ?? 0;
  const reports = await db.select().from(reportsTable)
    .orderBy(desc(reportsTable.reportDate))
    .limit(limit)
    .offset(offset);
  const result = await getReportsWithDetails(reports);
  res.json({ reports: result, total, hasMore: offset + limit < total });
});

router.get("/recent-activity", async (req, res): Promise<void> => {
  const parsed = GetRecentActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const limit = parsed.data.limit ?? 5;
  const reports = await db.select().from(reportsTable)
    .orderBy(desc(reportsTable.reportDate))
    .limit(limit);
  const result = await getReportsWithDetails(reports);
  res.json(result);
});

router.get("/stats", async (req, res): Promise<void> => {
  const [totalReportsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(reportsTable);
  const [totalMissionariesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "missionary"));
  const [metricsResult] = await db.select({
    totalPeopleReached: sql<number>`coalesce(sum(people_reached), 0)::int`,
    totalLeadersTrained: sql<number>`coalesce(sum(leaders_trainer), 0)::int`,
    totalCommunitiesServed: sql<number>`coalesce(sum(communities_served), 0)::int`,
  }).from(reportsTable);

  const categoryCounts = await db.select({
    category: reportsTable.category,
    count: sql<number>`count(*)::int`,
  }).from(reportsTable).groupBy(reportsTable.category);

  res.json({
    totalReports: totalReportsResult?.count ?? 0,
    totalMissionaries: totalMissionariesResult?.count ?? 0,
    totalPeopleReached: metricsResult?.totalPeopleReached ?? 0,
    totalLeadersTrained: metricsResult?.totalLeadersTrained ?? 0,
    totalCommunitiesServed: metricsResult?.totalCommunitiesServed ?? 0,
    reportsByCategory: categoryCounts,
  });
});

router.post("/upload-url", async (req, res): Promise<void> => {
  res.json({
    uploadUrl: "",
    publicUrl: "",
  });
});

export default router;
