# Installation & Setup

Lumina Academy is one Next.js app (`frontend/`) with three CMS backends:
Directus (`cms/`), Payload (`payload/`), and Keystone (`keystone/`).
`backend/` is an unused Laravel skeleton — ignore it.

## 1. What runs where

| Service | Folder | Runtime | Port | URL |
|---|---|---|---|---|
| Lumina Academy | `frontend/` | Node (dev) or Docker (`web`) | 3000 | http://localhost:3000 |
| Directus 12 | `cms/` | Docker Compose | 8055 | http://localhost:8055 |
| Payload 3 | `payload/` | Node | 3002 | http://localhost:3002/admin |
| Keystone 6 | `keystone/` | Node | 3003 | http://localhost:3003/ |

In development Directus is the only Docker service; the three Node apps run on
the host. In the production-like stack, `frontend/` is built into the `web`
container and Payload/Keystone still run on the host.

## 2. Prerequisites

- Node **22.23.4+** (Payload also accepts **24.22.1+**; Node 24.14.0 works but
  is below Payload's declared floor).
- npm 10+.
- Docker Engine with Compose v2 (`docker compose version`).
- Free ports `3000`, `3002`, `3003`, `8055`.
- ~3 GB disk for the three `node_modules` trees plus the Directus image.

```bash
node -v && npm -v && docker compose version
```

## 3. One-time setup

### 3.1 Environment files

```bash
cd ~/SAM/directus
cp cms/.env.example cms/.env
cp payload/.env.example payload/.env
cp keystone/.env.example keystone/.env
```

Create `frontend/.env.local`:

```dotenv
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=<cms DIRECTUS_ADMIN_TOKEN>
DIRECTUS_WS_URL=ws://localhost:8055/websocket
LAB_SECRET=<cms LAB_SECRET>

PAYLOAD_URL=http://localhost:3002
PAYLOAD_PUBLIC_URL=http://localhost:3002
PAYLOAD_API_KEY=<payload PAYLOAD_API_KEY>

KEYSTONE_URL=http://localhost:3003
KEYSTONE_PUBLIC_URL=http://localhost:3003
KEYSTONE_SECRET=<keystone LUMINA_SECRET>
```

These values must match across files:

| Secret | Files |
|---|---|
| Directus admin token | `cms/.env` `DIRECTUS_ADMIN_TOKEN` = `frontend/.env.local` `DIRECTUS_TOKEN` |
| Lab secret | `cms/.env` `LAB_SECRET` = `frontend/.env.local` `LAB_SECRET` |
| Payload API key | `payload/.env` `PAYLOAD_API_KEY` = `cms/.env` `PAYLOAD_API_KEY` = `frontend/.env.local` `PAYLOAD_API_KEY` |
| Keystone secret | `keystone/.env` `LUMINA_SECRET` = `cms/.env` `KEYSTONE_SECRET` = `frontend/.env.local` `KEYSTONE_SECRET` |

Generate values with `openssl rand -hex 32`.

Set `MOCK_API_URL` in `cms/.env`:

- Development (Next on the host): `http://host.docker.internal:3000`
- Full Docker stack (`web` container): `http://web:3000`

### 3.2 Install dependencies

```bash
(cd payload && npm ci)
(cd keystone && npm ci)
(cd frontend && npm ci)
```

Directus needs no install; its image and the prebuilt extensions in
`cms/extensions/*/dist` are ready. If Keystone's schema changes, run
`(cd keystone && npx prisma db push)` before starting it.

### 3.3 Data directories

```bash
mkdir -p cms/data/database cms/data/uploads
sudo chown -R 1000:1000 cms/data
```

The Directus container runs as uid 1000. On a local-only machine,
`chmod -R 777 cms/data` is an acceptable fallback.

### 3.4 First seed

```bash
docker compose -f cms/compose.yaml up -d directus
until curl -fsS http://localhost:8055/server/ping >/dev/null; do sleep 2; done

docker compose -f cms/compose.yaml exec -T directus node /seed/seed.mjs
(cd payload && npm run seed)
(cd keystone && npm run seed)   # optional; Keystone also seeds on first connect
```

- The Directus seed **overwrites** the eight lessons and the lab Flows on every
  run. Run it once, then edit content in Directus Studio.
- The Payload seed upserts users, lessons, catalog, and sample components.
- The Keystone seed is idempotent; `keystone dev` also seeds empty data on connect.

`./run.sh up` performs the first seed automatically when the SQLite files are
missing.

## 4. Run — development (recommended)

```bash
./run.sh up      # Directus in Docker + Payload, Keystone, frontend on the host
./run.sh status
```

`run.sh` is a thin wrapper around the commands below. It stops the Docker `web`
service first, because that container also binds port 3000.

Manual equivalent, four terminals:

```bash
docker compose -f cms/compose.yaml up -d directus
(cd payload && npm run dev)     # 3002
(cd keystone && npm run dev)    # 3003
(cd frontend && npm run dev)    # 3000
```

> Do **not** run `docker compose up` (without `-d directus`) while the frontend
> dev server is running. The `web` container binds 3000, so Next falls back to
> 3001 and the Payload/Keystone iframe URLs break.

Stop with `./run.sh down`.

## 5. Run — production-like (Docker web)

```bash
docker compose -f cms/compose.yaml up -d --build
```

This builds `frontend/` into the `web` container and starts Directus. Payload and
Keystone must still be running on the host at 3002/3003; the container reaches
them through `host.docker.internal`. Rebuild after frontend changes:

```bash
docker compose -f cms/compose.yaml build web
docker compose -f cms/compose.yaml up -d web
```

Return to development with `./run.sh down && ./run.sh up`.

## 6. Verify

```bash
curl -fsS http://localhost:8055/server/ping; echo
curl -fsS http://localhost:3002/api/lumina/health; echo
curl -fsS http://localhost:3003/api/lumina/health; echo
curl -fsS -o /dev/null -w '%{http_code}\n' http://localhost:3000/
curl -fsS http://localhost:3000/api/lab/health; echo
curl -fsS http://localhost:3000/api/lab/payload/health; echo
curl -fsS http://localhost:3000/api/lab/keystone/health; echo
```

| Surface | URL |
|---|---|
| Lumina Academy | http://localhost:3000 |
| Directus Studio | http://localhost:8055 |
| Payload Admin | http://localhost:3002/admin |
| Payload Showcase | http://localhost:3002/showcase |
| Keystone Admin | http://localhost:3003/ |
| Keystone Showcase | http://localhost:3003/showcase |

Course entry points:

```
/courses/directus-from-beginner-to-advanced/advanced
/courses/payload-cms/advanced
/courses/keystonejs/advanced
```

## 7. Credentials

| Service | Credentials |
|---|---|
| Directus | `cms/.env`: `DIRECTUS_ADMIN_EMAIL`, `DIRECTUS_ADMIN_PASSWORD` |
| Payload | `payload/.env`: `PAYLOAD_ADMIN_EMAIL`, `PAYLOAD_ADMIN_PASSWORD` (default `admin@lumina.local` / `lumina-payload-admin`) |
| Keystone | `keystone/.env`: `KEYSTONE_ADMIN_EMAIL`, `KEYSTONE_ADMIN_PASSWORD` (default `admin@lumina.local` / `lumina-keystone-admin`) |

These are local development defaults. Change them before exposing any port
beyond localhost.

## 8. Common tasks

| Task | Command |
|---|---|
| Start / stop | `./run.sh up` / `./run.sh down` |
| Restart | `./run.sh restart` |
| Health | `./run.sh status` |
| Follow logs | `./run.sh logs` or `./run.sh logs payload` |
| Reseed | `./run.sh seed` (stops and restarts Payload) |
| Directus logs | `./run.sh logs directus` |
| Rebuild web | `docker compose -f cms/compose.yaml build web && docker compose -f cms/compose.yaml up -d web` |
| Backup | `(cd cms && ./backup.sh)` — needs `sqlite3` |
| Update Directus | `docker compose -f cms/compose.yaml pull directus && docker compose -f cms/compose.yaml up -d` |
| Reset all data | `./run.sh reset` (prompts) |

`./run.sh seed` re-runs the Directus seed, which overwrites lessons and Flows.
Use it for a fresh database, not after editing course content in Studio.

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| Next starts on 3001 / `port 3000 is in use` | The Docker `web` container is running: `./run.sh down`, then `./run.sh up`. |
| `SQLITE_CANTOPEN` | `sudo chown -R 1000:1000 cms/data` (or `chmod -R 777 cms/data` locally). |
| Lumina shows "Offline content" | Directus is down, or `frontend/.env.local` `DIRECTUS_TOKEN` ≠ `cms/.env` `DIRECTUS_ADMIN_TOKEN`. |
| Payload/Keystone lessons are empty | The service is not running, or `PAYLOAD_URL`/`KEYSTONE_URL` is wrong. Check `./run.sh status`. |
| `components-render` returns 401 | `LAB_SECRET` differs between `cms/.env` and `frontend/.env.local`. |
| Keystone showcase is blank on first load | Reload once; the custom Admin UI page compiles on first request. |
| Keystone fails with missing tables/columns | `(cd keystone && npx prisma db push)`, then restart. |
| Directus unhealthy | `./run.sh logs directus`; verify `MOCK_API_URL` and that port 3000 is the Lumina app. |
| Weather/order lab returns 401 | `LAB_SECRET` must match in `cms/.env` and `frontend/.env.local`. |

## 10. Reset

```bash
./run.sh reset          # asks for confirmation
./run.sh reset --yes    # no prompt
```

This deletes `cms/data/database/data.db`, `payload/data/payload.db`, and
`keystone/data/keystone.db` (including learner submissions), then restarts and
reseeds. Back up first with `(cd cms && ./backup.sh)`.

## 11. LAN / Raspberry Pi

Set the browser-facing origins in `cms/.env` and restart:

```dotenv
DIRECTUS_PUBLIC_URL=http://<host-ip>:8055
PAYLOAD_PUBLIC_URL=http://<host-ip>:3002
KEYSTONE_PUBLIC_URL=http://<host-ip>:3003
WEB_ORIGIN=http://<host-ip>:3000
MOCK_API_URL=http://web:3000
```

Also set `PAYLOAD_PUBLIC_URL` and `KEYSTONE_PUBLIC_URL` in `frontend/.env.local`
to the same host addresses, and leave `DIRECTUS_WS_URL` empty so the app derives
`ws://<host-ip>:8055/websocket`. Keep port 8055 on the LAN; do not expose
Directus Studio to the internet.

See `cms/README.md` for the full Raspberry Pi deployment and backup notes.
