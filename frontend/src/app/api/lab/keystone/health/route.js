import { NextResponse } from "next/server";
import { getKeystonePublicUrl } from "@/lib/keystone";

export const dynamic = "force-dynamic";

const KEYSTONE_URL = process.env.KEYSTONE_URL || "http://localhost:3003";

export async function GET() {
  try {
    const response = await fetch(
      `${KEYSTONE_URL.replace(/\/+$/, "")}/api/lumina/health`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(4000)
      }
    );
    const body = await response.json().catch(() => null);
    return NextResponse.json(
      {
        ok: response.ok && Boolean(body?.ok),
        showcaseUrl: `${getKeystonePublicUrl()}/showcase`
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, showcaseUrl: `${getKeystonePublicUrl()}/showcase` },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
