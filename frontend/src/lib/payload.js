import { cache } from "react";
import fallbackContent from "../../content/payload-advanced.json";

const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3002";
const PAYLOAD_PUBLIC_URL =
  process.env.PAYLOAD_PUBLIC_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || PAYLOAD_URL;

const TRACK_LABELS = fallbackContent.trackLabels || {
  foundations: "Component Foundations",
  payload: "Payload Components",
  ship: "Ship & Showcase"
};

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
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
    track: row.track || "foundations",
    outcome: row.outcome,
    mental_model: parseJson(row.mentalModel, []),
    lab: parseJson(row.lab, {}),
    takeaway: row.takeaway,
    knowledge_check: parseJson(row.knowledgeCheck, {}),
    deep_dive: parseJson(row.deepDive, [])
  };
}

function normalizeCatalog(value) {
  if (!value || typeof value !== "object") return null;
  const kinds = parseJson(value.kinds, []);
  const tokenFields = parseJson(value.tokenFields, []);
  const tokenDefaults = parseJson(value.tokenDefaults, {});

  if (!Array.isArray(kinds) || !kinds.length) return null;

  return {
    version: value.version || "1",
    kinds,
    tokenFields: Array.isArray(tokenFields) ? tokenFields : [],
    tokenDefaults: tokenDefaults && typeof tokenDefaults === "object" ? tokenDefaults : {}
  };
}

export function getPayloadServerUrl() {
  return trimTrailingSlash(PAYLOAD_URL);
}

export function getPayloadPublicUrl() {
  return trimTrailingSlash(PAYLOAD_PUBLIC_URL);
}

export function getPayloadIntegrations() {
  const publicUrl = getPayloadPublicUrl();
  return {
    publicUrl,
    showcaseUrl: `${publicUrl}/showcase`,
    adminUrl: `${publicUrl}/admin`
  };
}

async function fetchPayload(path, { token } = {}) {
  const url = `${getPayloadServerUrl()}${path}`;
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = token;

  let response;
  try {
    response = await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
  } catch (error) {
    throw new Error(
      error?.name === "TimeoutError"
        ? "Payload did not respond in time."
        : "Could not reach Payload."
    );
  }

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw new Error(body?.errors?.[0]?.message || `Payload returned ${response.status}.`);
  }

  return body;
}

async function loadFromPayload() {
  const sectionResult = await fetchPayload(
    "/api/sections?where[slug][equals]=payload-advanced&limit=1&depth=0"
  );
  const section = sectionResult?.docs?.[0];
  if (!section?.id) throw new Error("The Advanced Payload section was not found.");

  const [lessonsResult, catalogResult] = await Promise.all([
    fetchPayload(
      `/api/lessons?where[and][0][section][equals]=${section.id}` +
        "&where[and][1][published][equals]=true&sort=sort&limit=20&depth=0"
    ),
    fetchPayload("/api/globals/component-catalog?depth=0").catch(() => null)
  ]);

  const rows = lessonsResult?.docs || [];
  if (!rows.length) throw new Error("No Advanced Payload lessons were found.");

  const dbLessons = rows.map(normalizeLesson);
  const savedSlugs = new Set(dbLessons.map((lesson) => lesson.slug));
  const lessons = [
    ...dbLessons,
    ...(fallbackContent.lessons || []).filter(
      (lesson) => !savedSlugs.has(lesson.slug)
    )
  ].sort((left, right) => left.sort - right.sort);

  const integrations = getPayloadIntegrations();

  return {
    section: {
      slug: section.slug,
      title: section.title,
      description: section.description
    },
    trackLabels: TRACK_LABELS,
    lessons,
    catalog: normalizeCatalog(catalogResult),
    payload: integrations,
    showcase: {
      provider: "Payload",
      href: "/courses/payload-cms/showcase",
      iframeUrl: `${integrations.publicUrl}/showcase?embed=1`,
      externalUrl: integrations.showcaseUrl,
      healthUrl: `${getPayloadServerUrl()}/api/lumina/health`
    },
    showcaseHref: "/courses/payload-cms/showcase",
    payloadShowcaseUrl: integrations.showcaseUrl,
    source: "payload"
  };
}

function fallback() {
  const integrations = getPayloadIntegrations();
  return {
    ...fallbackContent,
    lessons: [...(fallbackContent.lessons || [])].sort(
      (left, right) => left.sort - right.sort
    ),
    catalog: null,
    payload: integrations,
    showcase: {
      provider: "Payload",
      href: "/courses/payload-cms/showcase",
      iframeUrl: `${integrations.publicUrl}/showcase?embed=1`,
      externalUrl: integrations.showcaseUrl,
      healthUrl: `${getPayloadServerUrl()}/api/lumina/health`
    },
    showcaseHref: "/courses/payload-cms/showcase",
    payloadShowcaseUrl: integrations.showcaseUrl,
    source: "fallback"
  };
}

export const getPayloadAdvancedContent = cache(async () => {
  try {
    return await loadFromPayload();
  } catch (error) {
    console.warn(`[payload] Payload unavailable, using local content: ${error.message}`);
    return fallback();
  }
});

export async function getPayloadAdvancedLesson(slug) {
  const content = await getPayloadAdvancedContent();
  return {
    ...content,
    lesson: content.lessons.find((item) => item.slug === slug) || null
  };
}

export async function isPayloadReachable() {
  try {
    const response = await fetch(`${getPayloadServerUrl()}/api/lumina/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3500)
    });
    if (!response.ok) return false;
    const body = await response.json().catch(() => null);
    return Boolean(body?.ok);
  } catch {
    return false;
  }
}

export { fallbackContent };
