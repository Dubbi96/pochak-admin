# Pochak API Namespace 계약서

> 클라이언트별 허용 prefix와 대응 서비스를 정리합니다.
> 게이트웨이에서 경로 기반으로 라우팅되며, BFF가 있는 채널은 BFF 경유가 원칙입니다.

## 1. 채널별 API Prefix

| 채널 | Gateway 경로 | 대상 서비스 | 인증 방식 |
|------|-------------|------------|----------|
| **Public Web** | `/api/v1/web/public/**` | web-bff → content/commerce | Optional JWT (Cookie) |
| **Web (인증)** | `/api/v1/web/**` | web-bff → identity/content/commerce | JWT (Cookie) + CSRF |
| **App** | `/api/v1/app/**` | app-bff → identity/content/commerce | Bearer JWT |
| **Partner** | `/api/v1/partner/**` | partner-bff → operation/commerce/content | Bearer JWT |
| **BO (Admin)** | `/admin/bff/**` | bo-bff → admin/identity/content/commerce | Admin JWT |
| **Admin (직접)** | `/admin/api/v1/**` | admin-service | Admin JWT |

## 2. BFF 내부 네임스페이스

### Web BFF (port 9080)

| Prefix | 설명 |
|--------|------|
| `/public/resolve/{slug}` | Slug → 리소스 타입+ID 변환 |
| `/public/clubs/{slug}` | 클럽 공개 랜딩 |
| `/public/competitions/{slug}` | 대회 공개 랜딩 |
| `/public/organizations/{slug}` | 단체 공개 랜딩 |
| `/public/slug/check` | Slug 가용성 확인 |
| `/csrf/token` | CSRF 토큰 발급 |
| `/home` | 웹 홈 집약 |
| `/auth/**` | OAuth 시작/로그인/가입/로그아웃 |
| `/mypage` | 마이페이지 집약 |
| `/player/{type}/{id}` | 플레이어 집약 |
| `/notices` | 공지 목록 |

### App BFF (port 9081)

| Prefix | 설명 |
|--------|------|
| `/home` | 앱 홈 집약 |
| `/auth/**` | OAuth PKCE, 미성년 가입, 보호자 검증 |
| `/player/{type}/{id}` | 플레이어 집약 |
| `/mypage` | 마이페이지 집약 |
| `/resolve/{identifier}` | Slug/identifier → 리소스 |
| `/qr/{identifier}` | QR 코드 resolve |
| `/push/**` | 푸시 토큰 등록/해제 |
| `/settings/push-preferences/**` | 푸시 알림 카테고리별 설정 |
| `/settings/sessions/**` | 기기/세션 목록, 강제 로그아웃 |
| `/version/check` | 앱 최소 버전 확인 |

### Partner BFF (port 9091)

| Prefix | 설명 |
|--------|------|
| `/api/v1/partner/venues/**` | 시설 관리/스케줄 |
| `/api/v1/partner/reservations/**` | 예약 관리 |
| `/api/v1/partner/settlements/**` | 정산/잔액 |
| `/api/v1/partner/analytics/**` | 매출/예약 통계 |
| `/api/v1/partner/partners/{id}/clubs/**` | 클럽 커스터마이징 |
| `/api/v1/partner/notices` | 파트너 공지 |
| `/api/v1/partners/me/**` | 레거시 파트너 정보 (deprecated) |

### BO BFF (port 9090)

| Prefix | 설명 |
|--------|------|
| `/dashboard/summary` | 운영 대시보드 (멀티 서비스 aggregate) |
| `/dashboard/audit-logs` | 감사 로그 조회 |
| `/site/banners/**` | 배너 CRUD |
| `/site/notices/**` | 공지 CRUD |
| `/rbac/**` | RBAC 관리 프록시 |
| `/members/**` | 회원 관리 프록시 |
| `/commerce/**` | 상품/환불 관리 프록시 |

## 3. Core Service 내부 API

| 서비스 | 주요 내부 엔드포인트 | 비고 |
|--------|---------------------|------|
| content-service | `/public/resolve/{slug}`, `/public/links`, `/public/slug/check` | Public link CRUD |
| content-service | `/public/sites/{ownerType}/{ownerId}` | CMS 사이트 공개 조회 |
| content-service | `/sites/**` | CMS 사이트 관리 (admin 경유) |
| identity-service | `/users/me/sessions`, `/users/me/push-preferences/{category}` | 세션/푸시 설정 |
| identity-service | `/auth/oauth2/authorize/apple` | Apple OAuth |
| commerce-service | `/api/v1/partner/balances`, `/api/v1/partner/settlements` | 정산 |
| admin-service | `/admin/api/v1/audit/logs` | 감사 로그 조회 |

## 4. 보안 정책 요약

| 채널 | 인증 | CSRF | 특이사항 |
|------|------|------|---------|
| Web (공개) | 없음 / Optional JWT | 불필요 | 비인증 접근 허용, 로그인 시 확장 |
| Web (인증) | JWT (Cookie) | 필요 | `/csrf/token` 발급 → 상태 변경 시 헤더 |
| App | Bearer JWT | 불필요 | PKCE for OAuth |
| Partner | Bearer JWT | 불필요 | X-User-Id 기반 소유권 검증 |
| BO/Admin | Admin JWT | 불필요 (Stateless) | Permission Guard (`PERM_*`) |
