#!/bin/bash
# Sequential agent runner with exponential backoff
# Usage: ./scripts/run-agents.sh [max-agents]
# Runs agents one at a time to avoid API overload (529 errors)

set -e
cd "$HOME/Dubbi/pochak" || exit 1

LOG_DIR="$HOME/Dubbi/pochak/logs"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/agent-runner.log"
MAX_AGENTS="${1:-5}"
RETRY_DELAY=30
MAX_RETRIES=3
API="http://127.0.0.1:3100"

# Agent list (priority order)
AGENTS=(
  "3e6cdf4b-2c93-40c5-a492-c64bdc4fcfca:Backend"
  "9f72163e-d728-45fc-916d-aae803cfd886:Frontend"
  "1f0fe83a-91f4-4633-a871-b6b77bb137c5:Security"
  "da40fae1-42ae-4888-b4f3-dda3e76354af:DevOps"
  "31ae1703-dde6-4d04-a574-b8110cd1b26a:QA"
)

log() { echo "$(date '+%H:%M:%S') $1" | tee -a "$LOG"; }

# Health check
if ! curl -s "$API/api/health" > /dev/null 2>&1; then
  log "PaperclipAI not running. Exiting."
  exit 0
fi

# Check remaining todo issues
TODO_COUNT=$(curl -s "$API/api/companies/1a0fd4b1-ea57-44de-bb12-0c5030c8d6b1/issues?status=todo" | python3 -c "
import sys, json
data = json.load(sys.stdin)
items = data if isinstance(data, list) else data.get('items', [])
print(len(items))" 2>/dev/null)

if [ "$TODO_COUNT" = "0" ]; then
  log "No todo issues. Exiting."
  exit 0
fi

log "=== Agent Runner Start ($TODO_COUNT todo issues) ==="

RAN=0
for entry in "${AGENTS[@]}"; do
  [ $RAN -ge $MAX_AGENTS ] && break

  IFS=':' read -r aid name <<< "$entry"

  # Check if agent has assigned todo issues
  HAS_WORK=$(curl -s "$API/api/companies/1a0fd4b1-ea57-44de-bb12-0c5030c8d6b1/issues?status=todo&assigneeAgentId=$aid" | python3 -c "
import sys, json
data = json.load(sys.stdin)
items = data if isinstance(data, list) else data.get('items', [])
print(len(items))" 2>/dev/null)

  if [ "$HAS_WORK" = "0" ]; then
    log "  $name: no assigned work, skipping"
    continue
  fi

  # Reset agent to idle (clear stale locks)
  curl -s -X PATCH "$API/api/agents/$aid" \
    -H "Content-Type: application/json" \
    -d '{"status":"idle"}' > /dev/null

  log "  $name: starting ($HAS_WORK issues)..."

  # Run with retry on 529
  ATTEMPT=0
  while [ $ATTEMPT -lt $MAX_RETRIES ]; do
    ATTEMPT=$((ATTEMPT + 1))

    OUTPUT=$(npm exec paperclipai -- heartbeat run \
      -a "$aid" \
      --api-base "$API" \
      --timeout-ms 300000 2>&1)

    if echo "$OUTPUT" | grep -q "529\|overloaded\|Overloaded"; then
      WAIT=$((RETRY_DELAY * ATTEMPT))
      log "    529 overloaded (attempt $ATTEMPT/$MAX_RETRIES). Waiting ${WAIT}s..."
      sleep $WAIT
    else
      STATUS=$(echo "$OUTPUT" | grep -oP 'completed with status \K\w+' | tail -1)
      log "    $name: $STATUS"
      break
    fi
  done

  # Reset to idle after run
  curl -s -X PATCH "$API/api/agents/$aid" \
    -H "Content-Type: application/json" \
    -d '{"status":"idle"}' > /dev/null

  # Cooldown between agents (prevent burst)
  log "  Cooldown 10s..."
  sleep 10

  RAN=$((RAN + 1))
done

# Final status
DONE=$(curl -s "$API/api/companies/1a0fd4b1-ea57-44de-bb12-0c5030c8d6b1/dashboard" | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(f'open={d[\"tasks\"][\"open\"]} done={d[\"tasks\"][\"done\"]}')" 2>/dev/null)

log "=== Complete ($RAN agents ran). Tasks: $DONE ==="
