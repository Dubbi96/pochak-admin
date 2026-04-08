# Pochak - Legacy vs New Feature Verification Matrix

> Version: 1.0.0
> Created: 2026-04-08
> Issue: POC-18
> Legacy: pochak.live (React CRA + AWS Lambda) / corehub.hogak.live (ASP.NET MVC)
> New: pochak microservices (Spring Boot) + public-web (React Vite)

---

## 1. API Coverage Matrix

### 1.1 Auth API (Legacy: 10 endpoints)

| # | Legacy Endpoint | 설명 | New Endpoint | Status | Priority |
|---|----------------|------|-------------|--------|----------|
| 1 | `POST /api/Auth/Login` | 로그인 | `POST /api/v1/auth/login` | **Covered** | - |
| 2 | `POST /api/Auth/Users` | 회원가입 | `POST /api/v1/auth/signup/*` (4 routes) | **Covered** | - |
| 3 | `POST /api/Auth/UsersByEmail` | 이메일 회원가입 | `POST /api/v1/auth/signup/domestic` | **Covered** | - |
| 4 | `GET /api/Auth/UserInfo` | 유저 정보 | `GET /api/v1/users/me` | **Covered** | - |
| 5 | `GET /api/Auth/TermList` | 약관 목록 | Admin service terms API | **Covered** | - |
| 6 | `GET /api/Auth/Term` | 약관 상세 | Admin service terms API | **Covered** | - |
| 7 | `GET /api/Auth/EmailVerificationSend` | 이메일 인증 발송 | `POST /api/v1/auth/phone/send` (SMS 변경) | **Changed** | Low |
| 8 | `GET /api/Auth/EmailVerificationChk` | 이메일 인증 확인 | `POST /api/v1/auth/phone/verify` | **Changed** | Low |
| 9 | `GET /api/Auth/EmailVerificationByChange` | 이메일 변경 인증 | Not implemented | **Missing** | Low |
| 10 | `GET /api/Auth/userAgeAbove` | 나이 확인 | Guardian service handles age | **Covered** | - |

### 1.2 Main API (Legacy: 40+ endpoints)

| # | Legacy Endpoint | 설명 | New Endpoint | Status | Priority |
|---|----------------|------|-------------|--------|----------|
| 1 | `GET /api/Main/Sports` | 스포츠 목록 | `GET /api/v1/sports` | **Covered** | - |
| 2 | `GET /api/Main/TopMenu` | 상단 메뉴 | Frontend static config | **Changed** | - |
| 3 | `GET /api/Main/TopChanelMenu` | 채널 메뉴 | Frontend static config | **Changed** | - |
| 4 | `GET /api/Main/HomeBanner` | 홈 배너 | `GET /api/v1/home` (includes banners) | **Covered** | - |
| 5 | `GET /api/Main/HomeEvent` | 홈 이벤트 | `GET /api/v1/home` (includes events) | **Covered** | - |
| 6 | `GET /api/Main/HomeMatchSchedule` | 경기 일정 | `GET /api/v1/schedule` | **Covered** | - |
| 7 | `GET /api/Main/PopupList` | 팝업 목록 | Not implemented | **Missing** | Low |
| 8 | `GET /api/Main/Live` | 라이브 목록 | `GET /api/v1/contents?type=LIVE` | **Covered** | - |
| 9 | `GET /api/Main/Vod` | VOD 목록 | `GET /api/v1/contents?type=VOD` | **Covered** | - |
| 10 | `GET /api/Main/Clip` | 클립 목록 | `GET /api/v1/contents?type=CLIP` | **Covered** | - |
| 11 | `GET /api/Main/Competition` | 대회 목록 | `GET /api/v1/competitions` | **Covered** | - |
| 12 | `GET /api/Main/EventList` | 이벤트 목록 | Not implemented | **Missing** | Medium |
| 13 | `GET /api/Main/Event` | 이벤트 상세 | Not implemented | **Missing** | Medium |
| 14 | `GET /api/Main/MemberShip` | 멤버십 | `GET /api/v1/memberships` | **Covered** | - |
| 15 | `GET /api/Main/MembershipGroup` | 멤버십 그룹 | `GET /api/v1/organizations` | **Covered** | - |
| 16 | `POST /api/Main/MemberShipUp` | 멤버십 업데이트 | `PUT /api/v1/memberships/*` | **Covered** | - |
| 17 | `POST /api/Main/MemberImageAdd` | 멤버 이미지 | `POST /api/v1/upload/presigned-url` | **Covered** | - |
| 18 | `GET /api/Main/MyPoint` | 포인트 조회 | `GET /api/v1/wallet/balance` | **Covered** | - |
| 19 | `GET /api/Main/PointList` | 포인트 내역 | `GET /api/v1/wallet/transactions` | **Covered** | - |
| 20 | `GET /api/Main/NoticeList` | 공지 목록 | Admin `/admin/api/v1/notices` | **Covered** | - |
| 21 | `GET /api/Main/Notice` | 공지 상세 | Admin `/admin/api/v1/notices/{id}` | **Covered** | - |
| 22 | `GET /api/Main/InquiryList` | 문의 목록 | Admin CS API | **Covered** | - |
| 23 | `POST /api/Main/InquiryAdd` | 문의 등록 | Admin CS API | **Covered** | - |
| 24 | `GET /api/Main/RefundInquiryList` | 환불 문의 목록 | `GET /api/v1/refunds` | **Covered** | - |
| 25 | `POST /api/Main/RefundInquiryAdd` | 환불 문의 등록 | `POST /api/v1/refunds` | **Covered** | - |
| 26 | `POST /api/Main/RefundPGPayment` | PG 환불 | `POST /api/v1/refunds/{id}/process` | **Covered** | - |
| 27 | `GET /api/Main/SeasonPass` | 시즌패스 | `GET /api/v1/subscriptions` | **Changed** | - |
| 28 | `POST /api/Main/SeasonPassPurchase` | 시즌패스 구매 | `POST /api/v1/purchases` | **Changed** | - |
| 29 | `POST /api/Main/ReportAdd` | 신고 등록 | `POST /api/v1/communities/*/report` | **Covered** | - |
| 30 | `GET /api/Main/AlarmMemberSetting` | 알림 설정 | `GET /api/v1/notifications/settings` | **Covered** | - |
| 31 | `POST /api/Main/MemberWithdrawal` | 회원 탈퇴 | `POST /api/v1/auth/withdrawal` | **Covered** | - |
| 32 | `POST /api/Main/GiftCodeAdd` | 기프트코드 | `POST /api/v1/coupons/register` | **Changed** | - |
| 33 | `GET /api/Main/Appversion` | 앱 버전 | Admin `/admin/api/v1/app-versions` | **Covered** | - |
| 34 | `GET /api/Main/FavoriteCompetition` | 즐겨찾기 대회 | `GET /api/v1/users/me/favorites` | **Covered** | - |
| 35 | `GET /api/Main/FavoriteVod` | 즐겨찾기 VOD | `GET /api/v1/users/me/favorites` | **Covered** | - |
| 36 | `POST /api/Main/CancelPGSubscription` | 구독 취소 | `DELETE /api/v1/subscriptions/me` | **Covered** | - |
| 37 | `POST /api/Main/ResumePGSubscription` | 구독 재개 | `POST /api/v1/subscriptions/resume` | **Covered** | - |
| 38 | `GET /api/Main/DeployCheck` | 배포 확인 | Gateway health check | **Changed** | - |
| 39 | `GET /api/Main/AddressList` | 주소 목록 | Not implemented (Naver Maps API direct) | **Changed** | Low |
| 40 | `GET /api/Main/WithdrawalReason` | 탈퇴 사유 | Not implemented (static in frontend) | **Changed** | Low |

### 1.3 Competition API (Legacy: 7 endpoints)

| # | Legacy Endpoint | 설명 | New Endpoint | Status | Priority |
|---|----------------|------|-------------|--------|----------|
| 1 | `GET /api/Competition/TeamHomeTop` | 팀 홈 | `GET /api/v1/teams/{id}` | **Covered** | - |
| 2 | `GET /api/Competition/TeamHomeClip` | 팀 클립 | `GET /api/v1/contents?teamId=*&type=CLIP` | **Covered** | - |
| 3 | `GET /api/Competition/TeamHomeVod` | 팀 VOD | `GET /api/v1/contents?teamId=*&type=VOD` | **Covered** | - |
| 4 | `GET /api/Competition/TeamHomeSearchFilter` | 팀 검색 필터 | `GET /api/v1/search` (unified) | **Covered** | - |
| 5 | `GET /api/Competition/AssociationHomeTop` | 협회 홈 | `GET /api/v1/organizations/{id}` | **Covered** | - |
| 6 | `POST /api/Competition/Favorite` | 즐겨찾기 토글 | `POST /api/v1/follows` | **Covered** | - |
| 7 | `GET /api/Competition/MamberRoleInfo` | 멤버 역할 | `GET /api/v1/memberships/me` | **Covered** | - |

### 1.4 CompetitionSub API (Legacy: 18 endpoints)

| # | Legacy Endpoint | 설명 | New Endpoint | Status | Priority |
|---|----------------|------|-------------|--------|----------|
| 1 | `GET TeamInformation` | 팀 정보 | `GET /api/v1/teams/{id}` | **Covered** | - |
| 2 | `GET TeamMemberInformation` | 팀 멤버 | `GET /api/v1/memberships?orgId=*` | **Covered** | - |
| 3 | `GET TeamMemberDetailInformation` | 멤버 상세 | `GET /api/v1/memberships/{id}` | **Covered** | - |
| 4 | `POST TeamMemberAdd` | 멤버 추가 | `POST /api/v1/memberships/join` | **Covered** | - |
| 5 | `POST TeamMemberApprovalUp` | 멤버 승인 | `POST /api/v1/memberships/{id}/approve` | **Covered** | - |
| 6 | `POST TeamInformationUp` | 팀 정보 수정 | `PUT /api/v1/teams/{id}` | **Covered** | - |
| 7 | `POST TeamDisband` | 팀 해산 | Not implemented | **Missing** | Low |
| 8 | `POST TeamRegistRoleTransferUp` | 역할 이관 | `POST /api/v1/memberships/{id}/role` | **Covered** | - |
| 9 | `GET TeamPositionSelect` | 포지션 선택 | Not implemented (static in frontend) | **Missing** | Low |
| 10 | `GET TeamBanList` | 밴 목록 | Not implemented | **Missing** | Low |
| 11-18 | Address, AddInfo, Image, Push | 기타 | Partially covered | **Partial** | Low |

### 1.5 Landing/Video API (Legacy: 17 endpoints)

| # | Legacy Endpoint | 설명 | New Endpoint | Status | Priority |
|---|----------------|------|-------------|--------|----------|
| 1 | `GET LandingHome` | 랜딩 홈 | `GET /api/v1/home` | **Covered** | - |
| 2 | `GET LandingClipList` | 클립 목록 | `GET /api/v1/contents?type=CLIP` | **Covered** | - |
| 3 | `GET LandingVodTagList` | VOD 태그 목록 | `GET /api/v1/contents/tags` | **Covered** | - |
| 4 | `GET Clip` | 클립 상세 | `GET /api/v1/contents/{id}` | **Covered** | - |
| 5 | `POST ClipAdd` | 클립 등록 | `POST /api/v1/contents/clips` | **Covered** | - |
| 6 | `POST ClipDel` | 클립 삭제 | `DELETE /api/v1/contents/{id}` | **Covered** | - |
| 7 | `GET PublicType` | 공개 타입 | Content visibility enum | **Covered** | - |
| 8 | `POST LandingPointUsageAdd` | 포인트 사용 | `POST /api/v1/wallet/use` | **Covered** | - |
| 9 | `POST LandingViewingHistoryAdd` | 시청 기록 | `POST /api/v1/users/me/watch-history` | **Covered** | - |
| 10 | `GET GetMatchScheduleTeam` | 경기 일정 팀 | `GET /api/v1/schedule` | **Covered** | - |
| 11 | `GET GetSportTagList` | 스포츠 태그 | `GET /api/v1/sports/tags` | **Covered** | - |
| 12-17 | VodTag*, MediaDel | VOD 태그 관리 | Content service CRUD | **Covered** | - |

### 1.6 Media/Park API (Legacy: 14 endpoints)

| # | Legacy Endpoint | 설명 | New Endpoint | Status | Priority |
|---|----------------|------|-------------|--------|----------|
| 1 | `GET /api/Media/Park` | 구장 목록 | `GET /api/v1/venues` | **Covered** | - |
| 2 | `GET ParkRadiusByLocation` | 위치 기반 구장 | `GET /api/v1/venues/nearby` | **Covered** | - |
| 3 | `GET ParkReservation` | 구장 예약 | `GET /api/v1/reservations` | **Covered** | - |
| 4 | `GET ParkReservationByID` | 예약 상세 | `GET /api/v1/reservations/{id}` | **Covered** | - |
| 5 | `GET ParkReservationHistory` | 예약 이력 | `GET /api/v1/reservations?status=*` | **Covered** | - |
| 6 | `GET ParkReservationAvailabilityChk` | 예약 가능 확인 | `GET /api/v1/reservations/availability` | **Covered** | - |
| 7 | `POST ParkReservationUp` | 예약 수정 | `PUT /api/v1/reservations/{id}` | **Covered** | - |
| 8 | `POST ParkReservationDel` | 예약 삭제 | `DELETE /api/v1/reservations/{id}` | **Covered** | - |
| 9 | `GET ParkReservationParkFilter` | 구장 필터 | `GET /api/v1/venues/search` | **Covered** | - |
| 10 | `GET ParkInfoByQRCodek` | QR 구장 정보 | Not implemented | **Missing** | Medium |
| 11 | `GET GetShootingReservationList` | 촬영 예약 목록 | `GET /api/v1/reservations?type=FILMING` | **Covered** | - |
| 12 | `POST ParkReservationTimeUp` | 예약 시간 수정 | `PUT /api/v1/reservations/{id}` | **Covered** | - |
| 13 | `POST ParkReservationScoreUp` | 스코어 수정 | Not implemented | **Missing** | Low |
| 14 | `POST AirBrigeTracking` | 에어브릿지 트래킹 | Not implemented (3rd party direct) | **N/A** | - |

### 1.7 Payment API (Legacy: 6 endpoints)

| # | Legacy Endpoint | 설명 | New Endpoint | Status | Priority |
|---|----------------|------|-------------|--------|----------|
| 1 | `POST GetOrderNo` | 주문번호 생성 | `POST /api/v1/purchases` (internal) | **Changed** | - |
| 2 | `POST HogakPaymentPG` | PG 결제 | `POST /api/v1/payments/process` | **Covered** | - |
| 3 | `POST PGSubscriptionOrder` | 구독 결제 | `POST /api/v1/subscriptions` | **Covered** | - |
| 4 | `POST SeasonPassPointOnlyPurchase` | 포인트 구매 | `POST /api/v1/purchases` (paymentMethod=POINT) | **Covered** | - |
| 5-6 | SeasonPass order/payment | 시즌패스 결제 | `POST /api/v1/purchases` (product type) | **Changed** | - |

### 1.8 Search API (Legacy: 5 endpoints)

| # | Legacy Endpoint | 설명 | New Endpoint | Status | Priority |
|---|----------------|------|-------------|--------|----------|
| 1 | `GET SearchResultList` | 검색 결과 | `GET /api/v1/search` | **Covered** | - |
| 2 | `GET SearchResult{type}` | 타입별 검색 | `GET /api/v1/search?type=*` | **Covered** | - |
| 3 | `GET SearchCompetitionList` | 대회 검색 | `GET /api/v1/search?type=COMPETITION` | **Covered** | - |
| 4 | `GET SearchGroupList` | 그룹 검색 | `GET /api/v1/search?type=ORGANIZATION` | **Covered** | - |
| 5 | `GET SearchRecommand` | 추천 검색어 | `GET /api/v1/search/trending` | **Covered** | - |

---

## 2. Frontend Route Coverage Matrix

### Legacy Routes (32 routes) vs New Routes

| # | Legacy Route | 설명 | New Route | Status |
|---|-------------|------|-----------|--------|
| 1 | `/main` | 홈 | `/home` | **Covered** |
| 2 | `/login_t` | 로그인 | `/login` | **Covered** |
| 3 | `/sign_up` | 회원가입 | `/signup` | **Covered** |
| 4 | `/sign_up/userinfo` | 회원정보 입력 | `/signup` (single page) | **Covered** |
| 5 | `/callback/:social` | OAuth 콜백 | `/auth/callback` | **Covered** |
| 6 | `/pass/verification` | 본인인증 | Not implemented | **Missing** |
| 7 | `/my-page` | 마이페이지 | `/my` | **Covered** |
| 8 | `/my-page/info` | 프로필 | `/account` | **Covered** |
| 9 | `/my-page/ball-charge` | 포인트 충전 | `/my/points` | **Covered** |
| 10 | `/my-page/gift-ball` | 기프트 포인트 | `/my/gifts` | **Covered** |
| 11 | `/my-page/payment-history` | 결제 내역 | `/my/tickets` | **Covered** |
| 12 | `/my-page/pass-history` | 패스 내역 | `/store` (subscription) | **Covered** |
| 13 | `/my-page/season-pass` | 시즌패스 | `/store` | **Changed** |
| 14 | `/my-page/events` | 이벤트 | Not implemented | **Missing** |
| 15 | `/my-page/activities` | 활동 내역 | `/my/history` | **Covered** |
| 16 | `/my-page/affiliations` | 소속 팀 | `/my/clubs` | **Covered** |
| 17 | `/my-page/notice` | 공지사항 | `/notices` | **Covered** |
| 18 | `/my-page/customer-center` | 고객센터 | `/support` | **Covered** |
| 19 | `/my-page/notification-settings` | 알림 설정 | `/settings` | **Covered** |
| 20 | `/my-page/shortcuts` | 바로가기 | Not implemented | **Missing** |
| 21 | `/my-page/terms` | 약관 | `/terms` | **Covered** |
| 22 | `/my-page/shoot-reservation` | 촬영 예약 | `/my/reservations` | **Covered** |
| 23 | `/live` | 라이브 중계 | `/contents/live/:id` | **Covered** |
| 24 | `/clip` | 클립 재생 | `/clip/:id` | **Covered** |
| 25 | `/wish-list` | 찜 목록 | `/my/favorites` | **Covered** |
| 26 | `/shoot-reservation` | 촬영 예약 | `/my/facility` | **Covered** |
| 27 | `/shoot-reservation/arena/:id` | 구장 예약 | `/my/facility` | **Covered** |
| 28 | `/teams` | 팀 홈 | `/team/:teamId` | **Covered** |
| 29 | `/teams/join-form` | 팀 가입 | `/club/:clubId` (join) | **Covered** |
| 30 | `/teams/members` | 팀원 목록 | `/club/:clubId` (members tab) | **Covered** |
| 31 | `/competitions` | 대회 홈 | `/tv/competition/:id` | **Covered** |
| 32 | `/H-LOG/*` | H-LOG | Not implemented | **Missing** |

---

## 3. Coverage Summary

### 3.1 API Endpoint Coverage

| Category | Legacy Total | Covered | Changed | Missing | Coverage |
|----------|-------------|---------|---------|---------|----------|
| Auth | 10 | 7 | 2 | 1 | **90%** |
| Main | 40 | 30 | 6 | 4 | **90%** |
| Competition | 7 | 7 | 0 | 0 | **100%** |
| CompetitionSub | 18 | 10 | 0 | 8 | **56%** |
| Landing/Video | 17 | 16 | 0 | 1 | **94%** |
| Media/Park | 14 | 11 | 0 | 3 | **79%** |
| Payment | 6 | 4 | 2 | 0 | **100%** |
| Search | 5 | 5 | 0 | 0 | **100%** |
| **Total** | **117** | **90** | **10** | **17** | **85%** |

### 3.2 Frontend Route Coverage

| Category | Legacy Total | Covered | Changed | Missing | Coverage |
|----------|-------------|---------|---------|---------|----------|
| Routes | 32 | 24 | 4 | 4 | **88%** |

### 3.3 New Features (Not in Legacy)

| Feature | New Endpoint | Notes |
|---------|-------------|-------|
| Community posts | `/api/v1/communities` | NEWS/RECRUIT/GENERAL |
| Content moderation | `/api/v1/communities/*/report` | Report + resolve + action |
| Recommendations | `/api/v1/recommendations` | Personalized, similar, trending |
| Notifications inbox | `/api/v1/notifications` | Push + in-app |
| Follows system | `/api/v1/follows` | Teams, orgs, users |
| Comments (threaded) | `/api/v1/comments` | Threaded on any content |
| Likes | Content like/unlike | Toggle + count |
| Upload pipeline | `/api/v1/upload` | Presigned URL + transcoding |
| ABAC video access | Streaming ABAC | Visibility + org + subscription |
| Club discovery | `/api/v1/clubs` | Nearby, popular, recent |
| Competition invite | `/api/v1/competitions/*/invite` | Invite code access |
| BFF aggregation | App/Web/BO BFF services | Client-optimized responses |
| RBAC (BO) | Admin RBAC API | Roles, groups, menus, permissions |
| Analytics | Admin analytics API | Event ingestion + KPI dashboard |

---

## 4. Missing Features - Priority List

### Priority High
_(None - all critical user flows are covered)_

### Priority Medium
| # | Feature | Legacy Source | Impact | Recommendation |
|---|---------|-------------|--------|----------------|
| 1 | Event list/detail | `/api/Main/EventList`, `/Event` | Marketing campaigns | Add to Content service |
| 2 | QR code venue info | `/api/Media/ParkInfoByQRCodek` | Venue check-in flow | Add to Operation service |

### Priority Low
| # | Feature | Legacy Source | Impact | Recommendation |
|---|---------|-------------|--------|----------------|
| 3 | Email change verification | `/api/Auth/EmailVerificationByChange` | Edge case | Add when needed |
| 4 | Popup management | `/api/Main/PopupList` | Marketing | Add to Admin service |
| 5 | Team disband | `TeamDisband` | Rare admin action | Add to Content service |
| 6 | Team position select | `TeamPositionSelect` | Team management | Frontend static config |
| 7 | Team ban list | `TeamBanList` | Moderation | Add to Content service |
| 8 | Score update | `ParkReservationScoreUp` | Live scoring | Add to Operation service |
| 9 | 본인인증 (Mobile OK) | `/pass/verification` | KYC for minors | Plan with Guardian service |
| 10 | Shortcuts page | `/my-page/shortcuts` | UX convenience | Frontend-only feature |
| 11 | H-LOG | `/H-LOG/*` | Analytics view | Consider removing |
| 12 | Events page (my) | `/my-page/events` | User engagement | Add with Event feature |

---

## 5. Technology Migration Summary

| Aspect | Legacy | New | Assessment |
|--------|--------|-----|-----------|
| Backend | AWS Lambda (serverless) | Spring Boot (microservices) | Better maintainability |
| Frontend | React CRA + Webpack | React Vite + Tailwind | Modern, faster builds |
| Routing | React Router v5 | React Router v7 | Current version |
| State | React Context + SWR | Zustand + React Query | Better patterns |
| Video | Video.js + Google IMA | HLS.js | Lighter, no vendor lock |
| Date libs | Moment + Luxon + date-fns (3x!) | Native / date-fns only | Bundle size fix |
| BO | ASP.NET MVC + jQuery 1.11 | Next.js + modern React | Major improvement |
| DB | AWS (unknown, likely DynamoDB) | PostgreSQL (schema-per-service) | More flexible |
| Auth | Simple JWT + Cookie | JWT + PKCE OAuth2 + Redis blacklist | More secure |
| Search | Basic text | Unified search + suggestions + trending | Enhanced |
