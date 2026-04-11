#!/bin/bash
# CEO Heartbeat - 미배정 업무 확인 및 배정
# launchd에 의해 5분마다 자동 실행

LOG_DIR="$HOME/Dubbi/pochak/logs"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/ceo-heartbeat.log"

echo "=== $(date '+%Y-%m-%d %H:%M:%S') CEO Heartbeat ===" >> "$LOG"

cd "$HOME/Dubbi/pochak" || exit 1

# PaperclipAI 서버 체크
if ! curl -s http://127.0.0.1:3100/api/health > /dev/null 2>&1; then
  echo "  PaperclipAI not running, skipping" >> "$LOG"
  exit 0
fi

# CEO heartbeat 실행 (5분 타임아웃)
npm exec paperclipai -- heartbeat run \
  -a 8df8fc2d-5d61-45d7-b662-8648384e7e25 \
  --timeout-ms 300000 \
  --source timer \
  --trigger system >> "$LOG" 2>&1

echo "  Exit code: $?" >> "$LOG"
echo "" >> "$LOG"

# 로그 파일 크기 관리 (1MB 초과 시 truncate)
if [ $(wc -c < "$LOG") -gt 1048576 ]; then
  tail -500 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi
