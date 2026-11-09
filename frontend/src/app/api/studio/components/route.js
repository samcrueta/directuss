import { NextResponse } from "next/server";
import {
  directusRequest,
  normalizeLessonSlug,
  requireSession,
  studioErrorResponse,
  validateComponentPayload
} from "@/lib/studioServer";

export const dynamic = "force-dynamic";

const LIST_FIELDS = "id,name,description,framework,lesson_slug,date_updated,date_created";

export async function GET(request) {
  try {
    const session = requireSession(request);
    const lessonSlug = normalizeLessonSlug(request.nextUrl.searchParams.get("lesson"));
    const query = new URLSearchParams({
      "filter[owner_session][_eq]": session,
      sort: "-date_updated",
      limit: "100",
      fields: LIST_FIELDS
    });
    if (lessonSlug) {
      query.set("filter[lesson_slug][_eq]", lessonSlug);
    }
    const result = await directusRequest(`/items/components?${query.toString()}`);
    return NextResponse.json(
      { data: result?.data || [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = studioErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request) {
  try {
    const session = requireSession(request);
    const input = await request.json();
    const payload = validateComponentPayload(input);
    const lessonSlug = normalizeLessonSlug(input?.lesson_slug);

    const result = await directusRequest("/items/components", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        owner_session: session,
        lesson_slug: lessonSlug,
        date_updated: new Date().toISOString()
      })
    });

    return NextResponse.json(
      { data: result?.data || null },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = studioErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
