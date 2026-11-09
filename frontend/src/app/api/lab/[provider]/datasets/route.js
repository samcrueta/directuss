import { NextResponse } from "next/server";
import {
  createDataset,
  datasetErrorResponse,
  datasetLessonSlug,
  datasetProvider,
  datasetSession,
  listDatasets
} from "@/lib/datasetServer";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { provider } = await params;
    const key = datasetProvider(provider);
    const session = datasetSession(request);
    const lessonSlug = datasetLessonSlug(
      request.nextUrl.searchParams.get("lesson")
    );
    const data = await listDatasets(key, session, lessonSlug);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = datasetErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request, { params }) {
  try {
    const { provider } = await params;
    const key = datasetProvider(provider);
    const session = datasetSession(request);
    const input = await request.json();
    const data = await createDataset(key, session, input);
    return NextResponse.json(
      { data },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = datasetErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
