# Advanced Directus — CMS + deployment

> This document covers the Directus side of Lumina Academy. The Advanced Payload
> and Advanced KeystoneJS workspaces are documented in `../payload/README.md`,
> `../keystone/README.md`, and `../frontend/README.md`.

This folder runs the Directus instance and the Next.js app used by the Level 7
workspace.

- **Directus 12** stores the seventeen lessons, the UI/UX component versions, the
  lab Flows, and the `lab_notes` sandbox collection.
- **Next.js** serves the lesson UI, the API code lab, and the embedded UI/UX
  component lab.
- **Browser worker** runs learner JavaScript. It can only call the app's
  `/api/*` routes.
- **SQLite** keeps the Pi deployment light. No Postgres, Redis, or Caddy are
  required for a LAN-only install.
- **Level 8 advanced graphs** reads aggregate lesson and lab data from Directus
  and renders it in the Next.js showcase.

## URLs

| Service | Local | Pi (LAN) |
|---|---|---|
| Learning app | http://localhost:3000 | http://&lt;pi-ip&gt;:3000 |
| Directus Studio | http://localhost:8055 | http://&lt;pi-ip&gt;:8055 |

The Level 7 workspace lives at:

```
/courses/directus-from-beginner-to-advanced/advanced
```

The Level 8 advanced-graphs lesson is the only subtopic in the legacy Section 8 route:

```
/courses/directus-from-beginner-to-advanced/section-8-practical-projects-using-directus#directus-charts
```

The standalone charts lesson and showcase remain available at:

```
/courses/directus-from-beginner-to-advanced/charts
/courses/directus-from-beginner-to-advanced/charts/showcase
```

The charts loader queries `lessons` and `lab_notes` with the server-side
`DIRECTUS_TOKEN` and sends only aggregates to the browser. If Directus is
offline, the showcase renders a labelled sample dataset.

The advanced workspace contains two tracks:

- **Automation & APIs** — lessons 1–5
- **UI/UX Labs** — lessons 6–17: CMS component labs, editable data, and responsive charts.

There is no separate studio page. The old `/studio` URL redirects to
`/courses/directus-from-beginner-to-advanced/advanced/build-a-button`.
The old Section 7 URL redirects to the advanced workspace.

## UI/UX component lessons

Each UI/UX lesson embeds the same component lab: HTML, CSS, and JS tabs, a
sandboxed live preview, a console, a checklist, hints, and a solution. Saving
creates a version in Directus and makes it available in the lesson's
“Directus” preview.

- **Collection:** `components` — name, description, HTML, CSS, JS, owner
  session, lesson slug, timestamps.
- **Lessons:** the `track` field (`api` or `ui`) drives the rail groups.
- **Version history:** saved versions are filtered by `lesson_slug` and
  `owner_session`; each lesson has its own compact list.
- **Directus renderer:** a `components-render` endpoint extension builds a
  standalone HTML document from the stored fields.
- **Next proxy:** `/api/studio/render/:id` fetches the Directus document and
  adds a strict CSP before serving it to the lesson lab iframe.
- **Live preview:** the unsaved draft is rendered locally in a sandboxed
  iframe for instant feedback.
- **Saved preview:** the “Directus” toggle loads the document produced by the
  Directus endpoint.
- **Ownership:** each browser gets a UUID session in `localStorage`; the API
  filters versions by `owner_session` and `lesson_slug`. This is convenience
  ownership, not authentication. The Directus admin sees every component.
- **Sandbox:** the iframe uses `sandbox="allow-scripts"` without
  `allow-same-origin`; CSP blocks external assets and network requests. The
  pasted code cannot access the parent app or Directus cookies.
- **Directus secret:** the renderer requires the `x-lumina-render` header,
  which is only added server-side by the Next proxy. The browser never sees
  the Directus token or the header.

The endpoint extension is loaded from `extensions/components-render`. Restart
Directus after adding or changing it:

```bash
docker compose restart directus
```

The seed creates the `components` collection and its `lesson_slug` field. It
does not delete existing component versions when rerun.

## Local development

> The seed is idempotent for schema/Flows, but it **overwrites the twelve lesson
> records and the lab Flow definitions** on every run. Run it once, then edit
> content in Directus Studio. The lab Flows use fixed IDs that the Next.js
> proxy maps to `/flows/trigger/lab-weather` and `/flows/trigger/lab-order`;
> do not delete and recreate those Flows by hand.

1. Start Directus only:

   ```bash
   cd cms
   cp .env.example .env
   # edit the secrets and set MOCK_API_URL=http://host.docker.internal:3000
   docker compose up -d directus
   ```

2. Seed the schema, Flows, and lessons:

   ```bash
   docker compose exec directus node /seed/seed.mjs
   ```

3. In a second terminal, create `frontend/.env.local`:

   ```bash
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_TOKEN=<the same value as DIRECTUS_ADMIN_TOKEN>
   DIRECTUS_WS_URL=ws://localhost:8055/websocket
   LAB_SECRET=<the same value as LAB_SECRET>
   ```

4. Run the app:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Raspberry Pi deployment

Use a 64-bit Raspberry Pi OS on a Pi 4 or 5. A Pi 5 with 4 GB is comfortable.
An SSD or high-endurance SD card is strongly recommended.

1. Install Docker and the Compose plugin.

2. Copy the project to the Pi, then:

   ```bash
   cd cms
   cp .env.example .env
   nano .env
   ```

   Set at least:

   ```dotenv
   DIRECTUS_PUBLIC_URL=http://<pi-ip>:8055
   WEB_ORIGIN=http://<pi-ip>:3000
   MOCK_API_URL=http://web:3000
   ```

   Leave `DIRECTUS_WS_URL` empty; the app derives
   `ws://<pi-ip>:8055/websocket` from the incoming request.

3. Create the data directories and give the Directus container write access:

   ```bash
   mkdir -p data/database data/uploads
   sudo chown -R 1000:1000 data
   ```

4. Build and start:

   ```bash
   docker compose up -d --build
   ```

5. Seed once:

   ```bash
   docker compose exec directus node /seed/seed.mjs
   ```

6. Open `http://<pi-ip>:3000`.

Directus Studio is at `http://<pi-ip>:8055`. Keep it on the LAN; do not expose
port 8055 to the public internet.

## Backups

Install `sqlite3` once:

```bash
sudo apt install sqlite3
```

Run a backup:

```bash
cd cms
./backup.sh
```

The script uses SQLite's online backup API, archives uploads, and keeps two
weeks of files. Add it to cron:

```cron
15 2 * * * /home/pi/directus/cms/backup.sh >> /home/pi/directus/cms/backups/backup.log 2>&1
```

To restore, stop the stack, replace `data/database/data.db` and the contents of
`data/uploads/` from a backup, then start the stack again.

## Updating

```bash
cd cms
docker compose pull directus
docker compose up -d --build
```

Directus migrations run automatically. Back up before updating.

## Security notes

- The Directus admin token is used **server-side only** by the Next.js content
  fetcher, the `/api/directus` lab proxy, and the component lab API/render
  routes. It is never sent to the browser.
- The proxy only allows `lab_notes` reads/writes, the two lab Flow triggers,
  and the demo endpoint. It is not a general Directus proxy.
- The WebSocket lab runs in `public` auth mode so unauthenticated learners can
  subscribe to the public `lab_notes` read permission. The public role has no
  write access.
- The browser worker is a learning sandbox, not a hardened multi-tenant code
  runner. Do not paste hostile code into it.
- The lab proxy and component lab API are intentionally unauthenticated for
  the LAN demo. Saved versions are scoped by a browser session header and
  lesson slug, which prevents accidental cross-session listings but is not an
  authentication boundary. Add learner auth (Directus users or a reverse-proxy
  gate) and rate limiting before making the app publicly reachable.
- A Directus-rendered component URL contains a UUID and is reachable without
  the browser session. Components are treated as non-sensitive class content.
- `IMPORT_IP_DENY_LIST` is narrowed to the cloud metadata address so the
  internal mock API can be called by Flows. Flow creation is admin-only.
- For a public deployment, put Caddy in front for HTTPS/WSS and keep the
  Directus admin port private.

## Troubleshooting

| Symptom | Check |
|---|---|
| `SQLITE_CANTOPEN` | `sudo chown -R 1000:1000 cms/data` or `chmod -R 777 cms/data` |
| Directus unhealthy | `docker compose logs directus`; healthcheck uses `127.0.0.1:8055` |
| Weather/order lab returns 401 | `LAB_SECRET` must match in `cms/.env` and the web container |
| Weather/order lab cannot reach mock API | `MOCK_API_URL` must be `http://web:3000` in Docker |
| WebSocket lab says `AUTH_FAILED` | Directus must be reachable at `ws://<host>:8055`; check `WEBSOCKETS_REST_AUTH=public` and rerun the seed so the public role can read `lab_notes` |
| App shows “Offline content” | Directus is down or `DIRECTUS_TOKEN` is wrong; lessons still render from the local JSON fallback |
| Code lab says “Directus offline” | `/api/lab/health` cannot reach `/server/ping` |
| UI/UX lab says “Could not reach Directus” | Check the `web` container `DIRECTUS_URL` and the Directus healthcheck |
| UI/UX lab Directus preview is blank | `components-render` is not loaded; `docker compose restart directus` |
| UI/UX lab Directus preview returns 401 | `LAB_SECRET` must match in Directus and the web container |
| Saved versions are empty after clearing browser data | Versions remain in Directus but the browser session ID changed |

## Memory footprint

Approximate idle usage on a Pi 5:

- Directus + SQLite: 250–450 MB RAM
- Next.js standalone: 150–250 MB RAM
- Docker overhead: ~100 MB

Total: roughly 0.6–1 GB RAM and 1–1.5 GB disk.
