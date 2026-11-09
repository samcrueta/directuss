const KEYSTONE_URL = process.env.KEYSTONE_URL || "http://localhost:3003";
const KEYSTONE_SECRET = process.env.KEYSTONE_SECRET;

export const SESSION_HEADER = "x-lumina-session";
export const SESSION_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const COMPONENT_ID_PATTERN = /^[a-zA-Z0-9_-]{1,80}$/;
export const LESSON_SLUG_PATTERN = /^[a-z0-9-]{1,80}$/;

export class KeystoneLabError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "KeystoneLabError";
    this.status = status;
  }
}

export function requireSession(request) {
  const session = request.headers.get(SESSION_HEADER);
  if (!session || !SESSION_PATTERN.test(session)) {
    throw new KeystoneLabError("A valid lab session is required.", 400);
  }
  return session;
}

export function requireComponentId(id) {
  if (!id || !COMPONENT_ID_PATTERN.test(id)) {
    throw new KeystoneLabError("Invalid component id.", 400);
  }
  return id;
}

export function normalizeLessonSlug(value) {
  const slug = String(value || "");
  if (!LESSON_SLUG_PATTERN.test(slug)) {
    throw new KeystoneLabError("Invalid lesson slug.", 400);
  }
  return slug;
}

export async function keystoneRequest(path, { method = "GET", body, session } = {}) {
  if (!KEYSTONE_SECRET) {
    throw new KeystoneLabError("The Keystone Lumina secret is not configured.", 503);
  }

  let response;
  try {
    response = await fetch(`${KEYSTONE_URL.replace(/\/+$/, "")}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "x-lumina-secret": KEYSTONE_SECRET,
        ...(session ? { [SESSION_HEADER]: session } : {}),
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
  } catch (error) {
    throw new KeystoneLabError(
      error?.name === "TimeoutError"
        ? "Keystone did not respond in time."
        : "Could not reach Keystone.",
      503
    );
  }

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new KeystoneLabError(
      payload?.error || `Keystone request failed with ${response.status}.`,
      response.status >= 500 ? 502 : response.status
    );
  }

  return { payload, status: response.status };
}

export function keystoneErrorResponse(error) {
  const status = error instanceof KeystoneLabError ? error.status : 500;
  const message =
    error instanceof KeystoneLabError
      ? error.message
      : "The Keystone lab could not complete that request.";
  return { status, message };
}
