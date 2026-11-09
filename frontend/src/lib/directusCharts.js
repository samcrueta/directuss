import { cache } from "react";
import {
  createDirectus,
  readItems,
  rest,
  staticToken,
  withOptions
} from "@directus/sdk";
import { buildTableChart, FALLBACK_DATASETS } from "./datasetData";

const DIRECTUS_URL = (process.env.DIRECTUS_URL || "http://localhost:8055").replace(
  /\/+$/,
  ""
);
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const WINDOW_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const TRACK_LABELS = {
  api: { name: "Automation & APIs", short: "API" },
  ui: { name: "UI/UX Labs", short: "UI" }
};

const STATUS_LABELS = {
  draft: "Draft",
  processed: "Processed",
  published: "Published",
  archived: "Archived"
};

function titleCase(value) {
  return String(value || "unknown")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function isPublished(value) {
  return value === true || value === 1 || value === "1";
}

function buildActivity(notes) {
  const now = new Date();
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = [];

  for (let offset = WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(end - offset * DAY_MS);
    days.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC"
      }),
      value: 0
    });
  }

  const byDay = new Map(days.map((day) => [day.key, day]));

  for (const note of notes) {
    const date = new Date(note.date_created);
    if (Number.isNaN(date.getTime())) continue;
    const bucket = byDay.get(date.toISOString().slice(0, 10));
    if (bucket) bucket.value += 1;
  }

  return days;
}

function buildNoteDepth(notes) {
  const buckets = [
    { name: "1–5", min: 1, max: 5, value: 0 },
    { name: "6–10", min: 6, max: 10, value: 0 },
    { name: "11–20", min: 11, max: 20, value: 0 },
    { name: "21+", min: 21, max: Infinity, value: 0 }
  ];

  for (const note of notes) {
    const words = Number(note.word_count);
    if (!Number.isFinite(words) || words < 1) continue;
    const bucket = buckets.find((item) => words >= item.min && words <= item.max);
    if (bucket) bucket.value += 1;
  }

  return buckets;
}

function buildChartData(lessons, notes, source, dataset = null) {
  const trackCounts = new Map();
  const statusCounts = new Map();

  for (const lesson of lessons) {
    const track = lesson.track || "api";
    trackCounts.set(track, (trackCounts.get(track) || 0) + 1);
  }

  for (const note of notes) {
    const status = note.status || "unknown";
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
  }

  const lessonsByTrack = Array.from(trackCounts, ([track, value]) => ({
    name: TRACK_LABELS[track]?.name || titleCase(track),
    short: TRACK_LABELS[track]?.short || titleCase(track),
    value
  }));

  const recordsByStatus = Array.from(statusCounts, ([status, value]) => ({
    name: STATUS_LABELS[status] || titleCase(status),
    value
  })).sort((left, right) => right.value - left.value);

  const activity = buildActivity(notes);

  return {
    provider: "directus",
    source,
    fetchedAt: new Date().toISOString(),
    metrics: {
      lessons: lessons.length,
      published: lessons.filter((lesson) => isPublished(lesson.published)).length,
      records: notes.length,
      drafts: notes.filter((note) => note.status === "draft").length,
      recordsInWindow: activity.reduce((total, day) => total + day.value, 0)
    },
    charts: {
      lessonsByTrack,
      recordsByStatus,
      activity,
      distribution: buildNoteDepth(notes),
      table: buildTableChart(dataset?.content, {
        source,
        savedAt: dataset?.savedAt || null,
        fallback: FALLBACK_DATASETS.directus
      })
    }
  };
}

function fallbackData() {
  const now = Date.now();
  const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString();

  const lessons = [
    { track: "api", published: true },
    { track: "api", published: true },
    { track: "api", published: true },
    { track: "api", published: true },
    { track: "api", published: true },
    { track: "ui", published: true },
    { track: "ui", published: true },
    { track: "ui", published: true }
  ];

  const notes = [
    { status: "draft", word_count: 10, date_created: hoursAgo(2) },
    { status: "draft", word_count: 8, date_created: hoursAgo(6) },
    { status: "draft", word_count: 6, date_created: hoursAgo(26) },
    { status: "draft", word_count: 2, date_created: hoursAgo(50) },
    { status: "processed", word_count: null, date_created: hoursAgo(74) },
    { status: "processed", word_count: null, date_created: hoursAgo(98) }
  ];

  return buildChartData(lessons, notes, "fallback");
}

async function loadFromDirectus() {
  if (!DIRECTUS_TOKEN) {
    throw new Error("DIRECTUS_TOKEN is not configured.");
  }

  const client = createDirectus(DIRECTUS_URL)
    .with(rest())
    .with(staticToken(DIRECTUS_TOKEN));

  const options = {
    cache: "no-store",
    signal: AbortSignal.timeout(5000)
  };

  const [lessons, notes, savedTables] = await Promise.all([
    client.request(
      withOptions(
        readItems("lessons", {
          fields: ["track", "published"],
          limit: -1
        }),
        options
      )
    ),
    client.request(
      withOptions(
        readItems("lab_notes", {
          fields: ["status", "word_count", "date_created"],
          limit: -1
        }),
        options
      )
    ),
    client.request(
      withOptions(
        readItems("components", {
          fields: ["name", "html", "date_updated"],
          filter: { framework: { _eq: "data-table" } },
          sort: ["-date_updated"],
          limit: 1
        }),
        options
      )
    )
  ]);

  const savedTable = savedTables?.[0];
  const dataset = savedTable
    ? {
        content: parseJson(savedTable.html, null),
        savedAt: savedTable.date_updated || null
      }
    : null;

  return buildChartData(lessons ?? [], notes ?? [], "directus", dataset);
}

export const getDirectusChartData = cache(async () => {
  if (!DIRECTUS_TOKEN) {
    return fallbackData();
  }

  try {
    return await loadFromDirectus();
  } catch (error) {
    console.warn(`[charts] Directus unavailable, using sample data: ${error.message}`);
    return fallbackData();
  }
});
