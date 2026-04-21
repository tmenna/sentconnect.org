import { pool } from "@workspace/db";

export const DEFAULT_LANDING_PAGE_CONTENT = {
  heroEyebrow: "Private missionary updates",
  heroTitle: "Stay connected with your field teams from one private mission feed.",
  heroDescription: "SentConnect gives churches and mission organizations a dedicated space where missionaries can share updates, photos, prayer needs, and impact reports with the people who support them.",
  primaryCtaLabel: "Create your organization",
  primaryCtaHref: "/signup",
  secondaryCtaLabel: "Learn how sign-in works",
  secondaryCtaHref: "#signin",
  previewLabel: "Latest field updates",
  previewTitle1: "Prayer gathering in Kigali",
  previewTitle2: "New family visits this week",
  previewTitle3: "Youth outreach photos shared",
  step1Title: "1. Sign up",
  step1Description: "Create your organization and choose a short subdomain, like rvc.",
  step2Title: "2. Use your portal",
  step2Description: "Your team signs in at your dedicated address, such as rvc.sentconnect.org/login.",
  step3Title: "3. Share updates",
  step3Description: "Invite field users, collect reports, and keep your church connected to ministry work.",
};

type LandingPageContentInput = typeof DEFAULT_LANDING_PAGE_CONTENT;

const columnMap = {
  heroEyebrow: "hero_eyebrow",
  heroTitle: "hero_title",
  heroDescription: "hero_description",
  primaryCtaLabel: "primary_cta_label",
  primaryCtaHref: "primary_cta_href",
  secondaryCtaLabel: "secondary_cta_label",
  secondaryCtaHref: "secondary_cta_href",
  previewLabel: "preview_label",
  previewTitle1: "preview_title_1",
  previewTitle2: "preview_title_2",
  previewTitle3: "preview_title_3",
  step1Title: "step_1_title",
  step1Description: "step_1_description",
  step2Title: "step_2_title",
  step2Description: "step_2_description",
  step3Title: "step_3_title",
  step3Description: "step_3_description",
} as const;

let ensurePromise: Promise<void> | null = null;

export function cleanLandingPageContent(body: any): LandingPageContentInput | null {
  const values: Record<string, string> = {};
  for (const key of Object.keys(DEFAULT_LANDING_PAGE_CONTENT) as Array<keyof LandingPageContentInput>) {
    const value = typeof body?.[key] === "string" ? body[key].trim() : "";
    if (!value) return null;
    values[key] = value.slice(0, key.includes("Description") ? 700 : 180);
  }
  return values as LandingPageContentInput;
}

function rowToContent(row: any): LandingPageContentInput {
  const content: Record<string, string> = {};
  for (const [key, column] of Object.entries(columnMap)) {
    content[key] = row[column];
  }
  return { ...DEFAULT_LANDING_PAGE_CONTENT, ...content };
}

async function ensureLandingPageTable(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = pool.query(`
      CREATE TABLE IF NOT EXISTS landing_page_content (
        key text PRIMARY KEY,
        hero_eyebrow text NOT NULL,
        hero_title text NOT NULL,
        hero_description text NOT NULL,
        primary_cta_label text NOT NULL,
        primary_cta_href text NOT NULL,
        secondary_cta_label text NOT NULL,
        secondary_cta_href text NOT NULL,
        preview_label text NOT NULL,
        preview_title_1 text NOT NULL,
        preview_title_2 text NOT NULL,
        preview_title_3 text NOT NULL,
        step_1_title text NOT NULL,
        step_1_description text NOT NULL,
        step_2_title text NOT NULL,
        step_2_description text NOT NULL,
        step_3_title text NOT NULL,
        step_3_description text NOT NULL,
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `).then(() => undefined);
  }
  return ensurePromise;
}

export async function getLandingPageContent(): Promise<LandingPageContentInput> {
  await ensureLandingPageTable();
  const result = await pool.query("SELECT * FROM landing_page_content WHERE key = $1", ["main"]);
  return result.rows[0] ? rowToContent(result.rows[0]) : DEFAULT_LANDING_PAGE_CONTENT;
}

export async function saveLandingPageContent(content: LandingPageContentInput): Promise<LandingPageContentInput> {
  await ensureLandingPageTable();
  const keys = Object.keys(columnMap) as Array<keyof LandingPageContentInput>;
  const columns = keys.map((key) => columnMap[key]);
  const values = keys.map((key) => content[key]);
  const placeholders = values.map((_, index) => `$${index + 2}`);
  const updates = columns.map((column) => `${column} = EXCLUDED.${column}`).join(", ");

  const result = await pool.query(
    `
      INSERT INTO landing_page_content (key, ${columns.join(", ")})
      VALUES ($1, ${placeholders.join(", ")})
      ON CONFLICT (key) DO UPDATE SET ${updates}, updated_at = now()
      RETURNING *
    `,
    ["main", ...values],
  );

  return rowToContent(result.rows[0]);
}