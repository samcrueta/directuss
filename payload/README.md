# Advanced Payload — Lumina Academy

The Payload 3 CMS behind the Advanced Payload course. It stores the twelve Level 7
lessons, the component catalog, learner drafts, published submissions, block
pages, the public showcase, and the live data used by the frontend's Level 8
advanced-graphs lesson.

## URLs

| Surface | URL |
|---|---|
| Payload admin | http://localhost:3002/admin |
| Public showcase | http://localhost:3002/showcase |

The Lumina frontend is at http://localhost:3000. Its Advanced Payload workspace is
at `/courses/payload-cms/advanced`, and its in-site showcase is at
`/courses/payload-cms/showcase`. The Level 8 charts lesson lives at
`/courses/payload-cms/payload-section-8-practical-projects-using-payload-cms#payload-charts`,
with standalone pages at `/courses/payload-cms/charts` and
`/courses/payload-cms/charts/showcase`.

## Run locally

```bash
npm install
npm run seed     # users, 17 lessons, component catalog, sample showcase
npm run dev      # http://localhost:3002
```

`npm run dev` and `npm run start` set `PORT=3002` so Payload does not collide with
the Dockerized Lumina site on port 3000. Override the port with `PORT` if needed.

The default admin credentials come from `.env`:

```bash
PAYLOAD_ADMIN_EMAIL=admin@lumina.local
PAYLOAD_ADMIN_PASSWORD=lumina-payload-admin
```

The service account is used by the Lumina frontend:

```bash
PAYLOAD_SERVICE_EMAIL=service@lumina.local
PAYLOAD_API_KEY=lumina-payload-service-key
```

Keep the API key on the server. The frontend calls Payload through its own
`/api/lab/payload/*` routes.

## Data model

| Collection / global | Purpose |
|---|---|
| `sections` | Course section metadata (`payload-advanced`) |
| `lessons` | The twelve lessons, tracks, lab JSON, knowledge checks, deep dives |
| `components` | Learner drafts and published submissions, HTML/CSS/JS code, moderation |
| `pages` | Draft-enabled block pages with live preview |
| `component-catalog` | Legacy field definitions and token defaults for the block reference renderer |
| `showcase-settings` | Showcase title, intro, CTA, and featured submission |

Each lab starter and solution lives in
`../frontend/content/payload-advanced.json`, which is also the frontend's offline
fallback content. Run the seed after changing it. The seed copies the four
sample solutions into the `components` collection as HTML, CSS, and JavaScript.

Draft saves and published versions are the same records. Publishing a version
unpublishes the previous published version for that browser session and lesson,
so the showcase always shows the learner's latest public submission.

## Showcase and moderation

Public reads only expose components with `status: published` and
`surface: public`. The showcase reads live from the same collection. Admins can
feature, unpublish, or delete submissions from the admin panel.

Every published component is stored as HTML, CSS, and JavaScript. The showcase
renders it with `srcDoc` inside an iframe with
`sandbox="allow-scripts"` and a document-level CSP that blocks network access,
forms, and top-level navigation. No learner JavaScript runs in the Payload or
Lumina origin.

The legacy React renderer and `/embed` route remain in the repository for
reference, but the course and showcase no longer use them.

## Level 8 charts

The frontend's Level 8 advanced-graphs lesson treats Payload's `components`
collection as a dataset. The server loader reads `lessons` for the track and
published counts, and `components` for status, kind, and `createdAt`, then
reduces those rows into four small series:

- lessons by track
- components by status
- components created per day over the last 14 days
- components by kind

The loader authenticates with `PAYLOAD_API_KEY` on the server and returns counts
only. Component names, descriptions, code, owner sessions, and draft records
never reach the browser. If Payload is offline, the lesson renders a labelled
sample dataset instead of failing.

Payload does not expose Directus-style `aggregate` or `groupBy` endpoints. The
loader counts rows for the current collection sizes; a larger dashboard should
move that work into a collection hook, a custom endpoint, or a scheduled summary
collection.

## Docker

The `payload/Dockerfile` can build a standalone image. The current Lumina Compose
stack keeps Payload on the host at port 3002 and lets the Dockerized web app reach
it through `host.docker.internal`. See `../cms/compose.yaml`.
