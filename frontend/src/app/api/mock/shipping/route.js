import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const secret = process.env.LAB_SECRET;
  if (secret && request.headers.get("x-lab-secret") !== secret) {
    return NextResponse.json(
      { errors: [{ message: "Missing or invalid lab secret." }] },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ message: "Expected a JSON order body." }] },
      { status: 400 }
    );
  }

  const orderId = String(body?.order_id || "").trim();
  if (!orderId) {
    return NextResponse.json(
      { errors: [{ message: "order_id is required." }] },
      { status: 400 }
    );
  }

  const suffix = orderId.split("-").pop().replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();

  return NextResponse.json(
    {
      order_id: orderId,
      tracking: `LUM-${suffix}`,
      carrier: "Lumina Express",
      eta: "2-3 days",
      status: "queued"
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
