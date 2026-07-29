import { pool } from "@workspace/db";

export const DEFAULT_ABOUT_PAGE_CONTENT = {
  aboutTitle: "Why We Created SentConnect",
  aboutImageUrl: "",
  aboutBody: `We are the Menna family. While serving in Ethiopia, we saw a common challenge: churches often struggle to stay connected with the missionaries and ministry partners they send and support. Important updates, prayer requests, photos, and ministry reports are often scattered across emails, messaging apps, and social media.

Through years of serving as a bridge between churches, mission organizations, and field teams, we saw the need for a simple, dedicated platform built specifically for missionary communication.

SentConnect was created to strengthen the connection between churches and the mission field—helping ministries communicate clearly, stay engaged, and partner more effectively in God's mission.`,
};

export type AboutPageContent = typeof DEFAULT_ABOUT_PAGE_CONTENT;

let ensurePromise: Promise<void> | null = null;

async function ensureAboutPageTable(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = pool
      .query(`
        CREATE TABLE IF NOT EXISTS about_page_content (
          key              text PRIMARY KEY,
          about_title      text NOT NULL DEFAULT 'Why We Created SentConnect',
          about_image_url  text NOT NULL DEFAULT '',
          about_body       text NOT NULL DEFAULT '',
          updated_at       timestamptz NOT NULL DEFAULT now()
        )
      `)
      .then(() =>
        pool.query(`
          ALTER TABLE about_page_content
            ADD COLUMN IF NOT EXISTS about_image_url text NOT NULL DEFAULT ''
        `),
      )
      .then(() => undefined);
  }
  return ensurePromise;
}

function rowToContent(row: any): AboutPageContent {
  return {
    aboutTitle:    row.about_title     ?? DEFAULT_ABOUT_PAGE_CONTENT.aboutTitle,
    aboutImageUrl: row.about_image_url ?? DEFAULT_ABOUT_PAGE_CONTENT.aboutImageUrl,
    aboutBody:     row.about_body      ?? DEFAULT_ABOUT_PAGE_CONTENT.aboutBody,
  };
}

export async function getAboutPageContent(): Promise<AboutPageContent> {
  await ensureAboutPageTable();
  const result = await pool.query(
    "SELECT * FROM about_page_content WHERE key = $1",
    ["main"],
  );
  return result.rows[0] ? rowToContent(result.rows[0]) : DEFAULT_ABOUT_PAGE_CONTENT;
}

export async function saveAboutPageContent(content: AboutPageContent): Promise<AboutPageContent> {
  await ensureAboutPageTable();
  const result = await pool.query(
    `INSERT INTO about_page_content (key, about_title, about_image_url, about_body)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (key) DO UPDATE
       SET about_title      = EXCLUDED.about_title,
           about_image_url  = EXCLUDED.about_image_url,
           about_body       = EXCLUDED.about_body,
           updated_at       = now()
     RETURNING *`,
    ["main", content.aboutTitle, content.aboutImageUrl, content.aboutBody],
  );
  return rowToContent(result.rows[0]);
}

export function cleanAboutPageContent(body: any): AboutPageContent | null {
  const title        = typeof body?.aboutTitle    === "string" ? body.aboutTitle.trim()    : "";
  const aboutBody    = typeof body?.aboutBody     === "string" ? body.aboutBody.trim()     : "";
  const aboutImageUrl = typeof body?.aboutImageUrl === "string" ? body.aboutImageUrl.trim() : "";
  if (!title || !aboutBody) return null;
  return {
    aboutTitle:    title.slice(0, 300),
    aboutImageUrl: aboutImageUrl.slice(0, 1000),
    aboutBody:     aboutBody.slice(0, 20000),
  };
}
