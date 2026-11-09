import { NextResponse } from "next/server";
import {
  datasetErrorResponse,
  datasetProvider,
  datasetSession,
  deleteDataset,
  loadDataset,
  updateDataset
} from "@/lib/datasetServer";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { provider, id } = await params;
    const key = datasetProvider(provider);
    const session = datasetSession(request);
    const data = await loadDataset(key, session, id);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = datasetErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { provider, id } = await params;
    const key = datasetProvider(provider);
    const session = datasetSession(request);
    const input = await request.json();
    const data = await updateDataset(key, session, id, input);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = datasetErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { provider, id } = await params;
    const key = datasetProvider(provider);
    const session = datasetSession(request);
    await deleteDataset(key, session, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const { status, message } = datasetErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
