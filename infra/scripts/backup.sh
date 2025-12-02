#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./backup.sh /path/to/backups
# Requires env: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

DEST_DIR="${1:-./backups}"
mkdir -p "$DEST_DIR"
STAMP=$(date +"%Y%m%d-%H%M%S")
FILE="$DEST_DIR/georise-${PGDATABASE}-${STAMP}.sql.gz"

echo "Creating backup at $FILE"
pg_dump --format=plain --no-owner --no-privileges "$PGDATABASE" | gzip > "$FILE"
echo "Backup completed."
