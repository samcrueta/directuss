#!/usr/bin/env bash
# Lumina Academy local runner.
#
#   ./run.sh setup     copy env examples, create data dirs, install deps
#   ./run.sh up        Directus in Docker + Payload, Keystone, frontend on the host
#   ./run.sh down      stop host services and the Docker stack
#   ./run.sh restart   down + up
#   ./run.sh status    process and health summary
#   ./run.sh logs [directus|payload|keystone|frontend|all]
#   ./run.sh seed      reseed Directus, Payload, Keystone
#   ./run.sh reset     delete all local databases, restart, reseed
#
# Run from anywhere; paths are resolved from this script's directory.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

export NEXT_TELEMETRY_DISABLED=1

COMPOSE=(docker compose -f cms/compose.yaml)
RUN_DIR="$ROOT/.run"
HOST_SERVICES=(frontend keystone payload)

log()  { printf '%s\n' "$*"; }
warn() { printf 'warning: %s\n' "$*" >&2; }
die()  { printf 'error: %s\n' "$*" >&2; exit 1; }

need() { command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"; }

port_of() {
  case "$1" in
    frontend) echo 3000 ;;
    payload)  echo 3002 ;;
    keystone) echo 3003 ;;
    directus) echo 8055 ;;
    *) die "unknown service: $1" ;;
  esac
}

health_of() {
  case "$1" in
    frontend) echo "http://localhost:3000/" ;;
    payload)  echo "http://localhost:3002/api/lumina/health" ;;
    keystone) echo "http://localhost:3003/api/lumina/health" ;;
    directus) echo "http://localhost:8055/server/ping" ;;
    *) die "unknown service: $1" ;;
  esac
}

pid_file() { printf '%s/%s.pid' "$RUN_DIR" "$1"; }
log_file() { printf '%s/%s.log' "$RUN_DIR" "$1"; }

is_running() {
  local pf pid
  pf="$(pid_file "$1")"
  [[ -f "$pf" ]] || return 1
  pid="$(cat "$pf" 2>/dev/null || true)"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

healthy() {
  curl -fsS -o /dev/null --max-time 3 "$(health_of "$1")" 2>/dev/null
}

port_in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | awk 'NR > 1 { print $4 }' | grep -qE "[:.]${port}$"
  else
    curl -fsS -o /dev/null --max-time 1 "http://127.0.0.1:${port}/" 2>/dev/null
  fi
}

docker_ok() { docker info >/dev/null 2>&1; }

compose_running() {
  "${COMPOSE[@]}" ps --status running --format '{{.Service}}' 2>/dev/null | grep -qx "$1"
}

wait_for() {
  local name="$1" url="$2" seconds="${3:-180}" i
  for ((i = 1; i <= seconds; i++)); do
    if curl -fsS -o /dev/null --max-time 2 "$url" 2>/dev/null; then
      log "  $name ready ($url)"
      return 0
    fi
    sleep 1
  done
  return 1
}

start_service() {
  local svc="$1" dir="$2" out pid

  if is_running "$svc"; then
    log "  $svc already running (pid $(cat "$(pid_file "$svc")"))"
    return 0
  fi

  if [[ "$svc" != frontend ]] && healthy "$svc"; then
    log "  $svc already responding on :$(port_of "$svc") (started outside run.sh)"
    return 0
  fi

  if port_in_use "$(port_of "$svc")"; then
    if [[ "$svc" == frontend ]]; then
      die "port 3000 is in use (Docker 'web' container?). Run ./run.sh down first."
    fi
    die "port $(port_of "$svc") is in use by another process; stop it first."
  fi

  mkdir -p "$RUN_DIR"
  out="$(log_file "$svc")"
  : >"$out"

  if command -v setsid >/dev/null 2>&1; then
    ( cd "$dir" && exec setsid bash -c 'exec npm run dev' ) >"$out" 2>&1 &
  else
    ( cd "$dir" && exec nohup npm run dev ) >"$out" 2>&1 &
  fi
  pid=$!
  printf '%s\n' "$pid" >"$(pid_file "$svc")"
  log "  $svc started (pid $pid, log .run/$svc.log)"
}

stop_service() {
  local svc="$1" pf pid i
  pf="$(pid_file "$svc")"
  [[ -f "$pf" ]] || return 0
  pid="$(cat "$pf" 2>/dev/null || true)"
  rm -f "$pf"
  [[ -n "$pid" ]] || return 0
  kill -0 "$pid" 2>/dev/null || return 0

  kill -TERM "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  for ((i = 0; i < 20; i++)); do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.25
  done
  if kill -0 "$pid" 2>/dev/null; then
    kill -KILL "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
  fi
  log "  $svc stopped"
}

cmd_setup() {
  need node
  need npm
  need docker

  log "==> environment files"
  [[ -f cms/.env ]]      || { cp cms/.env.example cms/.env;           log "  created cms/.env"; }
  [[ -f payload/.env ]]  || { cp payload/.env.example payload/.env;   log "  created payload/.env"; }
  [[ -f keystone/.env ]] || { cp keystone/.env.example keystone/.env; log "  created keystone/.env"; }
  [[ -f frontend/.env.local ]] || warn "frontend/.env.local is missing — create it from SETUP.md §3.1"

  log "==> data directories"
  mkdir -p cms/data/database cms/data/uploads
  if ! chown -R 1000:1000 cms/data 2>/dev/null; then
    warn "could not chown cms/data to 1000:1000; run: sudo chown -R 1000:1000 cms/data"
  fi

  log "==> dependencies"
  local d
  for d in payload keystone frontend; do
    if [[ -d "$d/node_modules" && "${FORCE:-0}" != "1" ]]; then
      log "  $d: node_modules present (FORCE=1 to reinstall)"
    else
      log "  $d: npm ci"
      ( cd "$d" && npm ci )
    fi
  done

  log ""
  log "Review cms/.env, payload/.env, keystone/.env and create frontend/.env.local."
  log "Then run: ./run.sh up"
}

cmd_up() {
  need docker
  need curl
  docker_ok || die "Docker is not running"

  local f
  for f in cms/.env payload/.env keystone/.env frontend/.env.local; do
    [[ -f "$f" ]] || die "$f is missing; run ./run.sh setup and fill it in (SETUP.md §3.1)"
  done

  local fresh_directus=0 fresh_payload=0
  [[ -f cms/data/database/data.db ]] || fresh_directus=1
  [[ -f payload/data/payload.db ]]   || fresh_payload=1

  if compose_running web; then
    log "==> stopping Docker web (dev frontend needs port 3000)"
    "${COMPOSE[@]}" stop web
  fi

  log "==> Directus"
  "${COMPOSE[@]}" up -d directus
  wait_for directus "$(health_of directus)" 90 \
    || die "Directus did not become healthy; run: ./run.sh logs directus"

  if [[ "$fresh_directus" -eq 1 ]]; then
    log "==> first run: seeding Directus"
    "${COMPOSE[@]}" exec -T directus node /seed/seed.mjs
  fi

  if [[ "$fresh_payload" -eq 1 ]]; then
    log "==> first run: seeding Payload"
    ( cd payload && npm run seed )
  fi

  log "==> Payload"
  start_service payload payload
  wait_for payload "$(health_of payload)" 180 \
    || die "Payload did not become healthy; run: ./run.sh logs payload"

  log "==> Keystone"
  start_service keystone keystone
  wait_for keystone "$(health_of keystone)" 180 \
    || die "Keystone did not become healthy; run: ./run.sh logs keystone"

  log "==> Lumina Academy"
  start_service frontend frontend
  wait_for frontend "$(health_of frontend)" 180 \
    || die "Frontend did not become healthy; run: ./run.sh logs frontend"

  log ""
  log "Lumina Academy  http://localhost:3000"
  log "Directus Studio http://localhost:8055"
  log "Payload Admin   http://localhost:3002/admin"
  log "Keystone Admin  http://localhost:3003/"
  log ""
  log "Next: ./run.sh status | ./run.sh logs | ./run.sh down"
}

cmd_down() {
  log "==> host services"
  local svc
  for svc in "${HOST_SERVICES[@]}"; do
    stop_service "$svc"
  done

  if command -v docker >/dev/null 2>&1 && docker_ok; then
    log "==> docker"
    "${COMPOSE[@]}" stop
  fi
  log "stopped"
}

cmd_status() {
  need curl
  local svc state

  printf '%-9s %-22s %s\n' "SERVICE" "STATE" "URL"
  for svc in directus frontend payload keystone; do
    if [[ "$svc" == directus ]]; then
      if docker_ok && compose_running directus; then state="docker"; else state="stopped"; fi
    elif is_running "$svc"; then
      state="pid $(cat "$(pid_file "$svc")")"
    elif healthy "$svc"; then
      state="external"
    else
      state="stopped"
    fi
    printf '%-9s %-22s %s\n' "$svc" "$state" "$(health_of "$svc")"
  done

  log ""
  for svc in directus payload keystone frontend; do
    if healthy "$svc"; then
      printf '  %-9s ok\n' "$svc"
    else
      printf '  %-9s FAIL\n' "$svc"
    fi
  done

  if port_in_use 3000 && ! is_running frontend; then
    warn "port 3000 is held by another process (probably lumina-web-1); frontend dev cannot start"
  fi
}

cmd_logs() {
  local target="${1:-all}" files
  mkdir -p "$RUN_DIR"
  case "$target" in
    directus)
      "${COMPOSE[@]}" logs -f --tail=100 directus
      ;;
    frontend|payload|keystone)
      [[ -f "$(log_file "$target")" ]] || die "no log yet: .run/$target.log"
      tail -n 100 -f "$(log_file "$target")"
      ;;
    all)
      files=("$RUN_DIR"/*.log)
      [[ -e "${files[0]}" ]] || die "no service logs yet"
      tail -n 40 -f "${files[@]}"
      ;;
    *)
      die "usage: ./run.sh logs [directus|payload|keystone|frontend|all]"
      ;;
  esac
}

cmd_seed() {
  need docker
  need curl
  docker_ok || die "Docker is not running"
  compose_running directus || die "Directus is not running; run ./run.sh up first"

  local payload_was_running=0

  log "==> Directus seed"
  "${COMPOSE[@]}" exec -T directus node /seed/seed.mjs

  if is_running payload; then
    payload_was_running=1
    stop_service payload
  fi
  log "==> Payload seed"
  ( cd payload && npm run seed )
  if [[ "$payload_was_running" -eq 1 ]]; then
    start_service payload payload
    wait_for payload "$(health_of payload)" 180 \
      || die "Payload did not restart; run: ./run.sh logs payload"
  fi

  if is_running keystone; then
    log "==> Keystone is running; it seeds itself on connection (skipped)"
  else
    log "==> Keystone seed"
    ( cd keystone && npm run seed )
  fi

  log "seed complete"
}

cmd_reset() {
  local confirm="${1:-}"
  if [[ "$confirm" != "--yes" ]]; then
    printf 'Delete all local databases (including learner submissions) and reseed? [y/N] '
    read -r answer
    [[ "$answer" =~ ^[Yy]$ ]] || { log "cancelled"; exit 0; }
  fi

  cmd_down
  log "==> deleting databases"
  rm -f cms/data/database/data.db cms/data/database/data.db-* \
        payload/data/payload.db payload/data/payload.db-* \
        keystone/data/keystone.db keystone/data/keystone.db-*
  cmd_up
}

usage() {
  cat <<'EOF'
Usage: ./run.sh <command>

  setup     Copy env examples, create data dirs, install dependencies
  up        Start Directus (Docker) + Payload, Keystone, frontend (host)
  down      Stop host services and the Docker stack
  restart   down + up
  status    Process and health summary
  logs      Follow logs: ./run.sh logs [directus|payload|keystone|frontend|all]
  seed      Reseed Directus, Payload, and Keystone
  reset     Delete local databases, restart, reseed (use --yes to skip prompt)
EOF
}

case "${1:-}" in
  setup)   cmd_setup ;;
  up)      cmd_up ;;
  down)    cmd_down ;;
  restart) cmd_down; cmd_up ;;
  status)  cmd_status ;;
  logs)    shift; cmd_logs "${1:-all}" ;;
  seed)    cmd_seed ;;
  reset)   shift; cmd_reset "${1:-}" ;;
  *)       usage ;;
esac
