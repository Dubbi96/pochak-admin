# Pochak 개발 세션 요약서

> Session: 2026-03-24 ~ 2026-03-26
> Status: **Phase 0-4 수정 완료, Entity-DB 매핑 정합 진행 중**

---

## 1. 완료된 작업 목록

### 1-1. 아키텍처 분석 & 문서화

| 산출물 | 파일 | 내용 |
|--------|------|------|
| 아키텍처 보고서 | `ARCHITECTURE_REPORT.md` | 6 서비스 + 1 Gateway 전체 분석, API 명세, 서비스 간 연결 |
| 이슈 수정 보고서 | `ISSUE_FIX_REPORT.md` | 15건 이슈 수정 상세 (Critical 4 / High 4 / Medium 6 / Low 5) |
| 정책서 v2 | `docs/POCHAK_POLICY.md` | 포착 TV/시티/클럽 3영역, DAG 단체, CUG, 커뮤니티 |
| 정책서 PDF | `docs/POCHAK_POLICY.pdf` | 인쇄/공유용 |
| 프로젝트 정의서 | `docs/PROJECT_DEFINITION.md` | 전체 구조도 + 상세 정의서 |
| 프로젝트 정의서 PDF | `docs/PROJECT_DEFINITION.pdf` | 663KB |
| 보안 감사 보고서 | `docs/SECURITY_AUDIT_REPORT.md` | 33건 허점 + Phase별 로드맵 |
| 보안 감사 보고서 PDF | `docs/SECURITY_AUDIT_REPORT.pdf` | 767KB |

### 1-2. 15건 이슈 수정 (초기)

| # | 심각도 | 이슈 | 수정 |
|---|--------|------|------|
| 001 | Critical | Content↔Commerce Entitlement 연동 부재 | RestClient 기반 서비스 간 통신 |
| 003-005 | Critical | Gateway 라우팅 누락/충돌 | RouteConfig 전면 재설계 |
| 006 | High | Domain Event 발행 미구현 | 실제 publish() 호출 추가 |
| 007 | High | AdminMemberService 인메모리 필터링 | DB 레벨 JPQL 필터링 |
| 008 | High | Streaming Stub 미비 | ConditionalOnProperty + 설정 기반 교체 |
| 009 | High | BO Web Gateway 우회 | Gateway 경유로 변경 |
| 010-015 | Medium | PG/SMS 추상화, CORS, JWT, Redis, Notification | 각각 인터페이스+stub 패턴 |
| 016-020 | Low | OpenAPI, 테스트, Health, PageMeta, Event 직렬화 | 각각 구현 |

### 1-3. OAuth2 프로필 데이터 수정

- signupToken에 name/profileImageUrl 포함
- completeOAuthSignup에서 프로필 저장
- 기존 로그인 시 enrichUserFromOAuth() 호출

### 1-4. BO Web 디자인 리디자인 (CLAS 모티브)

| 변경 | 상세 |
|------|------|
| 테마 | 다크→라이트, emerald→blue-600, Pretendard 폰트 |
| 사이드바 | 220px 라이트 테마, 좌측 블루 보더 액티브 |
| 헤더 | 56px white GNB, 프로필 드롭다운 |
| 컴포넌트 | 버튼/뱃지/카드/테이블/필터/모달 전체 CLAS 스타일 |
| 에러 페이지 | 404(고양이)/500(로봇)/505(우주인) SVG 일러스트 |
| 로그인 | 다크 그래디언트 + white 카드 |

### 1-5. Hogak BO 명세 정합

- 사이드바 18개 대메뉴 재편
- 17개 신규 페이지 생성 (팀/단체 6, 뽈/시즌권 4, VPU 2, 사이트 2, 예약 1, 스카이라이프 2)
- 총 65페이지 빌드 성공

### 1-6. Policy v2 백엔드 구현

| Step | 작업 | 파일 |
|------|------|------|
| 1 | Organization DAG + 6개 신규 필드 + 순환참조 방지 | Organization.java + Enums + Migration V013 |
| 2 | Competition visibility + CompetitionVisit | Competition.java + V014 |
| 3 | Asset visibility 통일 + CUG ACL + 예약 정책 | LiveAsset, VideoAclService, ReservationService |
| 4 | Community 모듈 신규 | Entity/Repo/DTO/Service/Controller + V015 + Gateway |

### 1-7. Policy v2 프론트엔드 구현

| 영역 | 작업 |
|------|------|
| BO Web | 단체 설정 확장, 대회 비공개, 커뮤니티 관리 2페이지, 사이드바 |
| Public Web | 포착 시티, 대회 초대, 클럽 CUG, 커뮤니티 |
| Mobile | 시티 인증뱃지, 클럽 CUG 잠금, 커뮤니티 탭, 대회 딥링크 |
| Shared | domain-types policy-v2.ts, shared types |

### 1-8. 보안 허점 수정 (33건 중 25건 완료)

| Phase | 수정 항목 | 상태 |
|-------|----------|------|
| Phase 0 | SEC-001, SEC-004, SEC-005 | **완료** |
| Phase 1 | BIZ-008, BIZ-009, BIZ-001 | **완료** |
| Phase 2 | SEC-002, SEC-003 (PKCE), SEC-006 (토큰 URL), SEC-011, SEC-012 | **완료** |
| Phase 3-4 | BIZ-002, BIZ-007, BIZ-010, DATA-004 (쿼리 최적화), DATA-010 (Circuit Breaker) | **완료** |
| Phase 5 | SEC-007 (감사 로그), SEC-009 (캐시 TTL), SEC-010 (Rate Limiter 폴백), SEC-013 (inviteCode 제한) | **완료** |
| Data | DATA-006 (community FK), DATA-008 (visit 만료), DATA-009 (상품 스냅샷) | **완료** |

### 1-9. DB 정합

- Entity `active` → `@Column(name = "is_active")` 매핑 수정 (8개 Entity)
- `ddl-auto: update`로 전환 (5개 서비스)
- 누락 DB 컬럼 수동 추가 (description, icon_url 등)
- LiveAssetRepository JPQL `m.name` → `m.title` 수정

### 1-10. Entity-DB 매핑 전면 정합 (2026-03-26)

- **V017 마이그레이션**: 17개 섹션 — Competition DATE 변환, 누락 컬럼 추가, 테이블 리네임(view_history→view_histories, user_status_history→user_status_histories), 인덱스 정리
- **Entity @Column 추가**: Camera(model, manufacturer), VenueCamera(position), Venue(address, description), StudioSession(status)
- **JPQL 버그 수정**: LiveAssetRepository `m.venue` → `m.venueId`, 파라미터 타입 String→Long
- 70개 Entity 감사 완료

### 1-11. Mock→실 API 전환 (2026-03-26)

- **Priority 1 (6개 파일)**: content, competition, organization, member, operation, content-asset — 102개 실 API 호출
- **Priority 2 (5개 파일)**: commerce-admin, admin, site, support, reservation — 45개 실 API 호출
- **Priority 3 (6개 파일)**: statistics, monitoring, streaming, studio, app-management, promotion — TODO 마킹
- 모든 파일 hybrid 패턴 (실 API 시도 → 실패 시 mock fallback)

### 1-12. 보안 2차 수정 (2026-03-26)

| 항목 | 구현 내용 |
|------|----------|
| DATA-010 | Resilience4j Circuit Breaker + Caffeine 5분 캐시 + grace access (degraded 플래그) |
| SEC-003 | RFC 7636 PKCE — PkceUtil(S256), PkceStateStore(10분 TTL), 모바일 필수/웹 선택 |
| SEC-006 | AuthCodeStore(30초 일회용) + POST /auth/oauth2/token 토큰 교환 + 프론트엔드 연동 |
| SEC-007 | AuditLog JSONB + SHA-256 해시 체인 + synchronized thread-safety |
| SEC-009 | CaffeineCacheManager 5분 TTL + @CacheEvict 6개 mutation 메서드 |
| DATA-004 | EntitlementRepo/MembershipRepo scope-filtered JPQL + 4개 부분 인덱스 |

---

## 2. 다음 세션에서 해야 할 작업

### 2-1. 보안 감사 미수정 항목 (8건)

| 분류 | 미수정 항목 | 성격 |
|------|----------|------|
| 인프라 필요 | DATA-001 (사용자 탈퇴 cross-schema), DATA-002 (Outbox 이벤트), DATA-005 (Flyway 롤백) | 이벤트/메시징 인프라 필요 |
| 설계 필요 | BIZ-005 (GUARDIAN 보호자), BIZ-006 (커뮤니티 모더레이션) | 정책 결정 + 신규 API 설계 |
| 대규모 | SEC-008 (PII AES-256 암호화), DATA-003 (DAG DB 트리거) | KMS 인프라 + SQL 트리거 |
| 정책 | BIZ-003, BIZ-004 (CUG 정책 명확화) | 비즈니스 정책 확정 후 구현 |

### 2-2. Mock→실 API 전환 잔여 (Priority 3)

| 파일 | 필요 사항 |
|------|----------|
| statistics-api.ts | Admin Service analytics 엔드포인트 구현 필요 |
| monitoring-api.ts | 신규 모니터링 엔드포인트 필요 |
| streaming-api.ts | 스트리밍 인프라 배포 후 연동 |
| studio-api.ts | 스튜디오 세션 엔드포인트 구현 필요 |
| app-management-api.ts | Admin Service 앱 버전 관리 |
| promotion-api.ts | Commerce Service 프로모션 |

### 2-3. 통합 테스트

- DB 마이그레이션 V017~V021 실행 확인
- Entity-DB validate 모드 전환 테스트
- Circuit Breaker 동작 검증 (Commerce 서비스 다운 시나리오)
- PKCE OAuth 플로우 E2E 테스트 (모바일/웹)

---

## 3. 프로젝트 현재 수치

| 항목 | 수치 |
|------|------|
| Backend Java files | ~560 |
| BO Web pages | 65 |
| Public Web pages | 50 |
| Mobile screens | 59 |
| DB migrations | 23 (V017~V021 추가) |
| Docker containers | 10 |
| 문서 파일 (docs/) | 8 |
| 정책서 체크 항목 | 20 섹션 |
| 보안 허점 수정률 | 25/33 (76%) |

---

## 4. 환경 설정 현황

| 설정 | 값 | 비고 |
|------|---|------|
| ddl-auto | `update` (전 서비스) | 개발 편의를 위해 전환. 프로덕션에서는 `validate` 또는 `none`으로 복원 필요 |
| Rate Limit | Redis + in-memory 폴백 + trusted proxy | SEC-010 적용 |
| Cache | Caffeine 5분 TTL (Content ACL), In-memory (기타) | SEC-009 적용 |
| Circuit Breaker | Resilience4j (Commerce→Content) | DATA-010 적용 |
| OAuth PKCE | S256, 모바일 필수 | SEC-003 적용 |
| Auth Code Exchange | 30초 일회용, POST body 토큰 반환 | SEC-006 적용 |
| JWT Secret | 환경변수 필수 (32자+) | Gateway + Identity |
| CORS | 환경변수 설정 | localhost:3000, 3100, 8097 |
| Streaming Provider | mock/stub | 실 연동 필요 |
| Payment Provider | stub | 실 PG 연동 필요 |
| SMS Provider | stub | 실 SMS 연동 필요 |

---

*End of Session Summary*
