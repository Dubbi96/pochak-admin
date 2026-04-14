# 구현 수정 계획서

> 작성일: 2026-04-13  
> 목적: 외부 서비스 계약 없이 코드 수정만으로 완료 가능한 항목의 구체적 수정 계획  
> 기준: DEFERRED_ITEMS.md 분류 중 백엔드 API 미구현(12건) + FE 연결 미완(5건) + 이벤트 발행 연결(1건)

---

## 전체 구현 목록 및 우선순위

| 우선순위 | 항목 | 파일 | 예상 작업량 |
|---------|------|------|-------------|
| P1 | 항목 6: 이벤트 발행 연결 | 도메인 서비스 5개 | 1~2일 |
| P1 | 항목 52: CompetitionDetailScreen | mobile FE | 2~3시간 |
| P1 | 항목 66: ClipEditScreen 주석 해제 | mobile FE | 1시간 |
| P1 | 항목 63: searchService.ts 연결 | mobile FE | 2~3시간 |
| P2 | 항목 26: vpu-contracts 백엔드 + FE | operation-service + bo-web | 2~3일 |
| P2 | 항목 27: vpu-devices 백엔드 + FE | operation-service + bo-web | 1~2일 |
| P2 | 항목 28: reservations/booking 백엔드 + FE | operation-service + bo-web | 1일 |
| P2 | 항목 30: community/posts 백엔드 + FE | content-service + bo-web | 1~2일 |
| P3 | 항목 57: SupportScreen FAQ 백엔드 + FE | admin-service + mobile | 2~3일 |
| P3 | 항목 36~39, 44: commerce BO 백엔드 + FE | commerce-service + bo-web | 3~5일 |
| P3 | 항목 40~43: Skylife BO 백엔드 + FE | operation-service + bo-web | 3~5일 |

---

## P1-1. 항목 6 — 도메인 서비스 이벤트 발행 연결

### 현재 상태
- `RabbitMqEventPublisher` 및 `InMemoryEventPublisher` 모두 구현 완료
- **문제**: Identity/Content/Commerce/Operation 서비스에서 비즈니스 이벤트 발생 지점에 `eventPublisher.publish()` 호출이 없음

### 수정 계획

#### 1-A. Identity Service — 회원 탈퇴 이벤트

**파일**: `services/pochak-identity-service/src/main/java/com/pochak/identity/auth/service/AuthServiceImpl.java`

탐색 결과 `withdraw()` 메서드 라인 228 근처에 이미 `eventPublisher.publish(new UserWithdrawnEvent(...))` 구현이 확인됨. Docker Compose에서 RabbitMQ host 환경변수만 활성화하면 동작.

**확인 필요**: `UserWithdrawnEvent`가 Content/Commerce/Operation 서비스에서 소비되는지 확인
```bash
grep -r "UserWithdrawnEvent" services/ --include="*.java"
```

#### 1-B. Commerce Service — 환불 완료 이벤트

**파일**: `services/pochak-commerce-service/src/main/java/com/pochak/commerce/payment/service/PaymentService.java`

**추가할 이벤트 발행 위치**:
```java
// refundPayment() 성공 후
eventPublisher.publish(new RefundCompletedEvent(
    payment.getUserId(),
    payment.getOrderId(),
    payment.getAmount(),
    payment.getEntitlementId()  // 취소할 시청권
));
```

**수신 서비스**: Content Service — 환불 시 Entitlement 비활성화

#### 1-C. Commerce Service — 구독권 만료 이벤트

**파일**: `services/pochak-commerce-service/src/main/java/com/pochak/commerce/entitlement/service/EntitlementService.java`

**추가할 이벤트 발행 위치**:
```java
// expireEntitlement() 또는 스케줄러 만료 처리 후
eventPublisher.publish(new EntitlementExpiredEvent(
    entitlement.getUserId(),
    entitlement.getContentId(),
    entitlement.getType()
));
```

#### 1-D. 이벤트 소비자 확인

```bash
# 기존 구현된 소비자 확인
grep -r "@RabbitListener\|@EventListener" services/ --include="*.java" -l
```

예상 소비자:
- `UserWithdrawalListener` (Content/Commerce/Operation/Admin 각 서비스) — 이미 구현됨 확인 필요
- `RefundCompletedListener` (Content Service) — Entitlement 회수

#### 1-E. Docker Compose 환경변수 활성화

**파일**: `infra/.env` 또는 `infra/docker-compose.yml`

```bash
# 각 서비스 환경변수에 추가
SPRING_RABBITMQ_HOST=rabbitmq
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=pochak
SPRING_RABBITMQ_PASSWORD=${RABBITMQ_PASSWORD}
```

#### 1-F. 검증
```bash
make all-up
# 회원 탈퇴 API 호출
curl -X DELETE http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer ${TOKEN}"
# RabbitMQ Management UI (http://localhost:15672) → 큐 메시지 확인
```

---

## P1-2. 항목 52 — CompetitionDetailScreen Mock → API 전환

### 현재 상태
- `screens/detail/CompetitionDetailScreen.tsx` — 모든 데이터가 파일 내 Mock 상수 (라인 87~207)
- 팔로우 API는 이미 연결됨

### 수정 계획

**파일**: `clients/apps/mobile/src/screens/detail/CompetitionDetailScreen.tsx`

#### Step 1 — contentService 연결
```typescript
// 상단 import 추가
import { contentService } from '../../services/contentService';

// 기존 Mock 상수 제거:
// const MOCK_COMPETITIONS = [...] ← 삭제
// const MOCK_VIDEOS = [...]        ← 삭제
// const MOCK_CLIPS = [...]         ← 삭제
// const MOCK_MATCHES = [...]       ← 삭제
// const MOCK_POSTS = [...]         ← 삭제
```

#### Step 2 — 상태 및 useEffect 추가
```typescript
const [competition, setCompetition] = useState<CompetitionDetail | null>(null);
const [videos, setVideos] = useState<VideoItem[]>([]);
const [clips, setClips] = useState<ClipItem[]>([]);
const [matches, setMatches] = useState<MatchItem[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const load = async () => {
    try {
      setIsLoading(true);
      const [compData, videoData, matchData] = await Promise.all([
        contentService.getCompetition(competitionId),
        contentService.getCompetitionVideos(competitionId),
        contentService.getCompetitionMatches(competitionId),
      ]);
      setCompetition(compData);
      setVideos(videoData.videos ?? []);
      setClips(videoData.clips ?? []);
      setMatches(matchData ?? []);
    } catch (e) {
      setError('대회 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  load();
}, [competitionId]);
```

#### Step 3 — contentService 메서드 확인/추가

**파일**: `clients/apps/mobile/src/services/contentService.ts`

```typescript
// 필요 시 추가 (이미 있으면 확인만)
getCompetition: async (id: string): Promise<CompetitionDetail> => {
  const res = await apiClient.get(`/competitions/${id}`);
  return res.data;
},
getCompetitionVideos: async (id: string) => {
  const res = await apiClient.get(`/competitions/${id}/contents`);
  return res.data;
},
getCompetitionMatches: async (id: string) => {
  const res = await apiClient.get(`/competitions/${id}/matches`);
  return res.data;
},
```

#### Step 4 — 로딩/에러 UI 추가
```typescript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorView message={error} onRetry={load} />;
if (!competition) return null;
```

---

## P1-3. 항목 66 — ClipEditScreen API 연결

### 현재 상태
- `ClipEditScreen.tsx` 라인 95~99: `contentService.createClip()` 호출이 주석 처리됨
- 라인 102: 500ms setTimeout으로 mock 처리 중

### 수정 계획

**파일**: `clients/apps/mobile/src/screens/clip/ClipEditScreen.tsx`

#### Step 1 — 주석 해제 및 mock 제거
```typescript
// 기존 (제거)
// TODO: Call clip creation API
// await contentService.createClip({...});
await new Promise(resolve => setTimeout(resolve, 500));  // ← 이 줄 제거

// 변경 후
await contentService.createClip({
  title,
  description,
  tags,
  visibility,
  startTime,
  endTime,
  sourceContentType,
  sourceContentId,
});
```

#### Step 2 — contentService.createClip 구현 확인

**파일**: `clients/apps/mobile/src/services/contentService.ts`

```typescript
createClip: async (params: {
  title: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'club' | 'private';
  startTime: number;
  endTime: number;
  sourceContentType: 'live' | 'vod';
  sourceContentId: string;
}): Promise<{ clipId: string }> => {
  const res = await apiClient.post('/clips', params);
  return res.data;
},
```

#### Step 3 — 에러 처리 보강
```typescript
try {
  await contentService.createClip({...});
  analytics.track('clipCreate', {...});
  navigation.goBack();
  showToast('클립이 저장되었습니다.');
} catch (e) {
  // 트랜스코딩 미완료 상태 안내 메시지
  if (e?.response?.status === 503) {
    showToast('현재 클립 처리 서버가 준비 중입니다. 잠시 후 다시 시도해주세요.');
  } else {
    showToast('클립 저장에 실패했습니다.');
  }
}
```

---

## P1-4. 항목 63 — searchService.ts API 연결

### 현재 상태
- `mobile/src/api/searchService.ts:34`: 빈 배열 반환, `// TODO Phase 5` 주석

### 수정 계획

**파일**: `clients/apps/mobile/src/api/searchService.ts`

```typescript
// 기존 (제거)
// TODO Phase 5
return [];

// 변경 후
const res = await apiClient.get('/search', {
  params: { q: query, type, page, size: 20 },
});
return res.data?.results ?? [];
```

**에러 처리**:
```typescript
try {
  const res = await apiClient.get('/search', { params: { q: query, type } });
  return res.data?.results ?? [];
} catch {
  return [];  // 검색 실패 시 빈 결과 (graceful degradation)
}
```

**백엔드 엔드포인트 확인**:
```bash
grep -r "search" services/pochak-app-bff/src --include="*.java" -l
# GET /app/search 또는 GET /search 확인
```

---

## P2-1. 항목 26, 27 — VPU 장비 관리 (Operation Service + BO Web)

### 수정 계획

#### A. Operation Service — VPU 도메인 추가

**신규 파일 목록**:
```
services/pochak-operation-service/src/main/java/com/pochak/operation/
├── vpu/
│   ├── entity/
│   │   ├── VpuContract.java          # VPU 계약 엔티티
│   │   └── VpuDevice.java            # VPU 장비 엔티티
│   ├── repository/
│   │   ├── VpuContractRepository.java
│   │   └── VpuDeviceRepository.java
│   ├── service/
│   │   ├── VpuContractService.java
│   │   └── VpuDeviceService.java
│   ├── controller/
│   │   └── VpuAdminController.java   # /admin/vpu/**
│   └── dto/
│       ├── VpuContractResponse.java
│       └── VpuDeviceResponse.java
```

**VpuContract 엔티티 핵심 필드**:
```java
@Entity
public class VpuContract {
    @Id @GeneratedValue
    private Long id;
    private String contractNumber;     // 계약번호
    private Long organizationId;       // 연결 단체
    private ContractStatus status;     // ACTIVE, EXPIRED, PENDING
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer deviceCount;       // 계약 장비 수
    private String contactPerson;      // 담당자
    private String contactPhone;
}
```

**VpuDevice 엔티티 핵심 필드**:
```java
@Entity
public class VpuDevice {
    @Id @GeneratedValue
    private Long id;
    private Long contractId;           // 계약 참조
    private String serialNumber;       // 시리얼 번호
    private DeviceStatus status;       // ACTIVE, INACTIVE, MAINTENANCE
    private String firmwareVersion;
    private String location;           // 설치 위치
    private LocalDateTime lastHeartbeat;
}
```

**VpuAdminController 핵심 엔드포인트**:
```java
@RestController
@RequestMapping("/admin/vpu")
public class VpuAdminController {

    @GetMapping("/contracts")
    public Page<VpuContractResponse> listContracts(
        @RequestParam(required = false) ContractStatus status,
        Pageable pageable) { ... }

    @GetMapping("/devices")
    public Page<VpuDeviceResponse> listDevices(
        @RequestParam(required = false) Long contractId,
        @RequestParam(required = false) DeviceStatus status,
        Pageable pageable) { ... }

    @PostMapping("/contracts")
    public VpuContractResponse createContract(@RequestBody VpuContractRequest req) { ... }

    @PutMapping("/devices/{id}/status")
    public VpuDeviceResponse updateDeviceStatus(@PathVariable Long id,
                                                 @RequestBody DeviceStatusRequest req) { ... }
}
```

#### B. DB 마이그레이션 추가

**파일**: `db/migrations/V023__add_vpu_tables.sql`
```sql
CREATE TABLE vpu_contracts (
    id              BIGSERIAL PRIMARY KEY,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    organization_id BIGINT REFERENCES organizations(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    start_date      DATE,
    end_date        DATE,
    device_count    INTEGER DEFAULT 0,
    contact_person  VARCHAR(100),
    contact_phone   VARCHAR(20),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vpu_devices (
    id               BIGSERIAL PRIMARY KEY,
    contract_id      BIGINT REFERENCES vpu_contracts(id),
    serial_number    VARCHAR(100) UNIQUE NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
    firmware_version VARCHAR(50),
    location         VARCHAR(200),
    last_heartbeat   TIMESTAMP,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);
```

#### C. BO BFF 프록시 추가

**파일**: `services/pochak-bo-bff/src/main/java/com/pochak/bo/bff/client/OperationServiceClient.java`

기존 파일에 추가:
```java
public Optional<JsonNode> listVpuContracts(Map<String, String> params) {
    return get("/admin/vpu/contracts", params);
}

public Optional<JsonNode> listVpuDevices(Map<String, String> params) {
    return get("/admin/vpu/devices", params);
}
```

**파일**: `services/pochak-bo-bff/src/main/java/com/pochak/bo/bff/controller/BoOperationController.java`

기존 파일에 추가:
```java
@GetMapping("/equipment/vpu-contracts")
public ResponseEntity<JsonNode> listVpuContracts(@RequestParam Map<String, String> params) {
    return operationClient.listVpuContracts(params)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.noContent().build());
}

@GetMapping("/equipment/vpu-devices")
public ResponseEntity<JsonNode> listVpuDevices(@RequestParam Map<String, String> params) {
    return operationClient.listVpuDevices(params)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.noContent().build());
}
```

#### D. BO Web API 연결

**신규 파일**: `clients/apps/bo-web/src/lib/api/equipment-api.ts`
```typescript
import { apiClient } from './client';

export interface VpuContract {
  id: number;
  contractNumber: string;
  organizationId: number;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  startDate: string;
  endDate: string;
  deviceCount: number;
  contactPerson: string;
  contactPhone: string;
}

export interface VpuDevice {
  id: number;
  contractId: number;
  serialNumber: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  firmwareVersion: string;
  location: string;
  lastHeartbeat: string;
}

export const fetchVpuContracts = async (params?: Record<string, string>) => {
  const res = await apiClient.get('/bo/equipment/vpu-contracts', { params });
  return res.data as { content: VpuContract[]; totalElements: number };
};

export const fetchVpuDevices = async (params?: Record<string, string>) => {
  const res = await apiClient.get('/bo/equipment/vpu-devices', { params });
  return res.data as { content: VpuDevice[]; totalElements: number };
};
```

**수정 파일**: `clients/apps/bo-web/src/app/(dashboard)/equipment/vpu-contracts/page.tsx`
```typescript
// MOCK_CONTRACTS 상수 및 하드코딩 데이터 제거
// fetchVpuContracts() 호출로 교체
const { data } = useSWR('/bo/equipment/vpu-contracts', fetchVpuContracts);
```

---

## P2-2. 항목 28 — 예약 관리 (Operation Service + BO Web)

### 수정 계획

#### A. Operation Service — 관리자용 예약 목록 API

**파일**: `services/pochak-operation-service/src/main/java/com/pochak/operation/reservation/controller/ReservationAdminController.java`

```java
@RestController
@RequestMapping("/admin/reservations")
@PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
public class ReservationAdminController {

    @GetMapping
    public Page<ReservationAdminResponse> listReservations(
        @RequestParam(required = false) ReservationStatus status,
        @RequestParam(required = false) Long venueId,
        @RequestParam(required = false) @DateTimeFormat(iso = DATE) LocalDate date,
        Pageable pageable) {
        return reservationService.findAllForAdmin(status, venueId, date, pageable);
    }

    @PatchMapping("/{id}/status")
    public ReservationAdminResponse updateStatus(@PathVariable Long id,
                                                  @RequestBody StatusUpdateRequest req) {
        return reservationService.updateStatus(id, req.getStatus(), req.getReason());
    }
}
```

#### B. DB 마이그레이션 (필요 시)

기존 `reservations` 테이블 확인 후 관리자용 조회에 필요한 인덱스 추가:
```sql
-- V024__add_reservation_admin_indexes.sql
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_venue_date ON reservations(venue_id, reservation_date);
```

#### C. BO BFF + BO Web

항목 26, 27과 동일한 패턴으로 추가:
- `OperationServiceClient.listReservations(params)`
- `BoOperationController.GET /equipment/reservations/booking`
- `bo-web/reservations/booking/page.tsx` — `fetchReservations()` 호출

---

## P2-3. 항목 30 — 커뮤니티 게시글 관리 (Content Service + BO Web)

### 수정 계획

#### A. Content Service — 관리자용 게시글 목록 API

**파일**: `services/pochak-content-service/src/main/java/com/pochak/content/community/controller/CommunityAdminController.java`

```java
@RestController
@RequestMapping("/admin/community")
@PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
public class CommunityAdminController {

    @GetMapping("/posts")
    public Page<PostAdminResponse> listPosts(
        @RequestParam(required = false) PostStatus status,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) Long organizationId,
        Pageable pageable) {
        return communityService.findAllForAdmin(status, keyword, organizationId, pageable);
    }

    @PatchMapping("/posts/{id}/status")
    public PostAdminResponse updatePostStatus(@PathVariable Long id,
                                               @RequestBody PostStatusRequest req) {
        // 게시글 블라인드/복구/삭제 처리
        return communityService.updateStatus(id, req.getStatus(), req.getReason());
    }

    @DeleteMapping("/posts/{id}")
    public void deletePost(@PathVariable Long id,
                           @RequestParam String reason) {
        communityService.adminDelete(id, reason);
    }
}
```

#### B. BO BFF ContentServiceClient 추가

**파일**: `services/pochak-bo-bff/src/main/java/com/pochak/bo/bff/client/ContentServiceClient.java`

기존 파일에 추가:
```java
public Optional<JsonNode> listCommunityPosts(Map<String, String> params) {
    return get("/admin/community/posts", params);
}
```

#### C. BO Web

**신규 파일**: `clients/apps/bo-web/src/lib/api/community-api.ts`
```typescript
export const fetchCommunityPosts = async (params?: Record<string, string>) => {
  const res = await apiClient.get('/bo/community/posts', { params });
  return res.data;
};
```

**수정**: `community/posts/page.tsx` — `MOCK_POSTS` → `fetchCommunityPosts()` 교체

---

## P3-1. 항목 36~39, 44 — Commerce BO 집계 API

### 수정 계획

#### A. Commerce Service — 관리자용 집계 API

**신규 파일**: `services/pochak-commerce-service/src/main/java/com/pochak/commerce/admin/`

```
admin/
├── controller/
│   └── CommerceAdminDashboardController.java
├── service/
│   └── CommerceAdminDashboardService.java
└── dto/
    ├── PointsSummaryResponse.java
    ├── SeasonPassStatsResponse.java
    ├── GiftBallStatsResponse.java
    └── DailyRevenueResponse.java
```

**CommerceAdminDashboardController 핵심 엔드포인트**:
```java
@RestController
@RequestMapping("/admin/commerce")
@PreAuthorize("hasRole('ADMIN') or hasRole('COMMERCE_OPERATOR')")
public class CommerceAdminDashboardController {

    // 항목 36: 잔여 포인트 통계
    @GetMapping("/points/summary")
    public PointsSummaryResponse getPointsSummary() { ... }

    @GetMapping("/points/users")
    public Page<UserPointsResponse> getUserPoints(
        @RequestParam(required = false) Long minPoints,
        Pageable pageable) { ... }

    // 항목 37: 시즌패스 판매 이력
    @GetMapping("/season-passes/stats")
    public SeasonPassStatsResponse getSeasonPassStats(
        @RequestParam @DateTimeFormat(iso = DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DATE) LocalDate to) { ... }

    @GetMapping("/season-passes/history")
    public Page<SeasonPassHistoryResponse> getSeasonPassHistory(Pageable pageable) { ... }

    // 항목 37: 일별 매출
    @GetMapping("/revenue/daily")
    public List<DailyRevenueResponse> getDailyRevenue(
        @RequestParam @DateTimeFormat(iso = DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DATE) LocalDate to) { ... }

    // 항목 39: Gift Ball 목록
    @GetMapping("/gift-balls")
    public Page<GiftBallResponse> listGiftBalls(
        @RequestParam(required = false) GiftBallStatus status,
        Pageable pageable) { ... }
}
```

#### B. DB 마이그레이션

```sql
-- V025__add_gift_ball_table.sql (gift_balls 테이블 신규)
CREATE TABLE gift_balls (
    id              BIGSERIAL PRIMARY KEY,
    sender_id       BIGINT NOT NULL,
    receiver_id     BIGINT NOT NULL,
    amount          INTEGER NOT NULL,
    message         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    sent_at         TIMESTAMP DEFAULT NOW(),
    received_at     TIMESTAMP
);
```

#### C. BO BFF + BO Web 연결

기존 패턴과 동일:
1. `BoCommerceAdminClient` 또는 기존 `CommerceServiceClient`에 메서드 추가
2. `BoCommerceController`에 엔드포인트 추가
3. BO Web 각 페이지에서 `setTimeout(r, 300)` 제거 → 실 API 호출

---

## P3-2. 항목 57 — SupportScreen FAQ 백엔드

### 수정 계획

#### A. Admin Service — FAQ 도메인 추가

**신규 파일**: `services/pochak-admin-service/src/main/java/com/pochak/admin/faq/`

```java
@Entity
public class Faq {
    @Id @GeneratedValue
    private Long id;
    private String category;   // 계정, 결제, 콘텐츠, 기타
    private String question;
    private String answer;
    private Integer sortOrder;
    private boolean isActive;
    private LocalDateTime createdAt;
}
```

**엔드포인트**:
```java
// 사용자향
@GetMapping("/site/faqs")          // GET 목록 (category 필터)
@GetMapping("/site/faqs/{id}")     // GET 단건

// 관리자향
@PostMapping("/admin/faqs")        // 생성
@PutMapping("/admin/faqs/{id}")    // 수정
@DeleteMapping("/admin/faqs/{id}") // 삭제
```

#### B. Mobile FE — SupportScreen 연결

**파일**: `clients/apps/mobile/src/screens/support/SupportScreen.tsx`

```typescript
// MOCK_FAQ 제거 → 실 API 호출
const [faqs, setFaqs] = useState<FAQ[]>([]);
const [inquiries, setInquiries] = useState<Inquiry[]>([]);

useEffect(() => {
  Promise.all([
    supportService.getFaqs(),
    supportService.getMyInquiries(),
  ]).then(([faqData, inquiryData]) => {
    setFaqs(faqData);
    setInquiries(inquiryData);
  });
}, []);
```

#### C. DB 마이그레이션

```sql
-- V026__add_faq_table.sql
CREATE TABLE faqs (
    id          BIGSERIAL PRIMARY KEY,
    category    VARCHAR(50) NOT NULL,
    question    TEXT NOT NULL,
    answer      TEXT NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO faqs (category, question, answer, sort_order) VALUES
('계정', '비밀번호를 잊어버렸어요', '로그인 화면에서 [비밀번호 찾기]를 클릭하세요.', 1),
('결제', '구독을 취소하려면 어떻게 하나요?', '[마이페이지] → [구독 관리]에서 취소하실 수 있습니다.', 1),
('콘텐츠', '영상이 재생되지 않아요', '네트워크 연결을 확인하고 앱을 재시작해보세요.', 1);
```

---

## P3-3. 항목 40~43 — Skylife VPU-CHU 관리

### 수정 계획

VPU-CHU는 하드웨어 인프라(VPU/CHU 장비)와 연계되므로 **장비 계약 전 코드 선행 구현** 방식으로 진행.

#### A. CHU 엔티티 및 API (Operation Service)

```java
@Entity
public class CameraHubUnit {
    @Id @GeneratedValue
    private Long id;
    private Long contractId;           // VPU 계약 참조
    private String macAddress;         // MAC 주소 (식별자)
    private String ipAddress;          // 현재 IP
    private ChuStatus status;          // CONNECTED, DISCONNECTED, ERROR
    private String firmwareVersion;
    private String location;
    private LocalDateTime lastConnectedAt;
}
```

**엔드포인트**:
```java
@GetMapping("/admin/skylife/chus")        // 목록 (항목 40)
@PostMapping("/admin/skylife/chus/{id}/connect")    // 연결 (항목 43)
@PostMapping("/admin/skylife/chus/{id}/disconnect") // 연결 해제 (항목 43)
@GetMapping("/admin/skylife/activation")  // 활성화 목록 (항목 41)
```

#### B. DB 마이그레이션

```sql
-- V027__add_chu_tables.sql
CREATE TABLE camera_hub_units (
    id                  BIGSERIAL PRIMARY KEY,
    contract_id         BIGINT REFERENCES vpu_contracts(id),
    mac_address         VARCHAR(17) UNIQUE NOT NULL,
    ip_address          VARCHAR(45),
    status              VARCHAR(20) NOT NULL DEFAULT 'DISCONNECTED',
    firmware_version    VARCHAR(50),
    location            VARCHAR(200),
    last_connected_at   TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
);
```

---

## 구현 순서 요약

```
Week 1 (즉시 착수)
  ├── P1-1: 이벤트 발행 연결 확인 + Docker Compose RabbitMQ 환경변수 활성화
  ├── P1-2: CompetitionDetailScreen mock → API (2~3시간)
  ├── P1-3: ClipEditScreen 주석 해제 (1시간)
  └── P1-4: searchService.ts 연결 (2~3시간)

Week 2~3 (백엔드 API 구축)
  ├── P2-1: VPU Contract/Device 도메인 + DB 마이그레이션 + BO BFF + FE
  ├── P2-2: 예약 관리자 API + BO BFF + FE
  └── P2-3: 커뮤니티 게시글 관리자 API + BO BFF + FE

Week 4~6 (Commerce + Skylife)
  ├── P3-1: Commerce 집계 API 4종 + Gift Ball 도메인 + FE
  ├── P3-2: FAQ 도메인 + Mobile SupportScreen
  └── P3-3: CHU 도메인 + Skylife BO 페이지

검증
  └── make all-up → 각 BO 페이지 실데이터 렌더링 확인
```

---

## 검증 체크리스트

```
□ make all-up — 전 서비스 정상 기동
□ RabbitMQ Management (http://localhost:15672) — 큐 생성 및 메시지 흐름 확인
□ CompetitionDetailScreen — 실제 대회 데이터 렌더링
□ ClipEditScreen — 클립 저장 후 목록에서 확인
□ BO Web /equipment/vpu-contracts — 페이지네이션 동작
□ BO Web /equipment/vpu-devices — 장비 상태 필터링
□ BO Web /reservations/booking — 예약 목록 + 상태 변경
□ BO Web /community/posts — 게시글 목록 + 블라인드 처리
□ BO Web /commerce/remaining-points — setTimeout 없이 실 데이터
□ BO Web /commerce/season-pass-history — 차트 데이터 렌더링
□ Mobile SupportScreen — FAQ 실 데이터 표시
```
