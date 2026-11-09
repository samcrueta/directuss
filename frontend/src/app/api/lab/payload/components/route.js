import { NextResponse } from "next/server";
import {
  getLessonForComponent,
  normalizeLessonSlug,
  payloadLabErrorResponse,
  payloadRequest,
  requireSession,
  serializeOwnedComponent,
  validateComponentInput
} from "@/lib/payloadServer";

export const dynamic = "force-dynamic";

function metadata(component) {
  return {
    id: component.id,
    name: component.name,
    description: component.description || "",
    kind: component.kind,
    lessonSlug: component.lessonSlug,
    surface: component.surface,
    status: component.status,
    publishedAt: component.publishedAt || null,
    updatedAt: component.updatedAt,
    createdAt: component.createdAt
  };
}

export async function GET(request) {
  try {
    const session = requireSession(request);
    const lessonSlug = normalizeLessonSlug(request.nextUrl.searchParams.get("lesson"));

    const query = new URLSearchParams();
    query.set("where[and][0][ownerSession][equals]", session);
    query.set("where[and][1][lessonSlug][equals]", lessonSlug);
    query.set("sort", "-updatedAt");
    query.set("limit", "50");
    query.set("depth", "0");

    const result = await payloadRequest(`/api/components?${query.toString()}`);
    return NextResponse.json(
      { data: (result?.docs || []).map(metadata) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = payloadLabErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request) {
  try {
    const session = requireSession(request);
    const input = await request.json();
    const { lesson, lab } = await getLessonForComponent(input?.lessonSlug);
    const data = validateComponentInput(input, lesson, lab);

    const body = await payloadRequest("/api/components", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        lesson: data.lessonId,
        lessonSlug: data.lessonSlug,
        ownerSession: session,
        surface: data.surface,
        kind: data.kind,
        status: data.status,
        html: data.html,
        css: data.css,
        js: data.js,
        content: data.content
      })
    });

    const saved = body?.doc || body;
    return NextResponse.json(
      { data: serializeOwnedComponent(saved) },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = payloadLabErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
