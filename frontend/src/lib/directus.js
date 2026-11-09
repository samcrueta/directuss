import { cache } from "react";
import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import fallbackContent from "../../content/advanced.json";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

function createClient() {
  let client = createDirectus(DIRECTUS_URL).with(rest());
  if (DIRECTUS_TOKEN) {
    client = client.with(staticToken(DIRECTUS_TOKEN));
  }
  return client;
}

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function normalizeLesson(row) {
  return {
    slug: row.slug,
    title: row.title,
    sort: row.sort,
    track: row.track || "api",
    outcome: row.outcome,
    mental_model: parseJson(row.mental_model, []),
    lab: parseJson(row.lab, {}),
    takeaway: row.takeaway,
    knowledge_check: parseJson(row.knowledge_check, {}),
    deep_dive: parseJson(row.deep_dive, [])
  };
}

const TRACK_LABELS = {
  api: "Automation & APIs",
  ui: "UI/UX Labs"
};

function fallback() {
  return {
    ...fallbackContent,
    trackLabels: TRACK_LABELS,
    showcaseHref: null,
    showcase: null,
    builder: null,
    payload: null,
    source: "fallback"
  };
}

export const getDirectusAdvancedContent = cache(async () => {
  if (!DIRECTUS_TOKEN) {
    return fallback();
  }

  try {
    const client = createClient();
    const sections = await client.request(
      readItems("sections", {
        filter: { slug: { _eq: "advanced" } },
        limit: 1
      })
    );

    const section = sections?.[0];
    if (!section) throw new Error("Advanced section not found in Directus.");

    const rows = await client.request(
      readItems("lessons", {
        filter: {
          section: { _eq: section.id },
          published: { _eq: true }
        },
        sort: ["sort"],
        limit: 20
      })
    );

    if (!rows?.length) throw new Error("No lessons found in Directus.");

    const dbLessons = rows.map(normalizeLesson);
    const savedSlugs = new Set(dbLessons.map((lesson) => lesson.slug));
    const missingLessons = (fallbackContent.lessons || []).filter(
      (lesson) => !savedSlugs.has(lesson.slug)
    );
    const lessons = [...dbLessons, ...missingLessons].sort(
      (left, right) => left.sort - right.sort
    );

    return {
      section: {
        slug: section.slug,
        title: section.title,
        description: section.description
      },
      trackLabels: TRACK_LABELS,
      lessons,
      showcaseHref: null,
      showcase: null,
      builder: null,
      payload: null,
      source: "directus"
    };
  } catch (error) {
    console.warn(`[advanced] Directus unavailable, using local content: ${error.message}`);
    return fallback();
  }
});

export { fallbackContent };
