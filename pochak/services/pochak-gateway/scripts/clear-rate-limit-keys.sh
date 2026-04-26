#!/usr/bin/env bash
# Deletes Redis keys used by RedisRateLimitFilter (rate-limit:{ip}:api|auth).
# Usage: ./scripts/clear-rate-limit-keys.sh
# Override CLI: REDIS_CLI="redis-cli -h host -p 6379" ./scripts/clear-rate-limit-keys.sh

set -euo pipefail
REDIS_CLI="${REDIS_CLI:-redis-cli}"

if ! command -v "${REDIS_CLI%% *}" >/dev/null 2>&1; then
  echo "redis-cli not found. Install Redis or set REDIS_CLI." >&2
  exit 1
fi

keys=$($REDIS_CLI KEYS 'rate-limit:*' 2>/dev/null | tr '\n' ' ' || true)
if [[ -z "${keys// }" ]]; then
  echo "No rate-limit:* keys found."
  exit 0
fi

# shellcheck disable=SC2086
$REDIS_CLI DEL $keys
echo "Deleted gateway rate-limit keys."
