import { getSessionId } from "./studioSession";

const RESET_CSS = `html, body { margin: 0; min-height: 100%; }
*, *::before, *::after { box-sizing: border-box; }
body {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #111827;
  background: #ffffff;
}`;

const ERROR_REPORTER = `(() => {
  const send = (type, level, text) => {
    try {
      parent.postMessage({ source: "lumina-component", type, level, text }, "*");
    } catch {}
  };

  const serialize = (value) => {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.stack || value.message;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  ["log", "info", "warn", "error", "debug"].forEach((level) => {
    const original = console[level] ? console[level].bind(console) : () => {};
    console[level] = (...args) => {
      original(...args);
      send("console", level === "debug" ? "log" : level, args.map(serialize).join(" "));
    };
  });

  window.addEventListener("error", (event) => {
    const location = event.lineno ? " (line " + event.lineno + ")" : "";
    send("error", "error", (event.message || "Unknown error") + location);
  });

  window.addEventListener("unhandledrejection", (event) => {
    send("error", "error", serialize(event.reason));
  });
})();`;

export function buildPreviewDocument({ html = "", css = "", js = "" } = {}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'">
  <title>Component preview</title>
  <style>${RESET_CSS}\n${css}</style>
  <script>${ERROR_REPORTER}</script>
</head>
<body>
${html}
<script>${js}</script>
</body>
</html>`;
}

async function request(path, options = {}) {
  const session = getSessionId();
  if (!session) {
    throw new Error("The studio session is not ready yet.");
  }

  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      "x-lumina-session": session,
      ...(options.headers || {})
    },
    cache: "no-store"
  });

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
    throw new Error(payload?.error || `Request failed with ${response.status}.`);
  }

  return payload;
}

export async function listComponents(lessonSlug) {
  const query = lessonSlug ? `?lesson=${encodeURIComponent(lessonSlug)}` : "";
  const payload = await request(`/api/studio/components${query}`);
  return payload?.data || [];
}

export async function loadComponent(id) {
  const payload = await request(`/api/studio/components/${id}`);
  if (!payload?.data) throw new Error("Component not found.");
  return payload.data;
}

function normalizeComponentInput(input = {}) {
  const { lessonSlug, status, ...rest } = input;
  return {
    ...rest,
    ...(lessonSlug !== undefined ? { lesson_slug: lessonSlug } : {})
  };
}

export async function createComponent(input) {
  const payload = await request("/api/studio/components", {
    method: "POST",
    body: JSON.stringify(normalizeComponentInput(input))
  });
  return payload?.data;
}

export async function updateComponent(id, input) {
  const payload = await request(`/api/studio/components/${id}`, {
    method: "PATCH",
    body: JSON.stringify(normalizeComponentInput(input))
  });
  return payload?.data;
}

export async function deleteComponent(id) {
  await request(`/api/studio/components/${id}`, { method: "DELETE" });
}
