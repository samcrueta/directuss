# Lumina Academy — Advanced Directus, Payload & Keystone

A focused learning workspace for three Level 7 courses and Level 8
advanced-graphs lessons for Directus, Payload, and Keystone in the legacy
Section 8 modules.

- `frontend/` — the Lumina Academy Next.js app. It contains:
  - the Advanced Directus workspace: five API/automation lessons and three UI/UX component labs
  - the Directus Level 8 advanced-graphs lesson in Section 8, plus the
    standalone charts lesson and live chart showcase
  - the Advanced Payload workspace: eight UI/UX lessons, an HTML/CSS/JS component editor, and an in-site showcase
  - the Payload Level 8 advanced-graphs lesson in Section 8, plus the
    standalone Payload charts lesson and live component showcase
  - the Advanced KeystoneJS workspace: eight UI/UX lessons, an HTML/CSS/JS component editor, and a Keystone-rendered showcase
  - the Keystone Level 8 advanced-graphs lesson in Section 8, plus the
    standalone Keystone charts lesson and live component showcase
- `cms/` — Directus 12, SQLite, lab Flows, the component renderer extension, seed script, and Raspberry Pi deployment notes.
- `payload/` — Payload 3 on SQLite: lessons, component catalog, learner submissions, showcase routes, and the admin panel.
- `keystone/` — Keystone 6 on SQLite: lessons, component catalog, learner submissions, public showcase pages, and custom Admin UI.
- `backend/` — unused Laravel skeleton; not part of the Level 7 experience.

## Advanced workspaces

| Course | Workspace |
|---|---|
| Directus | http://localhost:3000/courses/directus-from-beginner-to-advanced/advanced |
| Directus charts (Level 8) | http://localhost:3000/courses/directus-from-beginner-to-advanced/section-8-practical-projects-using-directus#directus-charts |
| Payload | http://localhost:3000/courses/payload-cms/advanced |
| Payload charts (Level 8) | http://localhost:3000/courses/payload-cms/payload-section-8-practical-projects-using-payload-cms#payload-charts |
| KeystoneJS | http://localhost:3000/courses/keystonejs/advanced |
| KeystoneJS charts (Level 8) | http://localhost:3000/courses/keystonejs/keystone-section-8-practical-projects-using-keystonejs#keystone-charts |

Each advanced-graphs lesson is the only subtopic in its legacy Section 8 route:

```
/courses/directus-from-beginner-to-advanced/section-8-practical-projects-using-directus#directus-charts
/courses/payload-cms/payload-section-8-practical-projects-using-payload-cms#payload-charts
/courses/keystonejs/keystone-section-8-practical-projects-using-keystonejs#keystone-charts
```

The standalone deep links remain available:

```
/courses/directus-from-beginner-to-advanced/charts
/courses/directus-from-beginner-to-advanced/charts/showcase
/courses/payload-cms/charts
/courses/payload-cms/charts/showcase
/courses/keystonejs/charts
/courses/keystonejs/charts/showcase
```

The other in-site showcases are available at:

```
/courses/payload-cms/showcase
/courses/keystonejs/showcase
```

## Local services

| Service | URL |
|---|---|
| Lumina Academy | http://localhost:3000 |
| Directus Studio | http://localhost:8055 |
| Payload Admin | http://localhost:3002/admin |
| Payload Showcase | http://localhost:3002/showcase |
| Keystone Admin | http://localhost:3003/ |
| Keystone Showcase | http://localhost:3003/showcase |

Start Directus with the Compose stack in `cms/compose.yaml`. Start Payload from
`payload/` with `npm run dev` (port 3002). Start Keystone from `keystone/` with
`npm run dev` (port 3003); it auto-seeds on the first connection.

The frontend reads Payload and Keystone through server-side environment
variables and keeps both service credentials server-only. See
`frontend/README.md` for the full environment and Docker rebuild instructions.

On Windows, use [`WINDOWS.md`](WINDOWS.md) and `.\run.cmd start` instead of
`run.sh`.

Start here: [`SETUP.md`](SETUP.md), [`WINDOWS.md`](WINDOWS.md),
[`frontend/README.md`](frontend/README.md), [`cms/README.md`](cms/README.md),
[`payload/README.md`](payload/README.md), and
[`keystone/README.md`](keystone/README.md).
