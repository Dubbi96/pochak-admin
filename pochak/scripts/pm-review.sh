#!/bin/bash
LOG="$HOME/Dubbi/pochak/logs/pm-review.log"
mkdir -p "$(dirname "$LOG")"
echo "=== $(date '+%Y-%m-%d %H:%M:%S') PM Review ===" >> "$LOG"

cd "$HOME/Dubbi/pochak" || exit 1

if ! curl -s http://127.0.0.1:3100/api/health > /dev/null 2>&1; then
  echo "  PaperclipAI not running, skipping" >> "$LOG"
  exit 0
fi

npm exec paperclipai -- heartbeat run \
  -a b7d1d377-af90-4b09-bb8b-42fec846b256 \
  --api-base http://127.0.0.1:3100 \
  --timeout-ms 300000 \
  --source timer \
  --trigger system >> "$LOG" 2>&1

echo "  Exit: $?" >> "$LOG"

# Log size management
if [ $(wc -c < "$LOG") -gt 1048576 ]; then
  tail -500 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi
