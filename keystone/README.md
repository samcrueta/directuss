# Advanced KeystoneJS — Lumina Academy

The Keystone 6 CMS behind the Advanced KeystoneJS course. It stores the twelve
Level 7 lessons, the component catalog, learner drafts, published submissions,
and the Keystone-rendered public showcase.

Each lab is a three-pane HTML/CSS/JS component. Drafts are saved to Keystone,
published submissions appear in the public showcase, and admin-surface labs stay
in draft mode.

## URLs

| Surface | URL |
|---|---|
| Keystone Admin UI | http://localhost:3003/ |
| Sign in | http://localhost:3003/signin |
| Public showcase | http://localhost:3003/showcase |
| Embedded showcase | http://localhost:3003/showcase#embed |
| Builder preview | http://localhost:3003/showcase#preview |
| GraphQL API | http://localhost:3003/api/graphql |
| Lumina health | http://localhost:3003/api/lumina/health |

The Lumina frontend is at http://localhost:3000. Its Advanced KeystoneJS
workspace is at `/courses/keystonejs/advanced`, and its in-site showcase is at
`/courses/keystonejs/showcase`.

## Run locally

```bash
npm install
npm run dev      # reads PORT=3003 from .env
npm run seed     # optional; the first connection auto-seeds empty data
npm run build
npm run start
```

The first `keystone dev` connection creates the admin user and seeds the twelve
lessons, the component catalog, the showcase settings, the design-token demo,
and four sample components. The seed is idempotent: on every connection it
upserts the section, catalog, and lessons, and refreshes the sample components
from the lesson solutions without touching other learner rows.

When the `Component.html`, `Component.css`, or `Component.js` columns are new,
apply the schema before starting Keystone:

```bash
npx prisma db push
```

Default admin credentials come from `.env`:

```bash
KEYSTONE_ADMIN_EMAIL=admin@lumina.local
KEYSTONE_ADMIN_PASSWORD=lumina-keystone-admin
```

If the public showcase is blank on the very first dev request while Next
compiles the custom page, reload once. The page is a client-rendered Keystone
Admin UI page.

## Data model

| List | Purpose |
|---|---|
| `User` | Keystone auth users and roles |
| `Section` | Course section metadata (`keystone-advanced`) |
| `Lesson` | Seventeen lessons, tracks, lab JSON, knowledge checks, deep dives |
| `Component` | Learner drafts and published submissions, stored as `html`/`css`/`js` with legacy `content`/`tokens` fallback |
| `ComponentCatalog` | Legacy builder field definitions, defaults, and token contract |
| `ShowcaseSettings` | Showcase title, intro, CTA, and copy |
| `Token` | A small design-token list with the custom color field view |

The curriculum source is `../frontend/content/keystone-advanced.json`. The
frontend also uses that file as its offline fallback.

## Component lab shape

Every lesson lab in `../frontend/content/keystone-advanced.json` uses:

```json
{
  "kind": "component",
  "componentKind": "card",
  "surface": "public",
  "publishable": true,
  "starter": { "html": "...", "css": "...", "js": "..." },
  "solution": { "html": "...", "css": "...", "js": "..." }
}
```

`surface: "admin"` labs are visual prototypes and cannot be published. The old
`kind: "builder"` shape with `content`/`tokens` remains accepted by the Lumina
API for legacy clients and rows.

## Keystone-rendered showcase

The `/showcase` route is a **public Keystone Admin UI page** configured through
`ui.publicPages`. Published rows with `html` are rendered in a sandboxed
`srcDoc` iframe:

- `sandbox="allow-scripts"` with no same-origin access.
- A document-level CSP allows inline styles and scripts only, and blocks
  network, form, and base-URL access.
- Closing `</style>` and `</script>` sequences are escaped before injection.

Rows that predate the conversion still use the legacy React `Renderer` when
they have `content`/`tokens` but no `html`.

Other routes:

- `#embed` hides the showcase header for the in-site Lumina iframe.
- `#preview` keeps the legacy builder iframe and `postMessage` listener.
- The default view is the full public showcase.

The component catalog is editable in the Admin UI. The custom color-token field
view lives in `fields/color-token/` and is registered on the `Token.value` JSON
field with `ui.views`.

## Lumina API

`server.extendExpressApp` registers `/api/lumina/*`:

- `GET /api/lumina/health`
- `GET /api/lumina/charts`
- `GET /api/lumina/components?lesson=...`
- `POST /api/lumina/components`
- `GET|PATCH|DELETE /api/lumina/components/:id`

All component routes require:

```http
x-lumina-secret: <LUMINA_SECRET>
x-lumina-session: <browser session UUID>
```

The charts route requires the secret but no session header. It returns only
`track`/`published` from lessons and `kind`/`status`/`surface`/`createdAt` from
components. It never returns names, descriptions, code, or owner sessions, so
the Lumina frontend can build aggregate charts without exposing draft content.

Component-lab requests include `html`, `css`, and `js`. HTML is required and all
three fields are size-limited. Publishing a second version for the same session
and lesson unpublishes the previous one. Admin-surface components are always
rejected when published.

The shared secret keeps Keystone writes server-only. The Lumina frontend proxies
to these routes and never exposes the secret to the browser.

## Environment

```bash
DATABASE_URL=file:./data/keystone.db
SESSION_SECRET=...
LUMINA_SECRET=...
PORT=3003
WEB_ORIGIN=http://localhost:3000
KEYSTONE_PUBLIC_URL=http://localhost:3003
```

The Dockerized Lumina web service reaches this server at
`host.docker.internal:3003`. Keep Keystone on the host at port 3003, or update
the `KEYSTONE_URL`/`KEYSTONE_PUBLIC_URL` values in `../cms/compose.yaml` and the
frontend environment.
