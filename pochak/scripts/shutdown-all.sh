#!/bin/bash
# ============================================================
# POCHAK - 전체 서비스 셧다운 스크립트
# Usage: ./scripts/shutdown-all.sh
# ============================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   POCHAK - Shutting down all services    ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# 1. Docker Compose 서비스 중지
echo "  [1/4] Docker Compose 서비스 중지..."
cd "$PROJECT_DIR/infra"
docker compose down --remove-orphans 2>/dev/null || true
echo "  ✓ Docker 서비스 중지 완료"

# 2. 로컬 Gradle bootRun 프로세스 종료 (있을 경우)
echo "  [2/4] 로컬 Spring Boot 프로세스 종료..."
pkill -f "pochak.*bootRun" 2>/dev/null || true
pkill -f "pochak-gateway" 2>/dev/null || true
pkill -f "pochak-identity" 2>/dev/null || true
pkill -f "pochak-content" 2>/dev/null || true
pkill -f "pochak-commerce" 2>/dev/null || true
pkill -f "pochak-operation" 2>/dev/null || true
pkill -f "pochak-admin" 2>/dev/null || true
pkill -f "pochak-web-bff" 2>/dev/null || true
pkill -f "pochak-app-bff" 2>/dev/null || true
pkill -f "pochak-bo-bff" 2>/dev/null || true
echo "  ✓ Spring Boot 프로세스 종료 완료"

# 3. 로컬 Node dev 서버 종료 (있을 경우)
echo "  [3/4] 로컬 Node.js 개발 서버 종료..."
pkill -f "vite.*pochak" 2>/dev/null || true
pkill -f "next.*pochak" 2>/dev/null || true
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3100 2>/dev/null | xargs kill -9 2>/dev/null || true
echo "  ✓ Node.js 서버 종료 완료"

# 4. 사용 중인 포트 확인
echo "  [4/4] 포트 사용 확인..."
PORTS_IN_USE=""
for port in 8080 8081 8082 8083 8084 8085 9080 9081 9090 3000 3100 5432 6379 5672; do
    if lsof -i:$port -sTCP:LISTEN >/dev/null 2>&1; then
        PORTS_IN_USE="$PORTS_IN_USE $port"
    fi
done

if [ -z "$PORTS_IN_USE" ]; then
    echo "  ✓ 모든 포트 정상 해제됨"
else
    echo "  ⚠ 아직 사용 중인 포트:$PORTS_IN_USE"
    echo "    수동 확인: lsof -i:<port>"
fi

echo ""
echo "  ✓ 전체 셧다운 완료"
echo ""
