# Pochak FIXLIST 미구현 항목 상세 사유서

> 작성일: 2026-04-12  
> 기준: FIXLIST.md 잔여 항목 31건 전체 분석  
> 목적: 각 항목이 왜 구현되지 않았는지 상세 사유를 기술하고, 다음 단계 요청 시 참고자료로 활용

---

## 전체 분류 요약

| 분류 | 건수 | 내용 |
|------|------|------|
| ✅ FIXLIST 오류 — 실제 구현 완료 | 6건 | FIXLIST 설명이 잘못됨, 코드베이스 탐색으로 구현 확인 |
| 🔴 외부 서비스 계약 필요 | 10건 | Stub/Skeleton 존재, 계약·자격증명 없이 활성화 불가 |
| 🟠 백엔드 API 엔드포인트 미구현 | 12건 | FE에서 호출할 백엔드 엔드포인트 자체가 없음 |
| 🟡 프론트엔드 API 연결 미완 | 5건 | 백엔드 API 존재, FE 코드만 연결되지 않음 |
| ⚠️ 인증·법규 이슈 | 2건 | 보안/법적 위험이 있어 신중한 접근 필요 |
| **합계** | **35건** | (31 FIXLIST + 6건 오류 정정 = 실 유효 미완 25건) |

---

## 1. ✅ FIXLIST 오류 — 실제 구현 완료 (6건)

> 이 항목들은 FIXLIST.md에 미완료로 표기되어 있으나, 코드베이스를 직접 탐색한 결과 이미 구현 완료된 것으로 확인되었다. FIXLIST 체크 여부가 잘못 기재된 것이다.

---

### 항목 5 — Partner-BFF 501 반환 (오류 판정)

**FIXLIST 내용**: `PartnerAuthController.java:20,25` — `/partner/me`, `/partner/register` 501 반환 → Identity Service 연결 필요

**실제 상태**: 구현 완료

**사유**:
- `PartnerAuthController`: `/partner/me` → Identity Service `GET /api/v1/users/me` 프록시, `/partner/register` → `POST /api/v1/users` 프록시 완전 구현됨
- `PartnerClubController`: 클럽 CRUD, 멤버 관리, 콘텐츠 조회 모두 Content Service 연결됨
- `PartnerAnalyticsController`: Admin Service 분석 엔드포인트 프록시 완전 구현됨
- FIXLIST 작성 시점 이후 구현이 완료되었으나 체크박스가 업데이트되지 않은 것으로 추정

**필요 조치**: FIXLIST 체크박스 [x] 처리

---

### 항목 29 — community/reports MOCK → API (오류 판정)

**FIXLIST 내용**: `bo-web/.../community/reports/page.tsx:57` — `MOCK_REPORTS` → API

**실제 상태**: 구현 완료

**사유**:
- `reports/page.tsx`는 `@/lib/api/support-api.ts`의 `fetchReports()` 함수를 사용 중
- `support-api.ts`는 BO BFF `GET /bo/reports`를 실제 호출
- MOCK 상수가 파일에 더 이상 존재하지 않음

**필요 조치**: FIXLIST 체크박스 [x] 처리

---

### 항목 31~35 — teams 5개 페이지 MOCK → API (오류 판정)

**FIXLIST 내용**:
- 31: `teams/elite/page.tsx:41` — `MOCK_DATA` → API
- 32: `teams/public-org/page.tsx:40` — `MOCK_DATA` → API
- 33: `teams/associations/page.tsx:40` — `MOCK_DATA` → API
- 34: `teams/private-branch/page.tsx:39` — `MOCK_DATA` → API
- 35: `teams/private-hq/page.tsx:39` — `MOCK_DATA` → API

**실제 상태**: 5건 모두 구현 완료

**사유**:
- 모든 teams 페이지가 `@/lib/api/organization-api.ts`의 `fetchOrganizations(type)` 함수를 사용 중
- `organization-api.ts`는 BO BFF `GET /bo/organizations?type={type}` 실제 호출
- 각 페이지별로 `type` 파라미터(ELITE, PUBLIC_ORG, ASSOCIATION, PRIVATE_BRANCH, PRIVATE_HQ)가 구분되어 있음

**필요 조치**: FIXLIST 항목 31~35 체크박스 [x] 처리

---

### 항목 38 — commerce/inapp-refunds MOCK → API (오류 판정)

**FIXLIST 내용**: `bo-web/.../commerce/inapp-refunds/page.tsx:49` — `MOCK_INAPP_REFUNDS` → API

**실제 상태**: 구현 완료

**사유**:
- `inapp-refunds/page.tsx`는 `@/lib/api/commerce-admin-api.ts`의 `fetchInAppRefunds()` 함수 사용 중
- `commerce-admin-api.ts`는 BO BFF `GET /bo/commerce/refunds` 실제 호출
- MOCK 상수 미사용

**필요 조치**: FIXLIST 체크박스 [x] 처리

---

## 2. 🔴 외부 서비스 계약 필요 (10건)

> 이 항목들은 코드 인프라(Stub, Skeleton, ConditionalOnProperty 패턴)가 이미 준비되어 있다. 계약 체결 후 환경변수만 전환하면 바로 활성화된다.

---

### 항목 6 — RabbitMQ 실 이벤트 발행 연결

**FIXLIST 내용**: `InMemoryEventPublisher.java` — Spring 로컬 이벤트 → RabbitMQ 실 메시지 브로커 교체

**현재 상태**:
- `RabbitMqEventPublisher`가 이미 구현되어 있으며 `@ConditionalOnProperty(name = "spring.rabbitmq.host")`로 활성화 조건 설정됨
- `InMemoryEventPublisher`는 테스트/로컬 환경 fallback으로 유지 중
- **문제**: 각 도메인 서비스(Identity, Content, Commerce, Operation)의 비즈니스 로직에서 `eventPublisher.publish(event)` 호출 자체가 누락됨
  - 예: 회원 탈퇴 시 `UserWithdrawnEvent` 발행 코드 없음
  - 예: 환불 처리 시 `RefundCompletedEvent` 발행 코드 없음
  - 예: 구독권 만료 시 `EntitlementExpiredEvent` 발행 코드 없음

**필요 작업**:
1. 각 서비스의 주요 비즈니스 이벤트 발생 지점(탈퇴, 환불, 구독 변경)에서 `eventPublisher.publish()` 호출 추가
2. Docker Compose에 `SPRING_RABBITMQ_HOST=rabbitmq` 환경변수 추가 (infra에 RabbitMQ 이미 정의됨)
3. 각 서비스의 `application.yml`에 RabbitMQ 큐/익스체인지 설정 추가

**연관 cross-service 효과**: 탈퇴→데이터정리, 환불→권한회수, 미성년자 회원권 만료 등 cross-service 흐름이 현재 전혀 동작하지 않음

---

### 항목 7 — 실시간 스트리밍 서버 연동 (AWS IVS / Pixellot)

**FIXLIST 내용**: `content-service/.../application.yml:59` — `streaming.provider: mock` → 실제 스트리밍 서버 연동

**현재 상태**:
- `@ConditionalOnProperty(name = "pochak.streaming.provider", havingValue = "mock")` 패턴으로 MockStreamingProvider 활성화 중
- Real 구현체 인터페이스(`StreamingProvider`)는 정의되어 있으나 구현 클래스 없음

**필요 외부서비스**:
- **AWS IVS (Interactive Video Service)**: 월 $0.002/분 스트림 + $0.0085/GB 전송비
- **Pixellot**: 스포츠 특화 AI 카메라 솔루션, 별도 엔터프라이즈 계약 필요
- **Nginx-RTMP (자체 서버)**: 저비용 대안, 직접 서버 운영 필요

**선행 조건**:
1. 스트리밍 서비스 제공업체 선정 및 계약
2. API Key / Stream Key 발급
3. `AWSIVSStreamingProvider` 또는 `PixellotStreamingProvider` 구현체 작성
4. `application.yml` `streaming.provider: aws-ivs`로 전환

---

### 항목 8 — VOD 업로드 실 구현 (S3/GCS + 트랜스코딩)

**FIXLIST 내용**: `StubVodUploadService.java` — VOD 업로드 Stub → S3/GCS + 트랜스코딩 실 구현

**현재 상태**:
- `StubVodUploadService`: 업로드 성공 응답을 즉시 반환하는 더미 구현
- `VodUploadService` 인터페이스 정의됨

**필요 외부서비스**:
- **AWS S3**: 스토리지 (VOD 원본 파일 저장)
- **AWS MediaConvert**: 트랜스코딩 (H.264 → HLS/DASH 세그먼트 생성)
- **CloudFront CDN**: 전 세계 배포
- 또는 **GCS + Cloud Transcoder API** 조합

**선행 조건**:
1. AWS 계정 및 IAM Role 설정
2. S3 버킷 생성 (원본 파일 버킷 + CDN 배포 버킷)
3. MediaConvert Job Template 작성
4. `S3VodUploadService` 구현 + `application.yml` 전환

---

### 항목 17 — 라이브 이벤트 핸들러 (FCM/인코딩 외부서비스 필요)

**FIXLIST 내용**: `ContentEventListener.java:25,35,45,55` — 라이브 시작/종료, VOD 인코딩, 클립 생성 이벤트 핸들러

**현재 상태**:
- `ContentEventListener` 클래스 존재, 각 이벤트 타입별 메서드 skeleton 존재
- 메서드 내부가 `// TODO: Phase 3 - implement` 주석만 있음

**필요 외부서비스**:
1. **FCM (Firebase Cloud Messaging)**: Android 푸시 알림 (서비스 계정 JSON 키 필요)
2. **APNs (Apple Push Notification Service)**: iOS 푸시 알림 (Apple Developer 인증서 필요)
3. **AWS MediaConvert**: VOD 인코딩 파이프라인 (항목 8과 동일)
4. **클립 생성 트랜스코더**: 타임코드 기반 세그먼트 추출 로직

**필요 작업**:
- `LiveStartedEventHandler`: FCM/APNs로 팔로워에게 알림 발송
- `LiveEndedEventHandler`: VOD 생성 트리거 → 인코딩 Job 생성
- `VodEncodedEventHandler`: 인코딩 완료 후 콘텐츠 상태 업데이트 + 사용자 알림
- `ClipCreatedEventHandler`: 클립 메타데이터 저장 + 사용자 알림

---

### 항목 18 — RTMP 실 서버 연동

**FIXLIST 내용**: `StreamingIngestService.java:13` — RTMP 실제 서버 미연동

**현재 상태**:
- `StubStreamingIngestService`: RTMP URL을 `rtmp://localhost:1935/live/{streamKey}` 형태로 더미 반환
- Real 구현 인터페이스 정의됨

**필요 외부서비스**:
- **AWS IVS**: RTMP 인제스트 엔드포인트 자동 제공 (계약 시 즉시 사용 가능)
- **Nginx-RTMP**: EC2/자체 서버에 직접 설치 (비용 절감, 운영 부담 증가)
- **Wowza Streaming Engine**: 상용 솔루션

**선행 조건**: 항목 7 (스트리밍 서버)과 동일 서비스 선정 후 연동

---

### 항목 22 — 결제 PG 연동 (KCP / Google Pay / Apple Pay)

**FIXLIST 내용**: `commerce-service/.../application.yml:50` — `payment.provider: stub` → 실 PG 연동

**현재 상태**:
- `StubPaymentGatewayService`: `@ConditionalOnProperty(name = "pochak.payment.provider", havingValue = "stub")`
- 결제 승인, 취소, 환불 로직 모두 즉시 성공 반환
- Real 인터페이스(`PaymentGatewayService`) 정의됨

**필요 외부서비스**:
- **NHN KCP**: 국내 신용카드/계좌이체 (사업자등록증 + 통신판매업 신고 필요)
- **Google Play Billing**: Android 인앱결제 (Google Play Console 등록 필요)
- **Apple StoreKit 2**: iOS 인앱결제 (Apple Developer Program 등록 필요)
- **토스페이먼츠 / 아임포트**: 대안 국내 PG

**선행 조건**:
1. 사업자 등록 완료
2. 통신판매업 신고
3. PG사 계약 (심사 기간 약 2~3주)
4. `KCPPaymentGatewayService` 구현
5. `application.yml` `payment.provider: kcp`로 전환

---

### 항목 23 — SMS 인증 / 보호자 본인인증 실 구현

**FIXLIST 내용**: `identity-service/.../application.yml:49` — `sms.provider: stub` → 실 SMS 연동

**현재 상태**:
- `StubSmsService`: `@ConditionalOnProperty(name = "pochak.sms.provider", havingValue = "stub")`
- SMS 발송 없이 즉시 성공 반환 (인증코드 로그에만 출력)
- `GuardianService.java:75`: 보호자 본인인증도 스킵 (PIPA 법적 위험 — 항목 10 참조)

**필요 외부서비스**:
- **SMS 발송**: Twilio, NCP(SENS), Kakao 알림톡 중 선택
- **보호자 본인인증(PASS)**: SKT/KT/LGU+ PASS 인증, 또는 나이스평가정보 NICE 인증

**선행 조건**:
1. SMS API 계약 및 발신번호 사전 등록
2. PASS/NICE 연동 계약 (심사 기간 약 1~2개월)
3. `TwilioSmsService` 또는 `NCPSmsService` 구현
4. `application.yml` `sms.provider: ncp`로 전환

---

### 항목 61 — DRM 라이선스 서버 연동 (Widevine / FairPlay)

**FIXLIST 내용**: `drmService.ts:9` — DRM 라이선스 서버 미연동

**현재 상태**:
- `drmService.ts`: `GET /api/v1/drm/license` 엔드포인트 호출 코드 존재
- 백엔드에 `/drm/license` 엔드포인트 미구현
- DRM 없이 재생 가능 상태(보안 취약)

**필요 외부서비스**:
- **Google Widevine**: Android/Chrome 재생 보호 (DRM 서버 라이선스 필요)
- **Apple FairPlay Streaming**: iOS/Safari 재생 보호 (Apple FPS 계약 필요)
- **BuyDRM / Axinom / PallyCon**: 통합 DRM SaaS (국내 PallyCon 권장)

**선행 조건**:
1. DRM 솔루션 선정 및 계약
2. Widevine Content Decryption Module Key, FairPlay Application Secret Key 발급
3. Content Service에 DRM 라이선스 발급 엔드포인트 구현
4. 스트리밍 콘텐츠에 암호화 적용(항목 7/8과 연계)

---

### 항목 62 — FCM/APNs 푸시 알림 구현

**FIXLIST 내용**: `pushService.ts:6` — FCM(Android) / APNs(iOS) 푸시 알림 미구현

**현재 상태**:
- `pushService.ts`: 알림 타입 정의 및 로컬 알림 wrapper 존재
- 실 푸시 발송 로직 없음 (Firebase 미연결)

**필요 외부서비스**:
- **Firebase Cloud Messaging (FCM)**: Android + Web 푸시 (Firebase 프로젝트 생성, `google-services.json` 필요)
- **Apple Push Notification service (APNs)**: iOS 푸시 (Apple Developer 계정 + p8 인증서 필요)

**필요 작업**:
- Backend: `notification-service` 또는 Content Service에 FCM Admin SDK 연동, 알림 발송 API 구현
- Frontend: Expo `expo-notifications` 연동, 디바이스 토큰 서버 등록 로직
- 알림 카테고리: 라이브 시작, 콘텐츠 업로드, 팔로워 활동, 커머스 결제 완료

---

### 항목 64 — 스트리밍 API 연동 (VPU/CHU 인프라)

**FIXLIST 내용**: `streamingService.ts:104` — 스트리밍 API 미연동

**현재 상태**:
- `streamingService.ts`: HLS/DASH 재생 URL 구성 함수에 `// TODO: Phase 5` 주석
- 현재 정적 URL 반환

**필요 외부서비스/인프라**:
- VPU(Video Processing Unit) / CHU(Camera Hub Unit) 하드웨어 인프라 (현장 설치 필요)
- CDN 스트리밍 URL 동적 발급 서버
- 항목 7(스트리밍 서버)과 직접 연계

**선행 조건**: 항목 7, 8 완료 후 진행 가능

---

## 3. 🟠 백엔드 API 엔드포인트 미구현 — BO Web (12건)

> 이 항목들은 프론트엔드 페이지가 이미 완성되어 있지만, 백엔드에 해당 API 엔드포인트가 존재하지 않아 mock 데이터에서 전환하지 못한 상태이다.

---

### 항목 26 — equipment/vpu-contracts MOCK → API

**FE 파일**: `bo-web/.../equipment/vpu-contracts/page.tsx:42`  
**현재 상태**: `MOCK_CONTRACTS` 배열을 직접 렌더링  
**필요 API**: `GET /bo/equipment/vpu-contracts` (BO BFF → Operation Service)  
**미구현 이유**: Operation Service에 VPU 계약 관리 도메인 자체가 없음. `VpuContract` Entity, Repository, Service, Controller 전체 신규 개발 필요  
**예상 작업**: Operation Service에 VPU 계약 CRUD + BO BFF 프록시 엔드포인트

---

### 항목 27 — equipment/vpu-devices MOCK → API

**FE 파일**: `bo-web/.../equipment/vpu-devices/page.tsx:41`  
**현재 상태**: `MOCK_DEVICES` 배열을 직접 렌더링  
**필요 API**: `GET /bo/equipment/vpu-devices` (BO BFF → Operation Service)  
**미구현 이유**: Operation Service에 VPU 디바이스 관리 도메인 없음  
**예상 작업**: VPU 장비 등록/상태 관리 CRUD + BO BFF 프록시

---

### 항목 28 — reservations/booking MOCK → API

**FE 파일**: `bo-web/.../reservations/booking/page.tsx:31`  
**현재 상태**: `MOCK_BOOKINGS` 배열을 직접 렌더링  
**필요 API**: `GET /bo/reservations/bookings` (BO BFF → Operation Service)  
**미구현 이유**: Operation Service에 예약(Booking) 조회 관리자 API 없음. `ReservationService`에서 사용자 예약 생성은 있으나 관리자용 전체 목록 조회 엔드포인트 미구현  
**예상 작업**: Operation Service에 `GET /admin/reservations` 추가 + BO BFF 프록시

---

### 항목 30 — community/posts MOCK → API

**FE 파일**: `bo-web/.../community/posts/page.tsx:54`  
**현재 상태**: `MOCK_POSTS` 배열을 직접 렌더링  
**필요 API**: `GET /bo/community/posts` (BO BFF → Content Service)  
**미구현 이유**: Content Service의 커뮤니티 모듈에 관리자용 게시글 목록 API 없음. 사용자 향 게시글 CRUD는 있으나 BO 전용 전체 목록/검색/제재 엔드포인트 미구현  
**예상 작업**: Content Service에 `GET /admin/community/posts` (페이징, 검색, 제재 처리) + BO BFF 프록시

---

### 항목 36 — commerce/remaining-points MOCK + setTimeout → API

**FE 파일**: `bo-web/.../commerce/remaining-points/page.tsx:41`  
**현재 상태**: `MOCK_STATS`, `MOCK_USERS` + `setTimeout(r, 300)` 가짜 딜레이  
**필요 API**: `GET /bo/commerce/points/summary`, `GET /bo/commerce/points/users` (BO BFF → Commerce Service)  
**미구현 이유**: Commerce Service에 포인트 잔액 집계 관리자 API 없음. 사용자별 포인트 조회는 있으나 전체 집계/잔액 조회 미구현  
**예상 작업**: Commerce Service `WalletService`에 관리자용 집계 메서드 추가 + API 노출

---

### 항목 37 — commerce/season-pass-history MOCK + setTimeout → API

**FE 파일**: `bo-web/.../commerce/season-pass-history/page.tsx:86`  
**현재 상태**: `MOCK_STATS`, `MOCK_DAILY_REVENUE`, `MOCK_HISTORY` + `setTimeout(r, 300)`  
**필요 API**: `GET /bo/commerce/season-passes/stats`, `GET /bo/commerce/season-passes/history` (BO BFF → Commerce Service)  
**미구현 이유**: Commerce Service에 시즌 패스 판매 이력 및 매출 집계 API 없음  
**예상 작업**: Commerce Service에 시즌 패스 매출 집계 + BO BFF 프록시

---

### 항목 39 — commerce/gift-ball MOCK + setTimeout → API

**FE 파일**: `bo-web/.../commerce/gift-ball/page.tsx:65`  
**현재 상태**: `MOCK_GIFT_BALLS` + `setTimeout(r, 300)`  
**필요 API**: `GET /bo/commerce/gift-balls` (BO BFF → Commerce Service)  
**미구현 이유**: Commerce Service에 Gift Ball(포인트 선물) 관리 API 없음  
**예상 작업**: Commerce Service에 Gift Ball 도메인 추가 + BO BFF 프록시

---

### 항목 40 — skylife/vpu-chu MOCK → API

**FE 파일**: `bo-web/.../skylife/vpu-chu/page.tsx:42`  
**현재 상태**: `MOCK_EQUIPMENT`, `MOCK_CHUS` 배열 렌더링  
**필요 API**: `GET /bo/skylife/vpu-chu`, `GET /bo/skylife/chus` (BO BFF → Operation Service)  
**미구현 이유**: Operation Service에 Skylife VPU-CHU(카메라 허브 유닛) 도메인 없음. 하드웨어 연동 인프라 미구축  
**예상 작업**: Operation Service에 CHU 장비 관리 도메인 추가 (항목 64 인프라와 연계)

---

### 항목 41 — skylife/activation MOCK → API

**FE 파일**: `bo-web/.../skylife/activation/page.tsx:32`  
**현재 상태**: `MOCK_CONTRACTS` 배열 렌더링  
**필요 API**: `GET /bo/skylife/activation` (BO BFF → Operation Service)  
**미구현 이유**: Skylife 서비스 활성화 관리 도메인이 Operation Service에 없음  
**예상 작업**: Operation Service에 Skylife 활성화 계약 관리 API + BO BFF 프록시

---

### 항목 42 — sports/list S3 이미지 업로드 미연동

**FE 파일**: `bo-web/.../sports/list/page.tsx:152`  
**현재 상태**: 스포츠 종목 생성/수정 폼에서 이미지 선택은 되지만 서버 업로드 불가  
**필요 API**: `POST /bo/sports/images/upload` (S3 presigned URL 방식)  
**미구현 이유**: Content Service에 이미지 업로드 presigned URL 발급 API 없음. 항목 8 (S3 계약)과 연계됨  
**예상 작업**: Content Service에 S3 presigned URL 발급 엔드포인트 구현 (S3 계약 후 진행 가능)

---

### 항목 43 — skylife/vpu-chu API call TODO

**FE 파일**: `bo-web/.../skylife/vpu-chu/page.tsx:124`  
**현재 상태**: 페이지 내 특정 액션(CHU 연결/해제)에 `// TODO: API call` 주석  
**필요 API**: `POST /bo/skylife/chus/{id}/connect`, `POST /bo/skylife/chus/{id}/disconnect`  
**미구현 이유**: 항목 40과 동일 — CHU 도메인 미구현  
**예상 작업**: 항목 40과 함께 처리

---

### 항목 44 — commerce 4개 페이지 setTimeout 가짜 딜레이

**FE 파일**: `season-pass-history`, `inapp-refunds`, `gift-ball`, `remaining-points`  
**현재 상태**: `setTimeout(resolve, 300)` 패턴으로 가짜 로딩 연출  
**미구현 이유**: 항목 36, 37, 39와 동일 — 백엔드 API 미구현으로 인해 임시 처리  
**예상 작업**: 항목 36, 37, 38, 39와 함께 백엔드 API 구현 후 일괄 전환

---

## 4. 🟡 프론트엔드 API 연결 미완 (5건)

> 이 항목들은 백엔드 API가 이미 존재하며, 프론트엔드 코드 수정만으로 완료 가능하다.

---

### 항목 47 — couponApi.ts MOCK → API

**FE 파일**: `mobile/.../services/couponApi.ts:26`  
**현재 상태**: `MOCK_COUPONS` 반환 후 실 API 호출 없음 (mock fallback 유지 중)  
**백엔드 API**: App BFF `GET /app/coupons` 엔드포인트 존재 확인됨  
**미구현 이유**: 이전 세션에서 mock fallback을 유지하는 결정을 내렸으나, 실 API 전환 코드 미작성  
**예상 작업**: `apiClient.get('/app/coupons')` 호출로 교체 (약 30분 내 완료 가능)  
**주의**: 쿠폰 만료 상태 처리 로직 확인 필요

---

### 항목 52 — CompetitionDetailScreen MOCK → API

**FE 파일**: `mobile/.../screens/detail/CompetitionDetailScreen.tsx:87`  
**현재 상태**: `MOCK_COMPETITION` 데이터 하드코딩  
**백엔드 API**: Content Service `GET /api/v1/competitions/{id}` 엔드포인트 존재  
**미구현 이유**: TeamDetailScreen(항목 51)과 함께 처리할 예정이었으나, 세션 시간 부족으로 DEFERRED  
**예상 작업**: `contentService.getCompetition(id)` 호출로 교체 (약 1~2시간 내 완료 가능)

---

### 항목 57 — SupportScreen FAQ/문의 MOCK → API

**FE 파일**: `mobile/.../screens/support/SupportScreen.tsx:40`  
**현재 상태**: `MOCK_FAQ`, `MOCK_INQUIRIES` 하드코딩  
**백엔드 API 현황**:
- `GET /app/inquiries` (내 문의 목록): App BFF에 존재
- `POST /app/inquiries` (문의 등록): 엔드포인트 존재 여부 불확실
- `GET /app/faq`: **백엔드 미구현** (Admin Service에 FAQ 도메인 없음)

**미구현 이유**:
- FAQ 기능은 Admin Service에 관리 API가 없어 데이터 없음
- 문의 목록 조회는 가능하나 FAQ가 없어 부분 전환만 가능한 상황

**예상 작업**:
1. Admin Service에 FAQ CRUD API 추가 (콘텐츠 관리 팀 필요)
2. 문의 목록/등록은 먼저 실 API 전환 가능 (즉시 가능)
3. FAQ는 백엔드 구현 후 전환

---

### 항목 63 — searchService.ts API 미연동

**FE 파일**: `mobile/.../api/searchService.ts:34`  
**현재 상태**: 검색 결과 빈 배열 반환, `// TODO Phase 5` 주석  
**백엔드 API**: App BFF `GET /app/search?q={query}&type={type}` 엔드포인트 존재 확인됨  
**미구현 이유**: Phase 5로 명시적 지연. 검색 기능 자체가 우선순위가 낮아 백로그에 보류  
**예상 작업**: `apiClient.get('/app/search', {params: {q, type}})` 호출로 교체 (약 2~3시간 내 완료 가능)  
**주의**: 검색 결과 타입별 파싱 로직 및 빈 결과 UX 처리 필요

---

### 항목 66 — ClipEditScreen 클립 생성 API 미연동

**FE 파일**: `mobile/.../screens/clip/ClipEditScreen.tsx:95`  
**현재 상태**: `POST /contents/clips` 호출 코드가 주석 처리됨  
**백엔드 API**: Content Service `POST /api/v1/clips` 엔드포인트 존재 확인됨  
**미구현 이유**: 클립 저장 완료 후 트랜스코딩이 필요한데, 트랜스코딩 파이프라인(항목 8)이 미완성. 저장은 되나 실제 클립 파일 생성 불가 상태라 주석 처리  
**예상 작업**:
- 단기: 주석 해제 + 클립 메타데이터만 저장 (트랜스코딩 없이)
- 장기: 항목 8 (S3/MediaConvert) 완료 후 트랜스코딩 파이프라인 연동

---

## 5. ⚠️ 인증·법규 이슈 (2건)

---

### 항목 9 — 회원가입 후 Wallet 생성 호출 누락

**파일**: `identity-service/.../AuthServiceImpl.java:82`  
**현재 상태**: 회원가입 완료 후 Commerce Service에 Wallet 생성 REST 호출 없음  
**위험**: 신규 사용자가 결제 시도 시 Wallet이 없어 NullPointerException 또는 결제 오류 발생 가능  
**미구현 이유**: Identity Service ↔ Commerce Service 간 동기 REST 호출 설계 시 순환 의존 우려로 보류  
**권장 해결책**:
- 방법 1: Identity Service에서 직접 `CommerceServiceClient.createWallet(userId)` 호출 (단순, 동기)
- 방법 2: RabbitMQ `UserRegisteredEvent` 발행 → Commerce Service가 소비하여 Wallet 생성 (비동기, 항목 6과 연계)
- **권장**: 방법 2 (이벤트 기반, 서비스 간 결합도 낮음)

---

### 항목 10 — 보호자 인증 검증 스킵 (PIPA 위반 위험)

**파일**: `identity-service/.../GuardianService.java:75`  
**현재 상태**: 미성년자 회원가입 시 보호자 본인인증을 실제 검증 없이 통과  
**위험**: 
- **개인정보보호법(PIPA) 위반**: 만 14세 미만 아동의 개인정보 수집 시 법정대리인 동의 의무 (위반 시 과태료 3천만 원 이하)
- **아동·청소년 보호**: 미성년자가 성인 콘텐츠 접근 시 법적 책임 발생 가능

**미구현 이유**: PASS 인증 API 계약(항목 23)이 없어 실 검증 불가  
**선행 조건**: 항목 23 (PASS/NICE 계약) 완료 후 즉시 구현 필요  
**긴급도**: 프로덕션 배포 전 반드시 해결 필요 (법적 위험)

---

## 6. 우선순위 및 로드맵

### Phase 2 (즉시 착수 가능 — 외부 의존성 없음)

| 항목 | 작업 | 예상 기간 |
|------|------|-----------|
| 6 (이벤트 발행 연결) | 도메인 서비스에 eventPublisher.publish() 추가 | 1~2일 |
| 9 (Wallet 생성) | UserRegisteredEvent 발행 + Wallet 소비자 구현 | 반나절 |
| 47 (couponApi) | FE API 연결 코드만 작성 | 30분 |
| 52 (CompetitionDetail) | FE mock → API 전환 | 1~2시간 |
| 63 (searchService) | FE API 연결 코드만 작성 | 2~3시간 |
| 66 (ClipEdit — 메타데이터) | 주석 해제 + 메타데이터만 저장 | 1시간 |
| 28, 30 (예약/커뮤니티 백엔드) | 관리자용 API 엔드포인트 추가 | 1~2일 |
| 26, 27 (VPU 장비) | VPU Contract/Device 도메인 추가 | 2~3일 |

### Phase 3 (외부 서비스 계약 후)

| 항목 | 선행 조건 | 순서 |
|------|-----------|------|
| 23 (SMS/PASS) | Twilio/NICE 계약 | 1순위 (법적 위험 해소) |
| 10 (PIPA 보호자 인증) | 항목 23 완료 | 1순위 즉시 연계 |
| 22 (PG 연동) | KCP/Google Play/Apple 계약 | 2순위 |
| 8 (VOD S3) | AWS 계정 | 3순위 |
| 7, 18 (스트리밍 서버) | AWS IVS 또는 Nginx-RTMP | 3순위 |
| 17 (이벤트 핸들러) | FCM/APNs + MediaConvert | 4순위 |
| 61 (DRM) | PallyCon/Widevine/FairPlay | 5순위 |
| 62 (푸시 알림) | Firebase/APNs | 4순위 |
| 64 (스트리밍 API) | 항목 7 완료 후 | 5순위 |

### Phase 5+ (장기 백로그)

| 항목 | 사유 |
|------|------|
| 36, 37, 39 (commerce 집계) | 거래 데이터 축적 후 집계 의미 있음 |
| 40, 41, 43 (Skylife CHU) | 하드웨어 인프라 구축 전제 |
| 57 FAQ (백엔드) | 콘텐츠 운영팀 입력 필요 |
| 42 (S3 이미지 업로드) | 항목 8 완료 후 연계 |

---

## 부록 — FIXLIST.md 수정 권고

다음 항목들은 FIXLIST.md에서 [x] 완료 처리가 필요하다:

| 항목 | 수정 내용 |
|------|-----------|
| **5** | [x] 표시 + "✅ Partner-BFF 전체 컨트롤러 구현 완료 확인" |
| **29** | [x] 표시 + "✅ support-api.ts → GET /bo/reports 실 API 연결 확인" |
| **31~35** | [x] 표시 + "✅ organization-api.ts → GET /bo/organizations 실 API 연결 확인" |
| **38** | [x] 표시 + "✅ commerce-admin-api.ts → GET /bo/commerce/refunds 실 API 연결 확인" |

수정 후 진행 현황 표:

| 등급 | 전체 | 완료 | 잔여 |
|------|------|------|------|
| 🔴 CRITICAL | 10 | 9 | 1 (항목 6 이벤트 연결) |
| 🟠 HIGH | 15 | 13+2 | 2 (항목 17, 18) — 22, 23은 DEFERRED |
| 🟡 MEDIUM (BO Web) | 19 | 6 | 13 |
| 🟡 MEDIUM (Mobile) | 21 | 13+1 | 7 |
| 🟢 LOW | 9 | 9 | 0 |
