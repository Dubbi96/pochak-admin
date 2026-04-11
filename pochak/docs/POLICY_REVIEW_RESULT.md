# Pochak 정책서 기반 구현 검토 결과

> 검토일: 2026-03-27
> 검토 기준: POCHAK_POLICY.md, API_SPECIFICATION.md, ARCHITECTURE.md

---

## 전체 현황

| 프로젝트 | ✅ 정상 | ⚠️ 부분 | ❌ 미반영 | 핵심 이슈 |
|---------|-------|--------|---------|----------|
| pochak-gateway | 8 | 3 | 3 | `/admin/**` ADMIN role 강제 누락 |
| pochak-identity-service | 7 | 4 | 1 | Redis blacklist, Push API, 상태 enum |
| pochak-content-service | 12 | 6 | 2 | RBAC 우선순위, 클립 제한, Outbox 미사용 |
| pochak-commerce-service | 12 | 2 | 0 | 부분환불 포인트 |
| pochak-operation-service | 9 | 2 | 0 | 예약 권한 체크 TODO |
| pochak-admin-service | 14 | 3 | 1 | is_verified 토글 미구현 |
| pochak-web-bff | 5 | 0 | 0 | 양호 |
| pochak-app-bff | 5 | 0 | 0 | 양호 |
| pochak-bo-bff | 2 | 1 | 0 | Operation/Commerce CRUD 누락 |
| PochakWebFront | 3 | 0 | 0 | 양호 |
| PochakBOFront | 3 | 1 | 0 | refresh 토큰 갱신 없음 |
| PochakAndroidApp | 4 | 0 | 0 | PKCE code_challenge 누락 |
| PochakiOSApp | 4 | 0 | 0 | PKCE code_challenge 누락 |

---

## HIGH 이슈 (7건) — 수정 완료 여부 추적

| # | 프로젝트 | 이슈 | 상태 |
|---|---------|------|------|
| H1 | Gateway | `/admin/**` ADMIN role 강제 + HealthController 외부화 | ✅ 수정완료 |
| H2 | Identity | Redis token blacklist (TokenBlacklistService) | ✅ 수정완료 |
| H3 | Identity | UNVERIFIED/BLOCKED 상태 enum 추가 | ✅ 수정완료 |
| H4 | Identity | Push 토큰 API (PushTokenController/Service) | ✅ 수정완료 |
| H5 | Content | Stage 1 RBAC 4단계 우선순위 (SUB>SEASON>MATCH>POINT) | ✅ 수정완료 |
| H6 | Content | 클립 180초 제한 + 기본 PRIVATE | ✅ 수정완료 |
| H7 | Mobile | PKCE code_challenge + PkceUtil + push unregister | ✅ 수정완료 |

## MEDIUM 이슈 (11건)

| # | 프로젝트 | 이슈 | 상태 |
|---|---------|------|------|
| M1 | Gateway | HealthController URL 하드코딩 + BFF 헬스체크 누락 | ✅ H1과 함께 수정 |
| M2 | Identity | Guardian 24시간 내 2명 등록 제한 | ✅ 수정완료 |
| M3 | Identity | UserDormancyScheduler 구현 (90→270일) | ✅ 수정완료 |
| M4 | Content | 시티 is_verified + reservation_policy 강제 | ✅ 수정완료 |
| M5 | Content | user_relations ABAC (allowedRelations) | ✅ 수정완료 |
| M6 | Content | time range ABAC (validFrom/validUntil) | ✅ 수정완료 |
| M7 | Content | OutboxEventPublisher Live/VOD 이벤트 적용 | ✅ 수정완료 |
| M8 | Operation | 예약 정책 권한 체크 (Content 서비스 연동) | ✅ 수정완료 |
| M9 | Admin | 단체 인증 is_verified 토글 API | ✅ 수정완료 |
| M10 | BO BFF | Operation/Commerce CRUD 컨트롤러 | ✅ 수정완료 |
| M11 | Commerce | 부분환불 포인트 지급 (WalletService 연동) | ✅ 수정완료 |

## LOW 이슈 (11건)

| # | 프로젝트 | 이슈 | 상태 |
|---|---------|------|------|
| L1 | Gateway | CORS globalcors + CorsConfig 중복 | ✅ 수정완료 |
| L2 | Gateway | ARCHITECTURE.md 라우팅 테이블 업데이트 | ✅ 수정완료 |
| L3 | Identity | JWT HS256 명시적 지정 | ✅ 수정완료 |
| L4 | Content | PostType RECRUIT/GENERAL로 통일 + V024 | ✅ 수정완료 |
| L5 | Content | CompetitionStatus ONGOING으로 변경 + V024 | ✅ 수정완료 |
| L6 | Commerce | Wallet @Version 제거 (PESSIMISTIC_WRITE만) | ✅ 수정완료 |
| L7 | Admin | AppVersion platform String→Platform enum | ✅ 수정완료 |
| L8 | Admin | 감사로그 3년 아카이빙 스케줄러 (매월 1일) | ✅ 수정완료 |
| L9 | WebFront | JWT memory+sessionStorage 보안 강화 | ✅ 수정완료 |
| L10 | BOFront | refresh 토큰 갱신 + 동시 요청 큐 | ✅ 수정완료 |
| L11 | App BFF | MyPage watchHistory+favorites 추가 | ✅ 수정완료 |

---

## 정상 반영 확인 사항

- DB Write Ownership: 5개 서비스 서비스별 DB 역할 전환 완료
- Transactional Outbox: common-lib 인프라 + 5개 서비스 설정 완료
- IdempotentEventConsumer: 4개 소비 서비스 전환 완료
- BFF 원칙: 3개 BFF 모두 DB 미접근, HTTP 호출만 사용
- 포착시티/클럽 Organization 모델: 필드 완비
- CUG 접근 제어: 비회원 홍보+회원전용 구현
- OAuth2 PKCE: PkceStateStore, S256, 30초 single-use
- 프론트/앱 API 경로: Gateway(:8080) 경유 정상
