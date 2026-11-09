import { cache } from "react";
import fallbackContent from "../../content/keystone-advanced.json";

const KEYSTONE_URL = process.env.KEYSTONE_URL || "http://localhost:3003";
const KEYSTONE_PUBLIC_URL =
  process.env.KEYSTONE_PUBLIC_URL || process.env.NEXT_PUBLIC_KEYSTONE_URL || KEYSTONE_URL;

const TRACK_LABELS = fallbackContent.trackLabels || {
  foundations: "Component Foundations",
  keystone: "Keystone Components",
  ship: "Ship & Showcase"
};

const CONTENT_QUERY = `
  query LuminaKeystoneAdvanced {
    sections(where: { slug: { equals: "keystone-advanced" } }) {
      id
      slug
      title
      description
    }
    lessons(where: { published: { equals: true } }) {
      slug
      title
      sort
      track
      outcome
      mentalModel
      lab
      takeaway
      knowledgeCheck
      deepDive
      section {
        id
      }
    }
    componentCatalogs(take: 1) {
      version
      tokenFields
      tokenDefaults
      kinds
    }
    showcaseSettings(take: 1) {
      title
      intro
      ctaLabel
      ctaHref
    }
  }
`;

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

let showcaseWarmAt = 0;

async function warmShowcase() {
  if (Date.now() - showcaseWarmAt < 60_000) return;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${getKeystoneServerUrl()}/showcase`, {
        cache: "no-store",
        signal: AbortSignal.timeout(4000)
      });
      const text = await response.text().catch(() => "");
      if (response.ok && text.includes("sc-showcase")) {
        showcaseWarmAt = Date.now();
        return;
      }
    } catch {
      // Keystone may be offline; the content loader will fall back.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

export function getKeystoneServerUrl() {
  return trimTrailingSlash(KEYSTONE_URL);
}

export function getKeystonePublicUrl() {
  return trimTrailingSlash(KEYSTONE_PUBLIC_URL);
}

export function getKeystoneIntegrations() {
  const publicUrl = getKeystonePublicUrl();
  return {
    publicUrl,
    showcaseUrl: `${publicUrl}/showcase`,
    previewUrl: `${publicUrl}/showcase#preview`,
    adminUrl: `${publicUrl}/`
  };
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
  if (!Array.isArray(kinds) || !kinds.length) return null;
  return {
    version: value.version || "1",
    kinds,
    tokenFields: parseJson(value.tokenFields, []),
    tokenDefaults: parseJson(value.tokenDefaults, {})
  };
}

async function fetchGraphQL(query) {
  let response;
  try {
    response = await fetch(`${getKeystoneServerUrl()}/api/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
  } catch (error) {
    throw new Error(
      error?.name === "TimeoutError"
        ? "Keystone did not respond in time."
        : "Could not reach Keystone."
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.errors?.length) {
    throw new Error(
      payload?.errors?.[0]?.message || `Keystone returned ${response.status}.`
    );
  }
  return payload.data;
}

function integrations() {
  const publicUrl = getKeystonePublicUrl();
  const serverUrl = getKeystoneServerUrl();
  return {
    builder: {
      provider: "keystone",
      label: "Keystone",
      previewUrl: `${publicUrl}/showcase#preview`,
      adminUrl: `${publicUrl}/`,
      externalShowcaseUrl: `${publicUrl}/showcase`
    },
    showcase: {
      provider: "Keystone",
      href: "/courses/keystonejs/showcase",
      iframeUrl: `${publicUrl}/showcase#embed`,
      externalUrl: `${publicUrl}/showcase`,
      healthUrl: `${serverUrl}/api/lumina/health`
    },
    showcaseHref: "/courses/keystonejs/showcase"
  };
}

async function loadFromKeystone() {
  const data = await fetchGraphQL(CONTENT_QUERY);
  const section = data?.sections?.[0];
  if (!section?.id) throw new Error("The Advanced KeystoneJS section was not found.");

  const dbLessons = (data?.lessons || [])
    .filter((lesson) => lesson.section?.id === section.id)
    .map(normalizeLesson);

  if (!dbLessons.length) throw new Error("No Advanced KeystoneJS lessons were found.");

  const savedSlugs = new Set(dbLessons.map((lesson) => lesson.slug));
  const lessons = [
    ...dbLessons,
    ...(fallbackContent.lessons || []).filter(
      (lesson) => !savedSlugs.has(lesson.slug)
    )
  ].sort((left, right) => left.sort - right.sort);

  const catalog = normalizeCatalog(data?.componentCatalogs?.[0]);
  const links = integrations();
  await warmShowcase();

  return {
    section: {
      slug: section.slug,
      title: section.title,
      description: section.description
    },
    trackLabels: TRACK_LABELS,
    lessons,
    catalog,
    builder: links.builder,
    showcase: links.showcase,
    showcaseHref: links.showcaseHref,
    source: "keystone"
  };
}

function fallback() {
  const links = integrations();
  return {
    ...fallbackContent,
    catalog: fallbackContent.catalog || null,
    builder: links.builder,
    showcase: links.showcase,
    showcaseHref: links.showcaseHref,
    source: "fallback"
  };
}

export const getKeystoneAdvancedContent = cache(async () => {
  try {
    return await loadFromKeystone();
  } catch (error) {
    console.warn(`[keystone] Keystone unavailable, using local content: ${error.message}`);
    return fallback();
  }
});

export { fallbackContent };
