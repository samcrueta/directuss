import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";

export async function GET() {
  try {
    const response = await fetch(`${DIRECTUS_URL}/server/ping`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500)
    });
    const text = await response.text();
    return NextResponse.json(
      { ok: response.ok && text.includes("pong") },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ ok: false }, { headers: { "Cache-Control": "no-store" } });
  }
}
