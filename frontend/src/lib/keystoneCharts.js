import { cache } from "react";
import { keystoneRequest } from "@/lib/keystoneServer";
import { buildTableChart, FALLBACK_DATASETS } from "./datasetData";

const WINDOW_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const TOP_KINDS = 6;

const TRACKS = [
  { key: "foundations", name: "Component Foundations", short: "Foundations" },
  { key: "keystone", name: "Keystone Components", short: "Keystone" },
  { key: "ship", name: "Ship & Showcase", short: "Showcase" }
];

const STATUS_LABELS = {
  draft: "Draft",
  published: "Published"
};

function titleCase(value) {
  return String(value || "unknown")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isPublished(value) {
  return value === true || value === 1 || value === "1";
}

function buildActivity(components) {
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

  for (const component of components) {
    const date = new Date(component.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const bucket = byDay.get(date.toISOString().slice(0, 10));
    if (bucket) bucket.value += 1;
  }

  return days;
}

function buildKindCounts(components) {
  const counts = new Map();

  for (const component of components) {
    const kind = component.kind || "unknown";
    counts.set(kind, (counts.get(kind) || 0) + 1);
  }

  const sorted = [...counts.entries()].sort((left, right) => right[1] - left[1]);
  const visible = sorted.slice(0, TOP_KINDS);
  const rest = sorted.slice(TOP_KINDS);

  const series = visible.map(([kind, value]) => ({
    name: titleCase(kind),
    value
  }));

  if (rest.length) {
    series.push({
      name: "Other",
      value: rest.reduce((total, [, value]) => total + value, 0)
    });
  }

  return series;
}

function buildChartData(lessons, components, source, dataset = null) {
  const trackCounts = new Map();
  const statusCounts = new Map();

  for (const lesson of lessons) {
    const track = lesson.track || "foundations";
    trackCounts.set(track, (trackCounts.get(track) || 0) + 1);
  }

  for (const component of components) {
    const status = component.status || "unknown";
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
  }

  const lessonsByTrack = TRACKS.filter((track) => trackCounts.has(track.key))
    .map((track) => ({
      name: track.name,
      short: track.short,
      value: trackCounts.get(track.key)
    }))
    .concat(
      [...trackCounts.entries()]
        .filter(([track]) => !TRACKS.some((item) => item.key === track))
        .map(([track, value]) => ({
          name: titleCase(track),
          short: titleCase(track),
          value
        }))
    );

  const recordsByStatus = [...statusCounts.entries()]
    .map(([status, value]) => ({
      name: STATUS_LABELS[status] || titleCase(status),
      value
    }))
    .sort((left, right) => right.value - left.value);

  const activity = buildActivity(components);

  return {
    provider: "keystone",
    source,
    fetchedAt: new Date().toISOString(),
    metrics: {
      lessons: lessons.length,
      published: lessons.filter((lesson) => isPublished(lesson.published)).length,
      records: components.length,
      drafts: components.filter((component) => component.status === "draft").length,
      recordsInWindow: activity.reduce((total, day) => total + day.value, 0)
    },
    charts: {
      lessonsByTrack,
      recordsByStatus,
      activity,
      distribution: buildKindCounts(components),
      table: buildTableChart(dataset?.content, {
        source,
        savedAt: dataset?.savedAt || null,
        fallback: FALLBACK_DATASETS.keystone
      })
    }
  };
}

function fallbackData() {
  const now = Date.now();
  const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString();

  const lessons = [
    { track: "foundations", published: true },
    { track: "foundations", published: true },
    { track: "foundations", published: true },
    { track: "keystone", published: true },
    { track: "keystone", published: true },
    { track: "keystone", published: true },
    { track: "ship", published: true },
    { track: "ship", published: true }
  ];

  const components = [
    { status: "published", kind: "card", createdAt: hoursAgo(3) },
    { status: "published", kind: "page", createdAt: hoursAgo(8) },
    { status: "published", kind: "pricing", createdAt: hoursAgo(26) },
    { status: "draft", kind: "testimonial", createdAt: hoursAgo(50) },
    { status: "draft", kind: "pricing", createdAt: hoursAgo(74) }
  ];

  return buildChartData(lessons, components, "fallback");
}

async function loadFromKeystone() {
  const { payload } = await keystoneRequest("/api/lumina/charts");
  const lessons = payload?.data?.lessons || [];
  const components = payload?.data?.components || [];

  if (!lessons.length && !components.length) {
    throw new Error("No Keystone lessons or components were found.");
  }

  const savedTable = components
    .filter((component) => component.kind === "dataTable" && component.content)
    .sort((left, right) =>
      String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""))
    )[0];

  const dataset = savedTable
    ? { content: savedTable.content, savedAt: savedTable.updatedAt || null }
    : null;

  return buildChartData(lessons, components, "keystone", dataset);
}

export const getKeystoneChartData = cache(async () => {
  try {
    return await loadFromKeystone();
  } catch (error) {
    console.warn(`[charts] Keystone unavailable, using sample data: ${error.message}`);
    return fallbackData();
  }
});
