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

export async function listComponents(lessonSlug) {
  const query = lessonSlug ? `?lesson=${encodeURIComponent(lessonSlug)}` : "";
  const payload = await request(`/api/lab/keystone/components${query}`);
  return payload?.data || [];
}

export async function loadComponent(id) {
  const payload = await request(`/api/lab/keystone/components/${id}`);
  if (!payload?.data) throw new Error("Component not found.");
  return payload.data;
}

export async function createComponent(input) {
  const payload = await request("/api/lab/keystone/components", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return payload?.data;
}

export async function updateComponent(id, input) {
  const payload = await request(`/api/lab/keystone/components/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
  return payload?.data;
}

export async function deleteComponent(id) {
  await request(`/api/lab/keystone/components/${id}`, { method: "DELETE" });
}
