import { DATASET_KIND, TOKEN_DEFAULTS } from "./builderCatalog";
import { keystoneRequest } from "./keystoneServer";
import { payloadRequest, serializeOwnedComponent } from "./payloadServer";
import { directusRequest } from "./studioServer";

const PROVIDERS = new Set(["directus", "payload", "keystone"]);
const LESSON_SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;
const SESSION_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIRECTUS_DATASET_FRAMEWORK = "data-table";
const MAX_ROWS = 12;
const MAX_NAME = 90;
const MAX_DESCRIPTION = 240;
const HEX = /^#[0-9a-f]{6}$/i;

export class DatasetError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "DatasetError";
    this.status = status;
  }
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

function requireProvider(value) {
  const provider = String(value || "");
  if (!PROVIDERS.has(provider)) {
    throw new DatasetError("Unknown lab provider.", 400);
  }
  return provider;
}

function requireLessonSlug(value) {
  const slug = String(value || "");
  if (!LESSON_SLUG_PATTERN.test(slug)) {
    throw new DatasetError("Invalid lesson slug.", 400);
  }
  return slug;
}

function sanitizeTokens(value) {
  const record = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const tokens = {
    ...TOKEN_DEFAULTS,
    theme: record.theme === "dark" ? "dark" : "light",
    radius: Math.min(32, Math.max(0, Math.round(Number(record.radius) || TOKEN_DEFAULTS.radius))),
    spacing: Math.min(48, Math.max(8, Math.round(Number(record.spacing) || TOKEN_DEFAULTS.spacing))),
    fontScale: Math.min(
      1.4,
      Math.max(0.8, Math.round((Number(record.fontScale) || TOKEN_DEFAULTS.fontScale) * 100) / 100)
    ),
    shadow: ["none", "soft", "strong"].includes(record.shadow) ? record.shadow : "soft"
  };

  for (const key of ["accent", "background", "foreground", "muted"]) {
    tokens[key] = typeof record[key] === "string" && HEX.test(record[key])
      ? record[key]
      : TOKEN_DEFAULTS[key];
  }

  return tokens;
}

export function validateDatasetInput(input) {
  if (!input || typeof input !== "object") {
    throw new DatasetError("A dataset payload is required.");
  }

  const content = input.content;
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    throw new DatasetError("Dataset content must be an object.");
  }

  const title = String(content.title ?? "").trim();
  if (!title) throw new DatasetError("Give the table a title.");
  if (title.length > MAX_NAME) {
    throw new DatasetError(`Title must be ${MAX_NAME} characters or fewer.`);
  }

  const caption = String(content.caption ?? "").trim();
  if (caption.length > MAX_DESCRIPTION) {
    throw new DatasetError(`Caption must be ${MAX_DESCRIPTION} characters or fewer.`);
  }

  const unit = String(content.unit ?? "").trim().slice(0, 16);
  const sourceRows = Array.isArray(content.rows) ? content.rows : [];
  if (!sourceRows.length) throw new DatasetError("Add at least one number row.");
  if (sourceRows.length > MAX_ROWS) {
    throw new DatasetError(`Keep the table to ${MAX_ROWS} rows or fewer.`);
  }

  const rows = sourceRows.map((row, index) => {
    const label = String(row?.label ?? "").trim();
    const value = Number(row?.value);
    if (!label) throw new DatasetError(`Row ${index + 1} needs a label.`);
    if (label.length > 40) {
      throw new DatasetError(`Row ${index + 1} label must be 40 characters or fewer.`);
    }
    if (!Number.isFinite(value)) {
      throw new DatasetError(`Row ${index + 1} needs a number.`);
    }
    if (Math.abs(value) > 1_000_000_000) {
      throw new DatasetError(`Row ${index + 1} value is too large.`);
    }
    return { label, value };
  });

  const name = String(input.name ?? title).trim().slice(0, MAX_NAME) || title;
  const description = String(input.description ?? caption).trim().slice(0, 500);
  const lessonSlug = requireLessonSlug(input.lessonSlug);

  return {
    name,
    description,
    lessonSlug,
    content: { title, caption, unit, rows },
    tokens: sanitizeTokens(input.tokens)
  };
}

function directusDataset(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    lessonSlug: row.lesson_slug,
    content: parseJson(row.html, {}),
    tokens: parseJson(row.css, {}),
    updatedAt: row.date_updated || null,
    createdAt: row.date_created || null
  };
}

async function readDirectusDataset(id, session) {
  const result = await directusRequest(`/items/components/${id}?fields=*`);
  const row = result?.data;
  if (
    !row ||
    row.framework !== DIRECTUS_DATASET_FRAMEWORK ||
    row.owner_session !== session
  ) {
    throw new DatasetError("Dataset not found.", 404);
  }
  return row;
}

async function listDirectus(session, lessonSlug) {
  const query = new URLSearchParams({
    "filter[framework][_eq]": DIRECTUS_DATASET_FRAMEWORK,
    "filter[owner_session][_eq]": session,
    "filter[lesson_slug][_eq]": lessonSlug,
    sort: "-date_updated",
    limit: "50",
    fields: "*"
  });
  const result = await directusRequest(`/items/components?${query.toString()}`);
  return (result?.data || []).map(directusDataset);
}

async function loadDirectus(session, id) {
  return directusDataset(await readDirectusDataset(id, session));
}

async function createDirectus(session, data) {
  const result = await directusRequest("/items/components", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      framework: DIRECTUS_DATASET_FRAMEWORK,
      html: JSON.stringify(data.content),
      css: JSON.stringify(data.tokens),
      js: "",
      owner_session: session,
      lesson_slug: data.lessonSlug,
      date_updated: new Date().toISOString()
    })
  });
  return directusDataset(result?.data);
}

async function updateDirectus(session, id, data) {
  const row = await readDirectusDataset(id, session);
  const result = await directusRequest(`/items/components/${row.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      html: JSON.stringify(data.content),
      css: JSON.stringify(data.tokens),
      date_updated: new Date().toISOString()
    })
  });
  return directusDataset(result?.data);
}

async function deleteDirectus(session, id) {
  const row = await readDirectusDataset(id, session);
  await directusRequest(`/items/components/${row.id}`, { method: "DELETE" });
}

function payloadDataset(row) {
  const serialized = serializeOwnedComponent(row);
  return {
    id: serialized.id,
    name: serialized.name,
    description: serialized.description,
    lessonSlug: serialized.lessonSlug,
    content: parseJson(serialized.content, {}),
    tokens: parseJson(serialized.tokens, {}),
    updatedAt: serialized.updatedAt,
    createdAt: serialized.createdAt
  };
}

async function listPayload(session, lessonSlug) {
  const query = new URLSearchParams();
  query.set("where[and][0][ownerSession][equals]", session);
  query.set("where[and][1][lessonSlug][equals]", lessonSlug);
  query.set("where[and][2][kind][equals]", DATASET_KIND);
  query.set("sort", "-updatedAt");
  query.set("limit", "50");
  query.set("depth", "0");
  const result = await payloadRequest(`/api/components?${query.toString()}`);
  return (result?.docs || []).map(payloadDataset);
}

async function loadPayload(session, id) {
  if (!/^\d+$/.test(String(id))) {
    throw new DatasetError("Invalid dataset id.", 400);
  }
  const row = await payloadRequest(`/api/components/${id}?depth=0`);
  if (!row || row.ownerSession !== session || row.kind !== DATASET_KIND) {
    throw new DatasetError("Dataset not found.", 404);
  }
  return payloadDataset(row);
}

async function payloadLesson(lessonSlug) {
  const result = await payloadRequest(
    `/api/lessons?where[slug][equals]=${encodeURIComponent(lessonSlug)}&limit=1&depth=0`
  );
  const lesson = result?.docs?.[0];
  if (!lesson) throw new DatasetError("Lesson not found.", 404);
  if (parseJson(lesson.lab, {})?.kind !== "dataset") {
    throw new DatasetError("This lesson does not use the data-table lab.", 400);
  }
  return lesson;
}

async function createPayload(session, data) {
  const lesson = await payloadLesson(data.lessonSlug);
  const body = await payloadRequest("/api/components", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      lesson: lesson.id,
      lessonSlug: data.lessonSlug,
      ownerSession: session,
      surface: "public",
      kind: DATASET_KIND,
      status: "published",
      html: "",
      css: "",
      js: "",
      content: data.content,
      tokens: data.tokens
    })
  });
  return payloadDataset(body?.doc || body);
}

async function updatePayload(session, id, data) {
  const current = await loadPayload(session, id);
  if (current.lessonSlug !== data.lessonSlug) {
    throw new DatasetError("This dataset belongs to another lesson.", 400);
  }
  const body = await payloadRequest(`/api/components/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      status: "published",
      content: data.content,
      tokens: data.tokens
    })
  });
  return payloadDataset(body?.doc || body);
}

async function deletePayload(session, id) {
  await loadPayload(session, id);
  await payloadRequest(`/api/components/${id}`, { method: "DELETE" });
}

function keystoneDataset(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    lessonSlug: row.lessonSlug,
    content: parseJson(row.content, {}),
    tokens: parseJson(row.tokens, {}),
    updatedAt: row.updatedAt || null,
    createdAt: row.createdAt || null
  };
}

async function listKeystone(session, lessonSlug) {
  const result = await keystoneRequest(
    `/api/lumina/components?lesson=${encodeURIComponent(lessonSlug)}`,
    { session }
  );
  return (result.payload?.data || [])
    .filter((row) => row.kind === DATASET_KIND)
    .map(keystoneDataset);
}

async function loadKeystone(session, id) {
  const result = await keystoneRequest(`/api/lumina/components/${id}`, { session });
  const row = result.payload?.data;
  if (!row || row.kind !== DATASET_KIND) {
    throw new DatasetError("Dataset not found.", 404);
  }
  return keystoneDataset(row);
}

async function createKeystone(session, data) {
  const result = await keystoneRequest("/api/lumina/components", {
    method: "POST",
    session,
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      lessonSlug: data.lessonSlug,
      kind: DATASET_KIND,
      status: "published",
      content: data.content,
      tokens: data.tokens
    })
  });
  return keystoneDataset(result.payload?.data);
}

async function updateKeystone(session, id, data) {
  const current = await loadKeystone(session, id);
  if (current.lessonSlug !== data.lessonSlug) {
    throw new DatasetError("This dataset belongs to another lesson.", 400);
  }
  const result = await keystoneRequest(`/api/lumina/components/${id}`, {
    method: "PATCH",
    session,
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      lessonSlug: data.lessonSlug,
      kind: DATASET_KIND,
      status: "published",
      content: data.content,
      tokens: data.tokens
    })
  });
  return keystoneDataset(result.payload?.data);
}

async function deleteKeystone(session, id) {
  await loadKeystone(session, id);
  await keystoneRequest(`/api/lumina/components/${id}`, { method: "DELETE", session });
}

export function datasetProvider(value) {
  return requireProvider(value);
}

export function datasetSession(request) {
  const session = request.headers.get("x-lumina-session");
  if (!session || !SESSION_PATTERN.test(session)) {
    throw new DatasetError("A valid lab session is required.", 400);
  }
  return session;
}

export function datasetLessonSlug(value) {
  return requireLessonSlug(value);
}

export async function listDatasets(provider, session, lessonSlug) {
  const key = requireProvider(provider);
  const slug = requireLessonSlug(lessonSlug);
  if (key === "directus") return listDirectus(session, slug);
  if (key === "payload") return listPayload(session, slug);
  return listKeystone(session, slug);
}

export async function loadDataset(provider, session, id) {
  const key = requireProvider(provider);
  if (key === "directus") return loadDirectus(session, id);
  if (key === "payload") return loadPayload(session, id);
  return loadKeystone(session, id);
}

export async function createDataset(provider, session, input) {
  const key = requireProvider(provider);
  const data = validateDatasetInput(input);
  if (key === "directus") return createDirectus(session, data);
  if (key === "payload") return createPayload(session, data);
  return createKeystone(session, data);
}

export async function updateDataset(provider, session, id, input) {
  const key = requireProvider(provider);
  const data = validateDatasetInput(input);
  if (key === "directus") return updateDirectus(session, id, data);
  if (key === "payload") return updatePayload(session, id, data);
  return updateKeystone(session, id, data);
}

export async function deleteDataset(provider, session, id) {
  const key = requireProvider(provider);
  if (key === "directus") return deleteDirectus(session, id);
  if (key === "payload") return deletePayload(session, id);
  return deleteKeystone(session, id);
}

export function datasetErrorResponse(error) {
  const known = error instanceof DatasetError;
  const status = known ? error.status : Number(error?.status) || 500;
  const message = known
    ? error.message
    : status < 500 && typeof error?.message === "string"
      ? error.message
      : "The data-table lab could not complete that request.";
  if (status >= 500) {
    console.error("[dataset]", error);
  }
  return { status, message };
}
