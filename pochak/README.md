# POCHAK - Sports OTT Platform

스포츠 특화 OTT 플랫폼. MSA 기반 아키텍처.

## Tech Stack

- **Backend**: Java 21, Spring Boot 3.3, Spring Cloud Gateway
- **Frontend**: React Native (Mobile), Next.js 14 (BO Web), TypeScript
- **Database**: PostgreSQL 16 (5 schemas), Redis 7
- **Infra**: Docker Compose, schema-per-service isolation

## 서비스 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| **Gateway** | 8080 | API 진입점, JWT 검증, 라우팅 |
| **Identity** | 8081 | 회원가입, 로그인, 인증, 프로필 |
| **Content** | 8082 | LIVE/VOD/CLIP, 종목, 팀, 대회 |
| **Commerce** | 8083 | 상품, 결제, 지갑(뽈), 구독 |
| **Operation** | 8084 | 구장, 장비, 촬영예약, 스튜디오 |
| **Admin** | 8085 | BO RBAC, 운영, 통계, CS |
| **BO Web** | 3000 | 관리자 웹 (Next.js) |
| **PostgreSQL** | 5432 | 메인 DB |
| **Redis** | 6379 | 캐시 |

---

## Quick Start

### 전체 서비스 한 번에 시작 (Docker)

```bash
make all-up
```

이 명령 하나로 **백엔드 6개 + BO Web + DB + Redis** = 9개 컨테이너가 모두 기동됩니다.

확인:
- BO Web: http://localhost:3000/login
- API Gateway: http://localhost:8080
- Identity API: http://localhost:8081/auth/login

### 서비스 상태 확인

```bash
make status
```

### 서비스 중지

```bash
make all-down     # 서비스만 중지 (DB 데이터 유지)
make clean        # 전체 삭제 (DB 초기화 포함)
```

---

## 로컬 개발 (FE)

### BO Web 개발 서버 (Hot Reload)

Docker가 아닌 로컬 dev 서버로 띄울 때:

```bash
# 1. 백엔드 + DB만 Docker로 띄우기
make deps-up

# 2. BO Web 개발 서버
make bo-dev
# → http://localhost:3000
```

### Mobile App (React Native)

```bash
# 1. 백엔드 + DB Docker 기동 (또는 make all-up 상태)
make deps-up

# 2. Metro 서버 시작 (포트 8097 - Identity 8081과 충돌 방지)
make mobile-dev
# → http://localhost:8097

# 3. iOS 시뮬레이터
make mobile-ios

# 4. Android 에뮬레이터
make mobile-android
```

> **주의**: React Native Metro 서버의 기본 포트가 8081인데, Identity Service와 충돌합니다. `make mobile-dev`는 자동으로 8097 포트를 사용합니다.

---

## 유용한 명령어

```bash
make help           # 전체 명령어 목록
make status         # 컨테이너 상태
make logs           # 전체 로그 (follow)
make logs-svc s=identity   # 특정 서비스 로그
make seed           # 시드 데이터 삽입
make migrate        # DB 마이그레이션 재실행
make rebuild        # 전체 서비스 재빌드
make common-publish # common-lib Maven Local 배포
```

## 프로젝트 구조

```
pochak/
├── services/                    # 백엔드 MSA (Spring Boot)
│   ├── pochak-common-lib/       # 공유 라이브러리
│   ├── pochak-gateway/          # API Gateway (:8080)
│   ├── pochak-identity-service/ # 인증/회원 (:8081)
│   ├── pochak-content-service/  # 콘텐츠 (:8082)
│   ├── pochak-commerce-service/ # 결제 (:8083)
│   ├── pochak-operation-service/# 운영 (:8084)
│   └── pochak-admin-service/    # BO (:8085)
├── clients/                     # 프론트엔드
│   ├── apps/
│   │   ├── bo-web/              # BO 웹 (Next.js, :3000)
│   │   ├── mobile/              # 모바일 앱 (React Native)
│   │   └── public-web/          # 사용자 웹 (예정)
│   └── packages/                # 공유 패키지
│       ├── api-client/          # API 클라이언트
│       ├── domain-types/        # 도메인 타입
│       ├── design-tokens/       # 디자인 토큰
│       └── utils/               # 유틸리티
├── db/
│   ├── migrations/              # SQL DDL (5 schemas, 60 tables)
│   └── seeds/                   # 초기 데이터
├── infra/                       # Docker Compose
├── docs/                        # 문서, 보고서
├── Makefile                     # 개발 명령어
└── ROADMAP.md                   # 전체 로드맵
```