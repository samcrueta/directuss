import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  let url = process.env.DIRECTUS_WS_URL;

  if (!url) {
    const requestHeaders = await headers();
    const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
    const hostname = host.split(":")[0];
    const forwardedProto = (requestHeaders.get("x-forwarded-proto") || "http").split(",")[0].trim();
    const protocol = forwardedProto === "https" ? "wss" : "ws";
    const port = process.env.DIRECTUS_WS_PORT || "8055";
    url = `${protocol}://${hostname}:${port}/websocket`;
  }

  return NextResponse.json(
    { url, token: null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
