import { NextResponse } from "next/server";
import { getPayloadPublicUrl } from "@/lib/payload";

export const dynamic = "force-dynamic";

const PAYLOAD_URL = process.env.PAYLOAD_URL || "http://localhost:3002";

export async function GET() {
  try {
    const response = await fetch(`${PAYLOAD_URL.replace(/\/+$/, "")}/api/lumina/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000)
    });
    const body = await response.json().catch(() => null);
    return NextResponse.json(
      {
        ok: response.ok && Boolean(body?.ok),
        showcaseUrl: `${getPayloadPublicUrl()}/showcase`
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, showcaseUrl: `${getPayloadPublicUrl()}/showcase` },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
