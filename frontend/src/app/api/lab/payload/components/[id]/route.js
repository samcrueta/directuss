import { NextResponse } from "next/server";
import {
  getLessonForComponent,
  payloadLabErrorResponse,
  payloadRequest,
  readOwnedComponent,
  requireComponentId,
  requireSession,
  serializeOwnedComponent,
  validateComponentInput
} from "@/lib/payloadServer";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = requireSession(request);
    const component = await readOwnedComponent(requireComponentId(id), session);
    return NextResponse.json(
      { data: serializeOwnedComponent(component) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = payloadLabErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const session = requireSession(request);
    const component = await readOwnedComponent(requireComponentId(id), session);
    const input = await request.json();
    const { lesson, lab } = await getLessonForComponent(component.lessonSlug);
    const data = validateComponentInput(input, lesson, lab);

    const body = await payloadRequest(`/api/components/${component.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: data.name,
        description: data.description,
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
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = payloadLabErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = requireSession(request);
    const component = await readOwnedComponent(requireComponentId(id), session);
    await payloadRequest(`/api/components/${component.id}`, { method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const { status, message } = payloadLabErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
