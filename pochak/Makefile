# ============================================================
# POCHAK OTT Platform - Development Commands
# ============================================================

.PHONY: help deps-up deps-down all-up all-down bo-dev mobile-dev \
        status logs seed rebuild clean

# ── Help ────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  POCHAK Development Commands"
	@echo "  ════════════════════════════════════════════════"
	@echo ""
	@echo "  Infrastructure:"
	@echo "    make deps-up      DB(PG) + Redis만 시작"
	@echo "    make deps-down    DB + Redis 중지"
	@echo "    make all-up       전체 서비스 시작 (백엔드 6개 + BO Web + DB + Redis)"
	@echo "    make all-down     전체 서비스 중지"
	@echo "    make rebuild      전체 서비스 재빌드 후 시작"
	@echo "    make clean        컨테이너 + 볼륨 전체 삭제 (DB 초기화됨)"
	@echo ""
	@echo "  Frontend (로컬 개발):"
	@echo "    make bo-dev       BO Web 개발 서버 (http://localhost:3000)"
	@echo "    make mobile-dev   Mobile Metro 서버 (http://localhost:8097)"
	@echo ""
	@echo "  Database:"
	@echo "    make seed         시드 데이터 삽입"
	@echo "    make migrate      마이그레이션 재실행"
	@echo ""
	@echo "  Monitoring:"
	@echo "    make status       전체 컨테이너 상태"
	@echo "    make logs         전체 로그 (follow)"
	@echo "    make logs-svc s=identity  특정 서비스 로그"
	@echo ""
	@echo "  ════════════════════════════════════════════════"
	@echo "  서비스 포트:"
	@echo "    Gateway:    http://localhost:8080"
	@echo "    Identity:   http://localhost:8081"
	@echo "    Content:    http://localhost:8082"
	@echo "    Commerce:   http://localhost:8083"
	@echo "    Operation:  http://localhost:8084"
	@echo "    Admin:      http://localhost:8085"
	@echo "    BO Web:     http://localhost:3000"
	@echo "    Mobile:     http://localhost:8097 (Metro)"
	@echo "    PostgreSQL: localhost:5432"
	@echo "    Redis:      localhost:6379"
	@echo ""

# ── Infrastructure ──────────────────────────────────────────

# DB + Redis만 시작 (백엔드 로컬 개발 시)
deps-up:
	cd infra && docker compose -f docker-compose.deps.yml up -d
	@echo ""
	@echo "✓ PostgreSQL: localhost:5432 (pochak/pochak_dev_2026)"
	@echo "✓ Redis:      localhost:6379"

deps-down:
	cd infra && docker compose -f docker-compose.deps.yml down

# 전체 서비스 시작 (백엔드 + BO Web + DB + Redis)
# 먼저 orphan/stale 컨테이너 정리 후 빌드
all-up:
	cd infra && docker compose down --remove-orphans 2>/dev/null || true
	cd infra && docker compose up -d --build
	@echo ""
	@echo "✓ 전체 서비스 시작 완료"
	@echo "  Gateway:  http://localhost:8080"
	@echo "  BO Web:   http://localhost:3000"
	@echo ""
	@make status

all-down:
	cd infra && docker compose down

# 전체 재빌드 (코드 변경 후)
rebuild:
	cd infra && docker compose up -d --build --force-recreate
	@echo "✓ 전체 서비스 재빌드 완료"

# 전체 삭제 (DB 데이터 포함)
clean:
	cd infra && docker compose down -v --remove-orphans
	@echo "✓ 전체 삭제 완료 (DB 데이터 초기화됨)"

# ── Frontend Local Dev ──────────────────────────────────────

# BO Web 개발 서버 (http://localhost:3000)
bo-dev:
	@echo "Starting BO Web dev server..."
	cd clients/apps/bo-web && npm run dev

# Public Web 개발 서버 (http://localhost:3100)
web-dev:
	@echo "Starting Public Web dev server..."
	cd clients/apps/public-web && npm run dev

# Mobile Expo Dev 서버 (Expo Go로 확인, 포트 8097)
mobile-dev:
	@echo "Starting Expo dev server on port 8097..."
	@echo "→ Expo Go 앱에서 QR 코드를 스캔하세요"
	cd clients/apps/mobile && npx expo start --port 8097

# Mobile Expo Tunnel (외부 네트워크에서 접속 시)
mobile-tunnel:
	cd clients/apps/mobile && npx expo start --tunnel --port 8097

# Mobile iOS 시뮬레이터
mobile-ios:
	cd clients/apps/mobile && npx expo start --ios --port 8097

# Mobile Android 에뮬레이터
mobile-android:
	cd clients/apps/mobile && npx expo start --android --port 8097

# ── Database ────────────────────────────────────────────────

# 시드 데이터 삽입
seed:
	docker exec -i pochak-postgres psql -U pochak -d pochak < db/seeds/V100__seed_initial_data.sql
	docker exec -i pochak-postgres psql -U pochak -d pochak < db/seeds/V101__seed_content_data.sql
	@echo "✓ 시드 데이터 삽입 완료 (V100 + V101)"

# 마이그레이션 실행 (V000~V005)
migrate:
	@for f in db/migrations/V*.sql; do \
		echo "Running $$f..."; \
		docker exec -i pochak-postgres psql -U pochak -d pochak < "$$f"; \
	done
	@echo "✓ 마이그레이션 완료"

# ── Monitoring ──────────────────────────────────────────────

# 전체 컨테이너 상태
status:
	@echo ""
	@echo "  POCHAK Services Status"
	@echo "  ──────────────────────────────────────"
	@docker ps --format "  {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | sort
	@echo ""

# 전체 로그
logs:
	cd infra && docker compose logs -f --tail=50

# 특정 서비스 로그 (예: make logs-svc s=identity)
logs-svc:
	docker logs -f pochak-$(s) --tail=100

# ── Common-lib (백엔드 개발 시) ─────────────────────────────

# common-lib 빌드 & 로컬 배포
common-publish:
	cd services/pochak-common-lib && ./gradlew publishToMavenLocal --no-daemon
	@echo "✓ pochak-common-lib published to Maven Local"
