# Pochak OTT Platform — Project Definition Document

> Version: 2.0.0 | Last Updated: 2026-03-26
> Policy: POCHAK_POLICY.md v2.0.0 Confirmed

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        CLIENTS (Frontend)                               │
│                                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────────┐                │
│  │  BO Web      │   │  Public Web   │   │  Mobile App    │               │
│  │  Next.js 16  │   │  React+Vite  │   │  RN + Expo     │               │
│  │  :3000       │   │  :3100       │   │  :8097         │               │
│  │  65 pages    │   │  50 pages    │   │  59 screens    │               │
│  └──────┬───────┘   └──────┬───────┘   └──────┬─────────┘               │
│         │                  │                   │                          │
│  ┌──────┴──────────────────┴───────────────────┴──────┐                  │
│  │              Shared Packages (15 files)             │                  │
│  │  @pochak/api-client · @pochak/domain-types          │                  │
│  │  @pochak/design-tokens · @pochak/utils              │                  │
│  └────────────────────────────────────────────────────┘                  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ HTTPS / JWT
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (:8080)                                 │
│                   Spring Cloud Gateway (Reactive)                        │
│                                                                          │
│   Filters: JWT Validation → Redis Rate Limit → Correlation ID            │
│   Public: /home, /contents, /search, /sports, /schedule, /communities    │
│   Admin:  /admin/** (BO 전용)                                            │
└────┬──────────┬──────────┬──────────┬──────────┬────────────────────────┘
     │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼
┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
│Identity ││Content  ││Commerce ││Operation││ Admin   │
│ :8081   ││ :8082   ││ :8083   ││ :8084   ││ :8085   │
│ 66 Java ││241 Java ││ 69 Java ││ 60 Java ││103 Java │
└────┬────┘└────┬────┘└────┬────┘└────┬────┘└────┬────┘
     │          │          │          │          │
     └──────────┴──────────┴──────────┴──────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
     ┌──────────────┐         ┌──────────────┐
     │ PostgreSQL 16│         │   Redis 7    │
     │   :5432      │         │   :6379      │
     │  5 schemas   │         │  Rate Limit  │
     │ 18 migrations│         │  Cache       │
     └──────────────┘         └──────────────┘
```

---

## 2. Service Inventory

### 2.1 Backend Services

| Service | Port | Schema | Java Files | Key Domains |
|---------|------|--------|-----------|-------------|
| **pochak-gateway** | 8080 | — | 11 | JWT, Rate Limit, CORS, Routing |
| **pochak-identity-service** | 8081 | identity | 66 | Auth, Signup (4경로), OAuth2, User Profile |
| **pochak-content-service** | 8082 | content | 241 | Organization (DAG), Competition, Match, Live/VOD/Clip, Tag, Membership, ACL, Search, Recommendation, Community, Home, Follow, Comment, Like, Favorite, Schedule, Highlight, Notification, Upload, Streaming |
| **pochak-commerce-service** | 8083 | commerce | 69 | Product, Purchase, Wallet, Coupon, Refund, Entitlement, GiftBall |
| **pochak-operation-service** | 8084 | operation | 60 | Venue, Camera, Reservation, Studio, Streaming Ingest, VPU |
| **pochak-admin-service** | 8085 | admin | 103 | RBAC, Analytics, Banner, Notice, Popup, Event, Terms, Inquiry, Report, AppVersion, AuditLog |
| **pochak-common-lib** | — | — | 14 | ApiResponse, ErrorCode, UserContext, DomainEvent, PageMeta |

### 2.2 Frontend Applications

| App | Framework | Port | Pages/Screens |
|-----|-----------|------|--------------|
| **BO Web** | Next.js 16 (App Router) | 3000 | 65 pages |
| **Public Web** | React 19 + Vite 8 (SPA) | 3100 | 50 pages |
| **Mobile App** | React Native 0.76 + Expo 52 | 8097 | 59 screens |

### 2.3 Infrastructure

| Component | Version | Port | Purpose |
|-----------|---------|------|---------|
| PostgreSQL | 16-alpine | 5432 | Primary DB (5 schemas) |
| Redis | 7-alpine | 6379 | Rate Limiting, Cache |
| Docker Compose | — | — | 10 containers |

---

## 3. Database Schema Map

```
PostgreSQL (pochak)
├── identity ─── users, user_auth_accounts, user_consents, user_preferences,
│                user_status_history, user_refresh_tokens, user_push_tokens,
│                user_notification_settings, user_relations,
│                phone_verifications, email_verifications
│
├── content ──── sports, sport_tags, organizations, teams, memberships,
│                competitions, competition_visits, matches, match_participants,
│                live_assets, vod_assets, clip_assets, asset_tags,
│                video_acl, view_history, display_sections, favorites,
│                watch_reservations, notifications, notification_recipients,
│                comments, follows, highlights, community_posts
│
├── commerce ─── products, purchases, wallets, wallet_ledger,
│                entitlements, refunds, coupons, user_coupons, gift_balls
│
├── operation ── venues, cameras, venue_cameras, reservations, studio_sessions
│
└── admin ────── admin_users, admin_roles, admin_groups, admin_menus,
                 admin_functions, admin_group_users, admin_group_roles,
                 admin_role_menus, admin_role_functions, audit_logs,
                 banners, popups, notices, events, advertisements,
                 inquiries, inquiry_answers, reports, terms,
                 app_versions, system_config, analytics_events
```

**Migration History** (18 files):

| Version | Name | Tables |
|---------|------|--------|
| V000 | init_schemas | 5 schemas |
| V001 | identity_schema | 11 tables |
| V002 | content_schema | ~20 tables |
| V003 | commerce_schema | 6 tables |
| V004 | operation_schema | 6 tables |
| V005 | admin_schema | 15+ tables |
| V006 | org_simplification_abac | 4 tables |
| V007 | coupon_tables | 2 tables |
| V008 | social_features | 3 tables |
| V009 | highlights | 1 table |
| V010 | analytics | 1 table |
| V011 | signup_account_system | 3 tables |
| V012 | fix_identity_schema | fixes |
| V013 | **organization_v2_fields** | 6 columns |
| V014 | **competition_visibility** | 2 columns + 1 table |
| V015 | **community_posts** | 1 table |
| V016 | **cleanup_deprecated** | data migration |
| V100-V101 | seed data | initial data |

---

## 4. Platform Areas (Policy v2)

### 4.1 포착 TV

```
메인 진입점 → 개인화 피드 (추천/인기/최신)
├── 홈 배너 (BO 관리)
├── 라이브 경기
├── VOD 다시보기
├── 클립 하이라이트
├── 대회/리그 목록
└── 검색/추천
```

### 4.2 포착 시티

```
지역 기반 체육시설 → 예약 현황
├── 시설 목록 (시/도/시/군/구 필터)
├── 시설 상세 (예약현황, 영업시간, 연락처)
├── 인증된 단체 (is_verified=true, BO 인증)
├── 촬영 예약 (ALL_MEMBERS 정책)
└── 공개 콘텐츠 (기본 PUBLIC)
```

### 4.3 포착 클럽

```
B2B/B2C 단체 → 가입 기반 접근
├── 오픈 단체: 자유 가입 + 공개 콘텐츠
├── CUG 단체: 단체 정보 공개 + 콘텐츠 제한
│   ├── 홍보용 영상 (visibility=PUBLIC, 비회원 시청 가능)
│   └── 회원 전용 영상 (visibility=MEMBERS_ONLY, 가입 후 시청)
├── 커뮤니티 (소식/구인/모집, 지역 기반)
└── 가입 정책: OPEN / APPROVAL / INVITE_ONLY
```

---

## 5. API Endpoint Map

### 5.1 Identity Service (:8081)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | 로그인 |
| `/auth/signup` | POST | 국내 성인 가입 |
| `/auth/signup/minor` | POST | 미성년 가입 |
| `/auth/signup/social` | POST | SNS 가입 |
| `/auth/signup/foreign` | POST | 해외 가입 |
| `/auth/phone/send-code` | POST | SMS 인증코드 발송 |
| `/auth/phone/verify-code` | POST | 인증코드 검증 |
| `/auth/oauth2/callback/{provider}` | GET | OAuth2 콜백 |
| `/auth/oauth2/complete-signup` | POST | OAuth 가입 완료 |
| `/auth/refresh` | POST | 토큰 갱신 |
| `/users/me` | GET/PUT | 프로필 조회/수정 |
| `/users/me/preferences` | GET/PUT | 선호 설정 |
| `/admin/members` | GET | 관리자 회원 목록 |

### 5.2 Content Service (:8082)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sports` | CRUD | 종목 관리 |
| `/organizations` | CRUD | **단체 관리 (DAG, display_area, CUG, join_policy)** |
| `/competitions` | CRUD | **대회 관리 (visibility, inviteCode)** |
| `/competitions/access` | POST | **비공개 대회 접근 (inviteCode 검증)** |
| `/competitions/visited` | GET | **방문한 비공개 대회 목록** |
| `/matches` | CRUD | 경기 관리 |
| `/contents/live` | CRUD | 라이브 에셋 |
| `/contents/vod` | CRUD | VOD 에셋 |
| `/contents/clips` | CRUD | 클립 에셋 |
| `/contents/tags` | CRD | 태그 관리 |
| `/contents/{type}/{id}/access` | GET | **콘텐츠 접근 권한 확인 (CUG 포함)** |
| `/memberships` | CRUD | 멤버십 관리 (승인/거절) |
| `/communities/posts` | CRUD | **커뮤니티 게시물 (소식/구인/모집/자유)** |
| `/communities/posts/{id}/pin` | PUT | 게시물 고정 |
| `/communities/posts/{id}/report` | POST | 게시물 신고 |
| `/home` | GET | 홈 데이터 |
| `/search` | GET | 통합 검색 |
| `/recommendations` | GET | 추천 콘텐츠 |
| `/follows` | POST/DELETE | 팔로우 |
| `/notifications` | CRUD | 알림 |

### 5.3 Commerce Service (:8083)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products` | CRUD | 상품 관리 |
| `/purchases` | POST/GET | 구매 |
| `/wallet` | GET | 지갑 잔액 |
| `/wallet/charge` | POST | 포인트 충전 |
| `/wallet/use` | POST | 포인트 사용 |
| `/coupons` | GET/POST | 쿠폰 |
| `/refunds` | POST/GET/PUT | 환불 |
| `/entitlements/check` | GET | 시청 권한 확인 |

### 5.4 Operation Service (:8084)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/venues` | CRUD | 경기장 관리 |
| `/venues/search` | GET | 경기장 검색 |
| `/venues/nearby` | GET | 주변 경기장 |
| `/cameras` | CRUD | 카메라 관리 |
| `/reservations` | CRUD | 촬영 예약 |
| `/reservations/calendar` | GET | 캘린더 뷰 |
| `/streaming/ingest/*` | CRUD | 스트리밍 인제스트 |
| `/studio/sessions` | GET | 스튜디오 세션 |

### 5.5 Admin Service (:8085)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/api/v1/auth/login` | POST | BO 로그인 |
| `/admin/api/v1/rbac/*` | CRUD | RBAC 관리 |
| `/admin/api/v1/analytics/*` | GET/POST | 분석 |
| `/admin/api/v1/site/*` | CRUD | 배너/공지/팝업/이벤트 |
| `/admin/api/v1/cs/*` | GET | 고객센터 |
| `/admin/api/v1/app/*` | CRUD | 앱 버전 |

---

## 6. BO Web Pages (65 pages)

### Menu Structure (19 sections)

```
 1. 종목 관리 ──────────── /sports/list
 2. 협회 관리 ──────────── /teams/associations
 3. 구장 관리 ──────────── /venues/list
 4. 팀/단체 관리 ────────── /teams/elite, club, private-hq, private-branch, public-org
 5. 대회/리그 관리 ──────── /competitions/list, schedule
 6. VPU 관리 ────────────── /equipment/cameras, vpu-devices, vpu-contracts
 7. 촬영예약 관리 ────────── /reservations, reservations/booking
 8. 스튜디오 관리 ────────── /studio
 9. 컨텐츠 관리 ──────────── /contents/live, vod, clips, tags (+ create, upload)
10. 회원 관리 ──────────── /members/list, blacklist
11. 커뮤니티 관리 ────────── /community/posts, reports        ★ Policy v2 신규
12. 뽈/시즌권/환불 ──────── /commerce/* (9개 서브메뉴)
13. 사이트 관리 ──────────── /site/popups, banners, notices, events
14. 앱 관리 ────────────── /app-management
15. 고객센터 관리 ────────── /support/inquiries, reports, terms
16. 운영 관리 ──────────── /operations/members, groups, permissions, menus
17. 모니터링 ────────────── /monitoring
18. 통계 ──────────────── /statistics/users, views, sales
19. 스카이라이프 계약 ────── /skylife/activation, vpu-chu
```

---

## 7. Key Policy v2 Implementations

### 7.1 Organization DAG (단체 자가참조 계층)

```java
// Organization.java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "parent_id")
private Organization parent;  // 자가참조 DAG

// 신규 필드
private DisplayArea displayArea;      // CITY | CLUB
private Boolean isVerified;           // 시티 인증
private Boolean isCug;                // CUG 모드
private JoinPolicy joinPolicy;       // OPEN | APPROVAL | INVITE_ONLY
private ReservationPolicy reservationPolicy;  // ALL_MEMBERS | MANAGER_ONLY
private String siGunGuCode;           // 지역 코드
```

**안전성**: 순환참조 감지 + 최대 5단계 깊이 제한 (OrganizationService)

### 7.2 Competition Visibility (비공개 대회)

```java
// Competition.java
private CompetitionVisibility visibility;  // PUBLIC | PRIVATE
private String inviteCode;                 // UUID (PRIVATE 시 자동 생성)

// CompetitionVisit.java — 방문 기록
@Table(uniqueConstraints = @UniqueConstraint({"user_id", "competition_id"}))
private Long userId, competitionId;
private LocalDateTime firstVisitedAt;
```

### 7.3 CUG Content Access Control

```
VideoAclService.evaluateAccess():
  1. CUG 단체 확인 (org.isCug)
  2. visibility=PUBLIC → ALLOW (홍보용)
  3. visibility=MEMBERS_ONLY → 멤버십 확인
  4. 비회원 → "가입 후 시청 가능" DENY
```

### 7.4 Community Module

```java
// CommunityPost.java
PostType: NEWS | RECRUITING | RECRUITMENT | FREE
siGunGuCode: 지역 기반 노출
isPinned: 관리자 고정

// API: /communities/posts
GET (list + filter), POST, PUT, DELETE, PUT pin/unpin, POST report
```

---

## 8. Design System (CLAS Motif)

| Token | Value |
|-------|-------|
| Primary | `#2563eb` (blue-600) |
| Primary Light | `#dbeafe` (blue-100) |
| Background | `#f8f9fb` |
| Card | `#ffffff`, border `#e5e7eb`, rounded-lg, shadow-sm |
| Sidebar | White, 220px, active=blue-50 + left 3px blue border |
| Header | White, 56px, bottom border |
| Font | Pretendard |
| Status Chips | 완료=blue, 대기=amber, 실패=red, 활성=green |

---

## 9. Environment Variables

| Variable | Service | Required |
|----------|---------|----------|
| JWT_SECRET | Gateway, Identity | Yes (min 32 chars) |
| CORS_ALLOWED_ORIGINS | Gateway | Yes |
| DB_HOST/PORT/NAME/USER/PASSWORD | All services | Yes |
| REDIS_HOST/PORT | Gateway, Content | Yes |
| KAKAO_REST_API_KEY | Identity | Yes |
| GOOGLE_CLIENT_ID | Identity | Yes |
| NAVER_CLIENT_ID | Identity | Yes |
| COMMERCE_SERVICE_URL | Content | Default: localhost:8083 |
| CDN_BASE_URL | Content, Operation | Default: cdn.pochak.co.kr |

---

## 10. Build & Run

```bash
# Full stack (10 containers)
make all-up

# Development
make deps-up        # DB + Redis only
make bo-dev         # BO Web dev server (:3000)
make web-dev        # Public Web dev server (:3100)
make mobile-dev     # Expo Metro (:8097)

# Verify
make status         # Container status
make logs           # All logs
```

---

## 11. File Counts Summary

| Component | Files | Lines (est.) |
|-----------|-------|-------------|
| Backend Java | 550 | ~25,000 |
| BO Web (TSX/TS) | ~120 | ~15,000 |
| Public Web (TSX/TS) | ~80 | ~8,000 |
| Mobile (TSX/TS) | ~90 | ~10,000 |
| SQL Migrations | 18 | ~1,600 |
| Shared Packages | 15 | ~500 |
| Docker/CI/Infra | 10 | ~300 |
| **Total** | **~883** | **~60,000** |

---

*End of Project Definition Document*
