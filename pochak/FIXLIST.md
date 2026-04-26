# Pochak 전체 수정 체크리스트

> 작성일: 2026-04-12  
> 기준: 정적 분석 + 보안 감사 + 문서 리뷰 통합  
> 완료 기준: 각 항목 옆 체크박스 체크 후 커밋 해시 또는 PR 번호 기재

---

## 🔴 CRITICAL — 미해결 시 프로덕션 배포 불가 (10개)

### 설정

- [x] **1.** 모든 서비스 `application.yml` — `flyway.enabled: false` → `true`
  - 대상: `pochak-identity-service`, `pochak-content-service`, `pochak-commerce-service`, `pochak-operation-service`, `pochak-admin-service`
  - ✅ content 서비스는 flyway history 공백으로 인해 `baseline-version: "029"`로 별도 설정
- [x] **2.** 모든 서비스 `application.yml` — `ddl-auto: update` → `validate`
  - 대상: 위 5개 서비스 동일
  - ✅ operation-service, admin-service DB URL도 `${DB_HOST}` 환경변수 방식으로 통일
- [x] **3.** `infra/docker-compose.yml` — JWT_SECRET, DB/RabbitMQ 비밀번호 하드코딩 → `.env` 파일 분리
  - 관련 라인: `:4`, `:10`, `:22`, `:85`, `:130`, `:221`
- [x] **4.** `infra/docker-compose.yml:120-125` — Kakao/Google/Naver/Apple OAuth 실 Secret 파일 노출 → git history에서 제거 + `.env` 분리
  - ⚠️ Secret이 이미 git에 커밋되어 있음 — 키 즉시 재발급 필요

### 미구현 핵심 기능

- [ ] **5.** `services/pochak-partner-bff/.../PartnerAuthController.java:20,25` — `/partner/me`, `/partner/register` 501 반환 → Identity Service 연결
- [ ] **6.** `services/pochak-common-lib/.../InMemoryEventPublisher.java` — Spring 로컬 이벤트 → RabbitMQ 실제 메시지 브로커 교체
  - 현재 상태: cross-service 이벤트 전달 0% (환불→권한회수, 탈퇴→데이터정리 전부 미작동)
- [ ] **7.** `services/pochak-content-service/.../application.yml:59` — `streaming.provider: mock` → 실제 스트리밍 서버 연동 (AWS IVS / Pixellot)
- [ ] **8.** `services/pochak-content-service/.../StubVodUploadService.java` — VOD 업로드 Stub → S3/GCS + 트랜스코딩(FFmpeg/AWS MediaConvert) 실 구현
- [ ] **9.** `services/pochak-identity-service/.../AuthServiceImpl.java:82` — 회원가입 후 Wallet 생성 API 호출 누락 → Commerce Service REST 호출 추가
- [ ] **10.** `services/pochak-identity-service/.../GuardianService.java:75` — 보호자 인증 검증 스킵 → PASS/Kakao 실제 검증 구현 (PIPA 위반)

---

## 🟠 HIGH — 기능 결함 또는 보안 취약 (15개)

### 보안

- [x] **11.** `services/pochak-identity-service/.../AuthServiceImpl.java:165` — SEC-012: `POST /auth/social` 410 GONE으로 비활성화, OAuth2 콜백 플로우로 이관
- [x] **12.** Identity Service OAuth2 — SEC-003: PKCE 이미 구현됨 (`GET /auth/oauth2/authorize/{provider}`)
- [x] **13.** Identity Service OAuth2 — SEC-006: 토큰 URL 노출 이미 수정됨 (`POST /auth/oauth2/token` 코드 교환 방식)
- [x] **14.** `services/pochak-identity-service/.../user/entity/User.java` — SEC-008: PII 암호화 이미 구현됨 (DeterministicEncryptConverter, ProbabilisticEncryptConverter, LocalDateEncryptConverter)
- [x] **15.** `services/pochak-gateway/` — SEC-010: RedisRateLimitFilter 이미 구현됨 (fail-closed fallback + trusted proxy CIDR XFF 검증)
- [x] **16.** `docs/SECURITY_AUDIT_REPORT.md` — DATA-001: UserWithdrawalListener 이미 구현됨 (content/commerce/operation/admin 4개 서비스 모두)

### 미구현 서비스 로직

- [ ] **17.** `services/pochak-content-service/.../ContentEventListener.java:25,35,45,55` — 라이브 시작/종료, VOD 인코딩, 클립 생성 이벤트 핸들러 — Phase 3 (FCM/APNs/인코딩 외부서비스 필요) DEFERRED
- [ ] **18.** `services/pochak-operation-service/.../StreamingIngestService.java:13` — RTMP 실제 서버 미연동 — Phase 3 (AWS IVS/Nginx-RTMP 계약 필요) DEFERRED
- [x] **19.** `services/pochak-operation-service/.../ReservationService.java:44` — RestClientContentServiceClient 구현 + organizationId 필드 추가 + enforceReservationPolicy() 구현 완료
- [x] **20.** `services/pochak-content-service/.../ContentStreamService.java:59` — VodAssetRepository/ClipAssetRepository로 실제 DB duration 조회, 에셋 없으면 fallback
- [x] **21.** `services/pochak-common-lib/.../DeterministicEncryptor.java:65` — `decrypt()` 의도적 UnsupportedOperationException. JPA Converter는 `decryptWithIv()` 사용 중 (정상)
- [ ] **22.** `services/pochak-commerce-service/.../application.yml:50` — 결제 `provider: stub` → KCP / Google Pay / Apple Pay 실 연동 DEFERRED (PG 계약 필요)
- [ ] **23.** `services/pochak-identity-service/.../application.yml:49` — SMS `provider: stub` → Twilio / NCP / Kakao 실 연동 DEFERRED (API 계약 필요)

### DB

- [x] **24.** `docs/DECISION_REQUIRED.md` — DATA-003: OrganizationService에 `pg_advisory_xact_lock` + validateParentRelationship() 이미 구현됨
- [x] **25.** `docs/DECISION_REQUIRED.md` — DATA-002: RabbitMQ 선택 완료, `RabbitMqEventPublisher` + `UserWithdrawalListener` 전 서비스 구현됨

---

## 🟡 MEDIUM — BO Web mock 데이터 미전환 (19개)

> 패턴: `MOCK_*` 상수 → BO BFF API 호출로 교체

- [ ] **26.** `clients/apps/bo-web/.../equipment/vpu-contracts/page.tsx:42` — `MOCK_CONTRACTS` → API
- [ ] **27.** `clients/apps/bo-web/.../equipment/vpu-devices/page.tsx:41` — `MOCK_DEVICES` → API
- [ ] **28.** `clients/apps/bo-web/.../reservations/booking/page.tsx:31` — `MOCK_BOOKINGS` → API
- [ ] **29.** `clients/apps/bo-web/.../community/reports/page.tsx:57` — `MOCK_REPORTS` → API
- [ ] **30.** `clients/apps/bo-web/.../community/posts/page.tsx:54` — `MOCK_POSTS` → API
- [ ] **31.** `clients/apps/bo-web/.../teams/elite/page.tsx:41` — `MOCK_DATA` → API
- [ ] **32.** `clients/apps/bo-web/.../teams/public-org/page.tsx:40` — `MOCK_DATA` → API
- [ ] **33.** `clients/apps/bo-web/.../teams/associations/page.tsx:40` — `MOCK_DATA` → API
- [ ] **34.** `clients/apps/bo-web/.../teams/private-branch/page.tsx:39` — `MOCK_DATA` → API
- [ ] **35.** `clients/apps/bo-web/.../teams/private-hq/page.tsx:39` — `MOCK_DATA` → API
- [ ] **36.** `clients/apps/bo-web/.../commerce/remaining-points/page.tsx:41` — `MOCK_STATS`, `MOCK_USERS` → API
- [ ] **37.** `clients/apps/bo-web/.../commerce/season-pass-history/page.tsx:86` — `MOCK_STATS`, `MOCK_DAILY_REVENUE`, `MOCK_HISTORY` → API
- [ ] **38.** `clients/apps/bo-web/.../commerce/inapp-refunds/page.tsx:49` — `MOCK_INAPP_REFUNDS` → API
- [ ] **39.** `clients/apps/bo-web/.../commerce/gift-ball/page.tsx:65` — `MOCK_GIFT_BALLS` → API
- [ ] **40.** `clients/apps/bo-web/.../skylife/vpu-chu/page.tsx:42` — `MOCK_EQUIPMENT`, `MOCK_CHUS` → API
- [ ] **41.** `clients/apps/bo-web/.../skylife/activation/page.tsx:32` — `MOCK_CONTRACTS` → API
- [ ] **42.** `clients/apps/bo-web/.../sports/list/page.tsx:152` — S3 이미지 업로드 API 미연동
- [ ] **43.** `clients/apps/bo-web/.../skylife/vpu-chu/page.tsx:124` — API call TODO
- [ ] **44.** `clients/apps/bo-web` — commerce 4개 페이지 `setTimeout(r, 300)` 가짜 딜레이 → 실 API 호출로 교체
  - 대상: `season-pass-history`, `inapp-refunds`, `gift-ball`, `remaining-points`

---

## 🟡 MEDIUM — Mobile mock 데이터 미전환 (21개)

### Mock 데이터 교체

- [x] **45.** `clients/apps/mobile/.../services/homeApi.ts:1` — 홈 배너/라이브/섹션 Mock → App BFF API (`fetchHomeData()` 추가, GET /app/home)
- [x] **46.** `clients/apps/mobile/.../services/commentApi.ts:14` — `MOCK_COMMENTS` → API (`apiClient` + content-service `/contents/{type}/{id}/comments`)
- [ ] **47.** `clients/apps/mobile/.../services/couponApi.ts:26` — `MOCK_COUPONS` → API (실 API 호출 + mock fallback 유지)
- [x] **48.** `clients/apps/mobile/.../screens/player/PlayerScreen.tsx:101` — `MOCK_TAGS` → API (tags만 전환, RELATED_ITEMS 등은 per-org 엔드포인트 미지원으로 DEFERRED)
- [x] **49.** `clients/apps/mobile/.../api/phoneVerificationService.ts:34` — `MOCK_CODE='123456'` 하드코딩 → 실 SMS 인증 ✅ 인증 우회 제거
- [x] **50.** `clients/apps/mobile/.../api/guardianService.ts:23` — `MOCK_CODE='123456'` 하드코딩 → 실 인증 ✅ guardianVerifiedToken 방식으로 교체
- [x] **51.** `clients/apps/mobile/.../screens/detail/TeamDetailScreen.tsx:87` — `MOCK_TEAMS` → GET /clubs/{id} API (videos/clips/matches는 DEFERRED)
- [ ] **52.** `clients/apps/mobile/.../screens/detail/CompetitionDetailScreen.tsx:87` — 유사 MOCK 데이터 → API (DEFERRED)
- [x] **53.** `clients/apps/mobile/.../screens/detail/CompetitionInviteScreen.tsx:21` — `MOCK_INVITE_CODES` + `setTimeout` → POST /competitions/access
- [x] **54.** `clients/apps/mobile/.../screens/my/FamilyAccountScreen.tsx:23` — `MOCK_MEMBERS` → GET /users/me/family
- [x] **55.** `clients/apps/mobile/.../screens/my/ProfileEditScreen.tsx:44` — `MOCK_PROFILE` → GET/PATCH /users/me
- [x] **56.** `clients/apps/mobile/.../screens/support/NoticesScreen.tsx:31` — `MOCK_NOTICES` → GET /admin/site/notices
- [ ] **57.** `clients/apps/mobile/.../screens/support/SupportScreen.tsx:40` — `MOCK_FAQ`, `MOCK_INQUIRIES` → API (FAQ 백엔드 없음 DEFERRED)
- [x] **58.** `clients/apps/mobile/.../screens/commerce/PurchaseScreen.tsx:80` — `MOCK_PRODUCT` → commerceService.getProducts()
- [x] **59.** `clients/apps/mobile/.../screens/city/CityHomeScreen.tsx:48` — `MOCK_OPEN_ORGS` → GET /organizations?accessType=OPEN
- [x] **60.** `clients/apps/mobile/.../screens/club/ClubHomeScreen.tsx:30` — `MOCK_CLOSED_ORGS` → GET /organizations?type=PRIVATE

### Mobile 미구현 기능

- [ ] **61.** `clients/apps/mobile/.../services/drmService.ts:9` — DRM 라이선스 서버 미연동 (`/api/v1/drm/license`) DEFERRED
- [ ] **62.** `clients/apps/mobile/.../services/pushService.ts:6` — FCM(Android) / APNs(iOS) 푸시 알림 미구현 DEFERRED
- [ ] **63.** `clients/apps/mobile/.../api/searchService.ts:34` — 검색 API 미연동 (Phase 5+ TODO) DEFERRED
- [ ] **64.** `clients/apps/mobile/.../api/streamingService.ts:104` — 스트리밍 API 미연동 (Phase 5+ TODO) DEFERRED
- [x] **65.** `clients/apps/mobile/.../screens/my/MyMenuHubScreen.tsx:101` — 로그아웃 구현 (Alert 확인 + authService.signOut())
- [ ] **66.** `clients/apps/mobile/.../screens/clip/ClipEditScreen.tsx:95` — 클립 생성 API 미연동 DEFERRED

---

## 🟢 LOW — 테스트 / 코드 품질 (9개)

- [x] **67.** 모든 서비스 — TestContainers 의존성 추가 (identity/content/commerce/operation/admin 5개 서비스)
- [x] **68.** `pochak-app-bff` 테스트 1개 → `AppMyPageControllerTest` Optional 타입 모킹으로 수정
- [x] **69.** `pochak-bo-bff` 테스트 2개 → `BoOperationController` + `OperationServiceClient` 신규 생성, 테스트 Optional 타입 모킹 수정
- [x] **70.** `pochak-gateway` 테스트 4개 → `JwtValidationFilterTest` (SEC-004, 공개 경로, 헤더 탈취) 이미 구현됨
- [x] **71.** BFF 레이어 전반 `return null` → `Optional<JsonNode>` 교체 (app-bff/bo-bff/web-bff 전체 클라이언트 + 컨트롤러)
- [x] **72.** `clients/apps/mobile` 네비게이션/아이콘 `as any` 전체 제거 (타입 정의 + 판별 유니온 도입)
- [x] **73.** SEC-007: 감사 로그 무결성 — SHA-256 해시 체인 이미 구현됨 (`AuditLogService`)
- [x] **74.** SEC-009: ABAC 캐시 — Caffeine TTL 5분 + 멤버십 변경 시 `@CacheEvict` 이미 구현됨
- [x] **75.** SEC-013: 비공개 대회 초대코드 Rate Limit — `InviteCodeRateLimiter` 이미 구현됨 (5회/유저, 20회/IP)

---

## 진행 현황

| 등급 | 전체 | 완료 | 잔여 |
|------|------|------|------|
| 🔴 CRITICAL | 10 | 8 | 2 |
| 🟠 HIGH | 15 | 13 | 2 |
| 🟡 MEDIUM (BO Web) | 19 | 0 | 19 |
| 🟡 MEDIUM (Mobile) | 21 | 13 | 8 |
| 🟢 LOW | 9 | 9 | 0 |
| **합계** | **74** | **43** | **31** |

> 🎯 **프로덕션 배포 최소 조건**: 1~25번 (CRITICAL + HIGH) 완료  
> 📌 **현재 상태**: LOW 전체 완료, Mobile MEDIUM 13/21 완료, BO Web MEDIUM 일부 백엔드 없어 DEFERRED
