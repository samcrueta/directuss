# NEW_SETUP - Lumina Academy Installation Guide

## Quick Install (3 commands)

```bash
cd ~/SAM/directus
./run.sh setup
./run.sh up
./run.sh status
```

## Prerequisites

- **Node** 22.23.4+ (24.22.1+ works for Payload)
- **npm** 10+
- **Docker** with Compose v2
- Free ports: 3000, 3002, 3003, 8055

## One-Time Setup

```bash
# Copy environment templates
cp cms/.env.example cms/.env
cp payload/.env.example payload/.env
cp keystone/.env.example keystone/.env

# Create frontend env
cat > frontend/.env.local <<EOF
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=<cms DIRECTUS_ADMIN_TOKEN>
LAB_SECRET=<cms LAB_SECRET>
PAYLOAD_URL=http://localhost:3002
KEYSTONE_URL=http://localhost:3003
EOF

# Generate all secrets
for service in cms payload keystone; do
  echo "=== $service secret ==="
  openssl rand -hex 32
  echo
Done

# Set secrets in env files (replace placeholder values)
# Use the generated hex values above
```

## First Run Seed

```bash
# Start Directus (Docker)
docker compose -f cms/compose.yaml up -d directus

# Wait for Directus
until curl -fsS http://localhost:8055/server/ping; do sleep 2; done

# Seed all databases
docker compose -f cms/compose.yaml exec -T directus node /seed/seed.mjs
(cd payload && npm run seed)
(cd keystone && npm run seed)
```

## Quick Verification

```bash
# Check if everything is healthy
./run.sh status
```

## Success! Access URLs

- **Lumina Academy**: http://localhost:3000
- **Directus Studio**: http://localhost:8055 (admin:password)
- **Payload Admin**: http://localhost:3002/admin (admin@lumina.local:lumina-payload-admin)
- **Keystone Admin**: http://localhost:3003/ (admin@lumina.local:lumina-keystone-admin)

## Course Entry Points

- Directus: http://localhost:3000/courses/directus-from-beginner-to-advanced/advanced
- Payload: http://localhost:3000/courses/payload-cms/advanced
- Keystone: http://localhost:3000/courses/keystonejs/advanced

## Need Help?

**Common Issues:**
- `"port 3000 is in use"`: `./run.sh down && ./run.sh up`
- `SQLite errors`: `sudo chown -R 1000:1000 cms/data`
- `Missing lessons`: Check all services with `./run.sh status`

**Get logs:** `./run.sh logs [directus|payload|keystone|frontend]`

**Full docs:** SETUP.md