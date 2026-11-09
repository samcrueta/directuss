import { NextResponse } from "next/server";
import {
  keystoneErrorResponse,
  keystoneRequest,
  normalizeLessonSlug,
  requireSession
} from "@/lib/keystoneServer";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = requireSession(request);
    const lessonSlug = normalizeLessonSlug(request.nextUrl.searchParams.get("lesson"));
    const result = await keystoneRequest(
      `/api/lumina/components?lesson=${encodeURIComponent(lessonSlug)}`,
      { session }
    );
    return NextResponse.json(result.payload, {
      status: result.status,
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    const { status, message } = keystoneErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request) {
  try {
    const session = requireSession(request);
    const body = await request.text();
    if (!body) {
      return NextResponse.json({ error: "A component payload is required." }, { status: 400 });
    }
    const result = await keystoneRequest("/api/lumina/components", {
      method: "POST",
      body,
      session
    });
    return NextResponse.json(result.payload, {
      status: 201,
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    const { status, message } = keystoneErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
