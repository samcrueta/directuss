import { NextResponse } from "next/server";
import { COMPONENT_ID_PATTERN } from "@/lib/studioServer";

export const dynamic = "force-dynamic";

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const LAB_SECRET = process.env.LAB_SECRET;

const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "script-src 'unsafe-inline'",
  "img-src data:",
  "font-src data:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-ancestors 'self'"
].join("; ");

function errorDocument(message) {
  const escaped = String(message).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Preview unavailable</title>
  <style>
    html, body { height: 100%; margin: 0; }
    body {
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      color: #6b7280;
      background: #ffffff;
      text-align: center;
    }
    p { max-width: 360px; margin: 0; line-height: 1.6; font-size: 14px; }
  </style>
</head>
<body><p>${escaped}</p></body>
</html>`;
}

function htmlResponse(html, status = 200) {
  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": CONTENT_SECURITY_POLICY,
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!id || !COMPONENT_ID_PATTERN.test(id)) {
    return htmlResponse(errorDocument("Invalid component id."), 400);
  }

  try {
    const response = await fetch(`${DIRECTUS_URL}/components-render/${id}`, {
      headers: {
        ...(LAB_SECRET ? { "x-lumina-render": LAB_SECRET } : {}),
        ...(DIRECTUS_TOKEN ? { Authorization: `Bearer ${DIRECTUS_TOKEN}` } : {}),
        Accept: "text/html"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000)
    });

    if (!response.ok) {
      return htmlResponse(
        errorDocument(
          response.status === 404
            ? "This component does not exist in Directus."
            : "Directus could not render this component."
        ),
        response.status === 404 ? 404 : 503
      );
    }

    const html = await response.text();
    return htmlResponse(html, 200);
  } catch {
    return htmlResponse(
      errorDocument("Directus is offline. Start it and try again."),
      503
    );
  }
}
