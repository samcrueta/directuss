import { getSessionId } from "./studioSession";

async function request(path, options = {}) {
  const session = getSessionId();
  if (!session) {
    throw new Error("The lab session is not ready yet.");
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

export async function listBuilderComponents(lessonSlug) {
  const payload = await request(
    `/api/lab/payload/components?lesson=${encodeURIComponent(lessonSlug)}`
  );
  return payload?.data || [];
}

export async function loadBuilderComponent(id) {
  const payload = await request(`/api/lab/payload/components/${id}`);
  if (!payload?.data) throw new Error("Component not found.");
  return payload.data;
}

export async function createBuilderComponent(input) {
  const payload = await request("/api/lab/payload/components", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return payload?.data;
}

export async function updateBuilderComponent(id, input) {
  const payload = await request(`/api/lab/payload/components/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
  return payload?.data;
}

export async function deleteBuilderComponent(id) {
  await request(`/api/lab/payload/components/${id}`, { method: "DELETE" });
}

export const TOKEN_DEFAULTS = {
  theme: "light",
  accent: "#4f46e5",
  background: "#ffffff",
  foreground: "#0f172a",
  muted: "#64748b",
  radius: 14,
  spacing: 24,
  fontScale: 1,
  shadow: "soft"
};

export const TOKEN_FIELDS = [
  {
    name: "theme",
    label: "Theme",
    type: "select",
    options: [
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" }
    ]
  },
  { name: "accent", label: "Accent", type: "color" },
  { name: "background", label: "Background", type: "color" },
  { name: "foreground", label: "Foreground", type: "color" },
  { name: "muted", label: "Muted text", type: "color" },
  { name: "radius", label: "Corner radius", type: "range", min: 0, max: 32, step: 1 },
  { name: "spacing", label: "Spacing", type: "range", min: 8, max: 48, step: 2 },
  { name: "fontScale", label: "Type scale", type: "range", min: 0.8, max: 1.4, step: 0.05 },
  {
    name: "shadow",
    label: "Shadow",
    type: "select",
    options: [
      { label: "None", value: "none" },
      { label: "Soft", value: "soft" },
      { label: "Strong", value: "strong" }
    ]
  }
];

export function defaultComponentName(lesson) {
  return String(lesson?.title || "Payload component").slice(0, 90);
}

export function defaultComponentDescription(lesson) {
  return String(lesson?.outcome || lesson?.lab?.brief || "").slice(0, 500);
}

export function tokenFieldsFromCatalog(catalog) {
  const fields = catalog?.tokenFields;
  return Array.isArray(fields) && fields.length ? fields : TOKEN_FIELDS;
}

export function defaultTokensFromCatalog(catalog) {
  const defaults = catalog?.tokenDefaults;
  return defaults && typeof defaults === "object"
    ? { ...TOKEN_DEFAULTS, ...defaults }
    : { ...TOKEN_DEFAULTS };
}
