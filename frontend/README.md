This is the Next.js frontend for Lumina Academy.

## Advanced workspaces

There are three Level 7 workspaces and Level 8 advanced-graphs lessons for
Directus, Payload, and Keystone, each served from its legacy Section 8 route:

```
/courses/directus-from-beginner-to-advanced/advanced
/courses/directus-from-beginner-to-advanced/section-8-practical-projects-using-directus#directus-charts
/courses/payload-cms/advanced
/courses/payload-cms/payload-section-8-practical-projects-using-payload-cms#payload-charts
/courses/keystonejs/advanced
/courses/keystonejs/keystone-section-8-practical-projects-using-keystonejs#keystone-charts
```

### Advanced Directus

Twelve focused lessons: five API/automation lessons and seven UI/UX component
labs. Lessons 1–5 use the Directus code lab; lessons 6–12 use the embedded
component editor. The Directus instance and lab setup live in `../cms/README.md`.

### Level 8: Advanced Graphs with Directus

The Level 8 advanced-graphs lesson is the only subtopic in the legacy Section 8
route and also remains available as a standalone lesson and showcase:

```
/courses/directus-from-beginner-to-advanced/section-8-practical-projects-using-directus#directus-charts
/courses/directus-from-beginner-to-advanced/charts
/courses/directus-from-beginner-to-advanced/charts/showcase
```

The lesson covers graph selection, bounded Directus queries, server-side
aggregation and time bucketing, responsive rendering, accessibility, and empty
or offline states. The showcase reads aggregate data only from the `lessons` and
`lab_notes` collections through the server-side Directus token. It never sends
note titles or bodies to the browser. If Directus is offline, the page renders a
labelled sample dataset instead of failing.

`.../level-8` redirects to the Directus charts subtopic in Section 8.

### Advanced Payload

Seventeen UI/UX lessons backed by the Payload CMS in `../payload`:

1. Components, two worlds
2. Design tokens as data
3. Accessible primitives
4. Custom admin components
5. Custom field components
6. Blocks and the page builder
7. Drafts, preview, publish
8. Capstone: the showcase

Each lesson uses the same HTML/CSS/JavaScript component editor as Directus.
The editor keeps the learner in three panes (HTML, CSS, JS), renders a live
draft in a sandboxed iframe, and stores each saved version in Payload with the
lesson slug, component kind, surface, and status.

Labs can save drafts and, for public components, publish directly to the
showcase. Publishing unpublishes the previous published version for that browser
session and lesson. Versions are stored in Payload and scoped to the browser
session. Admin-surface labs (lessons 4–5) save drafts only and never appear in
the public gallery; they are visual prototypes because real Payload admin views
are React components.

The in-site showcase lives at:

```
/courses/payload-cms/showcase
```

It embeds the Payload-rendered gallery. Payload renders each published
submission as HTML/CSS/JS inside a CSP-locked iframe with
`sandbox="allow-scripts"`, so learner code never runs in the Payload or Lumina
origin. The old Payload Section 7 URL redirects to
`/courses/payload-cms/advanced`.

### Level 8: Advanced Graphs with Payload CMS

The Payload advanced-graphs lesson is the only subtopic in the legacy Section 8
route and also remains available as a standalone lesson and showcase:

```
/courses/payload-cms/payload-section-8-practical-projects-using-payload-cms#payload-charts
/courses/payload-cms/charts
/courses/payload-cms/charts/showcase
```

The lesson uses Payload's own `components` collection as the dataset. It covers
graph selection, bounded Payload queries, server-side reduction and time
bucketing, responsive rendering, accessibility, and empty or offline states.
The showcase reads aggregate counts from the `lessons` and `components`
collections through the server-side `PAYLOAD_API_KEY`. It never sends component
names, descriptions, code, owner sessions, or draft content to the browser. If
Payload is offline, the page renders a labelled sample dataset instead of
failing.

`.../level-8` redirects to the Payload charts subtopic in Section 8. The chart
lesson, showcase, and routes share one registry and one UI with the Directus
Level 8 lesson; only the provider loader, copy, and data differ.

### Level 8: Advanced Graphs with KeystoneJS

The Keystone advanced-graphs lesson is the only subtopic in the legacy Section 8
route and also remains available as a standalone lesson and showcase:

```
/courses/keystonejs/keystone-section-8-practical-projects-using-keystonejs#keystone-charts
/courses/keystonejs/charts
/courses/keystonejs/charts/showcase
```

The lesson uses the Keystone `components` list as the dataset. It covers graph
selection, bounded reads through the server context, server-side reduction and
time bucketing, responsive rendering, accessibility, and empty or offline
states. The showcase calls a secret-protected Keystone endpoint that returns
aggregate-safe fields from the `Lesson` and `Component` lists. It never sends
component names, descriptions, code, owner sessions, or draft content to the
browser. If Keystone is offline, the page renders a labelled sample dataset
instead of failing.

`.../level-8` redirects to the Keystone charts subtopic in Section 8. The chart
lesson, showcase, and routes share one registry and one UI with the Directus and
Payload Level 8 lessons; only the provider loader, copy, and data differ.

### Advanced KeystoneJS

Seventeen UI/UX lessons backed by the Keystone 6 CMS in `../keystone`:

1. Components, two worlds
2. Design tokens as data
3. Accessible primitives
4. Custom admin components
5. Custom field views
6. Blocks and the page builder
7. Drafts, preview, publish
8. Capstone: the showcase

The Keystone labs use the same three-pane HTML/CSS/JS component editor as the
Payload course. Drafts are saved to Keystone; published submissions appear in
the public gallery at `/showcase`, where each one is rendered inside a
CSP-locked iframe with `sandbox="allow-scripts"`. Admin-surface labs (lessons
4–5) save drafts only and never appear in the public gallery. The legacy
schema-driven builder preview remains available at `/showcase#preview` for old
rows. The in-site showcase lives at `/courses/keystonejs/showcase`; the old
Keystone Section 7 URL redirects to `/courses/keystonejs/advanced`.

## Payload environment

Payload runs on the host at `http://localhost:3002`. Add these to `.env.local`:

```bash
PAYLOAD_URL=http://localhost:3002
PAYLOAD_PUBLIC_URL=http://localhost:3002
PAYLOAD_API_KEY=lumina-payload-service-key
```

- `PAYLOAD_URL` is the server-side origin used by the content loader and API
  routes.
- `PAYLOAD_PUBLIC_URL` is the browser-facing origin used by the showcase iframe.
- `PAYLOAD_API_KEY` is the Payload service account API key. It stays server-side.

Start Payload from `../payload` with `npm run dev`. If you open the Lumina site
from another machine, set `PAYLOAD_PUBLIC_URL` to the host's LAN address.

## Keystone environment

Keystone runs on the host at `http://localhost:3003`. Add these to `.env.local`:

```bash
KEYSTONE_URL=http://localhost:3003
KEYSTONE_PUBLIC_URL=http://localhost:3003
KEYSTONE_SECRET=<the same LUMINA_SECRET used by ../keystone/.env>
```

- `KEYSTONE_URL` is the server-side GraphQL and lab API origin.
- `KEYSTONE_PUBLIC_URL` is the browser-facing showcase/preview origin.
- `KEYSTONE_SECRET` authenticates the Lumina server to `/api/lumina/*` and stays
  server-side.

Start Keystone from `../keystone` with `npm run dev`. If you open Lumina from
another machine, set `KEYSTONE_PUBLIC_URL` to the host's LAN address.

## Docker

The `web` service in `../cms/compose.yaml` reaches Payload through
`host.docker.internal:3002` and Keystone through `host.docker.internal:3003`.
Rebuild the web image after frontend changes:

```bash
docker compose -f ../cms/compose.yaml build web
docker compose -f ../cms/compose.yaml up -d web
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
