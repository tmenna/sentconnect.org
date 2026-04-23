import { pool } from "@workspace/db";

export const DEFAULT_LANDING_PAGE_CONTENT = {
  logoUrl: "",
  headerBrandName: "SentConnect",
  headerPrimaryCtaLabel: "Sign up",
  headerPrimaryCtaHref: "/signup",
  heroEyebrow: "Private missionary updates",
  heroTitle: "Stay connected with your field teams from one private mission feed.",
  heroDescription: "SentConnect gives churches and mission organizations a dedicated space where missionaries can share updates, photos, prayer needs, and impact reports with the people who support them.",
  primaryCtaLabel: "Create your organization",
  primaryCtaHref: "/signup",
  previewCardTitle: "Mission Moments",
  previewLabel: "Latest field updates",
  previewTitle1: "Prayer gathering in Kigali",
  previewTitle2: "New family visits this week",
  previewTitle3: "Youth outreach photos shared",
  howItWorksLabel: "How it works",
  howItWorksHeading: "Simple for churches. Powerful for teams.",
  step1Title: "1. Sign up",
  step1Description: "Create your organization and choose a short subdomain, like rvc.",
  step2Title: "2. Use your portal",
  step2Description: "Your team signs in at your dedicated address, such as rvc.sentconnect.org/login.",
  step3Title: "3. Share updates",
  step3Description: "Invite field users, collect reports, and keep your church connected to ministry work.",
  ctaBandHeading: "Bring your church and field teams closer together.",
  ctaBandSubtext: "Set up your organization in minutes.",
  footerBrandName: "SentConnect",
  footerOwnerText: "Holtek Solutions LLC, 2108 N ST STE N, Sacramento, CA 95816 USA",
};

type LandingPageContentInput = typeof DEFAULT_LANDING_PAGE_CONTENT;

const OPTIONAL_KEYS = new Set<keyof LandingPageContentInput>(["logoUrl"]);

const columnMap = {
  logoUrl: "logo_url",
  headerBrandName: "header_brand_name",
  headerPrimaryCtaLabel: "header_primary_cta_label",
  headerPrimaryCtaHref: "header_primary_cta_href",
  heroEyebrow: "hero_eyebrow",
  heroTitle: "hero_title",
  heroDescription: "hero_description",
  primaryCtaLabel: "primary_cta_label",
  primaryCtaHref: "primary_cta_href",
  previewCardTitle: "preview_card_title",
  previewLabel: "preview_label",
  previewTitle1: "preview_title_1",
  previewTitle2: "preview_title_2",
  previewTitle3: "preview_title_3",
  howItWorksLabel: "how_it_works_label",
  howItWorksHeading: "how_it_works_heading",
  step1Title: "step_1_title",
  step1Description: "step_1_description",
  step2Title: "step_2_title",
  step2Description: "step_2_description",
  step3Title: "step_3_title",
  step3Description: "step_3_description",
  ctaBandHeading: "cta_band_heading",
  ctaBandSubtext: "cta_band_subtext",
  footerBrandName: "footer_brand_name",
  footerOwnerText: "footer_owner_text",
} as const;

let ensurePromise: Promise<void> | null = null;

export function cleanLandingPageContent(body: any): LandingPageContentInput | null {
  const values: Record<string, string> = {};
  for (const key of Object.keys(DEFAULT_LANDING_PAGE_CONTENT) as Array<keyof LandingPageContentInput>) {
    const value = typeof body?.[key] === "string" ? body[key].trim() : "";
    if (!value && !OPTIONAL_KEYS.has(key)) return null;
    values[key] = value.slice(0, key.includes("Description") || key.includes("Text") || key.includes("Subtext") || key.includes("Heading") ? 700 : 400);
  }
  return values as LandingPageContentInput;
}

function rowToContent(row: any): LandingPageContentInput {
  const content: Record<string, string> = {};
  for (const [key, column] of Object.entries(columnMap)) {
    content[key] = row[column] ?? (DEFAULT_LANDING_PAGE_CONTENT as any)[key];
  }
  return { ...DEFAULT_LANDING_PAGE_CONTENT, ...content };
}

async function ensureLandingPageTable(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = pool.query(`
      CREATE TABLE IF NOT EXISTS landing_page_content (
        key text PRIMARY KEY,
        logo_url text NOT NULL DEFAULT '',
        header_brand_name text NOT NULL DEFAULT 'SentConnect',
        header_primary_cta_label text NOT NULL DEFAULT 'Sign up',
        header_primary_cta_href text NOT NULL DEFAULT '/signup',
        header_secondary_cta_label text NOT NULL DEFAULT 'How to sign in',
        header_secondary_cta_href text NOT NULL DEFAULT '#signin',
        hero_eyebrow text NOT NULL,
        hero_title text NOT NULL,
        hero_description text NOT NULL,
        primary_cta_label text NOT NULL,
        primary_cta_href text NOT NULL,
        secondary_cta_label text NOT NULL DEFAULT '',
        secondary_cta_href text NOT NULL DEFAULT '',
        preview_card_title text NOT NULL DEFAULT 'Mission Moments',
        preview_label text NOT NULL,
        preview_title_1 text NOT NULL,
        preview_title_2 text NOT NULL,
        preview_title_3 text NOT NULL,
        how_it_works_label text NOT NULL DEFAULT 'How it works',
        how_it_works_heading text NOT NULL DEFAULT 'Simple for churches. Powerful for teams.',
        step_1_title text NOT NULL,
        step_1_description text NOT NULL,
        step_2_title text NOT NULL,
        step_2_description text NOT NULL,
        step_3_title text NOT NULL,
        step_3_description text NOT NULL,
        cta_band_heading text NOT NULL DEFAULT 'Ready to connect your team?',
        cta_band_subtext text NOT NULL DEFAULT 'Set up your organization in minutes.',
        footer_brand_name text NOT NULL DEFAULT 'SentConnect',
        footer_owner_text text NOT NULL DEFAULT 'Holtek Solutions LLC, 2108 N ST STE N, Sacramento, CA 95816 USA',
        updated_at timestamp with time zone NOT NULL DEFAULT now()
      )
    `).then(() => pool.query(`
      ALTER TABLE landing_page_content
        ADD COLUMN IF NOT EXISTS logo_url text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS header_brand_name text NOT NULL DEFAULT 'SentConnect',
        ADD COLUMN IF NOT EXISTS header_primary_cta_label text NOT NULL DEFAULT 'Sign up',
        ADD COLUMN IF NOT EXISTS header_primary_cta_href text NOT NULL DEFAULT '/signup',
        ADD COLUMN IF NOT EXISTS header_secondary_cta_label text NOT NULL DEFAULT 'How to sign in',
        ADD COLUMN IF NOT EXISTS header_secondary_cta_href text NOT NULL DEFAULT '#signin',
        ADD COLUMN IF NOT EXISTS footer_brand_name text NOT NULL DEFAULT 'SentConnect',
        ADD COLUMN IF NOT EXISTS footer_owner_text text NOT NULL DEFAULT 'Holtek Solutions LLC, 2108 N ST STE N, Sacramento, CA 95816 USA',
        ADD COLUMN IF NOT EXISTS preview_card_title text NOT NULL DEFAULT 'Mission Moments',
        ADD COLUMN IF NOT EXISTS how_it_works_label text NOT NULL DEFAULT 'How it works',
        ADD COLUMN IF NOT EXISTS how_it_works_heading text NOT NULL DEFAULT 'Simple for churches. Powerful for teams.',
        ADD COLUMN IF NOT EXISTS cta_band_heading text NOT NULL DEFAULT 'Ready to connect your team?',
        ADD COLUMN IF NOT EXISTS cta_band_subtext text NOT NULL DEFAULT 'Set up your organization in minutes.'
    `)).then(() => pool.query(`
      ALTER TABLE landing_page_content
        ALTER COLUMN secondary_cta_label SET DEFAULT '',
        ALTER COLUMN secondary_cta_href SET DEFAULT ''
    `)).then(() => undefined);
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
