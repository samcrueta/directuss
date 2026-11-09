const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3002";
const PAYLOAD_API_KEY = process.env.PAYLOAD_API_KEY;

export const SESSION_HEADER = "x-lumina-session";
export const SESSION_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const COMPONENT_ID_PATTERN = /^\d+$/;
export const LESSON_SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;

const MAX_NAME = 90;
const MAX_DESCRIPTION = 500;
const MAX_CODE_FIELD = 100_000;
const MAX_TOTAL_CODE = 300_000;

export class PayloadLabError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "PayloadLabError";
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

export function requireSession(request) {
  const session = request.headers.get(SESSION_HEADER);
  if (!session || !SESSION_PATTERN.test(session)) {
    throw new PayloadLabError("A valid lab session is required.", 400);
  }
  return session;
}

export function requireComponentId(id) {
  if (!id || !COMPONENT_ID_PATTERN.test(id)) {
    throw new PayloadLabError("Invalid component id.", 400);
  }
  return id;
}

export function normalizeLessonSlug(value) {
  const slug = String(value || "");
  if (!LESSON_SLUG_PATTERN.test(slug)) {
    throw new PayloadLabError("Invalid lesson slug.", 400);
  }
  return slug;
}

export function payloadRequest(path, options = {}) {
  if (!PAYLOAD_API_KEY) {
    throw new PayloadLabError("The Payload service API key is not configured.", 503);
  }
  return request(path, options, PAYLOAD_API_KEY);
}

async function request(path, options, apiKey) {
  const headers = {
    Authorization: `users API-Key ${apiKey}`,
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(`${PAYLOAD_URL.replace(/\/+$/, "")}${path}`, {
      ...options,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
  } catch (error) {
    throw new PayloadLabError(
      error?.name === "TimeoutError"
        ? "Payload did not respond in time."
        : "Could not reach Payload.",
      503
    );
  }

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      body?.errors?.[0]?.message ||
      (typeof body === "string" ? body : null) ||
      `Payload request failed with ${response.status}.`;
    throw new PayloadLabError(message, response.status >= 500 ? 502 : response.status);
  }

  return body;
}

export async function getLessonForComponent(slug) {
  const lessonSlug = normalizeLessonSlug(slug);
  const result = await payloadRequest(
    `/api/lessons?where[slug][equals]=${encodeURIComponent(lessonSlug)}&limit=1&depth=0`
  );
  const lesson = result?.docs?.[0];
  if (!lesson) throw new PayloadLabError("Lesson not found.", 404);

  const lab = parseJson(lesson.lab, {});
  if (lab?.kind !== "component") {
    throw new PayloadLabError("This lesson does not use a component lab.", 400);
  }

  return { lesson, lab };
}

export async function readOwnedComponent(id, session) {
  requireComponentId(id);
  const component = await payloadRequest(`/api/components/${id}?depth=0`);
  if (!component || component.ownerSession !== session) {
    throw new PayloadLabError("Component not found.", 404);
  }
  return component;
}

export function validateComponentInput(input, lesson, lab) {
  if (!input || typeof input !== "object") {
    throw new PayloadLabError("A component payload is required.");
  }

  const name = String(input.name ?? "").trim();
  const description = String(input.description ?? "").trim();
  const html = String(input.html ?? "");
  const css = String(input.css ?? "");
  const js = String(input.js ?? "");

  if (!name) throw new PayloadLabError("A component name is required.");
  if (name.length > MAX_NAME) {
    throw new PayloadLabError(`Name must be ${MAX_NAME} characters or fewer.`);
  }
  if (description.length > MAX_DESCRIPTION) {
    throw new PayloadLabError(
      `Description must be ${MAX_DESCRIPTION} characters or fewer.`
    );
  }
  if (!html.trim()) {
    throw new PayloadLabError("The HTML pane cannot be empty.");
  }
  if (
    html.length > MAX_CODE_FIELD ||
    css.length > MAX_CODE_FIELD ||
    js.length > MAX_CODE_FIELD
  ) {
    throw new PayloadLabError("Each code pane must be 100 KB or smaller.");
  }
  if (html.length + css.length + js.length > MAX_TOTAL_CODE) {
    throw new PayloadLabError("The component code is larger than 300 KB.");
  }

  const kind = String(lab.componentKind || "component");
  if (input.kind != null && String(input.kind) !== kind) {
    throw new PayloadLabError("This lab cannot save that component kind.");
  }

  const surface = lab.surface === "admin" ? "admin" : "public";
  const publishable = lab.publishable === true && surface === "public";
  const status = input.status === "published" ? "published" : "draft";

  if (status === "published" && !publishable) {
    throw new PayloadLabError("This lab saves drafts only.", 400);
  }

  return {
    name,
    description,
    kind,
    status,
    surface,
    html,
    css,
    js,
    content: {},
    lessonSlug: lesson.slug,
    lessonId: lesson.id
  };
}

export function serializeOwnedComponent(component) {
  return {
    id: component.id,
    name: component.name,
    description: component.description || "",
    kind: component.kind,
    lessonSlug: component.lessonSlug,
    surface: component.surface,
    status: component.status,
    html: component.html || "",
    css: component.css || "",
    js: component.js || "",
    content: parseJson(component.content, {}),
    tokens: parseJson(component.tokens, {}),
    publishedAt: component.publishedAt || null,
    updatedAt: component.updatedAt,
    createdAt: component.createdAt
  };
}

export function payloadLabErrorResponse(error) {
  const status = error instanceof PayloadLabError ? error.status : 500;
  const message =
    error instanceof PayloadLabError
      ? error.message
      : "The Payload lab could not complete that request.";
  return { status, message };
}
