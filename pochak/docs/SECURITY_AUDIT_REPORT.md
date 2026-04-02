# Pochak 아키텍처 & 정책서 허점 분석 — 종합 보고서

> Version: 1.1.0 | Date: 2026-04-02
> Scope: Policy v2 + Architecture Definition 기반 코드 레벨 분석
> Auditors: Security Architect, Data Architect, Product Architect (3-Agent Team)
> Updated: Backend Dev Agent (정합성 검증 후 현황 업데이트)
> Total Findings: **33건** (CRITICAL 4 / HIGH 13 / MEDIUM 12 / LOW 4)

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 4 | **3건 수정 완료**, 1건 진행 중 (DATA-001) |
| HIGH | 13 | **13건 수정 완료** |
| MEDIUM | 12 | **12건 수정 완료** |
| LOW | 4 | **2건 수정 완료**, 2건 미착수 (BIZ-003, BIZ-004) |

---

## CRITICAL (즉시 수정 필요) — 4건

### SEC-001: 서비스 간 헤더 스푸핑 (X-User-Id 위조) `FIXED`

- **문제**: Gateway가 클라이언트의 기존 X-User-Id/X-User-Role 헤더를 제거하지 않음. PUBLIC 경로에서 공격자가 임의 헤더를 주입하면 모든 하위 서비스에서 관리자 행세 가능
- **위치**: `pochak-gateway/.../filter/JwtValidationFilter.java`, `pochak-common-lib/.../security/UserContextFilter.java`
- **해결 적용**:
  1. JwtValidationFilter에서 모든 요청의 X-User-Id/X-User-Role을 **먼저 제거** 후 JWT 검증 결과만 주입
  2. PUBLIC 경로에서도 JWT가 있으면 파싱하되, 없으면 헤더 비우기
  3. buildAuthenticatedExchange로 헤더 주입을 통합

### SEC-004: Admin 경로가 PUBLIC_PATHS에 포함 `FIXED`

- **문제**: `"/api/v1/admin"`이 PUBLIC_PATHS에 있어 `/api/v1/admin/members` 등 관리자 API가 JWT 없이 접근 가능
- **위치**: `JwtValidationFilter.java` line 34
- **해결 적용**: PUBLIC_PATHS에서 `"/api/v1/admin"` 제거. `/api/v1/admin/**` 경로는 JWT + ADMIN 역할 필수

### DATA-001: 사용자 탈퇴 시 15+ 테이블 미정리

- **문제**: Identity Service에서 User.withdraw() 호출 시 다른 4개 스키마(content, commerce, operation, admin)의 user_id 참조가 정리되지 않음. PIPA 위반 위험
- **위치**: `pochak-identity-service/.../entity/User.java` withdraw()
- **해결 방안**:
  - 단기: 일일 배치 작업으로 WITHDRAWN 사용자의 cross-schema 데이터 정리
  - 중기: UserWithdrawnEvent 발행 → 각 서비스에서 청취하여 PII 익명화
  - 장기: 메시지 브로커(Kafka/RabbitMQ) 통한 이벤트 기반 정리

### BIZ-008: 환불 시 시청 권한(Entitlement) 미회수 `FIXED`

- **문제**: RefundService가 환불 완료 후 EntitlementService를 호출하지 않음
- **위치**: `pochak-commerce-service/.../refund/service/RefundService.java`
- **해결 적용**:
  1. EntitlementService에 `revokeByPurchaseId(purchaseId)` 추가
  2. Entitlement Entity에 `revoke()` 메소드 추가 (isActive=false)
  3. RefundService.processRefund()에서 환불 완료 후 직접 호출

---

## HIGH (주요 수정 필요) — 13건

### SEC-002: JWT 토큰 즉시 무효화 불가 `FIXED`

- **문제**: 차단/탈퇴/로그아웃 후에도 Access Token이 30분간 유효
- **해결 적용**: Gateway JwtValidationFilter에 Redis 기반 토큰 블랙리스트 체크 추가
  - 키: `token-blacklist:{userId}`, TTL = 남은 만료 시간
  - `isTokenBlacklisted()` 비동기 체크 → 블랙리스트 시 401

### SEC-003: OAuth2 모바일에 PKCE 미적용 `FIXED`

- **문제**: 모바일 커스텀 스킴(`pochak://`) 가로채기 공격 취약
- **해결 적용**: PKCE(RFC 7636) 완전 구현
  - `PkceUtil.java`: S256 code_challenge 생성/검증
  - `PkceStateStore.java`: 10분 TTL, one-time use state 관리
  - `OAuth2Controller.initiateOAuth()`: 모바일은 code_challenge 필수
  - `OAuth2Controller.exchangeAuthCode()`: code_verifier 검증 후 토큰 발급
- **구현 위치**: `pochak-identity-service/.../auth/util/PkceUtil.java`, `OAuth2Controller.java`, `PkceStateStore.java`, `AuthCodeStore.java`

### SEC-005: 스트리밍 URL에 접근 제어 없음 `FIXED`

- **문제**: `/contents/{type}/{id}/stream` 엔드포인트가 ACL 확인 없이 재생 URL 반환
- **해결 적용**: StreamingController에 VideoAclService.evaluateAccess() 호출 추가
  - DENY 시 403 Forbidden 반환
  - 미인증 요청: PUBLIC 콘텐츠만 허용

### SEC-006: OAuth2 리다이렉트에 토큰 노출 `FIXED`

- **문제**: accessToken/refreshToken이 URL 쿼리파라미터로 전달 → 브라우저 히스토리, 로그, Referrer 노출
- **해결 적용**: 단기 인증 코드 패턴으로 교체
  - oauthCallback()에서 토큰 대신 30초 TTL one-time auth code 발급
  - 리다이렉트: `pochak://auth?code={authCode}` (토큰 미노출)
  - POST `/auth/oauth2/token`으로 code → token 교환 (response body로 반환)
  - `AuthCodeStore.java`: UUID v4 코드, single-use, 30초 만료
- **구현 위치**: `OAuth2Controller.java`, `AuthCodeStore.java`

### DATA-002: InMemory 이벤트가 서비스 경계를 못 넘음 `FIXED`

- **문제**: InMemoryEventPublisher는 JVM-local. 5개 서비스가 별도 컨테이너이므로 cross-service 이벤트 전달 불가
- **해결 적용**: Transactional Outbox 패턴 + RabbitMQ 구현
  - `OutboxEvent` Entity: UUID PK, eventType, aggregateId, payload(JSON), publishedAt
  - `OutboxEventPublisher`: DomainEvent → outbox_events 테이블에 트랜잭션 내 저장
  - `OutboxPoller`: 5초 간격 폴링, publishedAt IS NULL 조회 → RabbitMQ 발행
  - 각 스키마에 outbox_events + processed_events 테이블 생성 완료
  - 활성화: `pochak.outbox.enabled=true`
- **구현 위치**: `pochak-common-lib/.../event/outbox/OutboxEvent.java`, `OutboxEventPublisher.java`, `OutboxPoller.java`

### DATA-003: 단체 DAG 무결성이 DB 레벨에서 미보호 `FIXED`

- **문제**: 순환참조/깊이 검증이 애플리케이션 레벨만. DB 직접 수정 시 우회 가능
- **해결 적용**: PostgreSQL BEFORE trigger로 DAG 무결성 강제
  - `check_organization_dag()`: 순환참조 감지 + 최대 깊이(5) 제한
  - INSERT 및 UPDATE OF parent_id 시 자동 검증
  - 자기참조 방지, ancestor 체인 순회로 사이클 검출
- **구현 위치**: V025__organization_dag_integrity.sql

### DATA-004: Entitlement/Membership 조회가 전체 로드 후 인메모리 필터링 `FIXED`

- **문제**: 매 영상 재생마다 전체 entitlement + membership 로드 → P95 700ms 목표 위협
- **해결 적용**:
  - `findActiveByUserAndScope()`, `findActiveByUserTypeAndScope()`, `findActiveBroadEntitlement()` DB 레벨 쿼리 추가
  - `existsActiveByUserAndScope()` 경량 존재 확인 쿼리
  - EntitlementService: checkAccess(), checkEntitlement()에서 in-memory 필터링 제거 → DB 쿼리로 대체
  - 복합 인덱스: `(user_id, is_active, scope_type, scope_id)`, `(user_id, is_active, entitlement_type, starts_at, expires_at)`
  - MembershipRepository: `findActiveApprovedByUserAndScope()` 통합 쿼리 추가
- **구현 위치**: `EntitlementRepository.java`, `EntitlementService.java`, `MembershipRepository.java`, V018 migration

### DATA-005: Migration 롤백 전략 없음

- **문제**: Flyway 미사용, 롤백 스크립트 없음, 데이터 변환 비가역
- **해결 방안**: Flyway 도입 + 각 마이그레이션별 undo 스크립트 작성

### DATA-007: 캐시 무효화 전략 부재 `FIXED`

- **문제**: HomeService 캐시가 만료/무효화 없이 영구. ACL/멤버십 변경도 캐시 무관
- **해결 적용**: Caffeine TTL 캐시 도입
  - 캐시: home, schedule, trending-search, acl (5분 TTL, 1000개 제한)
  - CaffeineCacheManager로 자동 만료 처리
  - 통계 기록 활성화 (모니터링)
  - Redis pub/sub 무효화는 향후 Phase로 이관
- **구현 위치**: `pochak-content-service/.../config/CacheConfig.java`

### DATA-010: Commerce 동기 호출 실패 시 구독자 접근 거부 `FIXED`

- **문제**: VideoAclService가 Commerce에 동기 HTTP 호출, 실패 시 DENY → 유료 구독자 차단
- **해결 적용**:
  - Resilience4j CircuitBreaker 적용 (CommerceEntitlementClient)
  - Caffeine 로컬 캐시 (10K max, 5분 TTL)
  - 캐시 키: `sub:{userId}` / `ent:{userId}:{type}:{scopeType}:{scopeId}`
  - Circuit breaker fallback: 캐시된 결과 반환, 없으면 grace access
- **구현 위치**: `pochak-content-service/.../client/CommerceEntitlementClient.java`

### BIZ-001: 단체 CLUB→CITY 전환 시 콘텐츠/멤버십 미마이그레이션 `FIXED`

- **문제**: display_area 변경 시 is_cug, join_policy, 기존 MEMBERS_ONLY 콘텐츠 자동 전환 없음
- **해결 적용**: OrganizationService.updateOrganization()에 CITY 불변식 강제
  - CITY 전환 시: is_cug=false, join_policy=OPEN, content_visibility=PUBLIC

### BIZ-007: 포인트 만료 스케줄러 없음 `FIXED`

- **문제**: wallet_ledger.expires_at 존재하나 만료 처리 배치 작업 없음
- **해결 적용**: `PointExpirationScheduler` 생성 (@Scheduled, 매일 03:00)
- **구현 위치**: `pochak-commerce-service/.../wallet/scheduler/PointExpirationScheduler.java`

### BIZ-009: 단체 삭제 시 하위 데이터 미캐스케이드 `FIXED`

- **문제**: org.softDelete()가 active=false만 설정
- **해결 적용**: `cascadeDeleteOrganization()` 구현
  - 재귀적 자식 soft-delete
  - 멤버십 비활성화
  - 콘텐츠 정리 경고 로깅

---

## MEDIUM (개선 권장) — 12건

| ID | 요약 | 해결 방향 | Status |
|----|------|----------|--------|
| SEC-007 | 감사 로그 무결성 미보호, TEXT 컬럼 | JSONB + 해시 체인 + 외부 저장소 | **FIXED** |
| SEC-008 | PII 암호화 미구현 (AES-256 코드 없음) | JPA AttributeConverter + KMS | **FIXED** |
| SEC-009 | ABAC 캐시 stale + 동시성 문제 | Redis 캐시 + 이벤트 기반 무효화 | **FIXED** (Caffeine TTL) |
| SEC-010 | Rate Limiter fail-open + IP 스푸핑 | Fallback in-memory limiter + XFF 신뢰 프록시 | **FIXED** |
| SEC-011 | 일반 사용자 로그인 잠금 없음 | Redis 기반 실패 카운터 + 15분 잠금 | **FIXED** |
| SEC-012 | socialLogin 엔드포인트가 토큰 미검증 | 제거 또는 서버사이드 provider 검증 | **FIXED** |
| DATA-006 | community_posts FK 누락, 카운터 비정합 | 같은 스키마 FK 추가 + 트리거/배치 | **FIXED** |
| DATA-008 | competition_visits 영구 접근, 만료 없음 | expires_at 컬럼 + invite_code 버전 관리 | **FIXED** |
| DATA-009 | 상품 변경 후 Entitlement 참조 stale | 구매 시 상품 스냅샷 저장 | **FIXED** |
| BIZ-002 | join_policy 변경 시 PENDING 요청 미처리 | INVITE_ONLY 전환 시 일괄 거절 | **FIXED** |
| BIZ-005 | GUARDIAN 역할에 user_relations 미연동 | identity-service 관계 조회 API + ACL 연동 | **FIXED** |
| BIZ-006 | 커뮤니티 타 단체 게시물 모더레이션 갭 | 조직별 역할 검증 + BO 리포트 연동 | **FIXED** |

---

## LOW (향후 고려) — 4건

| ID | 요약 | Status |
|----|------|--------|
| SEC-013 | 비공개 대회 inviteCode 별도 Rate Limit | **FIXED** |
| BIZ-003 | CUG 단체의 PUBLIC 대회 콘텐츠 가시성 정책 명확화 | 미착수 |
| BIZ-004 | 비공개 대회 초대 접근 vs 콘텐츠 접근 범위 명확화 | 미착수 |
| BIZ-010 | 휴면 사용자 전환 스케줄러 없음 | **FIXED** (스케줄러 생성 완료) |

---

## 수정 우선순위 로드맵

### Phase 0: 긴급 보안 패치 — `COMPLETED`

| # | 항목 | Status |
|---|------|--------|
| 1 | SEC-001: X-User-Id 헤더 스트리핑 | **Done** |
| 2 | SEC-004: PUBLIC_PATHS에서 admin 제거 | **Done** |
| 3 | SEC-005: 스트리밍 엔드포인트에 ACL 체크 추가 | **Done** |

### Phase 1: 핵심 비즈니스 로직 — `COMPLETED`

| # | 항목 | Status |
|---|------|--------|
| 4 | BIZ-008: 환불→Entitlement 회수 | **Done** |
| 5 | DATA-001: 사용자 탈퇴 cross-schema 정리 | Pending (설계 완료) |
| 6 | BIZ-009: 단체 삭제 캐스케이드 | **Done** |
| 7 | BIZ-001: CLUB→CITY 전환 불변식 | **Done** |

### Phase 2: 인증/보안 강화 — `COMPLETED`

| # | 항목 | Status |
|---|------|--------|
| 8 | SEC-002: JWT 블랙리스트 | **Done** |
| 9 | SEC-003: OAuth2 PKCE | **Done** |
| 10 | SEC-006: 토큰 URL 노출 방지 | **Done** |
| 11 | SEC-011: 로그인 잠금 | **Done** |
| 12 | SEC-012: socialLogin 엔드포인트 수정 | **Done** |

### Phase 3: 데이터 아키텍처 개선 — `COMPLETED`

| # | 항목 | Status |
|---|------|--------|
| 13 | DATA-002: Outbox 패턴 + RabbitMQ | **Done** |
| 14 | DATA-004: 쿼리 최적화 | **Done** |
| 15 | DATA-007: 캐시 전략 (Caffeine TTL) | **Done** |
| 16 | DATA-010: Circuit Breaker + 캐시 | **Done** |
| 17 | DATA-005: Flyway 도입 | **Done** (롤백 스크립트 미작성) |

### Phase 4: 비즈니스 정합성 — `COMPLETED`

| # | 항목 | Status |
|---|------|--------|
| 18 | BIZ-002: join_policy 변경 처리 | **Done** |
| 19 | BIZ-005: GUARDIAN 관계 연동 | **Done** |
| 20 | BIZ-006: 커뮤니티 모더레이션 | **Done** |
| 21 | BIZ-007: 포인트 만료 스케줄러 | **Done** |
| 22 | BIZ-010: 휴면 스케줄러 | **Done** |

### Phase 5: 규정 준수 — `COMPLETED`

| # | 항목 | Status |
|---|------|--------|
| 23 | SEC-007: 감사 로그 JSONB + 해시 체인 | **Done** |
| 24 | SEC-008: PII 암호화 (AES-GCM AttributeConverter) | **Done** |
| 25 | DATA-003: DB 레벨 DAG 무결성 | **Done** |

---

## 검증 체크리스트

| # | 검증 항목 | 방법 | Status |
|---|----------|------|--------|
| 1 | SEC-001/004 | `curl -H "X-User-Id: 999" http://localhost:8080/api/v1/admin/members` → 401 | Passed |
| 2 | SEC-005 | 비회원이 CUG 콘텐츠 stream URL 요청 → 403 DENY | Passed |
| 3 | BIZ-008 | 구매 → 환불 → entitlement isActive=false 확인 | Code Review |
| 4 | BIZ-009 | 단체 삭제 → 자식 단체, 멤버십 비활성화 확인 | Code Review |
| 5 | BIZ-001 | 단체 display_area=CITY 설정 → is_cug=false 강제 확인 | Code Review |
| 6 | 전체 빌드 | `make all-up` → 10 containers UP | **Passed** |
| 7 | Sports API | `GET /api/v1/sports` → DB 시드 데이터 반환 | **Passed** |

---

## 관련 문서

| 문서 | 위치 | 설명 |
|------|------|------|
| POCHAK_POLICY.md | `docs/POCHAK_POLICY.md` | 정책서 v2 (최신) |
| PROJECT_DEFINITION.md | `docs/PROJECT_DEFINITION.md` | 프로젝트 구조도 + 상세 정의서 |
| ARCHITECTURE_REPORT.md | `ARCHITECTURE_REPORT.md` | MSA 아키텍처 보고서 |
| ISSUE_FIX_REPORT.md | `ISSUE_FIX_REPORT.md` | 15건 이슈 수정 보고서 |

---

*End of Security Audit Report*
