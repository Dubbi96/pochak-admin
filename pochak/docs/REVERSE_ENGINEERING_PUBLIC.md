# pochak.live 리버스 엔지니어링 분석서 (Public Web)

> 분석일: 2026-04-08
> 대상: https://pochak.live
> 목적: 소스코드 미보유 상태에서 디자인 및 서비스 업데이트를 위한 현황 파악

---

## 1. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| 프레임워크 | React (Create React App) | SPA, `<div id="root">` 마운트 |
| 번들러 | Webpack 5 | 1000+ 코드 스플릿 청크 |
| 라우팅 | React Router v5 | `useHistory`, `withRouter`, `Switch`, `Route` |
| 상태관리 | React Context | `Po()` auth provider |
| 데이터 패칭 | SWR + Axios | `vk()` wrapper + `tn()` wrapper |
| 스타일링 | CSS Modules | 해시 클래스명 (예: `.Card_CardWrapper__14s9F`) |
| 폰트 | Pretendard (300-700) + Open Sans | |
| 국제화 | i18next | 한국어 기본, 다국어 지원 |
| 날짜 | Moment.js + Luxon + date-fns | **3개 중복 사용 (번들 비대 원인)** |
| 영상 | Video.js + Google IMA SDK | VAST 광고 지원 |
| 그래픽 | PixiJS | WebGL + WebGPU, 스코어버그/경기 시각화 |
| 아이콘 | Lucide React | 1000+ 아이콘 청크 |
| 캐러셀 | react-slick | |
| 지도 | Naver Maps + Google Maps | **이중 프로바이더** |
| 결제 | KCP | 사이트코드 `AL46F` |
| 분석 | GTM (`GTM-TV72J8TV`) + GA4 (`G-1309EXWYC7`) | |
| 광고 | Google AdSense (`ca-pub-1782774190014281`) | |
| CDN | AWS CloudFront (`d3ocndcybz2qo4.cloudfront.net`) | |
| 백엔드 | AWS API Gateway + Lambda | 서울 리전 (`ap-northeast-2`) |
| 내부 프로젝트명 | `videoend_admin` | webpack 청크 네임스페이스 |

---

## 2. 디자인 시스템

### 2.1 색상 체계

| 용도 | 색상 코드 |
|------|-----------|
| Primary Blue | `#428bca` |
| Dark | `#2b333f` |
| Gold | `#ecc546` |
| Error Red | `#ff4d4f` |
| Green | `#81eb47` |

### 2.2 타이포그래피

- **주 폰트**: Pretendard (weight: 300, 400, 500, 600, 700)
- **보조 폰트**: Open Sans (fallback)

### 2.3 레이아웃

| 항목 | 값 |
|------|-----|
| Breakpoint (모바일) | 480px |
| Breakpoint (태블릿/데스크톱) | 481px+ |
| Spacing 단위 | 4px / 8px base (0, 4, 5, 8, 10, 16, 20, 24px) |
| Border Radius | 4px, 8px, 16px, 20px, 50% |

### 2.4 Z-index 레이어

| 레이어 | z-index |
|--------|---------|
| Date Picker | 99999 |
| Minimap | 3000 |
| Controls | 1000 |
| Badges | 200 |
| Carousel | 10 |

---

## 3. OAuth 로그인

### 3.1 프로바이더 (4개)

| 프로바이더 | Client ID | Auth URL |
|-----------|-----------|----------|
| **카카오** | `58dcc4d359abe4fb62c85d5e52c272a2` | `https://kauth.kakao.com/oauth/authorize` |
| **구글** | `635303146703-sj9f4k0m6tp6vbe8ss208qb94sjs2uam.apps.googleusercontent.com` | `https://accounts.google.com/o/oauth2/v2/auth` |
| **애플** | `tv.pixellot.watch.yst.webapp` | `https://appleid.apple.com/auth/authorize` |
| **네이버** | `MAjynHL363RfpV3HxJT8` | `https://nid.naver.com/oauth2.0/authorize` |

### 3.2 인증 흐름

- **Grant Type**: `authorization_code`
- **Redirect URI**: `https://pochak.live/callback`
- **콜백 라우트**: `/callback/:social` → `code`, `clientToken`, `id_token` 추출
- **토큰 저장**: `localStorage` (accessToken, refreshToken, mid) + 쿠키 (30일 만료)
- **세션 관리**: React Context (`Po()` provider) → `checkLogin()`, `login()`, `logout()`

### 3.3 회원가입 라우트

```
/sign_up?userType=002
/sign_up/userinfo
/login_t
/pass/verification       (Mobile OK 본인인증)
```

---

## 4. API 엔드포인트

### Base URL

```
https://b7brq5fwy9.execute-api.ap-northeast-2.amazonaws.com/prd
```

### 4.1 Auth API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/Auth/Login` | 로그인 |
| POST | `/api/Auth/Users` | 회원가입 |
| POST | `/api/Auth/UsersByEmail` | 이메일 회원가입 |
| GET | `/api/Auth/UserInfo?mid={mid}` | 유저 정보 조회 |
| GET | `/api/Auth/TermList` | 약관 목록 |
| GET | `/api/Auth/Term?id={id}` | 약관 상세 |
| GET | `/api/Auth/EmailVerificationSend` | 이메일 인증 발송 |
| GET | `/api/Auth/EmailVerificationByChange` | 이메일 변경 인증 |
| GET | `/api/Auth/EmailVerificationChk` | 이메일 인증 확인 |
| GET | `/api/Auth/userAgeAbove` | 나이 확인 |

### 4.2 Main API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/Main/Sports` | 스포츠 목록 |
| GET | `/api/Main/TopMenu` | 상단 메뉴 |
| GET | `/api/Main/TopChanelMenu` | 채널 메뉴 |
| GET | `/api/Main/HomeBanner` | 홈 배너 |
| GET | `/api/Main/HomeEvent` | 홈 이벤트 |
| GET | `/api/Main/HomeMatchSchedule` | 경기 일정 |
| GET | `/api/Main/PopupList` | 팝업 목록 |
| GET | `/api/Main/Live` | 라이브 목록 |
| GET | `/api/Main/Vod` | VOD 목록 |
| GET | `/api/Main/Clip` | 클립 목록 |
| GET | `/api/Main/Competition` | 대회 목록 |
| GET | `/api/Main/EventList` | 이벤트 목록 |
| GET | `/api/Main/Event` | 이벤트 상세 |
| GET | `/api/Main/MemberShip` | 멤버십 |
| GET | `/api/Main/MembershipGroup` | 멤버십 그룹 |
| POST | `/api/Main/MemberShipUp` | 멤버십 업데이트 |
| POST | `/api/Main/MemberImageAdd` | 멤버 이미지 추가 |
| GET | `/api/Main/MyPoint` | 포인트 조회 |
| GET | `/api/Main/PointList` | 포인트 내역 |
| GET | `/api/Main/NoticeList` | 공지 목록 |
| GET | `/api/Main/Notice` | 공지 상세 |
| POST | `/api/Main/NoticeDel` | 공지 삭제 |
| GET | `/api/Main/InquiryList` | 문의 목록 |
| GET | `/api/Main/Inquiry` | 문의 상세 |
| POST | `/api/Main/InquiryAdd` | 문의 등록 |
| GET | `/api/Main/RefundInquiryList` | 환불 문의 목록 |
| GET | `/api/Main/RefundInquiry` | 환불 문의 상세 |
| POST | `/api/Main/RefundInquiryAdd` | 환불 문의 등록 |
| GET | `/api/Main/RefundReason` | 환불 사유 |
| POST | `/api/Main/RefundPGPayment` | PG 환불 |
| GET | `/api/Main/SeasonPass` | 시즌패스 |
| GET | `/api/Main/MySeasonPass` | 내 시즌패스 |
| POST | `/api/Main/SeasonPassPurchase` | 시즌패스 구매 |
| GET | `/api/Main/CheckSeasonPassConflict` | 시즌패스 충돌 확인 |
| GET | `/api/Main/GetSeasonPassExpectedDates` | 시즌패스 예상 일정 |
| POST | `/api/Main/ReportAdd` | 신고 등록 |
| POST | `/api/Main/ReportCategory` | 신고 카테고리 |
| POST | `/api/Main/TeamAdd` | 팀 추가 |
| GET | `/api/Main/AddressList` | 주소 목록 |
| GET | `/api/Main/AlarmMemberSetting` | 알림 설정 조회 |
| POST | `/api/Main/AlarmMemberSettingUp` | 알림 설정 업데이트 |
| POST | `/api/Main/AlarmReadUP` | 알림 읽음 처리 |
| GET | `/api/Main/WithdrawalReason` | 탈퇴 사유 |
| POST | `/api/Main/MemberWithdrawal` | 회원 탈퇴 |
| POST | `/api/Main/GiftCodeAdd` | 기프트코드 등록 |
| GET | `/api/Main/DeployCheck` | 배포 확인 |
| GET | `/api/Main/Appversion` | 앱 버전 |
| GET | `/api/Main/FavoriteCompetition` | 즐겨찾기 대회 |
| GET | `/api/Main/FavoriteGroup` | 즐겨찾기 그룹 |
| GET | `/api/Main/FavoriteVod` | 즐겨찾기 VOD |
| POST | `/api/Main/CancelPGSubscription` | 구독 취소 |
| POST | `/api/Main/ResumePGSubscription` | 구독 재개 |

### 4.3 Competition API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/Competition/TeamHomeTop` | 팀 홈 상단 |
| GET | `/api/Competition/TeamHomeClip` | 팀 홈 클립 |
| GET | `/api/Competition/TeamHomeVod` | 팀 홈 VOD |
| GET | `/api/Competition/TeamHomeSearchFilter` | 팀 홈 검색 필터 |
| GET | `/api/Competition/AssociationHomeTop` | 협회 홈 상단 |
| POST | `/api/Competition/Favorite` | 즐겨찾기 토글 |
| GET | `/api/Competition/MamberRoleInfo` | 멤버 역할 정보 |

### 4.4 CompetitionSub API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/CompetitionSub/TeamInformation` | 팀 정보 |
| GET | `/api/CompetitionSub/TeamMemberInformation` | 팀 멤버 정보 |
| GET | `/api/CompetitionSub/TeamMemberDetailInformation` | 팀 멤버 상세 |
| GET | `/api/CompetitionSub/TeamMemberRoleInfo` | 팀 멤버 역할 |
| GET | `/api/CompetitionSub/TeamPositionSelect` | 팀 포지션 선택 |
| GET | `/api/CompetitionSub/TeamBanList` | 팀 밴 목록 |
| GET | `/api/CompetitionSub/GroupSearchList` | 그룹 검색 |
| GET | `/api/CompetitionSub/TeamTeamRegiRoleTransferList` | 역할 이관 목록 |
| GET | `/api/CompetitionSub/TeamByMemberID` | 멤버 ID별 팀 |
| POST | `/api/CompetitionSub/TeamMemberAdd` | 팀 멤버 추가 |
| POST | `/api/CompetitionSub/TeamMemberApprovalUp` | 멤버 승인 |
| POST | `/api/CompetitionSub/TeamMemberInfoUp` | 멤버 정보 수정 |
| POST | `/api/CompetitionSub/TeamInformationUp` | 팀 정보 수정 |
| POST | `/api/CompetitionSub/TeamAddInformationAdd` | 팀 추가정보 등록 |
| POST | `/api/CompetitionSub/TeamAddInformationDel` | 팀 추가정보 삭제 |
| POST | `/api/CompetitionSub/TeamAddInformationUp` | 팀 추가정보 수정 |
| POST | `/api/CompetitionSub/TeamAddressAdd` | 팀 주소 등록 |
| POST | `/api/CompetitionSub/TeamAddressUp` | 팀 주소 수정 |
| POST | `/api/CompetitionSub/TeamRegistRoleTransferUp` | 역할 이관 |
| POST | `/api/CompetitionSub/TeamDisband` | 팀 해산 |
| POST | `/api/CompetitionSub/ImageDel` | 이미지 삭제 |
| POST | `/api/CompetitionSub/PushSettingUp` | 푸시 설정 |

### 4.5 Landing (영상) API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/Landing/LandingHome` | 랜딩 홈 |
| GET | `/api/Landing/LandingClipList` | 클립 목록 |
| GET | `/api/Landing/LandingVodTagList` | VOD 태그 목록 |
| GET | `/api/Landing/PublicType` | 공개 타입 |
| GET | `/api/Landing/Clip` | 클립 상세 |
| GET | `/api/Landing/VodTag` | VOD 태그 상세 |
| GET | `/api/Landing/GetMatchScheduleTeam` | 경기 일정 팀 |
| GET | `/api/Landing/GetSportTagList` | 스포츠 태그 목록 |
| POST | `/api/Landing/ClipAdd` | 클립 등록 |
| POST | `/api/Landing/ClipDel` | 클립 삭제 |
| POST | `/api/Landing/ClipUp` | 클립 수정 |
| POST | `/api/Landing/VodTagAdd` | VOD 태그 등록 |
| POST | `/api/Landing/VodTagDel` | VOD 태그 삭제 |
| POST | `/api/Landing/VodTagUp` | VOD 태그 수정 |
| POST | `/api/Landing/MediaDel` | 미디어 삭제 |
| POST | `/api/Landing/LandingPointUsageAdd` | 포인트 사용 |
| POST | `/api/Landing/LandingViewingHistoryAdd` | 시청 기록 |

### 4.6 Media / Park API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/Media/Park` | 구장 목록 |
| GET | `/api/Media/ParkRadiusByLocation` | 위치 기반 구장 |
| GET | `/api/Media/ParkReservation` | 구장 예약 |
| GET | `/api/Media/ParkReservationByID` | 예약 상세 (ID) |
| GET | `/api/Media/ParkReservationByMid` | 예약 상세 (멤버) |
| GET | `/api/Media/ParkReservationHistory` | 예약 이력 |
| GET | `/api/Media/ParkReservationAvailabilityChk` | 예약 가능 확인 |
| GET | `/api/Media/ParkReservationParkFilter` | 구장 필터 |
| GET | `/api/Media/ParkInfoByQRCodek` | QR 구장 정보 |
| GET | `/api/Media/GetShootingReservationList` | 촬영 예약 목록 |
| POST | `/api/Media/ParkReservationUp` | 예약 수정 |
| POST | `/api/Media/ParkReservationDel` | 예약 삭제 |
| POST | `/api/Media/ParkReservationTimeUp` | 예약 시간 수정 |
| POST | `/api/Media/ParkReservationScoreUp` | 스코어 수정 |
| POST | `/api/Media/AirBrigeTracking` | 에어브릿지 트래킹 |

### 4.7 Payment API

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/Payment/GetOrderNo` | 주문번호 생성 |
| POST | `/api/Payment/GetSeasonPassOrderNo` | 시즌패스 주문번호 |
| POST | `/api/Payment/HogakPaymentPG` | PG 결제 |
| POST | `/api/Payment/HogakSeasonPassPaymentPG` | 시즌패스 PG 결제 |
| POST | `/api/Payment/PGSubscriptionOrder` | 구독 결제 |
| POST | `/api/Payment/SeasonPassPointOnlyPurchase` | 포인트 구매 |

### 4.8 Search API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/Search/SearchResultList` | 검색 결과 |
| GET | `/api/Search/SearchResult{type}` | 타입별 검색 |
| GET | `/api/Search/SearchCompetitionList` | 대회 검색 |
| GET | `/api/Search/SearchGroupList` | 그룹 검색 |
| GET | `/api/Search/SearchRecommand` | 추천 검색어 |

---

## 5. 프론트엔드 라우트

```
/                                    → /main 리다이렉트
/main                                홈
/login_t                             로그인
/sign_up                             회원가입
/sign_up/userinfo                    회원정보 입력
/callback/:social                    OAuth 콜백
/pass/verification                   본인인증 (Mobile OK)

/my-page                             마이페이지
/my-page/info                        프로필
/my-page/ball-charge                 포인트 충전
/my-page/gift-ball                   기프트 포인트
/my-page/payment-history             결제 내역
/my-page/pass-history                패스 내역
/my-page/season-pass                 시즌패스
/my-page/season-pass/:id             시즌패스 상세
/my-page/events                      이벤트
/my-page/activities                  활동 내역
/my-page/affiliations                소속 팀
/my-page/notice                      공지사항
/my-page/notice/:id                  공지 상세
/my-page/customer-center             고객센터
/my-page/customer-center/refund-list/:id  환불 상세
/my-page/notification-settings       알림 설정
/my-page/shortcuts                   바로가기
/my-page/terms                       약관
/my-page/shoot-reservation           촬영 예약

/live?id=&type=live&matchid=         라이브 중계
/clip?id=&type=clip&matchid=         클립 재생
/wish-list                           찜 목록

/shoot-reservation                   촬영 예약
/shoot-reservation/arena/:parkID     구장 예약
/shoot-reservation/private/:parkID   개인 예약
/shoot-reservation/setting           예약 설정
/shoot-reservation/live-score/setting/:id  라이브 스코어 설정

/teams?referenceID=                  팀 홈
/teams/join-form                     팀 가입
/teams/join-form/nickname            닉네임 설정
/teams/join-form/number-and-position 번호/포지션 설정
/teams/join-form-for-parent          보호자 가입
/teams/members                       팀원 목록
/teams/member-edit                   팀원 수정
/teams/manager-settings/associations/join  협회 가입

/competitions?referenceID=           대회 홈
/associations/notice/view            협회 공지
/associations/organizations          협회 조직

/H-LOG/01000000_t                    H-LOG
```

---

## 6. 외부 서비스 연동

| 서비스 | URL / 키 | 용도 |
|--------|----------|------|
| Naver Maps | `ncpClientId=p4d2ac47ht` | 지도 + 지오코더 |
| Google Maps | `<REDACTED_GOOGLE_MAPS_API_KEY>` | 지도 |
| Google AdSense | `ca-pub-1782774190014281` | 광고 |
| GTM | `GTM-TV72J8TV` | 태그 매니저 |
| GA4 | `G-1309EXWYC7` | 애널리틱스 |
| Mobile OK | `cert.mobile-ok.com` | 본인인증 |
| KCP | 사이트코드 `AL46F` | PG 결제 |
| Scorebug | `scorebug.peerline.net:24200` | 스코어버그 |
| Media CDN | `media.aisportstv.com` | 영상 CDN |
| CloudFront | `d3ocndcybz2qo4.cloudfront.net` | 정적 자산 CDN |
| AirBridge | 앱 트래킹 | 마케팅 어트리뷰션 |
| FAQ | `neighborly-zinc-d32.notion.site` | Notion FAQ |

---

## 7. CDN 자산 경로

```
Base: https://d3ocndcybz2qo4.cloudfront.net/prd/

/app/logo/Pochak_Digital_Icon_Android.png
/app/logo/Pochak_Digital_Icon_iOS.png
/app/logo/Pochak_Logo.svg
/pubulish/icon/          (25+ SVG 아이콘)
/pubulish/images/        (배경 이미지)
```

---

## 8. 보안 이슈 및 개선 사항

### 8.1 보안 취약점

| 이슈 | 심각도 | 상세 |
|------|--------|------|
| 암호화 키 하드코딩 | **Critical** | `REACT_APP_CRYPTO_KEY = "key"`, `REACT_APP_CRYPTO_IV = "0000000000000000"` |
| OAuth Client ID 노출 | Medium | 프론트엔드 번들에 모든 OAuth Client ID 포함 (SPA 특성상 불가피) |
| 토큰 localStorage 저장 | Medium | XSS 공격 시 토큰 탈취 가능 |

### 8.2 성능 이슈

| 이슈 | 영향 | 개선 방안 |
|------|------|----------|
| 메인 번들 7MB | 초기 로딩 느림 | Tree-shaking, 동적 import |
| 날짜 라이브러리 3중 사용 | 번들 비대 | date-fns로 통일 |
| 지도 이중 로딩 | 불필요한 네트워크 요청 | 사용하는 지도만 로딩 |
| Manifest 미커스터마이즈 | PWA 미완성 | 앱 정보 반영 |

### 8.3 아키텍처 메모

- 내부 프로젝트명 `videoend_admin` → 어드민에서 파생된 코드베이스
- Apple Client ID `tv.pixellot.watch.yst.webapp` → Pixellot 플랫폼 기반
- 모회사: `aisportstv.co.kr`
- 하이브리드 앱: iOS (`window.webkit.messageHandlers`), Android (`window.bridge`)

---

## 9. Meta Tags

```html
<meta charset="utf-8">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no">
<meta name="google-adsense-account" content="ca-pub-1782774190014281">
<meta name="naver-site-verification" content="3f867915b28840c7ecd50bc3899b9b93ceca2015">
<meta name="description" content="AI로 스포츠를 더 가까이, 스포츠 중계 플랫폼 '포착'">
<meta property="og:title" content="포착">
<meta property="og:description" content="AI로 스포츠를 더 가까이, 스포츠 중계 플랫폼 '포착'">
<meta property="og:url" content="https://pochak.live/main">
<meta property="og:type" content="website">
<link rel="canonical" href="https://pochak.live/main">
```
