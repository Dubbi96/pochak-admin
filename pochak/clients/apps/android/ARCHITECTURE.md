# Pochak Platform Architecture

## 1. Gateway Routing Rules

The pochak-gateway defines 10 routes in priority order. Routes are evaluated top-to-bottom; the first match wins.

| Priority | Route ID              | Path Pattern(s)                                                                                                                                          | Target Service   | Strip Prefix | Notes                                         |
|----------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|--------------|-----------------------------------------------|
| 1        | content-user-routes   | `/api/v1/users/me/watch-history/**`, `/api/v1/users/me/favorites/**`                                                                                     | content-service  | 2            | Resolves /users/** path conflict (ISSUE-004)  |
| 2        | identity-oauth2       | `/api/v1/auth/oauth2/authorize/**`, `/api/v1/auth/oauth2/callback/**`, `/api/v1/auth/oauth2/token`, `/api/v1/auth/oauth2/complete-signup`, `/api/v1/auth/oauth2/link` | identity-service | 2            | OAuth2 specificity before general auth        |
| 3        | identity-service      | `/api/v1/auth/**`, `/api/v1/users/**`, `/api/v1/guardians/**`, `/api/v1/admin/members/**`                                                                | identity-service | 2            | General auth + user management                |
| 4        | web-bff               | `/api/v1/web/**`                                                                                                                                         | web-bff          | 2            | Web BFF layer                                 |
| 5        | app-bff               | `/api/v1/app/**`                                                                                                                                         | app-bff          | 2            | App BFF layer                                 |
| 6        | bo-bff                | `/admin/bff/**`                                                                                                                                          | bo-bff           | No           | Back-office BFF layer                         |
| 7        | operation-service     | `/api/v1/venues/**`, `/api/v1/cameras/**`, `/api/v1/reservations/**`, `/api/v1/streaming/ingest/**`, `/api/v1/studio/**`                                  | operation-service| 2            | Before content (resolves ISSUE-005 streaming) |
| 8        | content-service       | `/api/v1/contents/**`, `/api/v1/sports/**`, `/api/v1/teams/**`, `/api/v1/competitions/**`, `/api/v1/matches/**`, `/api/v1/home/**`, `/api/v1/clubs/**`, `/api/v1/organizations/**`, `/api/v1/search/**`, `/api/v1/recommendations/**`, `/api/v1/upload/**`, `/api/v1/follows/**`, `/api/v1/memberships/**`, `/api/v1/schedule/**`, `/api/v1/comments/**`, `/api/v1/notifications/**`, `/api/v1/streaming/**`, `/api/v1/communities/**` | content-service  | 2            | All content routes                            |
| 9        | commerce-service      | `/api/v1/subscriptions/**`, `/api/v1/payments/**`, `/api/v1/products/**`, `/api/v1/wallet/**`, `/api/v1/purchases/**`, `/api/v1/refunds/**`, `/api/v1/entitlements/**`, `/api/v1/coupons/**` | commerce-service | 2            | Commerce domain                               |
| 10       | admin-service         | `/admin/**`                                                                                                                                              | admin-service    | No           | Admin catch-all (no stripPrefix)              |

### Service URLs (defaults)

| Service           | Default URL              |
|-------------------|--------------------------|
| identity-service  | http://localhost:8081     |
| content-service   | http://localhost:8082     |
| commerce-service  | http://localhost:8083     |
| operation-service | http://localhost:8084     |
| admin-service     | http://localhost:8085     |
| web-bff           | http://localhost:9080     |
| app-bff           | http://localhost:9081     |
| bo-bff            | http://localhost:9090     |

### Key Design Decisions

- **BFF routes (4-6) are placed before domain service routes (7-10)** to ensure BFF aggregation endpoints are matched before individual domain paths.
- **OAuth2 route (2) is placed before general identity route (3)** to ensure specific `/auth/oauth2/**` paths are matched before the catch-all `/auth/**`.
- **content-user-routes (1) is the highest priority** to resolve the `/users/**` path conflict between identity and content services (ISSUE-004).
- **operation-service (7) is placed before content-service (8)** to ensure `/streaming/ingest/**` goes to operation while `/streaming/**` goes to content (ISSUE-005).
- **CORS is managed solely by `CorsConfig.java`** (not duplicated in `application.yml` globalcors). The `DedupeResponseHeader` default filter is retained to prevent duplicate CORS headers.
