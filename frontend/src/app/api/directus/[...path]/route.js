import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

const FLOW_ALIASES = {
  "flows/trigger/lab-weather": "/flows/trigger/f0000000-0000-4000-8000-000000000001",
  "flows/trigger/lab-order": "/flows/trigger/f0000000-0000-4000-8000-000000000003"
};

function resolveTarget(path) {
  const joined = path.join("/");

  if (FLOW_ALIASES[joined]) {
    return { path: FLOW_ALIASES[joined], methods: ["POST"] };
  }

  if (joined === "labs-endpoint/hello") {
    return { path: "/labs-endpoint/hello", methods: ["GET"] };
  }

  if (joined === "items/lab_notes") {
    return { path: "/items/lab_notes", methods: ["GET", "POST"] };
  }

  if (/^items\/lab_notes\/[0-9a-f-]{36}$/i.test(joined)) {
    return { path: `/${joined}`, methods: ["GET", "PATCH"] };
  }

  return null;
}

export async function GET(request, { params }) {
  return handle(request, await params, "GET");
}

export async function POST(request, { params }) {
  return handle(request, await params, "POST");
}

export async function PATCH(request, { params }) {
  return handle(request, await params, "PATCH");
}

async function handle(request, params, method) {
  if (!DIRECTUS_TOKEN) {
    return NextResponse.json(
      { errors: [{ message: "The lab API is not configured. Set DIRECTUS_TOKEN." }] },
      { status: 503 }
    );
  }

  const target = resolveTarget(params.path || []);
  if (!target || !target.methods.includes(method)) {
    return NextResponse.json(
      { errors: [{ message: "This lab path is not available." }] },
      { status: 404 }
    );
  }

  const search = new URL(request.url).search;
  const headers = {
    Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    Accept: "application/json"
  };

  let body;
  if (method === "POST" || method === "PATCH") {
    const raw = await request.text();
    body = raw || undefined;
    if (raw) headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${DIRECTUS_URL}${target.path}${search}`, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        errors: [
          {
            message:
              error?.name === "TimeoutError"
                ? "Directus did not respond in time."
                : "Could not reach Directus. Is it running on port 8055?"
          }
        ]
      },
      { status: 503 }
    );
  }
}
