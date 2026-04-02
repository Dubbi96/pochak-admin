# Pochak OTT Platform - Architecture Document

> Version: 1.0.0
> Last Updated: 2026-03-26

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Service Responsibilities](#2-service-responsibilities)
3. [Data Flow Diagrams](#3-data-flow-diagrams)
4. [Database Schema](#4-database-schema)
5. [Security Architecture](#5-security-architecture)
6. [Event Architecture](#6-event-architecture)
7. [Technology Stack](#7-technology-stack)
8. [Deployment Architecture](#8-deployment-architecture)

---

## 1. System Overview

Pochak is a microservice-based OTT platform for sports content streaming. The system serves three user-facing surfaces (Mobile App, Public Web, BO Web) through a single API Gateway that routes to five domain services sharing one PostgreSQL instance (schema-per-service) with RabbitMQ for async events and Redis for caching/rate-limiting.

```
 ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
 │  Mobile App  │  │  Public Web  │  │   BO Web     │
 │  (Flutter)   │  │  (React/Vite)│  │  (Next.js)   │
 └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
        │                 │                  │
        └────────┬────────┘──────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────────────────┐
  │           API Gateway  :8080                     │
  │  ┌────────────────────────────────────────────┐  │
  │  │  JwtValidationFilter (SEC-001 ~ SEC-004)   │  │
  │  │  CorrelationIdFilter (X-Correlation-Id)    │  │
  │  │  RateLimitFilter (Redis + in-memory)       │  │
  │  │  CorsWebFilter (origin whitelist)          │  │
  │  │  RouteConfig (path-based routing)          │  │
  │  └────────────────────────────────────────────┘  │
  └──────────────────────┬───────────────────────────┘
                         │
       ┌─────────┬───────┼────────┬──────────┐
       ▼         ▼       ▼        ▼          ▼
  ┌─────────┐ ┌────────┐ ┌────────┐ ┌─────────┐ ┌───────┐
  │Identity │ │Content │ │Commerce│ │Operation│ │ Admin │
  │ :8081   │ │ :8082  │ │ :8083  │ │ :8084   │ │ :8085 │
  └────┬────┘ └───┬────┘ └───┬────┘ └────┬────┘ └───┬───┘
       │          │          │           │           │
       └────┬─────┘──────────┘───────────┘───────────┘
            │          │              │
            ▼          ▼              ▼
  ┌──────────────┐ ┌────────────┐ ┌──────────────┐
  │ PostgreSQL   │ │   Redis    │ │  RabbitMQ    │
  │    :5432     │ │   :6379    │ │  :5672       │
  │ (5 schemas)  │ │ (cache,    │ │ (events,     │
  │              │ │  blacklist,│ │  best-effort) │
  │              │ │  rate-limit│ │              │
  └──────────────┘ └────────────┘ └──────────────┘
```

### Gateway Routing Rules

The Gateway uses path-prefix-based routing with `stripPrefix(2)` to remove `/api/v1` before forwarding:

| Priority | Route | Path Patterns | Target |
|----------|-------|---------------|--------|
| 1 | content-user-routes | `/api/v1/users/me/watch-history/**`, `/api/v1/users/me/favorites/**` | Content :8082 |
| 2 | identity-service | `/api/v1/auth/**`, `/api/v1/users/**`, `/api/v1/guardians/**`, `/api/v1/admin/members/**` | Identity :8081 |
| 3 | operation-service | `/api/v1/venues/**`, `/api/v1/cameras/**`, `/api/v1/reservations/**`, `/api/v1/streaming/ingest/**`, `/api/v1/studio/**` | Operation :8084 |
| 4 | content-service | `/api/v1/contents/**`, `/api/v1/sports/**`, `/api/v1/teams/**`, `/api/v1/competitions/**`, `/api/v1/matches/**`, `/api/v1/home/**`, `/api/v1/clubs/**`, `/api/v1/organizations/**`, `/api/v1/search/**`, `/api/v1/recommendations/**`, `/api/v1/upload/**`, `/api/v1/follows/**`, `/api/v1/memberships/**`, `/api/v1/schedule/**`, `/api/v1/comments/**`, `/api/v1/notifications/**`, `/api/v1/streaming/**`, `/api/v1/communities/**` | Content :8082 |
| 5 | commerce-service | `/api/v1/subscriptions/**`, `/api/v1/payments/**`, `/api/v1/products/**`, `/api/v1/wallet/**`, `/api/v1/purchases/**`, `/api/v1/refunds/**`, `/api/v1/entitlements/**`, `/api/v1/coupons/**` | Commerce :8083 |
| 6 | admin-service | `/admin/**` | Admin :8085 (no stripPrefix) |

Route ordering resolves two known path conflicts:
- **ISSUE-004**: `/api/v1/users/me/watch-history` and `/api/v1/users/me/favorites` go to Content, not Identity.
- **ISSUE-005**: `/api/v1/streaming/ingest/**` goes to Operation; `/api/v1/streaming/**` goes to Content.

---

## 2. Service Responsibilities

### 2.1 Identity Service (pochak-identity-service)

**Owns**: User accounts, authentication, authorization tokens, guardian relationships

| Domain | Responsibility |
|--------|---------------|
| Auth | Login (email/password), signup (4 routes: domestic, minor, social, foreign), token refresh, logout, withdrawal |
| OAuth2 | PKCE-based OAuth2 flow for Kakao/Google/Naver, auth code exchange (SEC-003, SEC-006) |
| Phone Verification | Send/verify SMS codes (mock), duplicate phone check |
| User Profile | Profile CRUD, preferences (sports/areas), account status |
| Guardian | Guardian-minor relationships, consent verification, monthly payment limit management |
| Admin Members | Member list/search, status/role updates for BO |

**Events Published**: `UserWithdrawnEvent` (consumed by all services)

### 2.2 Content Service (pochak-content-service)

**Owns**: Sports metadata, media assets, social features, community

| Domain | Responsibility |
|--------|---------------|
| Home | Aggregated home feed (banners, sections, recommended) |
| Sports & Tags | Sport definitions, sport tags (종목/태그 관리) |
| Teams | Team entities linked to sports |
| Organizations | Organization hierarchy (PRIVATE/PUBLIC), branches |
| Clubs | Club discovery (nearby/popular/recent), join, member list |
| Competitions | Competition CRUD, invite code access (rate-limited), visited tracking |
| Matches | Match lifecycle (SCHEDULED -> LIVE -> FINISHED), filtering |
| Live Assets | Live stream metadata, visibility management |
| VOD Assets | VOD metadata, visibility, bulk operations |
| Clip Assets | Clip creation (direct + from time range), auto-clip from highlights |
| Tags | Asset tagging system (cross-asset-type) |
| Highlights | Manual and auto-detected highlights, clip generation |
| Timeline | Timeline events for live/VOD content |
| Player | Player detail aggregation (stream URL, cameras, quality, match info, highlights) |
| Streaming | Playback URL generation with ABAC enforcement, camera views, quality levels |
| ACL (ABAC) | Video access control (visibility, org membership, subscription) |
| Comments | Threaded comments on content |
| Likes | Like/unlike toggle, count |
| Follows | Follow entities (teams, orgs, users), follower counts |
| Memberships | Organization membership (join, approve/reject, role management) |
| Community | Community posts (NEWS/RECRUIT/GENERAL), moderation (report/resolve/action) |
| Search | Unified search, suggestions, trending terms |
| Schedule | Today's competitions, match schedule by date |
| Recommendations | Personalized, similar, trending, content-based, feed |
| Watch History | View event recording, history retrieval |
| Favorites | User favorites (add/remove/list) |
| Notifications | Notification creation, user inbox, read status, unread count |
| Upload | VOD upload (presigned URL), transcoding pipeline, live-to-VOD conversion |

**Events Published**: `ContentPublishedEvent`, `LiveStreamStartedEvent`, `LiveStreamEndedEvent`, `ClipCreatedEvent`
**Events Consumed**: `UserWithdrawnEvent`

### 2.3 Commerce Service (pochak-commerce-service)

**Owns**: Products, purchases, entitlements, wallet, refunds, coupons

| Domain | Responsibility |
|--------|---------------|
| Products | Product definitions (SUBSCRIPTION/SINGLE/POINT_PACK), CRUD |
| Purchases | Purchase creation, history, cancellation |
| Entitlements | Access right management, entitlement check (type/scope-based) |
| Wallet | Point balance, charge, use, transaction history (ledger) |
| Refunds | Refund request, admin processing (approve/reject) |
| Coupons | Coupon registration by code, usage, available listing |

**Events Published**: `PurchaseCompletedEvent`, `RefundProcessedEvent`, `SubscriptionActivatedEvent`
**Events Consumed**: `UserWithdrawnEvent`

### 2.4 Operation Service (pochak-operation-service)

**Owns**: Venues, cameras, reservations, studio sessions, streaming ingest

| Domain | Responsibility |
|--------|---------------|
| Venues | Venue CRUD, search (keyword/geo/nearby), camera linking |
| Cameras | Camera inventory management |
| Reservations | Filming reservation lifecycle (PENDING -> CONFIRMED/CANCELLED), calendar view |
| Studio | Studio session tracking per venue/match |
| Streaming Ingest | RTMP ingest endpoint management, transcoding pipeline (start/stop), playback URL generation |

**Events Published**: `ReservationCreatedEvent`, `ReservationCancelledEvent`
**Events Consumed**: `UserWithdrawnEvent`

### 2.5 Admin Service (pochak-admin-service)

**Owns**: BO user management, RBAC, site content, CS, analytics

| Domain | Responsibility |
|--------|---------------|
| Auth | BO admin login |
| RBAC | Roles, groups, menus, functions, member assignment, effective permissions |
| Site | Banner management, notice management |
| CS | Inquiry listing, report listing, terms management |
| App Versions | Mobile app version management (force update support) |
| Analytics | Event ingestion (bulk), dashboard KPIs |

**Events Published**: Audit events (via `AuditEventListener`)
**Events Consumed**: `UserWithdrawnEvent`

### 2.6 Gateway (pochak-gateway)

**Owns**: Request routing, cross-cutting concerns

| Concern | Implementation |
|---------|---------------|
| JWT Validation | `JwtValidationFilter` - validates token, strips/injects X-User-Id/X-User-Role |
| Rate Limiting | `RateLimitFilter` (in-memory) / `RedisRateLimitFilter` (Redis) |
| CORS | `CorsWebFilter` with configurable origin whitelist |
| Correlation ID | `CorrelationIdFilter` - generates/propagates X-Correlation-Id |
| Health Check | Periodic downstream health monitoring (60s interval) |
| Routing | Spring Cloud Gateway path-based routing with priority ordering |

---

## 3. Data Flow Diagrams

### 3.1 OAuth2 Login (PKCE + Auth Code Exchange)

```
Mobile App                  Gateway       Identity Service     OAuth Provider (Kakao)
    │                         │                 │                       │
    │  GET /auth/oauth2/      │                 │                       │
    │  authorize/kakao        │                 │                       │
    │  ?code_challenge=ABC    │                 │                       │
    │  &platform=mobile       │                 │                       │
    ├────────────────────────►│                 │                       │
    │                         ├────────────────►│                       │
    │                         │                 │── store(state,        │
    │                         │                 │   codeChallenge)      │
    │                         │                 │── in PkceStateStore   │
    │                         │                 │                       │
    │              302 Redirect to Kakao auth URL                      │
    │◄──────────────────────────────────────────┤                      │
    │                         │                 │                       │
    │  (User authorizes on Kakao)               │                       │
    │                         │                 │                       │
    │                         │  GET /callback/kakao?code=XYZ&state=ST │
    │                         │◄────────────────────────────────────────┤
    │                         │                 │                       │
    │                         ├────────────────►│                       │
    │                         │                 │── processOAuth(code)  │
    │                         │                 │── exchange code with  │
    │                         │                 │   Kakao for profile   │
    │                         │                 │                       │
    │                         │                 │── consume PkceState   │
    │                         │                 │── store auth_code +   │
    │                         │                 │   codeChallenge in    │
    │                         │                 │   AuthCodeStore       │
    │                         │                 │   (30s TTL, 1-use)    │
    │                         │                 │                       │
    │  302 pochak://auth?code=AUTH_CODE         │                       │
    │◄──────────────────────────────────────────┤                       │
    │                         │                 │                       │
    │  POST /auth/oauth2/token                  │                       │
    │  { code: AUTH_CODE,     │                 │                       │
    │    codeVerifier: DEF }  │                 │                       │
    ├────────────────────────►│                 │                       │
    │                         ├────────────────►│                       │
    │                         │                 │── exchange(AUTH_CODE)  │
    │                         │                 │── verify PKCE:        │
    │                         │                 │   SHA256(DEF) == ABC  │
    │                         │                 │── return tokens       │
    │                         │                 │                       │
    │  { accessToken, refreshToken }            │                       │
    │◄──────────────────────────────────────────┤                       │
```

### 3.2 Content Access Control (ABAC + CUG + Subscription)

```
Mobile App          Gateway         Content Service         Commerce Service
    │                  │                   │                        │
    │ GET /contents/   │                   │                        │
    │ vod/42/stream    │                   │                        │
    │ Authorization:   │                   │                        │
    │ Bearer <jwt>     │                   │                        │
    ├─────────────────►│                   │                        │
    │                  │── validate JWT    │                        │
    │                  │── inject          │                        │
    │                  │   X-User-Id: 100  │                        │
    │                  ├──────────────────►│                        │
    │                  │                   │                        │
    │                  │                   │── VideoAclService      │
    │                  │                   │   .evaluateAccess(     │
    │                  │                   │     "vod", 42, 100)    │
    │                  │                   │                        │
    │                  │                   │── 1. Get VideoAcl      │
    │                  │                   │      for vod:42        │
    │                  │                   │                        │
    │                  │                   │── 2. Check visibility: │
    │                  │                   │   PUBLIC? -> ALLOW     │
    │                  │                   │   PRIVATE? -> DENY     │
    │                  │                   │   MEMBERS_ONLY? ->     │
    │                  │                   │     check membership   │
    │                  │                   │                        │
    │                  │                   │── 3. If MEMBERS_ONLY:  │
    │                  │                   │   check if user 100    │
    │                  │                   │   has APPROVED         │
    │                  │                   │   membership in org    │
    │                  │                   │                        │
    │                  │                   │── 4. If requires       │
    │                  │                   │   subscription:        │
    │                  │                   │   HTTP call to ────────┤
    │                  │                   │   GET /entitlements/   │
    │                  │                   │   check?userId=100     │
    │                  │                   │   &scopeType=VOD       │
    │                  │                   │   &scopeId=42          │
    │                  │                   │◄──────────────────────┤
    │                  │                   │   { hasAccess: true }  │
    │                  │                   │                        │
    │                  │                   │── 5. ALLOW ->          │
    │                  │                   │   return PlaybackResp  │
    │                  │                   │   { hlsUrl, qualities }│
    │                  │◄─────────────────┤                        │
    │  { success: true, data: { hlsUrl } }│                        │
    │◄─────────────────┤                   │                        │
```

### 3.3 Purchase -> Entitlement -> Access

```
Mobile App        Gateway       Commerce Service        Content Service
    │                │                 │                        │
    │ POST /purchases│                 │                        │
    │ { productId:5, │                 │                        │
    │   pgType:CARD, │                 │                        │
    │   amount:9900 }│                 │                        │
    ├───────────────►│                 │                        │
    │                ├────────────────►│                        │
    │                │                 │── validate product     │
    │                │                 │── check guardian limit  │
    │                │                 │   (if minor user)      │
    │                │                 │── process PG payment   │
    │                │                 │── create purchase      │
    │                │                 │   (status: COMPLETED)  │
    │                │                 │                        │
    │                │                 │── create entitlement   │
    │                │                 │   { userId, type,      │
    │                │                 │     scopeType,         │
    │                │                 │     scopeId,           │
    │                │                 │     expiresAt }        │
    │                │                 │                        │
    │                │                 │── publish event ──────►│ (via RabbitMQ)
    │                │                 │   PurchaseCompleted    │
    │                │                 │   { userId, productId, │
    │                │                 │     entitlementId }    │
    │                │                 │                        │── update content
    │                │                 │                        │   access cache
    │                │                 │                        │── create notification
    │ { purchaseId,  │                 │                        │   "Purchase completed"
    │   status:      │                 │                        │
    │   COMPLETED }  │                 │                        │
    │◄───────────────┤                 │                        │
    │                │                 │                        │
    │ GET /contents/vod/42/stream      │                        │
    ├───────────────►│                 │                        │
    │                ├─────────────────────────────────────────►│
    │                │                 │                        │── check ACL
    │                │                 │                        │── entitlement exists
    │                │                 │                        │── ALLOW: return HLS URL
    │ { hlsUrl }     │                 │                        │
    │◄───────────────┤                 │                        │
```

### 3.4 User Withdrawal (Cross-Service Event)

```
Mobile App      Gateway      Identity         RabbitMQ        Content   Commerce   Operation   Admin
    │              │            │                 │              │          │           │         │
    │ DELETE       │            │                 │              │          │           │         │
    │ /auth/       │            │                 │              │          │           │         │
    │  withdraw    │            │                 │              │          │           │         │
    ├─────────────►│            │                 │              │          │           │         │
    │              ├───────────►│                 │              │          │           │         │
    │              │            │── set status    │              │          │           │         │
    │              │            │   WITHDRAWN     │              │          │           │         │
    │              │            │                 │              │          │           │         │
    │              │            │── blacklist     │              │          │           │         │
    │              │            │   token in      │              │          │           │         │
    │              │            │   Redis         │              │          │           │         │
    │              │            │                 │              │          │           │         │
    │              │            │── publish ──────►              │          │           │         │
    │              │            │  UserWithdrawn  │              │          │           │         │
    │              │            │  Event          │              │          │           │         │
    │              │            │  routing key:   │              │          │           │         │
    │              │            │  identity.      │              │          │           │         │
    │              │            │  UserWithdrawn  │              │          │           │         │
    │              │            │  Event          │              │          │           │         │
    │              │            │                 │              │          │           │         │
    │              │            │                 │── deliver ──►│          │           │         │
    │              │            │                 │              │── soft-  │           │         │
    │              │            │                 │              │  delete  │           │         │
    │              │            │                 │              │  content │           │         │
    │              │            │                 │              │  data    │           │         │
    │              │            │                 │              │          │           │         │
    │              │            │                 │── deliver ──────────────►           │         │
    │              │            │                 │              │          │── cancel  │         │
    │              │            │                 │              │  pending │  active   │         │
    │              │            │                 │              │  entitle-│  sub-     │         │
    │              │            │                 │              │  ments   │  scripts  │         │
    │              │            │                 │              │          │           │         │
    │              │            │                 │── deliver ──────────────────────────►         │
    │              │            │                 │              │          │  cancel   │         │
    │              │            │                 │              │          │  reserv-  │         │
    │              │            │                 │              │          │  ations   │         │
    │              │            │                 │              │          │           │         │
    │              │            │                 │── deliver ──────────────────────────────────►│
    │              │            │                 │              │          │           │  log    │
    │              │            │                 │              │          │           │  audit  │
    │              │            │                 │              │          │           │  event  │
    │  { success } │            │                 │              │          │           │         │
    │◄─────────────┤            │                 │              │          │           │         │
```

---

## 4. Database Schema

All services share one PostgreSQL 16 instance with schema-per-service isolation. Cross-schema references use logical foreign keys (FK not enforced in DDL, referenced by convention).

### 4.1 Schema Overview

```
pochak (database)
├── identity          -- Users, auth, preferences, guardians
├── content           -- Sports, teams, orgs, competitions, matches, assets, social
├── commerce          -- Products, wallets, purchases, entitlements, refunds, coupons
├── operation         -- Venues, cameras, reservations, studio sessions
└── admin             -- Admin users, RBAC, banners, notices, terms, analytics
```

### 4.2 Identity Schema

```
identity.users
├── id (PK)
├── username (UNIQUE)
├── email
├── phone
├── name
├── birthday, gender, nationality
├── profile_image
├── status (UNVERIFIED/GUEST/ACTIVE/DORMANT_PENDING/DORMANT/BLOCKED/WITHDRAWN)
├── is_marketing, is_age_14_above
├── ci, di (본인확인 식별자)
├── login_id, password_hash
└── created_at, updated_at, deleted_at

identity.user_auth_accounts (1:N with users)
├── provider (EMAIL/KAKAO/NAVER/APPLE/GOOGLE)
├── provider_key
└── access_token, refresh_token

identity.user_consents (1:N with users)
├── term_id (-> admin.terms, cross-schema)
└── is_agreed, agreed_at

identity.user_preferences (1:1 with users)
├── preferred_sports (JSONB)
├── preferred_areas (JSONB)
└── usage_purpose

identity.user_status_history (1:N with users)
├── from_status, to_status
├── reason
└── changed_by

identity.user_refresh_tokens (1:N with users)
├── token (UNIQUE)
└── device_type

identity.guardian_relationships
├── guardian_user_id (-> users)
├── minor_user_id (-> users)
├── status (PENDING/VERIFIED/REVOKED)
├── monthly_payment_limit
└── consent_method
```

### 4.3 Content Schema

```
content.sports
├── id (PK), name, code (UNIQUE), image_url
├── display_order, is_active
└── sport_tags (1:N)

content.organizations
├── id (PK), sport_id (-> sports)
├── name, short_name, org_type (PRIVATE/PUBLIC)
├── status, si_gun_gu_code, member_limit
├── parent_id (self-referencing hierarchy)
└── is_displayed

content.competitions
├── id (PK), sport_id, organization_id
├── name, status (UPCOMING/ONGOING/FINISHED)
├── invite_code (for private competitions)
├── visibility (PUBLIC/PRIVATE)
└── start_date, end_date

content.matches
├── id (PK), competition_id, venue_id (-> operation.venues)
├── home_team_id, away_team_id (-> teams)
├── status (SCHEDULED/LIVE/FINISHED/CANCELLED)
├── scheduled_at, started_at, ended_at
└── score_home, score_away

content.live_assets
├── id (PK), match_id, venue_id
├── title, description, thumbnail_url
├── stream_url, owner_type, visibility (PUBLIC/MEMBERS_ONLY/PRIVATE)
├── is_displayed, started_at, ended_at
└── organization_id (for ABAC)

content.vod_assets
├── id (PK), source_live_id (-> live_assets)
├── title, description, thumbnail_url
├── stream_url, duration_sec, visibility
├── file_size, resolution
└── organization_id

content.clip_assets
├── id (PK), source_asset_id, source_type (LIVE/VOD)
├── title, start_time_sec, end_time_sec
├── stream_url, visibility
├── creator_user_id
└── organization_id

content.video_acls
├── id (PK), asset_type, asset_id
├── visibility (PUBLIC/MEMBERS_ONLY/PRIVATE)
├── allowed_org_ids (JSONB), denied_org_ids (JSONB)
└── require_subscription

content.memberships
├── id (PK), user_id, target_type, target_id
├── role (MEMBER/MANAGER/ADMIN)
├── status (PENDING/APPROVED/REJECTED)
└── nickname

content.follows, content.favorites, content.watch_history
content.comments, content.content_likes, content.notifications
content.highlights, content.timeline_events, content.asset_tags
content.community_posts, content.post_reports, content.moderation_actions
```

### 4.4 Commerce Schema

```
commerce.products
├── id (PK), name, product_type (SUBSCRIPTION/SINGLE/POINT_PACK)
├── price_krw, price_point, duration_days
├── reference_type, reference_id
└── is_active

commerce.wallets (1:1 with identity.users)
├── id (PK), user_id (UNIQUE)
└── balance

commerce.wallet_ledger (1:N with wallets)
├── ledger_type (CHARGE/USE/REFUND/EXPIRE)
├── amount, balance_after
├── reference_type, reference_id, description
└── expires_at

commerce.purchases
├── id (PK), user_id, product_id (-> products)
├── pg_type, amount, status (PENDING/COMPLETED/CANCELLED/REFUNDED)
├── product_snapshot (JSONB)
└── pg_transaction_id, coupon_id

commerce.entitlements
├── id (PK), user_id, purchase_id (-> purchases)
├── type (SUBSCRIPTION/SINGLE_PURCHASE)
├── scope_type, scope_id
├── status (ACTIVE/EXPIRED/REVOKED)
└── starts_at, expires_at

commerce.refunds
├── id (PK), purchase_id, user_id
├── status (PENDING/APPROVED/REJECTED)
├── amount, reason
└── processed_by, processed_at

commerce.coupons, commerce.user_coupons
```

### 4.5 Operation Schema

```
operation.venues
├── id (PK), sport_id (-> content.sports)
├── name, venue_type, owner_type
├── address, si_gun_gu_code, latitude, longitude
├── qr_code, pixellot_club_id
└── is_active

operation.cameras
├── id (PK), name, camera_type, product_type
├── status, serial_number, version, is_panorama
└── pixellot_venue_id, pixellot_club_id

operation.venue_cameras (M:N junction)
├── venue_id, camera_id, is_main

operation.reservations
├── id (PK), venue_id, match_id (-> content.matches)
├── reserved_by_user_id (-> identity.users)
├── status (PENDING/CONFIRMED/CANCELLED)
├── start_at, end_at, purpose, memo
└── cancelled_reason

operation.studio_sessions
├── id (PK), venue_id, match_id
├── status, started_at, ended_at
└── recording_url

operation.ingest_endpoints, operation.transcode_sessions
```

### 4.6 Admin Schema

```
admin.admin_users
├── id (PK), login_id (UNIQUE), password_hash
├── name, phone, email, profile_image
├── is_blocked, fail_count, last_login_at
└── kakao_id, skype_id, line_id

admin.admin_roles
├── id (PK), name, code (UNIQUE), description
└── display_order, is_active

admin.admin_menus (self-referencing tree)
├── id (PK), parent_id, name, menu_type
├── page_url, icon, display_order
└── is_active

admin.admin_functions
├── id (PK), code (UNIQUE), name
└── controller, action, is_active

admin.admin_role_menus (M:N), admin.admin_role_functions (M:N)
admin.admin_groups (tree), admin.admin_group_members, admin.admin_group_roles

admin.banners, admin.notices, admin.terms
admin.inquiries, admin.reports
admin.app_versions
admin.analytics_events, admin.audit_logs
```

### 4.7 Cross-Schema Reference Map

| Source Table | Column | Target Table | Notes |
|---|---|---|---|
| identity.user_consents | term_id | admin.terms | Terms defined in admin |
| commerce.wallets | user_id | identity.users | 1:1 per user |
| commerce.purchases | user_id | identity.users | Purchase owner |
| operation.venues | sport_id | content.sports | Venue sport type |
| operation.reservations | match_id | content.matches | Reservation for match |
| operation.reservations | reserved_by_user_id | identity.users | Reservation creator |
| content.matches | venue_id | operation.venues | Match location |
| content.live_assets | venue_id | operation.venues | Streaming venue |

All cross-schema references are logical only (no enforced FKs) to maintain schema independence.

---

## 5. Security Architecture

### 5.1 JWT Validation at Gateway

```
Request with Authorization: Bearer <token>
    │
    ▼
┌─────────────────────────────────────────────┐
│           JwtValidationFilter               │
│                                             │
│  1. STRIP X-User-Id, X-User-Role headers    │  (SEC-001)
│     from incoming request                   │
│                                             │
│  2. Check if path is PUBLIC                 │
│     YES + no JWT -> pass through            │
│     YES + JWT -> try parse, pass either way │
│     NO + no JWT -> 401 Unauthorized         │
│                                             │
│  3. Parse JWT with HMAC-SHA256              │
│     Extract: sub (userId), role             │
│                                             │
│  4. Check Redis token blacklist             │  (SEC-002)
│     Key: token-blacklist:{userId}           │
│     If exists -> 401 "Token revoked"        │
│                                             │
│  5. Admin path check                        │  (SEC-004)
│     /api/v1/admin/** requires role=ADMIN    │
│     Non-ADMIN -> 403 Forbidden              │
│                                             │
│  6. Inject X-User-Id, X-User-Role headers   │
│     into downstream request                 │
└─────────────────────────────────────────────┘
```

**Public Paths** (JWT optional):
`/auth/login`, `/auth/signup*`, `/auth/social`, `/auth/oauth2*`, `/auth/refresh`, `/auth/check-duplicate`, `/auth/phone/*`, `/auth/guardian/verify`, `/home`, `/contents`, `/search`, `/competitions`, `/sports`, `/schedule`, `/venues`, `/clubs`, `/streaming`, `/communities`, `/matches`, `/teams`, `/organizations`, `/recommendations`, `/admin/api/v1/auth`, `/actuator`, `/api-docs`, `/swagger-ui`

### 5.2 PII Encryption

Sensitive fields in the database use application-level encryption:

| Field | Table | Method |
|-------|-------|--------|
| CI (본인확인 연계정보) | identity.users | AES-256 envelope encryption |
| DI (중복확인 식별자) | identity.users | AES-256 envelope encryption |
| Phone number | identity.users | Stored encrypted at rest |
| Payment tokens | commerce.purchases | PG-specific tokenization |

### 5.3 Rate Limiting

Two implementations with automatic fallback:

```
┌─────────────────────────────────────────────┐
│ pochak.rate-limit.type = redis (default)    │
│                                             │
│  RedisRateLimitFilter                       │
│  ├── Key: rate-limit:{ip}:{path-category}   │
│  ├── INCR + EXPIRE (atomic)                 │
│  ├── TTL: 60 seconds                        │
│  └── Distributed across gateway instances   │
│                                             │
│ pochak.rate-limit.type = in-memory          │
│                                             │
│  RateLimitFilter                            │
│  ├── ConcurrentHashMap<String, Bucket>      │
│  ├── Sliding window with AtomicInteger      │
│  ├── Eviction every 5 minutes               │
│  │   (RateLimitCleanupConfig @Scheduled)    │
│  └── Per-instance only (not shared)         │
└─────────────────────────────────────────────┘

Rate Limits:
  /api/v1/auth/**     : 10 requests / minute (brute-force protection)
  /api/v1/**          : 100 requests / minute (general API)
```

### 5.4 PKCE OAuth2 (SEC-003)

```
┌─────────┐                    ┌──────────────┐
│  Mobile │                    │   Identity   │
│   App   │                    │   Service    │
└────┬────┘                    └──────┬───────┘
     │                                │
     │ 1. Generate:                   │
     │    code_verifier (43 chars)    │
     │    code_challenge =            │
     │      BASE64URL(SHA256(verifier))│
     │                                │
     │ 2. GET /authorize/kakao        │
     │    ?code_challenge=ABC         │
     │    &code_challenge_method=S256 │
     │    &platform=mobile            │
     ├───────────────────────────────►│
     │                                │── store(state -> {ABC, S256, mobile})
     │                                │   in PkceStateStore (5min TTL)
     │ 3. 302 -> Kakao                │
     │◄───────────────────────────────┤
     │                                │
     │  ... Kakao auth + callback ... │
     │                                │
     │ 4. 302 pochak://auth?code=XYZ  │
     │◄───────────────────────────────┤── AuthCodeStore stores
     │                                │   {tokens, codeChallenge=ABC}
     │                                │   (30s TTL, single-use)
     │                                │
     │ 5. POST /auth/oauth2/token     │
     │    { code: XYZ,                │
     │      codeVerifier: verifier }  │
     ├───────────────────────────────►│
     │                                │── SHA256(verifier) == ABC?
     │                                │── YES -> return tokens
     │                                │── NO  -> 401 PKCE failed
     │ 6. { accessToken, refreshToken}│
     │◄───────────────────────────────┤
```

---

## 6. Event Architecture

### 6.1 RabbitMQ Topology

```
                          pochak.events
                        (Topic Exchange)
                        ┌──────────────┐
                        │   durable    │
                        └──────┬───────┘
                               │
            ┌──────────────────┼──────────────────────────┐
            │                  │                          │
    routing key:       routing key:              routing key:
    identity.#         content.#                 commerce.#
            │                  │                          │
            ▼                  ▼                          ▼
  ┌─────────────────┐ ┌──────────────────┐ ┌─────────────────────┐
  │ identity.events │ │ content.events   │ │ commerce.events     │
  │ (durable queue) │ │ (durable queue)  │ │ (durable queue)     │
  └─────────────────┘ └──────────────────┘ └─────────────────────┘

            ┌──────────────────┼──────────────────────────┐
    routing key:       routing key:
    operation.#        admin.#
            │                  │
            ▼                  ▼
  ┌─────────────────┐ ┌──────────────────┐
  │ operation.events│ │ admin.events     │
  │ (durable queue) │ │ (durable queue)  │
  └─────────────────┘ └──────────────────┘

  Special binding: identity.UserWithdrawnEvent
  ────────────────────────────────────────────
  Delivered to ALL queues (content, commerce, operation, admin)
  for cross-service user data cleanup.
```

### 6.2 Event Types and Routing

| Event Type | Routing Key | Source | Consumers | Description |
|---|---|---|---|---|
| `UserWithdrawnEvent` | `identity.UserWithdrawnEvent` | Identity | Content, Commerce, Operation, Admin | User withdrawal, triggers data cleanup in all services |
| `ContentPublishedEvent` | `content.ContentPublishedEvent` | Content | Admin (analytics) | New content made available |
| `LiveStreamStartedEvent` | `content.LiveStreamStartedEvent` | Content | Admin | Live stream begins |
| `LiveStreamEndedEvent` | `content.LiveStreamEndedEvent` | Content | Admin | Live stream ends |
| `ClipCreatedEvent` | `content.ClipCreatedEvent` | Content | Admin | New clip created |
| `PurchaseCompletedEvent` | `commerce.PurchaseCompletedEvent` | Commerce | Content (notifications) | Purchase finalized |
| `RefundProcessedEvent` | `commerce.RefundProcessedEvent` | Commerce | Content (notifications) | Refund approved/rejected |
| `SubscriptionActivatedEvent` | `commerce.SubscriptionActivatedEvent` | Commerce | Content (entitlement cache) | Subscription activated |
| `ReservationCreatedEvent` | `operation.ReservationCreatedEvent` | Operation | Content (notifications) | New reservation |
| `ReservationCancelledEvent` | `operation.ReservationCancelledEvent` | Operation | Content (notifications) | Reservation cancelled |

### 6.3 Event Structure

All events extend `DomainEvent`:

```java
public abstract class DomainEvent {
    private String eventId;       // UUID
    private String eventType;     // e.g., "UserWithdrawnEvent"
    private String aggregateId;   // e.g., user ID
    private LocalDateTime occurredAt;
}
```

### 6.4 Delivery Guarantees

| Aspect | Policy |
|--------|--------|
| Delivery | **Best-effort**. AmqpException is caught and logged, never propagated. Business transactions are NOT rolled back on publish failure. |
| Durability | Exchange and queues are durable. Messages survive broker restart. |
| Idempotency | Consumers must be idempotent. Events include `eventId` for deduplication. |
| Ordering | Not guaranteed across partitions. Events include `occurredAt` for sequencing. |
| Retry | No automatic retry at publisher level. Consumer-side retry via RabbitMQ redelivery. |
| Fallback | When RabbitMQ is unavailable, `InMemoryEventPublisher` handles events within the same JVM (local only). |

### 6.5 Routing Key Resolution

The `RabbitMqEventPublisher` resolves routing keys from the event class:

1. If `eventType` contains a dot (e.g., `identity.UserWithdrawnEvent`), use as-is.
2. Otherwise, extract domain from package: `com.pochak.{domain}.event.XxxEvent` -> `{domain}.XxxEvent`.
3. Fallback: use `eventType` directly.

---

## 7. Technology Stack

### 7.1 Backend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Language | Java | 17+ | All services |
| Framework | Spring Boot | 3.x | Services use Spring MVC |
| Gateway | Spring Cloud Gateway | 3.x | WebFlux-based reactive |
| ORM | Spring Data JPA + Hibernate | - | Schema-per-service |
| Database | PostgreSQL | 16-alpine | Single instance, 5 schemas |
| Cache | Redis | 7-alpine | Token blacklist, rate limiting, session |
| Messaging | RabbitMQ | 3-management-alpine | Topic exchange, durable queues |
| JWT | jjwt (io.jsonwebtoken) | - | HMAC-SHA256 signing |
| Build | Maven (multi-module) | - | pochak-common-lib shared |
| API Docs | SpringDoc OpenAPI | - | Swagger UI |
| Validation | Jakarta Bean Validation | - | `@Valid` annotations |
| Serialization | Jackson | - | JSON + Java Time Module |
| Migrations | Flyway-style SQL scripts | - | V001-V021 versioned |

### 7.2 Frontend

| Component | Technology | Notes |
|-----------|-----------|-------|
| Mobile App | Flutter | Cross-platform (AOS/IOS) |
| Public Web | React + Vite + TypeScript | ADR-002: migrated from Next.js |
| BO Web | Next.js | Admin back-office |
| Shared packages | TypeScript monorepo | `clients/packages/`, `clients/shared/` |

### 7.3 Infrastructure

| Component | Technology | Notes |
|-----------|-----------|-------|
| Container Runtime | Docker | Per-service Dockerfile |
| Orchestration | Docker Compose | 11 containers (dev) |
| Reverse Proxy | Spring Cloud Gateway | Built-in routing |
| Monitoring | Spring Boot Actuator | `/actuator/health` per service |
| Health Check | Gateway HealthController | Periodic 60s polling |

---

## 8. Deployment Architecture

### 8.1 Docker Compose Topology (Development)

```
docker-compose.yml
│
├── Infrastructure (3 containers)
│   ├── pochak-postgres    :5432   (postgres:16-alpine, 5 schemas, persistent volume)
│   ├── pochak-redis       :6379   (redis:7-alpine, AOF persistence)
│   └── pochak-rabbitmq    :5672   (rabbitmq:3-management-alpine, mgmt UI :15672)
│                          :15672
│
├── Backend Services (6 containers)
│   ├── pochak-gateway     :8080   (Spring Cloud Gateway, WebFlux)
│   ├── pochak-identity    :8081   (Spring Boot MVC)
│   ├── pochak-content     :8082   (Spring Boot MVC)
│   ├── pochak-commerce    :8083   (Spring Boot MVC)
│   ├── pochak-operation   :8084   (Spring Boot MVC)
│   └── pochak-admin       :8085   (Spring Boot MVC)
│
└── Frontend Services (2 containers)
    ├── pochak-bo-web      :3000   (Next.js)
    └── pochak-public-web  :3100   (React + Vite)
```

Total: **11 containers**

### 8.2 Container Dependencies

```
pochak-postgres ──────┐
pochak-redis    ──────┼── pochak-gateway ──┐
pochak-rabbitmq ──────┘                    │
                                           ├── pochak-bo-web
pochak-postgres ──┐                        └── pochak-public-web
pochak-rabbitmq ──┼── pochak-identity
                  │
pochak-postgres ──┼── pochak-content
pochak-rabbitmq ──┤
                  │
pochak-postgres ──┼── pochak-commerce
pochak-rabbitmq ──┤
                  │
pochak-postgres ──┼── pochak-operation
pochak-rabbitmq ──┤
                  │
pochak-postgres ──┼── pochak-admin
pochak-rabbitmq ──┘
```

All backend services depend on PostgreSQL and RabbitMQ being healthy (health checks with retries). The Gateway additionally depends on Redis. Frontend containers depend on the Gateway.

### 8.3 Health Checks

| Container | Health Check Command | Interval | Retries |
|-----------|---------------------|----------|---------|
| pochak-postgres | `pg_isready -U pochak -d pochak` | 10s | 5 |
| pochak-redis | `redis-cli ping` | 10s | 5 |
| pochak-rabbitmq | `rabbitmq-diagnostics -q ping` | 10s | 5 |
| Backend services | Spring Boot Actuator `/actuator/health` | Checked by Gateway every 60s | - |

### 8.4 Environment Configuration

Services share a common environment block (`x-service-env` YAML anchor):

| Variable | Value (Dev) | Description |
|----------|-------------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://pochak-postgres:5432/pochak` | Shared DB |
| `SPRING_DATASOURCE_USERNAME` | `pochak` | DB user |
| `SPRING_REDIS_HOST` | `pochak-redis` | Redis host |
| `SPRING_RABBITMQ_HOST` | `pochak-rabbitmq` | RabbitMQ host |
| `SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA` | `identity` / `content` / etc. | Per-service schema |
| `JWT_SECRET` | (256-bit key) | Shared across Gateway + Identity |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,3100,8097` | Gateway CORS |

OAuth2 credentials (Kakao, Google, Naver) are configured only on the Identity Service.

### 8.5 Persistent Volumes

| Volume | Container | Mount Point |
|--------|-----------|-------------|
| `pochak-pg-data` | pochak-postgres | `/var/lib/postgresql/data` |
| `pochak-redis-data` | pochak-redis | `/data` |
| `pochak-rabbitmq-data` | pochak-rabbitmq | `/var/lib/rabbitmq` |

### 8.6 Database Initialization

On first startup, PostgreSQL runs migration scripts from `db/migrations/` (mounted to `/docker-entrypoint-initdb.d`):

```
V000__init_schemas.sql              -- CREATE SCHEMA IF NOT EXISTS (x5)
V001__create_identity_schema.sql    -- identity tables
V002__create_content_schema.sql     -- content tables
V003__create_commerce_schema.sql    -- commerce tables
V004__create_operation_schema.sql   -- operation tables
V005__create_admin_schema.sql       -- admin tables
V006 ~ V021                         -- incremental migrations
```

---

*End of Architecture Document*
