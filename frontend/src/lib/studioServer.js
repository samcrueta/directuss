const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

export const SESSION_HEADER = "x-lumina-session";
export const SESSION_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const COMPONENT_ID_PATTERN = SESSION_PATTERN;
export const LESSON_SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;

const MAX_NAME = 80;
const MAX_DESCRIPTION = 500;
const MAX_CODE_FIELD = 100_000;
const MAX_TOTAL_CODE = 300_000;

export class StudioError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "StudioError";
    this.status = status;
  }
}

export function requireSession(request) {
  const session = request.headers.get(SESSION_HEADER);
  if (!session || !SESSION_PATTERN.test(session)) {
    throw new StudioError("A valid studio session is required.", 400);
  }
  return session;
}

export function requireComponentId(id) {
  if (!id || !COMPONENT_ID_PATTERN.test(id)) {
    throw new StudioError("Invalid component id.", 400);
  }
  return id;
}

export function normalizeLessonSlug(value) {
  if (value == null || value === "") return null;
  const slug = String(value);
  if (!LESSON_SLUG_PATTERN.test(slug)) {
    throw new StudioError("Invalid lesson slug.", 400);
  }
  return slug;
}

export function validateComponentPayload(input) {
  if (!input || typeof input !== "object") {
    throw new StudioError("A component payload is required.");
  }

  const name = String(input.name ?? "").trim();
  const description = String(input.description ?? "").trim();
  const html = String(input.html ?? "");
  const css = String(input.css ?? "");
  const js = String(input.js ?? "");

  if (!name) throw new StudioError("Component name is required.");
  if (name.length > MAX_NAME) throw new StudioError(`Name must be ${MAX_NAME} characters or fewer.`);
  if (description.length > MAX_DESCRIPTION) {
    throw new StudioError(`Description must be ${MAX_DESCRIPTION} characters or fewer.`);
  }
  if (html.length > MAX_CODE_FIELD || css.length > MAX_CODE_FIELD || js.length > MAX_CODE_FIELD) {
    throw new StudioError("Each code field must be 100 KB or smaller.");
  }
  if (html.length + css.length + js.length > MAX_TOTAL_CODE) {
    throw new StudioError("The component code is larger than 300 KB.");
  }

  return {
    name,
    description,
    framework: "html",
    html,
    css,
    js
  };
}

export async function directusRequest(path, options = {}) {
  if (!DIRECTUS_TOKEN) {
    throw new StudioError("The Directus service token is not configured.", 503);
  }

  const headers = {
    Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(`${DIRECTUS_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
  } catch (error) {
    throw new StudioError(
      error?.name === "TimeoutError"
        ? "Directus did not respond in time."
        : "Could not reach Directus.",
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
      `Directus request failed with ${response.status}.`;
    throw new StudioError(message, response.status);
  }

  return body;
}

export async function readOwnedComponent(id, session) {
  requireComponentId(id);
  const result = await directusRequest(`/items/components/${id}?fields=*`);
  const component = result?.data;
  if (!component || component.owner_session !== session) {
    throw new StudioError("Component not found.", 404);
  }
  return component;
}

export function studioErrorResponse(error) {
  const status = error instanceof StudioError ? error.status : 500;
  const message =
    error instanceof StudioError
      ? error.message
      : "The studio could not complete that request.";
  return { status, message };
}
