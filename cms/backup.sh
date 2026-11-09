#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 is required. Install it with: sudo apt install sqlite3" >&2
  exit 1
fi

if [ ! -f data/database/data.db ]; then
  echo "Directus database not found at data/database/data.db" >&2
  exit 1
fi

mkdir -p backups
STAMP="$(date +%Y-%m-%d-%H%M)"

# SQLite's online backup is safe while Directus is running.
sqlite3 data/database/data.db ".backup 'backups/data-$STAMP.db'"
tar -czf "backups/uploads-$STAMP.tar.gz" -C data uploads 2>/dev/null || true

# Keep two weeks of backups.
find backups -type f -mtime +14 -delete

echo "Backup written to cms/backups/data-$STAMP.db and uploads-$STAMP.tar.gz"
