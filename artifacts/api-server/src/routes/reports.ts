import { Router, type IRouter } from "express";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { db, reportsTable, usersTable, photosTable, likesTable, commentsTable } from "@workspace/db";

const router: IRouter = Router();

async function getPostWithDetails(postId: number, currentUserId?: number) {
  const [post] = await db.select().from(reportsTable).where(eq(reportsTable.id, postId));
  if (!post) return null;
  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, post.missionaryId));
  if (!author) return null;
  const photos = await db.select().from(photosTable).where(eq(photosTable.reportId, postId));
  const [likeCount] = await db.select({ count: count() }).from(likesTable).where(eq(likesTable.postId, postId));
  const [commentCount] = await db.select({ count: count() }).from(commentsTable).where(eq(commentsTable.postId, postId));
  let likedByMe = false;
  if (currentUserId) {
    const [like] = await db.select().from(likesTable).where(and(eq(likesTable.postId, postId), eq(likesTable.userId, currentUserId)));
    likedByMe = !!like;
  }
  const { passwordHash: _pw, ...authorData } = author;
  return { ...post, author: authorData, photos, likeCount: likeCount?.count ?? 0, commentCount: commentCount?.count ?? 0, likedByMe };
}

async function getPostsWithDetails(posts: typeof reportsTable.$inferSelect[], currentUserId?: number) {
  return await Promise.all(posts.map(p => getPostWithDetails(p.id, currentUserId)));
}

// GET /timeline — requires login
router.get("/timeline", async (req, res): Promise<void> => {
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;

  const whereClause = undefined; // all posts visible to logged-in users
  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(reportsTable).where(whereClause);
  const total = countResult?.count ?? 0;
  const posts = await db.select().from(reportsTable)
    .where(whereClause)
    .orderBy(desc(reportsTable.createdAt))
    .limit(limit)
    .offset(offset);
  const result = await getPostsWithDetails(posts, currentUserId);
  res.json({ reports: result, total, hasMore: offset + limit < total });
});

// GET /reports — list posts (requires login)
router.get("/reports", async (req, res): Promise<void> => {
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const missionaryId = req.query.missionaryId ? Number(req.query.missionaryId) : undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Number(req.query.offset) || 0;

  const conditions = [];
  if (missionaryId) conditions.push(eq(reportsTable.missionaryId, missionaryId));

  const posts = await db.select().from(reportsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(reportsTable.createdAt))
    .limit(limit)
    .offset(offset);
  const result = await getPostsWithDetails(posts, currentUserId);
  res.json(result);
});

// GET /users/:id/reports — profile timeline (requires login)
router.get("/users/:id/reports", async (req, res): Promise<void> => {
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const userId = Number(req.params.id);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }
  const conditions = [eq(reportsTable.missionaryId, userId)];
  const posts = await db.select().from(reportsTable)
    .where(and(...conditions))
    .orderBy(desc(reportsTable.createdAt));
  const result = await getPostsWithDetails(posts, currentUserId);
  res.json(result);
});

// POST /reports — create a post (simplified: no required fields except missionaryId)
router.post("/reports", async (req, res): Promise<void> => {
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { description, location, visibility } = req.body ?? {};
  const vis = visibility === "private" ? "private" : "public";

  const [post] = await db.insert(reportsTable).values({
    missionaryId: currentUserId,
    description: typeof description === "string" ? description : null,
    location: typeof location === "string" ? location : null,
    visibility: vis,
    title: null,
    category: "post",
    reportDate: new Date(),
  }).returning();
  const details = await getPostWithDetails(post.id, currentUserId);
  res.status(201).json(details);
});

// GET /reports/:id (requires login)
router.get("/reports/:id", async (req, res): Promise<void> => {
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const postId = Number(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const details = await getPostWithDetails(postId, currentUserId);
  if (!details) { res.status(404).json({ error: "Post not found" }); return; }
  res.json(details);
});

// PATCH /reports/:id
router.patch("/reports/:id", async (req, res): Promise<void> => {
  const postId = Number(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { description, location, visibility } = req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (description != null) updates.description = String(description);
  if (location !== undefined) updates.location = location ?? null;
  if (visibility === "public" || visibility === "private") updates.visibility = visibility;

  const [post] = await db.update(reportsTable).set(updates).where(eq(reportsTable.id, postId)).returning();
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  const details = await getPostWithDetails(post.id, currentUserId);
  res.json(details);
});

// DELETE /reports/:id
router.delete("/reports/:id", async (req, res): Promise<void> => {
  const postId = Number(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [post] = await db.delete(reportsTable).where(eq(reportsTable.id, postId)).returning();
  if (!post) { res.status(404).json({ error: "Post not found" }); return; }
  res.sendStatus(204);
});

// POST /reports/:id/photos — add media to a post
router.post("/reports/:id/photos", async (req, res): Promise<void> => {
  const postId = Number(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { url, caption } = req.body ?? {};
  if (!url || typeof url !== "string") { res.status(400).json({ error: "url is required" }); return; }
  const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, postId));
  if (!report) { res.status(404).json({ error: "Post not found" }); return; }
  const [photo] = await db.insert(photosTable).values({ reportId: postId, url, caption: caption ?? null }).returning();
  res.status(201).json(photo);
});

// DELETE /photos/:id
router.delete("/photos/:id", async (req, res): Promise<void> => {
  const photoId = Number(req.params.id);
  if (isNaN(photoId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [photo] = await db.delete(photosTable).where(eq(photosTable.id, photoId)).returning();
  if (!photo) { res.status(404).json({ error: "Photo not found" }); return; }
  res.sendStatus(204);
});

// POST /reports/:id/likes — toggle like
router.post("/reports/:id/likes", async (req, res): Promise<void> => {
  const postId = Number(req.params.id);
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [existing] = await db.select().from(likesTable).where(and(eq(likesTable.postId, postId), eq(likesTable.userId, currentUserId)));
  if (existing) {
    await db.delete(likesTable).where(eq(likesTable.id, existing.id));
    const [lc] = await db.select({ count: count() }).from(likesTable).where(eq(likesTable.postId, postId));
    res.json({ liked: false, likeCount: lc?.count ?? 0 });
  } else {
    await db.insert(likesTable).values({ postId, userId: currentUserId });
    const [lc] = await db.select({ count: count() }).from(likesTable).where(eq(likesTable.postId, postId));
    res.json({ liked: true, likeCount: lc?.count ?? 0 });
  }
});

// GET /reports/:id/comments
router.get("/reports/:id/comments", async (req, res): Promise<void> => {
  const postId = Number(req.params.id);
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const commentsList = await db.select().from(commentsTable).where(eq(commentsTable.postId, postId)).orderBy(commentsTable.createdAt);
  const withAuthors = await Promise.all(commentsList.map(async (c) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, c.userId));
    const { passwordHash: _pw, ...u } = user ?? { passwordHash: "", id: 0, name: "Unknown", email: "", role: "user", bio: null, location: null, avatarUrl: null, organization: null, createdAt: new Date(), updatedAt: new Date() };
    return { ...c, author: u };
  }));
  res.json(withAuthors);
});

// POST /reports/:id/comments
router.post("/reports/:id/comments", async (req, res): Promise<void> => {
  const postId = Number(req.params.id);
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (isNaN(postId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { text } = req.body ?? {};
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    res.status(400).json({ error: "text is required" }); return;
  }
  const [comment] = await db.insert(commentsTable).values({ postId, userId: currentUserId, text: text.trim().slice(0, 1000) }).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, currentUserId));
  const { passwordHash: _pw, ...authorData } = user;
  res.status(201).json({ ...comment, author: authorData });
});

// DELETE /comments/:id
router.delete("/comments/:id", async (req, res): Promise<void> => {
  const commentId = Number(req.params.id);
  if (isNaN(commentId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [comment] = await db.delete(commentsTable).where(and(eq(commentsTable.id, commentId), eq(commentsTable.userId, currentUserId))).returning();
  if (!comment) { res.status(404).json({ error: "Comment not found or not yours" }); return; }
  res.sendStatus(204);
});

// GET /stats
router.get("/stats", async (req, res): Promise<void> => {
  const [totalPostsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(reportsTable);
  const [totalUsersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "user"));
  const [totalMissionariesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "missionary"));
  res.json({
    totalPosts: totalPostsResult?.count ?? 0,
    totalUsers: (totalUsersResult?.count ?? 0) + (totalMissionariesResult?.count ?? 0),
    totalReports: totalPostsResult?.count ?? 0,
    totalMissionaries: (totalUsersResult?.count ?? 0) + (totalMissionariesResult?.count ?? 0),
    totalPeopleReached: 0,
    totalLeadersTrained: 0,
    totalCommunitiesServed: 0,
    reportsByCategory: [],
  });
});

// GET /recent-activity (requires login)
router.get("/recent-activity", async (req, res): Promise<void> => {
  const currentUserId = req.session?.userId as number | undefined;
  if (!currentUserId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const limit = Math.min(Number(req.query.limit) || 5, 20);
  const posts = await db.select().from(reportsTable)
    .orderBy(desc(reportsTable.createdAt))
    .limit(limit);
  const result = await getPostsWithDetails(posts, currentUserId);
  res.json(result);
});

export default router;
