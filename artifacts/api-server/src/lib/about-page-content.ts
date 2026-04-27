import { pool } from "@workspace/db";

export const DEFAULT_ABOUT_PAGE_CONTENT = {
  aboutTitle: "Why We Created SentConnect",
  aboutBody: `We are the Menna family, serving in Ethiopia alongside internally displaced persons (IDPs) through local ministry work. Over the years, one consistent gap we have seen in partnerships between churches, missionaries, international ministries, and local field partners is communication and reporting.

Too often, important ministry updates, prayer needs, stories from the field, and impact reports are shared inconsistently or get lost across emails, messaging apps, and informal channels. This can create distance between sending churches, mission organizations, and the teams they support in the field.

While serving with organizations like e3 Partners, I often helped bridge this gap as a communication liaison between field teams and churches in Ethiopia and ministry partners in the U.S.—supporting local ministries with reporting, updates, and timely communication. Through that experience, we saw the need for a simple tool designed specifically for this challenge.

SentConnect was born from that need.

We created SentConnect to give churches, mission organizations, and field teams a dedicated shared space to communicate clearly and consistently—where teams can share updates, photos, prayer requests, and ministry reports, and where churches can stay meaningfully connected to the work happening on the field.

Our vision is simple: strengthen the connection between the church, mission organizations, and the field—so ministry partnerships can be more informed, engaged, and fruitful.`,
};

export type AboutPageContent = typeof DEFAULT_ABOUT_PAGE_CONTENT;

let ensurePromise: Promise<void> | null = null;

async function ensureAboutPageTable(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = pool
      .query(`
        CREATE TABLE IF NOT EXISTS about_page_content (
          key         text PRIMARY KEY,
          about_title text NOT NULL DEFAULT 'Why We Created SentConnect',
          about_body  text NOT NULL DEFAULT '',
          updated_at  timestamptz NOT NULL DEFAULT now()
        )
      `)
      .then(() => undefined);
  }
  return ensurePromise;
}

function rowToContent(row: any): AboutPageContent {
  return {
    aboutTitle: row.about_title ?? DEFAULT_ABOUT_PAGE_CONTENT.aboutTitle,
    aboutBody: row.about_body ?? DEFAULT_ABOUT_PAGE_CONTENT.aboutBody,
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
    `INSERT INTO about_page_content (key, about_title, about_body)
     VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE
       SET about_title = EXCLUDED.about_title,
           about_body  = EXCLUDED.about_body,
           updated_at  = now()
     RETURNING *`,
    ["main", content.aboutTitle, content.aboutBody],
  );
  return rowToContent(result.rows[0]);
}

export function cleanAboutPageContent(body: any): AboutPageContent | null {
  const title = typeof body?.aboutTitle === "string" ? body.aboutTitle.trim() : "";
  const aboutBody = typeof body?.aboutBody === "string" ? body.aboutBody.trim() : "";
  if (!title || !aboutBody) return null;
  return {
    aboutTitle: title.slice(0, 300),
    aboutBody: aboutBody.slice(0, 20000),
  };
}
