#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./restore.sh /path/to/backup.sql.gz
# Requires env: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

BACKUP_FILE="${1:?path to backup .sql or .sql.gz required}"

echo "Restoring $BACKUP_FILE into $PGDATABASE"
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | psql "$PGDATABASE"
else
  psql "$PGDATABASE" < "$BACKUP_FILE"
fi
echo "Restore completed."
