# Pochak 운영 서버 Reverse Engineering 보고서

**작성일**: 2026-04-09
**분석 방법**: GET 요청 기반 비파괴 분석 (POST/PUT/DELETE 미사용)
**분석 대상**: pochak.live, corehub.hogak.live

---

## 1. pochak.live (사용자 웹)

### 1.1 기술 스택

| 항목 | 내용 |
|------|------|
| **프레임워크** | React (CRA - Create React App) |
| **빌드** | Webpack, code splitting (1,000+ chunks) |
| **웹서버** | Nginx (HTTP/2) |
| **상태관리** | React Hooks (useState, useEffect, useReducer, useMemo, useContext) |
| **영상 플레이어** | Video.js + HLS.js |
| **그래픽** | Pixi.js (canvas 기반 렌더링) |
| **날짜 처리** | Moment.js v2.30.1 |
| **스타일링** | Styled Components |
| **다국어** | i18next |
| **DnD** | React DnD |
| **PWA** | manifest.json 지원 (standalone mode) |

### 1.2 인프라 구성

```
[사용자 브라우저]
     │
     ▼
[Nginx - pochak.live]  ← React SPA 서빙 (static files)
     │
     ▼ (API 호출)
[AWS API Gateway]
  https://b7brq5fwy9.execute-api.ap-northeast-2.amazonaws.com/prd
     │
     ▼
[.NET Backend (C#)]  ← Lambda 또는 EC2/ECS
     │
     ▼
[AWS CloudFront CDN]
  https://d3ocndcybz2qo4.cloudfront.net/prd/
     │
     ├── /app/logo/        ← 앱 로고, 아이콘
     ├── /pubulish/         ← UI 아이콘, 배경 이미지
     ├── /pubulish/icon/    ← 기능별 아이콘 (40+ SVG)
     ├── /pubulish/images/  ← 배경 이미지
     └── /Banner/           ← 배너 이미지
```

### 1.3 외부 서비스 연동

| 서비스 | 용도 | 식별자/URL |
|--------|------|-----------|
| **Google Tag Manager** | 태그 관리 | GTM-TV72J8TV |
| **Google Analytics** | 웹 분석 | G-1309EXWYC7 |
| **Google Ads (DFP)** | 광고 | securepubads.g.doubleclick.net |
| **Google Maps** | 지도 | API Key: AIzaSyAlX-QUScBCpoc7x8QbZJlHDrGsLHEFBv8 |
| **Google Cast** | Chromecast 지원 | cast_sender.js |
| **Naver Maps** | 지도 | NCP Client ID: p4d2ac47ht |
| **Naver OAuth** | 네이버 로그인 | nid.naver.com/oauth2.0/authorize |
| **Kakao OAuth** | 카카오 로그인 | kauth.kakao.com/oauth/authorize |
| **Google OAuth** | 구글 로그인 | accounts.google.com/o/oauth2/v2/auth |
| **Apple Auth** | 애플 로그인 | appleid.apple.com/auth/authorize |
| **KCP 결제** | PG 결제 | spay.kcp.co.kr |
| **Mobile-OK** | 본인인증 | cert.mobile-ok.com |
| **Daum 우편번호** | 주소 검색 | t1.daumcdn.net/mapjsapi/bundle/postcode |
| **Peerline** | 스코어보드/광고 | scorebug.peerline.net, dev.peerline.net |
| **Google IMA** | 비디오 광고 | imasdk.googleapis.com |

### 1.4 API 구조 (AWS API Gateway)

**Base URL**: `https://b7brq5fwy9.execute-api.ap-northeast-2.amazonaws.com/prd`

**응답 형식**:
```json
{
  "ResultCode": 200,
  "Message": "Success",
  "ResultData": { ... }
}
```

**에러 응답** (.NET 표준):
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "mID": ["The mID field is required."] },
  "traceId": "00-..."
}
```

#### API 엔드포인트 목록

**인증 (Auth)**
| 메서드 | 경로 | 설명 |
|--------|------|------|
| | `/api/Auth/Login` | 로그인 |
| | `/api/Auth/Users` | 회원가입 |
| | `/api/Auth/UsersByEmail` | 이메일 회원가입 |
| GET | `/api/Auth/TermList` | 약관 목록 |
| | `/api/Auth/EmailVerificationSend` | 이메일 인증 발송 |
| | `/api/Auth/EmailVerificationByChange` | 이메일 변경 인증 |
| GET | `/api/Auth/userAgeAbove` | 연령 확인 |

**메인 (Main)**
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/Main/HomeBanner` | 홈 배너 (6개 확인) |
| GET | `/api/Main/HomeEvent` | 홈 이벤트 |
| GET | `/api/Main/PopupList` | 팝업 목록 |
| GET | `/api/Main/DeployCheck` | 배포 상태 확인 |
| GET | `/api/Main/ReportCategory` | 신고 카테고리 |
| | `/api/Main/AlarmReadUP` | 알림 읽음 처리 |
| | `/api/Main/AlarmMemberSettingUp` | 알림 설정 |
| | `/api/Main/MemberShipUp` | 멤버십 수정 |
| | `/api/Main/MemberImageAdd` | 프로필 이미지 |
| | `/api/Main/MemberWithdrawal` | 회원 탈퇴 |
| | `/api/Main/TeamAdd` | 팀 생성 |
| | `/api/Main/NoticeAdd/Del` | 공지 CRUD |
| | `/api/Main/InquiryAdd` | 문의 등록 |
| | `/api/Main/ReportAdd` | 신고 |
| | `/api/Main/GiftCodeAdd` | 기프트코드 |
| | `/api/Main/SeasonPassPurchase` | 시즌패스 구매 |
| | `/api/Main/CancelPGSubscription` | 구독 취소 |
| | `/api/Main/ResumePGSubscription` | 구독 재개 |
| | `/api/Main/RefundPGPayment` | PG 환불 |
| | `/api/Main/RefundInquiryAdd` | 환불 문의 |

**대회/조직 (Competition)**
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/Competition/OrganizationHomeTop` | 조직 홈 (mID 파라미터 필수) |
| GET | `/api/Competition/TeamHomeTop` | 팀 홈 |
| | `/api/Competition/Favorite` | 즐겨찾기 |
| | `/api/Competition/AccessHistory` | 접근 이력 |

**대회 하위 (CompetitionSub)** — 조직/팀/지부 관리
| 경로 패턴 | 설명 |
|-----------|------|
| `/api/CompetitionSub/OrganizationInformationUp` | 조직 정보 수정 |
| `/api/CompetitionSub/OrganizationJoinAdd` | 조직 가입 |
| `/api/CompetitionSub/OrganizationMemberAdd` | 조직 멤버 추가 |
| `/api/CompetitionSub/BranchInformationUp` | 지부 정보 수정 |
| `/api/CompetitionSub/BranchTeamAdd` | 지부 팀 추가 |
| `/api/CompetitionSub/AssociationInformationUp` | 협회 정보 수정 |
| `/api/CompetitionSub/AssociationJoinAdd` | 협회 가입 |
| `/api/CompetitionSub/TeamInformationUp` | 팀 정보 수정 |
| `/api/CompetitionSub/TeamNameUp` | 팀명 변경 |
| `/api/CompetitionSub/TeamMemberAdd` | 팀 멤버 추가 |
| `/api/CompetitionSub/TeamMemberApprovalUp` | 팀 멤버 승인 |
| `/api/CompetitionSub/TeamMemberRoleUp` | 팀 멤버 역할 변경 |
| `/api/CompetitionSub/TeamMemberInfoUp` | 팀 멤버 정보 수정 |
| `/api/CompetitionSub/TeamRegistRoleTransferUp` | 팀 등록 권한 이전 |
| `/api/CompetitionSub/TeamDisband` | 팀 해산 |
| `/api/CompetitionSub/TeamAddressAdd/Up` | 팀 주소 CRUD |
| `/api/CompetitionSub/TeamAddInformationAdd/Del/Up` | 팀 추가정보 CRUD |
| `/api/CompetitionSub/AddInformationAdd/Del/Up` | 추가정보 CRUD |
| `/api/CompetitionSub/AddressInfoAdd/Del/Up` | 주소정보 CRUD |
| `/api/CompetitionSub/GroupApprovalStatusUp` | 그룹 승인 상태 |
| `/api/CompetitionSub/GroupMemberApprovalStatusUp` | 그룹 멤버 승인 |
| `/api/CompetitionSub/ImageAdd/Del` | 이미지 CRUD |
| `/api/CompetitionSub/PushSettingUp` | 푸시 설정 |

**콘텐츠/랜딩 (Landing)**
| 경로 | 설명 |
|------|------|
| `/api/Landing/ClipAdd/Del/Up` | 클립 CRUD |
| `/api/Landing/VodTagAdd/Del/Up` | VOD 태그 CRUD |
| `/api/Landing/MediaDel` | 미디어 삭제 |
| `/api/Landing/LandingPointUsageAdd` | 포인트 사용 |
| `/api/Landing/LandingViewingHistoryAdd` | 시청 이력 추가 |

**결제 (Payment)**
| 경로 | 설명 |
|------|------|
| `/api/Payment/GetOrderNo` | 주문번호 생성 |
| `/api/Payment/GetSeasonPassOrderNo` | 시즌패스 주문번호 |
| `/api/Payment/HogakPaymentPG` | PG 결제 처리 |
| `/api/Payment/HogakSeasonPassPaymentPG` | 시즌패스 PG 결제 |
| `/api/Payment/PGSubscriptionOrder` | 구독 주문 |
| `/api/Payment/SeasonPassPointOnlyPurchase` | 포인트 전용 구매 |

**미디어 (Media)**
| 경로 | 설명 |
|------|------|
| `/api/Media/AirBrigeTracking` | Airbridge 트래킹 |
| `/api/Media/ParkReservationAdd/Del/Up` | 시설 예약 CRUD |
| `/api/Media/ParkReservationScoreUp` | 시설 평점 |
| `/api/Media/ParkReservationTimeUp` | 예약 시간 수정 |

### 1.5 광고 슬롯 구조

번들에서 발견된 Google DFP 광고 슬롯 (hogaklive_111_* 패턴):

**모바일 (M)**
| 슬롯 ID | 위치 | 크기 |
|---------|------|------|
| MHCLIPMIDDLE2 | 클립 중간 | 300x50 |
| MHCLIPTOP1 | 클립 상단 | 300x50 |
| MHLEAGUEMIDDLE1/2 | 리그 중간 | 300x50 |
| MHMAINMIDDLE1/2 | 메인 중간 | 300x100 |
| MHRECENTVIDEOMIDDLE2 | 최신영상 중간 | 300x50 |
| MHRECENTVIDEOTOP1 | 최신영상 상단 | 300x50 |
| MHSCHEDULEBOTTOM2 | 일정 하단 | 300x100 |
| MHSCHEDULETOP1 | 일정 상단 | 300x50 |
| MHVIDEORENDERMIDDLE1 | 영상뷰 중간 | 300x100 |

**PC (P)**
| 슬롯 ID | 위치 | 크기 |
|---------|------|------|
| PHANCHORSUBMENU | 앵커 서브메뉴 | 970x90 |
| PHCLIPLEFTWING1/RIGHTWING2 | 클립 좌/우 | 160x600 |
| PHLEAGUELEFTWING1/RIGHTWING2 | 리그 좌/우 | 160x600 |
| PHLEAGUEMIDDLE3 | 리그 중간 | 970x90 |
| PHLIVELEFTWING1/RIGHTWING2 | 라이브 좌/우 | 160x600 |
| PHMAINLEFTWING1/RIGHTWING2 | 메인 좌/우 | 160x600 |
| PHMAINMIDDLE31 | 메인 중간 | 970x90 |
| PHVIDEORENDERLEFTWING1/RIGHTWING2 | 영상뷰 좌/우 | 160x600 |
| PHVIDEORENDERRIGHT3 | 영상뷰 우측 | 300x250 |
| PHVIDEORIGHT3 | 영상 우측 | 300x250 |
| PHSCHEDULELEFTWING1/RIGHTWING2 | 일정 좌/우 | 160x600 |
| PHRECENTVIDEOLEFTWING1/RIGHTWING2 | 최신영상 좌/우 | 160x600 |

### 1.6 프론트엔드 라우트 구조

```
/main              ← 메인 홈
/login             ← 로그인 (소셜: 카카오, 네이버, 구글, 애플)
/signup            ← 회원가입
/mypage            ← 마이페이지
/live              ← 라이브 목록
/vod               ← VOD 목록
/schedule          ← 일정
/notice            ← 공지사항
/event             ← 이벤트
/match             ← 경기
/team              ← 팀
/club              ← 클럽
/search            ← 검색
/store             ← 스토어 (시즌패스, 구독)
/about             ← 소개
/callback          ← OAuth 콜백
```

### 1.7 HomeBanner API 응답 구조 (실제 데이터)

```json
{
  "ResultCode": 200,
  "Message": "Success",
  "ResultData": {
    "BannerSelectResults": [
      {
        "TotalCount": 6,
        "BannerID": 121,
        "BannerType": 510050,
        "ImageURL": "https://d3ocndcybz2qo4.cloudfront.net/Banner/..._Web_*.png",
        "ImageURLMobile": "https://d3ocndcybz2qo4.cloudfront.net/Banner/..._Mobile_*.png"
      }
    ]
  }
}
```

### 1.8 영상 스트리밍 구조

| 항목 | 내용 |
|------|------|
| **플레이어** | Video.js (커스텀 hogak-player 컴포넌트) |
| **프로토콜** | HLS (m3u8) |
| **미디어 서버** | media.aisportstv.com |
| **스코어보드** | scorebug.peerline.net |
| **프리롤 광고** | dev.peerline.net/hogak/thumbnail/hogak_preroll_ad.mp4 |
| **비디오 광고** | Google IMA SDK |
| **Chromecast** | Google Cast SDK 지원 |

---

## 2. corehub.hogak.live (BO 관리자)

### 2.1 기술 스택

| 항목 | 내용 |
|------|------|
| **프레임워크** | ASP.NET MVC (.NET Framework / C#) |
| **서버** | Nginx (리버스 프록시) + Kestrel/IIS |
| **프론트엔드** | jQuery + jQuery UI + jQuery Templates |
| **UI 라이브러리** | jQuery BlockUI (로딩) |
| **인증** | 폼 기반 + SMS 2차 인증 |
| **레이아웃** | 서버사이드 렌더링 (SSR), iframe 기반 패널 |

### 2.2 인프라 구성

```
[관리자 브라우저]
     │
     ▼
[AWS ALB (Application Load Balancer)]
  ├── Cookie: AWSALB / AWSALBCORS
  └── HTTP → 302 Redirect to /Account/Index
     │
     ▼
[Nginx (리버스 프록시)]
     │
     ▼
[ASP.NET MVC 서버]
  ├── /Account/*     ← 인증 (Login, SMS인증)
  ├── /Home          ← 대시보드 (로그인 후)
  ├── /* (기타)      ← 관리 페이지들 (인증 필요 → 302)
  └── /health        ← 헬스체크 (200 OK)
```

### 2.3 인증 구조

```
1단계: 아이디/비밀번호 입력
   POST /Account/Login
   - UserID: 영문+숫자 조합 8자리 이상
   - PassWord

2단계: SMS 2차 인증
   POST /Account/SMSCertifyRequest  ← SMS 발송 요청
   POST /Account/MemberCertify      ← 인증번호 확인
   - txtCertificationNumber

3단계: 세션 생성 → /Home 리다이렉트
```

### 2.4 라우트 구조 (HTTP 응답 코드 기반 분석)

| 코드 | 경로 | 상태 |
|------|------|------|
| 200 | `/Account/Login` | 로그인 폼 |
| 200 | `/Account/Index` | 로그인 폼 (리다이렉트 포함) |
| 200 | `/health` | 헬스체크 ("OK") |
| 302 | `/` | → `/Account/Index` (인증 필요) |
| 302 | `/Home` | → `/Account/Index` (인증 필요) |
| 404 | 그 외 모든 경로 | 인증 없이 접근 불가 |

**참고**: Dashboard, Content, Live, Match, User, Club, Team, Vod, Schedule, Notice, Event, Payment, Setting, Report, Statistics, Member 등 모든 관리 경로는 인증 없이 404 반환. 로그인 후에만 접근 가능.

### 2.5 프론트엔드 JS 라이브러리

| 파일 | 용도 |
|------|------|
| `jquery-latest.min.js` | jQuery |
| `jquery-ui.js` | jQuery UI |
| `jquery.tmpl.min.js` | jQuery Templates (동적 HTML 렌더링) |
| `jquery.blockUI.js` | 로딩 UI |
| `core.common.js` | 공통 유틸리티 (날짜 포맷, 윈도우 팝업, iframe 토글) |
| `ui.common.js` | UI 공통 |
| `WeLinkScript.js` | 패널 플라이아웃 시스템 (iframe 기반) |
| `JFramework.Validate.js` | 폼 유효성 검증 |
| `JFramework.Pagination.js` | 페이지네이션 |
| `JFramework.Common.js` | 공통 프레임워크 |

### 2.6 UI 패턴

- **패널 플라이아웃**: iframe 기반 사이드 패널 (우측에서 슬라이드)
  - 기본 너비: 1200px
  - 중첩 가능 (레이어당 30px 감소)
  - z-index: 100001 기반으로 레이어링
- **로딩 UI**: BlockUI + GIF 애니메이션
- **TR 토글**: 테이블 행 확장/축소 (iframe 임베드)

---

## 3. 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                            │
│                                                             │
│  ┌──────────────┐     ┌──────────────────────────────────┐  │
│  │   CloudFront  │     │      API Gateway                 │  │
│  │   CDN         │     │  b7brq5fwy9.execute-api         │  │
│  │  (정적 리소스)  │     │  ap-northeast-2 (서울)           │  │
│  └──────┬───────┘     └──────────┬───────────────────────┘  │
│         │                        │                          │
│  d3ocndcybz2qo4      ┌──────────▼───────────────────────┐  │
│  .cloudfront.net      │   .NET Backend (C#)              │  │
│                       │   ├── Auth Controller            │  │
│                       │   ├── Main Controller            │  │
│                       │   ├── Competition Controller     │  │
│                       │   ├── CompetitionSub Controller  │  │
│                       │   ├── Landing Controller         │  │
│                       │   ├── Payment Controller         │  │
│                       │   └── Media Controller           │  │
│                       └──────────────────────────────────┘  │
│                                                             │
│  ┌──────────────┐     ┌──────────────────────────────────┐  │
│  │   ALB         │     │   ASP.NET MVC (BO)              │  │
│  │  (corehub)    │────▶│   ├── Account (로그인/인증)       │  │
│  │               │     │   ├── Home (대시보드)             │  │
│  └──────────────┘     │   ├── Content/Live/Vod           │  │
│                       │   ├── Match/Team/Club            │  │
│                       │   ├── Member/Payment             │  │
│                       │   └── Report/Statistics          │  │
│                       └──────────────────────────────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │   External Services                                    │  │
│  │   ├── media.aisportstv.com (미디어 서버)                 │  │
│  │   ├── scorebug.peerline.net (스코어보드)                 │  │
│  │   ├── dev.peerline.net (광고 영상)                      │  │
│  │   ├── KCP (결제)                                       │  │
│  │   ├── Mobile-OK (본인인증)                              │  │
│  │   └── Google/Naver/Kakao/Apple (OAuth + Maps)          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────┐   ┌───────────────────────────┐
│   pochak.live             │   │   corehub.hogak.live      │
│   ┌───────────────────┐   │   │   ┌───────────────────┐   │
│   │  Nginx (HTTP/2)   │   │   │   │  Nginx             │   │
│   │  React SPA        │   │   │   │  ASP.NET MVC SSR   │   │
│   │  Video.js + HLS   │   │   │   │  jQuery + iframe   │   │
│   │  Pixi.js          │   │   │   │  SMS 2FA           │   │
│   └───────────────────┘   │   │   └───────────────────┘   │
└───────────────────────────┘   └───────────────────────────┘
```

---

## 4. 도메인 관계 정리

| 도메인 | 역할 | 프로토콜 |
|--------|------|----------|
| `pochak.live` | 사용자 웹 (SPA) | HTTPS |
| `corehub.hogak.live` | 관리자 BO | HTTP |
| `b7brq5fwy9.execute-api.ap-northeast-2.amazonaws.com` | API Gateway | HTTPS |
| `d3ocndcybz2qo4.cloudfront.net` | CDN (정적 리소스) | HTTPS |
| `media.aisportstv.com` | 미디어 스트리밍 서버 | HTTPS |
| `scorebug.peerline.net` | 스코어보드 서비스 | HTTPS |
| `dev.peerline.net` | 광고/프리롤 서버 | HTTPS |
| `aisportstv.co.kr` | 이전 서비스 도메인 (참조) | - |
| `hogak.co.kr` | 회사 도메인 | - |

---

## 5. 보안 관련 참고사항

| 항목 | 현황 |
|------|------|
| **pochak.live** | HTTPS (HTTP/2), Nginx |
| **corehub.hogak.live** | **HTTP** (비암호화) - 보안 취약점 |
| **BO 인증** | 폼 기반 + SMS 2FA |
| **API 인증** | AWS API Gateway (토큰 기반 추정 - "Missing Authentication Token") |
| **CORS** | AWSALBCORS 쿠키로 ALB 레벨 CORS 처리 |
| **Google Maps API Key** | 번들에 하드코딩 (제한 설정 필요) |
| **NCP Client ID** | 번들에 하드코딩 |

---

## 6. 데이터 모델 추정 (API 응답 기반)

### Banner
```
BannerID, BannerType, ImageURL, ImageURLMobile, TotalCount
```

### Term (약관)
```
TermId, TermType, Title, Content, EffectiveDate, IsEssential, IsUse, IsDelete
```

### Deploy 설정
```
DetailCode, MasterCode, DetailName, Description, EtcValue, DisplayOrder, IsUse, IsDelete
```

### 공통 패턴
- 모든 엔티티: `IsUse`, `IsDelete` (소프트 삭제)
- 날짜 필드: ISO 8601 형식
- 수정 추적: `UpdateID`, `UpdateDate`, `RegistId`, `RegistDate`
- 코드 체계: `MasterCode` → `DetailCode` (코드 테이블 패턴)

---

## 7. pochak 신규 시스템과의 차이점 비교

| 항목 | 운영 (pochak.live) | 신규 (pochak 개발중) |
|------|-------------------|---------------------|
| **FE 프레임워크** | React (CRA) | React (Vite) |
| **상태관리** | React Hooks | Zustand |
| **스타일링** | Styled Components | Tailwind CSS v4 |
| **BE 프레임워크** | .NET (C#) | Spring Boot (Java) |
| **BE 아키텍처** | 모놀리식 (단일 API Gateway) | 마이크로서비스 (Gateway + 6 서비스) |
| **API 형식** | `/api/Controller/Action` (MVC) | `/api/v1/resource` (REST) |
| **인프라** | AWS (API Gateway + Lambda/EC2) | Docker Compose (로컬) |
| **CDN** | CloudFront | 미설정 |
| **영상 플레이어** | Video.js + Pixi.js | HLS.js (경량) |
| **BO 프레임워크** | ASP.NET MVC (SSR + jQuery) | Next.js (React SSR) |
| **결제** | KCP | 미설정 |
| **광고** | Google DFP + IMA | 미설정 |
