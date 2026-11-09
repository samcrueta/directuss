export async function isUrlReachable(url) {
  if (!url) return false;
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(3500)
    });
    return response.ok;
  } catch {
    return false;
  }
}
