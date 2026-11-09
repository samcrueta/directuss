import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CITIES = {
  manila: { tempC: 31, condition: "Humid" },
  tokyo: { tempC: 22, condition: "Clear" },
  oslo: { tempC: 7, condition: "Cloudy" },
  london: { tempC: 14, condition: "Rainy" },
  seattle: { tempC: 12, condition: "Drizzle" }
};

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export async function GET(request) {
  const secret = process.env.LAB_SECRET;
  if (secret && request.headers.get("x-lab-secret") !== secret) {
    return NextResponse.json(
      { errors: [{ message: "Missing or invalid lab secret." }] },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const requested = (url.searchParams.get("city") || "Manila").trim();
  const key = requested.toLowerCase();
  const units = url.searchParams.get("units") === "imperial" ? "imperial" : "metric";
  const known = CITIES[key];
  const tempC = known?.tempC ?? 15 + (key.length % 12);
  const condition = known?.condition ?? "Partly cloudy";

  return NextResponse.json(
    {
      city: titleCase(requested) || "Manila",
      units,
      tempC,
      ...(units === "imperial" ? { tempF: Math.round((tempC * 9) / 5 + 32) } : {}),
      condition,
      source: "mock-weather"
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
