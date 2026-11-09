import { NextResponse } from "next/server";
import {
  keystoneErrorResponse,
  keystoneRequest,
  requireComponentId,
  requireSession
} from "@/lib/keystoneServer";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = requireSession(request);
    const result = await keystoneRequest(
      `/api/lumina/components/${requireComponentId(id)}`,
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

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const session = requireSession(request);
    const body = await request.text();
    if (!body) {
      return NextResponse.json({ error: "A component payload is required." }, { status: 400 });
    }
    const result = await keystoneRequest(
      `/api/lumina/components/${requireComponentId(id)}`,
      { method: "PATCH", body, session }
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

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = requireSession(request);
    const result = await keystoneRequest(
      `/api/lumina/components/${requireComponentId(id)}`,
      { method: "DELETE", session }
    );
    return new NextResponse(null, { status: result.status || 204 });
  } catch (error) {
    const { status, message } = keystoneErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
