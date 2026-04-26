# 외부 서비스 연동 결정 가이드

> 작성일: 2026-04-13  
> 목적: 계약·자격증명 확보가 선행되어야 하는 외부 서비스 연동 항목의 상세 절차 기술  
> 현재 상태: 모든 항목에 대해 Stub/Skeleton 코드가 준비되어 있으며, 계약 완료 후 환경변수 전환만으로 활성화 가능

---

## 우선순위 결정 권고

```
즉시 착수 (법적 위험)
  └─ A. SMS + 보호자 인증 (PASS/NICE) ← PIPA 위반 위험, 가장 먼저 계약

출시 필수 (수익 모델)
  └─ B. 결제 PG (KCP + Google Play + Apple IAP)

출시 전 권고 (콘텐츠 보호)
  └─ C. 스트리밍 서버 + RTMP (AWS IVS 또는 Nginx-RTMP)
  └─ D. VOD 스토리지 + 트랜스코딩 (S3 + MediaConvert)
  └─ E. DRM (PallyCon)

Phase 3 (성장 단계)
  └─ F. 푸시 알림 (FCM + APNs)
```

---

## A. SMS 인증 + 보호자 본인인증 (PASS/NICE)

**관련 항목**: FIXLIST 23, 10  
**법적 긴급도**: 🔴 최우선 — 미이행 시 PIPA(개인정보보호법) 위반

### A-1. SMS 발송 서비스 선택

| 서비스 | 가격 (SMS) | 계약 방식 | 비고 |
|--------|-----------|-----------|------|
| **NCP SENS** | ₩9/건 | 온라인 즉시 | 국내 최저가, 카카오 알림톡 병행 가능 |
| **Twilio** | $0.0079/건 | 온라인 즉시 | 해외 번호 발송 시 유리 |
| **Kakao 알림톡** | ₩8~15/건 | 대행사 통해 계약 | 카카오 계정 필요, 인증 특화 |

**권장**: NCP SENS (국내 서비스, 빠른 계약, Kakao 알림톡 병행 가능)

### A-2. NCP SENS SMS 연동 절차

**Step 1 — NCP 계정 및 프로젝트 생성**
```
1. https://console.ncloud.com 접속 → 회원가입 (사업자 계정)
2. 서비스 → Simple & Easy Notification Service 검색 → 사용 신청
3. Project 생성 → Service ID 발급
4. SMS 서비스 → 발신번호 등록
   - 전화번호 소유자 증명서류 제출 (통신사 계약서 또는 발신자 등록 확인증)
   - 심사 기간: 영업일 1~3일
```

**Step 2 — API 키 발급**
```
NCP 포털 → 마이페이지 → 인증키 관리
→ Access Key ID, Secret Key 발급 및 저장
```

**Step 3 — 환경변수 설정**
```bash
# infra/.env 파일에 추가
NCP_SMS_ACCESS_KEY=your-access-key
NCP_SMS_SECRET_KEY=your-secret-key
NCP_SMS_SERVICE_ID=ncp:sms:kr:xxxxxxxx:pochak
NCP_SMS_FROM_NUMBER=01012345678
POCHAK_SMS_PROVIDER=ncp
```

**Step 4 — 코드 활성화**

파일: `services/pochak-identity-service/src/main/java/com/pochak/identity/auth/service/sms/`

```java
// NCPSmsService.java 신규 생성 (StubSmsService.java 참고)
@Service
@ConditionalOnProperty(name = "pochak.sms.provider", havingValue = "ncp")
public class NCPSmsService implements SmsService {

    private final String accessKey;    // NCP_SMS_ACCESS_KEY
    private final String secretKey;    // NCP_SMS_SECRET_KEY
    private final String serviceId;    // NCP_SMS_SERVICE_ID
    private final String fromNumber;   // NCP_SMS_FROM_NUMBER

    @Override
    public void sendVerificationCode(String phoneNumber, String code) {
        // NCP SENS REST API v2 호출
        // POST https://sens.apigw.ntruss.com/sms/v2/services/{serviceId}/messages
        // Headers: x-ncp-apigw-timestamp, x-ncp-iam-access-key, x-ncp-apigw-signature-v2
    }
}
```

**Step 5 — application.yml 전환**
```yaml
# services/pochak-identity-service/src/main/resources/application.yml
pochak:
  sms:
    provider: ncp  # stub → ncp
```

**Step 6 — 검증**
```bash
# 실제 번호로 SMS 발송 테스트
curl -X POST http://localhost:8081/api/v1/auth/phone/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "01012345678"}'
# → SMS 수신 확인
```

---

### A-3. 보호자 본인인증 (NICE / PASS) 연동 절차

**선택지**:
| 서비스 | 제공사 | 계약 방식 | 비고 |
|--------|--------|-----------|------|
| **NICE 본인인증** | 나이스평가정보 | 직계약 (계약서 필요) | 범용 본인인증, 가장 보편적 |
| **PASS 인증** | SKT/KT/LGU+ | 통신3사 통해 계약 | 패스앱 기반, 10대 친화적 |
| **카카오 본인인증** | 카카오 | 파트너사 계약 | 카카오 사용자만 가능 |

**권장**: NICE 본인인증 (범용, 대부분의 법인 서비스가 사용)

**Step 1 — NICE 계약**
```
1. https://www.niceid.co.kr → 서비스 신청 → 본인인증 서비스
2. 필요 서류:
   - 사업자등록증 사본
   - 법인인감증명서 (법인의 경우)
   - 개인정보 처리방침 URL
   - 서비스 URL 및 화면 캡처
3. 심사 기간: 영업일 5~10일
4. 계약 완료 후 테스트 사이트 ID/비밀번호 발급
```

**Step 2 — NICE SDK 연동 방식 선택**
```
방식 1: 표준창 방식 (권장)
  - NICE에서 제공하는 팝업창 호출
  - 간단한 연동, 가장 일반적
  - 결과를 서버로 전달하는 콜백 URL 설정

방식 2: API 방식
  - 직접 REST API 호출
  - 서버 간 통신
  - 더 복잡한 연동
```

**Step 3 — 백엔드 연동**

```java
// GuardianConsentVerifier.java 신규 구현
// 파일: services/pochak-identity-service/src/main/java/
//        com/pochak/identity/guardian/service/NiceGuardianConsentVerifier.java

@Service
@ConditionalOnProperty(name = "pochak.guardian.verifier", havingValue = "nice")
public class NiceGuardianConsentVerifier implements GuardianConsentVerifier {

    @Override
    public boolean verify(ConsentMethod method, String verificationToken) {
        // NICE 검증 토큰으로 본인인증 결과 확인
        // POST https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb
        // 응답에서 생년월일, 이름, 전화번호 추출 → DB 정보와 대조
        return niceApiClient.verifyToken(verificationToken);
    }
}
```

**Step 4 — 환경변수**
```bash
NICE_SITE_CODE=your-site-code
NICE_SITE_PASSWORD=your-site-password
POCHAK_GUARDIAN_VERIFIER=nice
```

**Step 5 — 모바일 앱 연동**
```typescript
// GuardianVerificationScreen.tsx에서 NICE 웹뷰 호출
// NICE 표준창 URL로 WebView 열기
// 완료 후 verificationToken을 서버로 전송
```

---

## B. 결제 PG 연동

**관련 항목**: FIXLIST 22  
**긴급도**: 🟠 출시 필수

### B-1. PG 선택 매트릭스

| 결제 수단 | 권장 PG | 계약 방식 | 수수료 |
|-----------|---------|-----------|--------|
| 국내 신용카드 | **토스페이먼츠** | 온라인 즉시 | 2.0~3.5% |
| 국내 신용카드 (대안) | KCP | 대면 계약 | 2.0~3.5% |
| Android 인앱결제 | **Google Play Billing** | Google Play Console | 15~30% |
| iOS 인앱결제 | **Apple StoreKit 2** | App Store Connect | 15~30% |

**권장**: 토스페이먼츠 (국내) + Google Play Billing + Apple StoreKit 2 조합

### B-2. 토스페이먼츠 연동 절차

**Step 1 — 계정 생성 및 심사**
```
1. https://developers.tosspayments.com → 회원가입
2. 사업자 계정 전환:
   - 사업자등록증 사본 업로드
   - 통신판매업 신고증 업로드 (없으면 신고 먼저)
   - 정산 계좌 등록
3. 심사 기간: 영업일 2~5일
4. 승인 후 라이브 API 키 발급
```

**Step 2 — API 키 확인**
```
테스트: test_sk_xxxxxxxx (즉시 사용 가능)
라이브: live_sk_xxxxxxxx (심사 후 발급)
```

**Step 3 — 환경변수**
```bash
# infra/.env
TOSS_CLIENT_KEY=live_ck_xxxxxxxx
TOSS_SECRET_KEY=live_sk_xxxxxxxx
POCHAK_PAYMENT_PROVIDER=toss
```

**Step 4 — 코드 활성화**

```java
// TossPaymentGatewayService.java 신규 생성
// 파일: services/pochak-commerce-service/src/main/java/
//        com/pochak/commerce/payment/TossPaymentGatewayService.java

@Service
@ConditionalOnProperty(name = "pochak.payment.provider", havingValue = "toss")
public class TossPaymentGatewayService implements PaymentGatewayService {

    private static final String TOSS_API_BASE = "https://api.tosspayments.com/v1";

    @Override
    public PaymentResult verifyPayment(String pgType, BigDecimal amount, String paymentKey) {
        // POST https://api.tosspayments.com/v1/payments/confirm
        // Body: { paymentKey, orderId, amount }
        // Authorization: Basic base64(secretKey:)
    }

    @Override
    public PaymentResult refundPayment(String paymentKey, BigDecimal amount) {
        // POST https://api.tosspayments.com/v1/payments/{paymentKey}/cancel
        // Body: { cancelReason, cancelAmount }
    }
}
```

**Step 5 — 모바일 FE (PurchaseScreen.tsx)**
```typescript
// Toss 결제창 호출
import TossPayments from '@tosspayments/tosspayments-sdk';

const toss = TossPayments('live_ck_xxxxxxxx');
await toss.requestPayment('카드', {
  amount: product.price,
  orderId: generateOrderId(),
  orderName: product.name,
  successUrl: `${API_BASE}/payments/success`,
  failUrl: `${API_BASE}/payments/fail`,
});
```

**Step 6 — 검증 체크리스트**
```
□ 테스트 카드로 결제 성공 확인 (4242-4242-4242-4242)
□ 결제 취소/환불 플로우 테스트
□ 웹훅 수신 확인 (결제 완료 이벤트)
□ 이중결제 방지 로직 확인 (idempotency key)
```

---

### B-3. Google Play Billing 연동

**Step 1 — Google Play Console 등록**
```
1. https://play.google.com/console → 개발자 계정 생성
2. 등록비: $25 (1회)
3. 결제 프로필 설정:
   - 사업자 정보 입력
   - 은행 계좌 연결
   - 세금 정보 제출
```

**Step 2 — 인앱 상품 등록**
```
Play Console → 앱 선택 → 수익 창출 → 인앱 상품
→ 관리형 제품 또는 구독 생성
→ 상품 ID 설정 (예: season_pass_monthly, point_1000)
```

**Step 3 — 서버 측 검증**
```java
// Google Play Developer API로 구매 검증
// POST https://androidpublisher.googleapis.com/androidpublisher/v3/
//      applications/{packageName}/purchases/subscriptions/{subscriptionId}/tokens/{token}:acknowledge
```

**Step 4 — 환경변수**
```bash
GOOGLE_PLAY_PACKAGE_NAME=com.pochak.mobile
GOOGLE_PLAY_SERVICE_ACCOUNT_KEY=/secrets/google-play-service-account.json
```

---

### B-4. Apple StoreKit 2 연동

**Step 1 — App Store Connect 설정**
```
1. https://appstoreconnect.apple.com → 앱 선택
2. 앱 내 구입 → 신규 생성
   - 소모성 (포인트): 1회 구매
   - 자동 갱신 구독 (시즌패스): 월/연간 구독
3. 가격 책정 (가격 매트릭스)
4. 세금 및 뱅킹 정보 제출 (계정 소유자 권한 필요)
```

**Step 2 — 서버 측 검증 (App Store Server API)**
```java
// Apple App Store Server API v2로 영수증 검증
// GET https://api.storekit.itunes.apple.com/inApps/v1/transactions/{transactionId}
// Authorization: Bearer {JWT signed with private key}
```

**Step 3 — 환경변수**
```bash
APPLE_BUNDLE_ID=com.pochak.mobile
APPLE_ISSUER_ID=your-issuer-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY=/secrets/apple-storekit.p8
```

---

## C. 스트리밍 서버 + RTMP 연동

**관련 항목**: FIXLIST 7, 18, 64  
**긴급도**: 🟠 출시 전 필수

### C-1. 스트리밍 서비스 선택

| 옵션 | 비용 | 장점 | 단점 |
|------|------|------|------|
| **AWS IVS** | $0.002/분 입력 + $0.0085/GB 출력 | 관리형, 바로 사용 | 비용 예측 어려움 |
| **Nginx-RTMP (EC2)** | EC2 비용만 | 저렴, 유연 | 직접 운영, 확장성 수동 |
| **Pixellot** | 엔터프라이즈 계약 | AI 카메라 통합 | 하드웨어 연계 필요 |

**권장**: AWS IVS (빠른 시작) → 트래픽 증가 후 비용 검토

### C-2. AWS IVS 연동 절차

**Step 1 — AWS 계정 및 IVS 채널 생성**
```
1. AWS Console → Interactive Video Service → 채널 생성
2. 채널 유형 선택:
   - STANDARD: 최대 8500kbps, 다중 품질
   - BASIC: 최대 1500kbps, 단일 품질 (저비용)
3. 채널 생성 후 확인:
   - Ingest Server: rtmps://xxxxxxxx.global-contribute.live-video.net:443/app/
   - Stream Key: sk_ap-northeast-2_xxxxxxxx
   - Playback URL: https://xxxxxxxx.ap-northeast-2.ivs.video/xxxxxxxx/channel.m3u8
```

**Step 2 — AWS 자격증명 설정**
```bash
# IAM 사용자 생성 (최소 권한)
# 정책: ivs:GetChannel, ivs:CreateChannel, ivs:DeleteChannel, ivs:StopStream

AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-2
POCHAK_STREAMING_PROVIDER=aws-ivs
```

**Step 3 — 코드 활성화**

```java
// AWSIVSStreamingProvider.java 신규 생성
// 파일: services/pochak-content-service/src/main/java/
//        com/pochak/content/streaming/AWSIVSStreamingProvider.java

@Service
@ConditionalOnProperty(name = "pochak.streaming.provider", havingValue = "aws-ivs")
public class AWSIVSStreamingProvider implements StreamingProvider {

    private final IvsClient ivsClient;  // AWS SDK v2

    @Override
    public StreamingChannelInfo createChannel(String channelName) {
        // ivsClient.createChannel(request)
        // 반환: ingestEndpoint, streamKey, playbackUrl
    }

    @Override
    public String getPlaybackUrl(String channelArn) {
        // ivsClient.getChannel(channelArn).channel().playbackUrl()
    }

    @Override
    public void stopStream(String channelArn) {
        // ivsClient.stopStream(channelArn)
    }
}
```

**Step 4 — build.gradle.kts 의존성 추가**
```kotlin
// services/pochak-content-service/build.gradle.kts
dependencies {
    implementation("software.amazon.awssdk:ivs:2.25.0")
}
```

**Step 5 — Operation Service RTMP URL 전환**
```java
// StubStreamingIngestService.java → AWSIVSStreamingIngestService.java
// RTMP URL: rtmps://{ingestEndpoint}/app/{streamKey}
// 앱 카메라 → 이 URL로 RTMP 송출
```

**Step 6 — 모바일 스트리밍 URL 수신**
```typescript
// streamingService.ts:104 주석 해제
// GET /app/stream/{contentId}/url 로 playbackUrl 동적 수신
// react-native-video의 source.uri에 HLS URL 설정
```

**Step 7 — 비용 알림 설정**
```
AWS Budgets → 월 $100 초과 시 이메일 알림 설정
IVS Metrics → CloudWatch 대시보드에 동시 시청자수 모니터링
```

---

## D. VOD 스토리지 + 트랜스코딩

**관련 항목**: FIXLIST 8, 42(S3 이미지)  
**긴급도**: 🟠 출시 전 필수

### D-1. AWS S3 + MediaConvert 연동 절차

**Step 1 — S3 버킷 생성**
```
버킷 1: pochak-vod-raw (원본 파일)
  - 리전: ap-northeast-2 (서울)
  - 퍼블릭 접근 차단
  - 수명 주기: 30일 후 Glacier 이동 (비용 절감)

버킷 2: pochak-vod-transcoded (HLS 세그먼트)
  - 퍼블릭 읽기 허용 (또는 CloudFront OAC 사용)
  - 정적 웹 호스팅 활성화

버킷 3: pochak-images (이미지 업로드)
  - 퍼블릭 읽기 허용
```

**Step 2 — MediaConvert Job Template 생성**
```
AWS Console → MediaConvert → Job Templates → Create
→ Output Group: Apple HLS
→ 해상도 Ladder:
   - 1080p: 4500kbps
   - 720p:  2500kbps
   - 480p:  1000kbps
   - 360p:   500kbps
→ Thumbnail 추출 (10초마다)
```

**Step 3 — IAM Role**
```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject",
    "mediaconvert:CreateJob",
    "mediaconvert:GetJob"
  ],
  "Resource": ["arn:aws:s3:::pochak-vod-*/*"]
}
```

**Step 4 — 환경변수**
```bash
AWS_S3_RAW_BUCKET=pochak-vod-raw
AWS_S3_TRANSCODED_BUCKET=pochak-vod-transcoded
AWS_S3_IMAGE_BUCKET=pochak-images
AWS_MEDIACONVERT_ENDPOINT=https://xxxxxxxx.mediaconvert.ap-northeast-2.amazonaws.com
AWS_MEDIACONVERT_ROLE_ARN=arn:aws:iam::xxxx:role/MediaConvertRole
POCHAK_VOD_PROVIDER=s3
```

**Step 5 — 코드 활성화**

```java
// S3VodUploadService.java 신규 생성
// 파일: services/pochak-content-service/src/main/java/
//        com/pochak/content/asset/service/S3VodUploadService.java

@Service
@ConditionalOnProperty(name = "pochak.vod.provider", havingValue = "s3")
public class S3VodUploadService implements VodUploadService {

    @Override
    public UploadResult uploadVod(MultipartFile file, String contentId) {
        // 1. S3 Presigned URL 생성 또는 직접 업로드
        // 2. MediaConvert Job 생성 (원본 → HLS 세그먼트)
        // 3. Job ID 저장 → 비동기 완료 콜백 대기
        // 4. EventBridge → ContentEventListener.onVodEncoded() 트리거
    }

    @Override
    public String generatePresignedUploadUrl(String key, String contentType) {
        // S3Presigner.presignPutObject()
        // 유효기간: 15분
        return presignedUrl;
    }
}
```

**Step 6 — BO Web 이미지 업로드 연결 (항목 42)**
```java
// Content Service에 Presigned URL 엔드포인트 추가
// POST /api/v1/admin/upload/presigned
// 응답: { uploadUrl, fileKey }
// FE: PUT uploadUrl (S3 직접 업로드)
```

**Step 7 — CloudFront CDN 연결**
```
CloudFront 배포 생성:
  Origin: pochak-vod-transcoded.s3.ap-northeast-2.amazonaws.com
  Cache: HLS 세그먼트 TTL 86400s, 매니페스트(.m3u8) TTL 30s
  도메인: cdn.pochak.com (Route53 연결)
```

---

## E. DRM 연동 (PallyCon)

**관련 항목**: FIXLIST 61  
**긴급도**: 🟡 출시 전 권고 (유료 콘텐츠 보호 필수)

### E-1. PallyCon 선택 이유
- Widevine + FairPlay + PlayReady 통합 지원
- 한국 회사 (국내 지원 용이)
- 가격: $0.005~0.01/라이선스

### E-2. 연동 절차

**Step 1 — PallyCon 계정 생성**
```
1. https://pallycon.com → Start Free Trial
2. Site ID, KMS Token, AES Key 발급
3. DRM 패키징 도구 선택:
   - PallyCon Packager CLI (서버 사이드)
   - Shaka Packager 연동
```

**Step 2 — 콘텐츠 패키징**
```bash
# MediaConvert 출력물에 DRM 암호화 적용
# PallyCon CLI 또는 Shaka Packager 사용
pallycon-packager \
  --input s3://pochak-vod-transcoded/{contentId}/index.m3u8 \
  --output s3://pochak-vod-drm/{contentId}/ \
  --site-id YOUR_SITE_ID \
  --kms-token YOUR_KMS_TOKEN
```

**Step 3 — 백엔드 라이선스 발급 엔드포인트**
```java
// Content Service에 DRM 라이선스 엔드포인트 추가
// POST /api/v1/drm/license
// 1. JWT로 사용자 인증
// 2. 시청 권한(Entitlement) 확인
// 3. PallyCon KMS에 라이선스 요청
// 4. 클라이언트에 라이선스 반환

@PostMapping("/drm/license")
public ResponseEntity<byte[]> getDrmLicense(
    @RequestHeader("Authorization") String token,
    @RequestBody byte[] licenseRequest) {
    // PallyCon License API 프록시
}
```

**Step 4 — 모바일 연결**
```typescript
// drmService.ts 활성화
// react-native-video DRM 설정
const drmConfig = {
  type: Platform.OS === 'ios' ? 'fairplay' : 'widevine',
  licenseServer: `${API_BASE}/api/v1/drm/license`,
  headers: { Authorization: `Bearer ${token}` },
};
```

**Step 5 — 환경변수**
```bash
PALLYCON_SITE_ID=your-site-id
PALLYCON_KMS_TOKEN=your-kms-token
PALLYCON_AES_KEY=your-aes-key
```

---

## F. 푸시 알림 (FCM + APNs)

**관련 항목**: FIXLIST 17, 62  
**긴급도**: 🟡 Phase 3

### F-1. Firebase 프로젝트 설정

**Step 1 — Firebase 프로젝트 생성**
```
1. https://console.firebase.google.com → 프로젝트 만들기
2. "pochak-prod" 프로젝트 생성
3. Android 앱 추가:
   - 패키지 이름: com.pochak.mobile
   - google-services.json 다운로드 → clients/apps/mobile/android/ 에 배치
4. iOS 앱 추가:
   - 번들 ID: com.pochak.mobile
   - GoogleService-Info.plist 다운로드 → clients/apps/mobile/ios/ 에 배치
```

**Step 2 — APNs 인증서 설정**
```
Apple Developer → Certificates → APNs Auth Key (.p8) 발급
Firebase Console → 프로젝트 설정 → Cloud Messaging → APNs 인증 키 업로드
  - Key ID: 10자리 영숫자
  - Team ID: Apple Developer 계정 Team ID
```

**Step 3 — 백엔드 서비스 계정**
```
Firebase Console → 프로젝트 설정 → 서비스 계정
→ 새 비공개 키 생성 → firebase-service-account.json 다운로드
→ /secrets/firebase-service-account.json 에 저장
```

**Step 4 — 환경변수**
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/secrets/firebase-service-account.json
FIREBASE_PROJECT_ID=pochak-prod
```

**Step 5 — 백엔드 FCM 발송 구현**
```java
// ContentEventListener.java 핸들러 구현
// 파일: services/pochak-content-service/src/main/java/
//        com/pochak/content/event/ContentEventListener.java

@EventListener
@Async
public void onLiveStreamStarted(LiveStreamStartedEvent event) {
    // 1. content-service: 팔로워 userId 목록 조회
    // 2. identity-service: userId → FCM 토큰 조회
    // 3. FCM Admin SDK로 알림 발송
    FirebaseMessaging.getInstance().sendMulticast(
        MulticastMessage.builder()
            .addAllTokens(fcmTokens)
            .setNotification(Notification.builder()
                .setTitle("라이브 시작")
                .setBody(event.getTitle() + " 라이브가 시작되었습니다")
                .build())
            .build()
    );
}
```

**Step 6 — 모바일 디바이스 토큰 등록**
```typescript
// clients/apps/mobile/src/services/pushService.ts 활성화
import messaging from '@react-native-firebase/messaging';

const token = await messaging().getToken();
await apiClient.post('/users/me/push-token', { token, platform: Platform.OS });
```

**Step 7 — build.gradle.kts 의존성**
```kotlin
// services/pochak-content-service/build.gradle.kts
dependencies {
    implementation("com.google.firebase:firebase-admin:9.2.0")
}
```

---

## 연동 완료 체크리스트

```
Phase 1 (법적 위험 해소)
□ A. NCP SENS SMS 계약 + 발신번호 등록
□ A. NICE 본인인증 계약
□ NCPSmsService 구현 + 테스트
□ NiceGuardianConsentVerifier 구현 + 테스트
□ 미성년자 회원가입 E2E 테스트

Phase 2 (수익 모델 활성화)
□ 토스페이먼츠 계약 + 심사 완료
□ Google Play Console 계정 + 인앱 상품 등록
□ Apple Developer 계정 + 인앱 상품 등록
□ TossPaymentGatewayService 구현 + 테스트
□ 결제→환불 E2E 테스트

Phase 3 (콘텐츠 인프라)
□ AWS 계정 생성 + IAM 설정
□ S3 버킷 3개 생성
□ AWS IVS 채널 생성
□ MediaConvert Job Template 작성
□ AWSIVSStreamingProvider 구현
□ S3VodUploadService 구현
□ CloudFront CDN 연결
□ 라이브 스트리밍 E2E 테스트 (RTMP 송출 → HLS 수신)

Phase 4 (콘텐츠 보호)
□ PallyCon 계약
□ 콘텐츠 DRM 패키징 파이프라인 구축
□ 라이선스 발급 엔드포인트 구현
□ 모바일 DRM 재생 테스트

Phase 5 (알림)
□ Firebase 프로젝트 생성
□ APNs 인증서 설정
□ ContentEventListener 핸들러 구현
□ 모바일 FCM 토큰 등록 구현
□ 라이브 시작 알림 E2E 테스트
```
