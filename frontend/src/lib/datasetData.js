export const FALLBACK_DATASETS = {
  directus: {
    title: "Sample weekly learners",
    caption: "Save a table in the Level 7 Directus data lab to replace this sample series.",
    unit: "learners",
    rows: [
      { label: "Mon", value: 120 },
      { label: "Tue", value: 168 },
      { label: "Wed", value: 142 },
      { label: "Thu", value: 196 },
      { label: "Fri", value: 231 },
      { label: "Sat", value: 184 }
    ]
  },
  payload: {
    title: "Sample signups by channel",
    caption: "Save a table in the Level 7 Payload data lab to replace this sample series.",
    unit: "signups",
    rows: [
      { label: "Organic", value: 84 },
      { label: "Referral", value: 52 },
      { label: "Social", value: 47 },
      { label: "Email", value: 66 },
      { label: "Partners", value: 29 }
    ]
  },
  keystone: {
    title: "Sample support tickets",
    caption: "Save a table in the Level 7 Keystone data lab to replace this sample series.",
    unit: "tickets",
    rows: [
      { label: "Billing", value: 18 },
      { label: "Access", value: 27 },
      { label: "Bugs", value: 34 },
      { label: "Docs", value: 12 },
      { label: "Other", value: 8 }
    ]
  }
};

export const FALLBACK_DATASET = FALLBACK_DATASETS.directus;

export const DATASET_STORAGE_VERSION = 1;

export function datasetStorageKey(provider) {
  return `lumina:level7:dataset:${provider}`;
}

export function readStoredDataset(provider) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(datasetStorageKey(provider));
    if (!raw) return null;
    const stored = JSON.parse(raw);
    return normalizeTableDataset(stored?.content || stored);
  } catch {
    return null;
  }
}

export function writeStoredDataset(provider, content, { lessonSlug = null, tokens = {} } = {}) {
  if (typeof window === "undefined") return false;

  const normalized = normalizeTableDataset(content);
  if (!normalized) return false;

  try {
    window.localStorage.setItem(
      datasetStorageKey(provider),
      JSON.stringify({
        version: DATASET_STORAGE_VERSION,
        provider,
        lessonSlug,
        content: normalized,
        tokens,
        updatedAt: new Date().toISOString()
      })
    );
    return true;
  } catch {
    return false;
  }
}

function parseJson(value) {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

export function normalizeTableDataset(value) {
  const dataset = parseJson(value);
  if (!dataset || typeof dataset !== "object" || Array.isArray(dataset)) return null;

  const rows = (Array.isArray(dataset.rows) ? dataset.rows : [])
    .slice(0, 12)
    .map((row, index) => {
      const label = String(row?.label ?? "").trim();
      const value = Number(row?.value);
      if (!label || !Number.isFinite(value)) return null;
      return { label, value };
    })
    .filter(Boolean);

  if (!rows.length) return null;

  return {
    title: String(dataset.title || "Saved table").slice(0, 90),
    caption: String(dataset.caption || "").slice(0, 240),
    unit: String(dataset.unit || "").slice(0, 16),
    rows
  };
}

export function buildTableChart(
  value,
  { source = "cms", savedAt = null, fallback = FALLBACK_DATASET } = {}
) {
  const live = normalizeTableDataset(value);
  const dataset = live || fallback || FALLBACK_DATASET;

  return {
    title: dataset.title,
    caption: dataset.caption,
    unit: dataset.unit,
    rows: dataset.rows.map((row) => ({ name: row.label, value: row.value })),
    total: dataset.rows.reduce((sum, row) => sum + row.value, 0),
    count: dataset.rows.length,
    source: live ? source : "sample",
    savedAt: live ? savedAt : null
  };
}
