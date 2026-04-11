#!/bin/bash
set -e

# ============================================================================
# Pochak DB Initialization Script
# Runs migrations first, then seed data, in alphabetical order.
# Executed by PostgreSQL docker-entrypoint-initdb.d on first container start.
# ============================================================================

echo "=========================================="
echo "  Pochak DB Init: Running migrations..."
echo "=========================================="

for f in /docker-entrypoint-initdb.d/migrations/V*.sql; do
    if [ -f "$f" ]; then
        echo "  → $(basename $f)"
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$f"
    fi
done

echo ""
echo "=========================================="
echo "  Pochak DB Init: Running seed data..."
echo "=========================================="

for f in /docker-entrypoint-initdb.d/seeds/V*.sql; do
    if [ -f "$f" ]; then
        echo "  → $(basename $f)"
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$f"
    fi
done

echo ""
echo "=========================================="
echo "  Pochak DB Init: Complete!"
echo "=========================================="
