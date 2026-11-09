# Running Lumina Academy on Windows

This is the Windows equivalent of `run.sh`. It starts the entire development
stack from one terminal:

- **Directus 12** in Docker (port `8055`)
- **Payload 3** on the host (port `3002`)
- **Keystone 6** on the host (port `3003`)
- **Lumina Academy / Next.js** on the host (port `3000`)

The legacy `backend/` Laravel skeleton is unused and is not started.

The entry point is `run.cmd`, which calls `run.ps1` with the correct PowerShell
execution policy. You do not need to change your machine-wide policy.

---

## 1. Prerequisites

Install these once:

| Requirement | Notes |
|---|---|
| **Windows 10/11** | Windows Terminal or PowerShell 5.1+ |
| **Docker Desktop** | Use the WSL 2 backend and make sure it is **running** before `up` |
| **Node.js** | `22.23.4+` or `24.22.1+` (Payload requirement); npm is included |
| **Free ports** | `3000`, `3002`, `3003`, `8055` |
| **Disk space** | ~3 GB for dependencies, Docker image, and databases |

Check the versions in PowerShell:

```powershell
node -v
npm -v
docker compose version
```

> Keep the project on a local drive such as `C:\dev\directus`. OneDrive,
> network shares, and paths with unusual permissions can make SQLite and npm
> slow or unreliable.

---

## 2. Quick start (one command)

Open PowerShell in the project folder and run:

```powershell
cd C:\dev\directus
.\run.cmd start
```

`start` does the one-time setup and then starts every service:

1. Creates `cms/.env`, `payload/.env`, `keystone/.env` if they are missing.
2. Generates random secrets and makes the shared secrets match across files.
3. Creates `frontend/.env.local` with the generated tokens.
4. Creates the SQLite/media folders.
5. Runs `npm ci` for `payload`, `keystone`, and `frontend` when needed.
6. Starts Directus in Docker and waits for it to become healthy.
7. Seeds Directus and Payload automatically on a fresh database.
8. Starts Payload, Keystone, and the frontend on the host.

The first run takes several minutes because Docker pulls the Directus image and
the three dependency trees are installed. Later runs only start the services.

If you have already run setup, use:

```powershell
.\run.cmd up
```

### Prefer double-clicking?

- `start.cmd` runs setup + up and keeps the window open so you can read the
  URLs and any errors.
- `stop.cmd` stops everything and keeps the window open.

The PowerShell commands below are still the recommended way to work, because
the window shows live progress.

---

## 3. Access URLs

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
http://localhost:3000/courses/directus-from-beginner-to-advanced/advanced
http://localhost:3000/courses/payload-cms/advanced
http://localhost:3000/courses/keystonejs/advanced
```

### Credentials

`setup` prints the credentials when it finishes. They are also stored in the
environment files:

| Service | Where to look | Default |
|---|---|---|
| Directus | `cms/.env` → `DIRECTUS_ADMIN_EMAIL`, `DIRECTUS_ADMIN_PASSWORD` | `admin@example.com` / `LuminaAdmin123!` |
| Payload | `payload/.env` → `PAYLOAD_ADMIN_EMAIL`, `PAYLOAD_ADMIN_PASSWORD` | `admin@lumina.local` / `lumina-payload-admin` |
| Keystone | `keystone/.env` → `KEYSTONE_ADMIN_EMAIL`, `KEYSTONE_ADMIN_PASSWORD` | `admin@lumina.local` / `lumina-keystone-admin` |

These are local-development defaults. Change them before exposing any port
beyond `localhost`.

---

## 4. Daily commands

Run these from the project folder in PowerShell:

| Task | Command |
|---|---|
| Start everything | `.\run.cmd up` |
| Start everything after a fresh checkout | `.\run.cmd start` |
| Stop everything | `.\run.cmd down` |
| Restart | `.\run.cmd restart` |
| Health / process summary | `.\run.cmd status` |
| Follow all host logs | `.\run.cmd logs` |
| Follow one service | `.\run.cmd logs payload` |
| Directus container logs | `.\run.cmd logs directus` |
| Reseed everything | `.\run.cmd seed` |
| Reinstall dependencies | `.\run.cmd setup -Force` |
| Delete databases and reseed | `.\run.cmd reset` |
| Delete without confirmation | `.\run.cmd reset --yes` |
| Show help | `.\run.cmd help` |

### What `status` should look like

```text
SERVICE   STATE        URL
-------   -----        ---
directus  docker       http://localhost:8055/server/ping
frontend  pid 12345    http://localhost:3000/
payload   pid 12346    http://localhost:3002/api/lumina/health
keystone  pid 12347    http://localhost:3003/api/lumina/health

  directus  ok
  payload   ok
  keystone  ok
  frontend  ok
```

---

## 5. How the Windows script differs from `run.sh`

The commands and behaviour mirror `run.sh`, with a few Windows-specific
improvements:

| Topic | Windows behaviour |
|---|---|
| Setup | Generates secrets automatically and writes `frontend/.env.local`, instead of asking you to copy values by hand |
| Secrets | Keeps `PAYLOAD_API_KEY` and `KEYSTONE_SECRET`/`LUMINA_SECRET` in sync across all env files |
| `MOCK_API_URL` | Set to `http://host.docker.internal:3000` because the frontend runs on the host, not in the Docker `web` container |
| Dependencies | Detects a `node_modules` tree copied from Linux/macOS (no `.cmd` shims) and reinstalls it |
| Processes | Started hidden with `cmd.exe`; PIDs and logs live in `.run\` |
| Logs | `.\run.cmd logs` follows all host logs from one terminal |
| Docker `web` | Stopped automatically before `up`, because it also binds port `3000` |

`.\run.cmd down` stops the host processes and the Compose stack. The Directus
data stays in `cms\data`, so the next `up` reuses it.

---

## 6. Seeding and data

The first `up` seeds automatically when the SQLite files are missing:

- **Directus** runs `node /seed/seed.mjs` inside the container.
- **Payload** runs `npm run seed` from `payload\`.
- **Keystone** seeds itself when it first connects to the database.

Manual reseed:

```powershell
.\run.cmd seed
```

> The Directus seed **overwrites** the lessons and lab Flows. Use it on a fresh
> database, not after editing course content in Directus Studio.

Reset everything, including learner submissions:

```powershell
.\run.cmd reset
```

This deletes:

```
cms\data\database\data.db*
payload\data\payload.db*
keystone\data\keystone.db*
```

then restarts and reseeds. Back up first if you need the data.

---

## 7. Environment files

`setup` creates these files:

| File | Purpose |
|---|---|
| `cms\.env` | Directus secrets, admin account, mock API URL, Payload/Keystone links |
| `payload\.env` | Payload database, admin account, service API key |
| `keystone\.env` | Keystone database, admin account, session and Lumina secrets |
| `frontend\.env.local` | URLs and tokens used by Next.js |

The shared values must match:

| Value | Files |
|---|---|
| Directus admin token | `cms\.env` `DIRECTUS_ADMIN_TOKEN` = `frontend\.env.local` `DIRECTUS_TOKEN` |
| Lab secret | `cms\.env` `LAB_SECRET` = `frontend\.env.local` `LAB_SECRET` |
| Payload API key | `payload\.env` = `cms\.env` = `frontend\.env.local` |
| Keystone secret | `keystone\.env` `LUMINA_SECRET` = `cms\.env` `KEYSTONE_SECRET` = `frontend\.env.local` `KEYSTONE_SECRET` |

If you edit a secret by hand, run `.\run.cmd setup` again to resynchronise the
files, then `.\run.cmd restart`.

### LAN / Raspberry Pi mode

The Windows script is development-oriented:

```dotenv
MOCK_API_URL=http://host.docker.internal:3000
```

For the production-like Docker stack (frontend inside the `web` container),
set `MOCK_API_URL=http://web:3000` and use:

```powershell
docker compose -f cms/compose.yaml up -d --build
```

Payload and Keystone still run on the host at `3002`/`3003`; the containers
reach them through `host.docker.internal`. Return to development with:

```powershell
.\run.cmd down
.\run.cmd up
```

---

## 8. Running services manually (optional)

If you prefer separate terminals instead of `run.cmd`, use four PowerShell
windows:

```powershell
# Terminal 1 - Directus
docker compose -f cms/compose.yaml up -d directus

# Terminal 2 - Payload (3002)
cd payload
npm run dev

# Terminal 3 - Keystone (3003)
cd keystone
npm run dev

# Terminal 4 - Lumina Academy (3000)
cd frontend
npm run dev
```

> Do **not** run `docker compose up` without `-d directus` while the frontend
> dev server is running. The `web` container also binds port `3000`, so Next
> falls back to `3001` and the Payload/Keystone iframes break.

Stop the host services with `Ctrl+C` in each terminal, then:

```powershell
docker compose -f cms/compose.yaml stop
```

---

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| `run.ps1 cannot be loaded because running scripts is disabled` | Use `.\run.cmd ...` instead of calling `run.ps1` directly. `run.cmd` uses `-ExecutionPolicy Bypass` for that process only. |
| `Docker is not running` | Start **Docker Desktop** and wait for the whale icon to say "Engine running", then retry. |
| `missing required command: docker` | Docker Desktop is not on `PATH`. Open a new terminal after installing it, or add `C:\Program Files\Docker\Docker\resources\bin` to `PATH`. |
| `port 3000 is in use` | A previous frontend or the Docker `web` container is running. Run `.\run.cmd down`, then `.\run.cmd up`. |
| `port 8055 is in use` | Another Directus/Compose stack is running. Stop it with `docker compose ls` / `docker compose down`, then retry. |
| Next starts on `3001` | Port `3000` was occupied. `.\run.cmd down` then `.\run.cmd up`. |
| `SQLITE_CANTOPEN` or a locked database | Stop everything with `.\run.cmd down`, then move the project out of OneDrive/network shares. Check that `cms\data` is writable. |
| `better-sqlite3` / native module error | Your `node_modules` was built for another OS or Node version. Run `.\run.cmd setup -Force` (this runs `npm ci`), or install the matching Node version. If npm tries to compile it, install Python 3 and Visual Studio Build Tools with the **Desktop development with C++** workload. |
| `npm ci` fails with EPERM / EACCES | Close editors and terminals using the project, then retry. Antivirus can also lock `node_modules` briefly. |
| Node version warning | Install Node `22.23.4+` or `24.22.1+` and rerun `.\run.cmd setup -Force`. |
| Directus is unhealthy | `.\run.cmd logs directus`, then check the `cms\.env` values and that port `8055` is free. |
| Lumina shows "Offline content" | Directus is down, or `DIRECTUS_TOKEN` in `frontend\.env.local` does not match `cms\.env`. Run `.\run.cmd setup` and restart. |
| Payload / Keystone lessons are empty | The service is not running, or its URL is wrong. Check `.\run.cmd status`. |
| `components-render` returns `401` | `LAB_SECRET` differs between `cms\.env` and `frontend\.env.local`. Run `.\run.cmd setup`, then restart. |
| Keystone fails with missing tables/columns | `cd keystone`, then `npx prisma db push`, then `.\run.cmd restart`. |
| Keystone showcase blank on first load | Reload once; the custom Admin UI page compiles on first request. |
| Windows Firewall prompt | Allow Docker Desktop and Node.js on private networks. The services only need `localhost`. |
| First startup is very slow | The Directus image is being downloaded and Next/Payload are compiling. Watch `.\run.cmd logs` and give it a few minutes. |

### Getting a clean slate

```powershell
.\run.cmd down
Remove-Item -Recurse -Force .run
.\run.cmd setup -Force
.\run.cmd up
```

For a database reset as well, use `.\run.cmd reset --yes`.

---

## 10. Files added for Windows

| File | Purpose |
|---|---|
| `run.cmd` | Small launcher; picks PowerShell 7 (`pwsh`) or Windows PowerShell |
| `run.ps1` | Full runner: setup, start, up, down, restart, status, logs, seed, reset |
| `start.cmd` | Double-click helper for `setup` + `up` |
| `stop.cmd` | Double-click helper for `down` |
| `WINDOWS.md` | This guide |

The existing `run.sh`, `SETUP.md`, and other Linux/macOS documentation are
unchanged and still apply.
