import { NextResponse } from "next/server";
import {
  directusRequest,
  readOwnedComponent,
  requireComponentId,
  requireSession,
  studioErrorResponse,
  validateComponentPayload
} from "@/lib/studioServer";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = requireSession(request);
    const component = await readOwnedComponent(requireComponentId(id), session);

    return NextResponse.json(
      {
        data: {
          id: component.id,
          name: component.name,
          description: component.description,
          framework: component.framework,
          html: component.html,
          css: component.css,
          js: component.js,
          lesson_slug: component.lesson_slug,
          date_created: component.date_created,
          date_updated: component.date_updated
        }
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = studioErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const session = requireSession(request);
    await readOwnedComponent(requireComponentId(id), session);

    const input = await request.json();
    const payload = validateComponentPayload(input);
    const result = await directusRequest(`/items/components/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    return NextResponse.json(
      { data: result?.data || null },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = studioErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = requireSession(request);
    await readOwnedComponent(requireComponentId(id), session);
    await directusRequest(`/items/components/${id}`, { method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const { status, message } = studioErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
