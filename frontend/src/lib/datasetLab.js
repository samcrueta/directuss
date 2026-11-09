import { getSessionId } from "./studioSession";

async function request(provider, path, options = {}) {
  const session = getSessionId();
  if (!session) {
    throw new Error("The lab session is not ready yet.");
  }

  const response = await fetch(`/api/lab/${provider}/datasets${path}`, {
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

export async function listDatasets(provider, lessonSlug) {
  const payload = await request(
    provider,
    `?lesson=${encodeURIComponent(lessonSlug)}`
  );
  return payload?.data || [];
}

export async function loadDataset(provider, id) {
  const payload = await request(provider, `/${id}`);
  if (!payload?.data) throw new Error("Dataset not found.");
  return payload.data;
}

export async function createDataset(provider, input) {
  const payload = await request(provider, "", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return payload?.data;
}

export async function updateDataset(provider, id, input) {
  const payload = await request(provider, `/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
  return payload?.data;
}

export async function deleteDataset(provider, id) {
  await request(provider, `/${id}`, { method: "DELETE" });
}
