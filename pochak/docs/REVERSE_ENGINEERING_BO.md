# corehub.hogak.live 리버스 엔지니어링 분석서 (BackOffice)

> 분석일: 2026-04-08
> 대상: https://corehub.hogak.live/
> 목적: 소스코드 미보유 상태에서 디자인 및 서비스 업데이트를 위한 현황 파악

---

## 1. 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| 백엔드 | ASP.NET Core MVC (C#) | Razor Views (`.cshtml`) |
| 서버 | Nginx (리버스 프록시) | 버전 미노출 |
| 호스팅 | AWS (ALB) | `AWSALB`, `AWSALBCORS` 쿠키 확인 |
| JS 라이브러리 | jQuery 1.11.1 (2014) | **매우 오래됨, 보안 취약** |
| UI 라이브러리 | jQuery UI 1.11.2 (2014) | |
| 템플릿 | jQuery Templates 1.0.0pre | |
| 로딩 오버레이 | jQuery BlockUI 2.7 | |
| 멀티셀렉트 | Multiple Select 1.5.2 | wenzhixin |
| 커스텀 프레임워크 | JFramework | 밸리데이션, 페이지네이션, 공통 유틸 |
| 패널 시스템 | WeLinkScript | 슬라이드아웃 패널 (iframe 기반) |
| 날짜 | jQuery UI Datepicker | 포맷: `yy-mm-dd` |
| 차트 | C3.js | 관리 대시보드 차트 |
| 어드민 템플릿 | Sash Bootstrap 5 | 부분 사용 |
| 아이콘 폰트 | Tencons (커스텀) | `Tencons-Regular` woff/eot/ttf |
| 모던 프레임워크 | **없음** | React/Vue/Angular 미사용, 전통 서버렌더링 |

---

## 2. 디자인 시스템

### 2.1 폰트

| 용도 | 폰트 | 비고 |
|------|------|------|
| 주 폰트 | S-CoreDream-4Regular | CDN: `cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/` |
| 라이트 | S-CoreDream-3Light | |
| Fallback | -apple-system, Roboto, NotoSansLight, Malgun Gothic, dotum, sans-serif | |
| 기본 크기 | 0.813em (~13px) | `<html>` 기준 |
| 입력 폼 크기 | 13px | |
| Line-height | 1.333 | |

### 2.2 색상 체계

| 역할 | 색상 | Hex |
|------|------|-----|
| Primary / Accent | 블루 | `#6787ff` |
| Primary Hover | 다크 블루 | `#4269fd` |
| Primary Focus | 딥 블루 | `#3754c3` / `#3d5dd5` |
| Success | 그린 | `#20c898` / `#18b488` |
| Delete / Danger | 레드 | `#f44336` |
| Error Highlight | 핑크 | `#ec1f71` / `#ff5f7b` |
| Warning | 옐로우 | `#ffd800` / `#ffc107` |
| Cancel | 그레이 | `#b0b0b0` |
| Badge Default | 그레이 블루 | `#a8b0cb` |
| Text Primary | 다크 | `#333` / `#555` |
| Text Secondary | 그레이 | `#888` |
| Text Muted | 라이트 그레이 | `#bbb` |
| Table Header BG | 슬레이트 | `#8a91a9` |
| Table Header Border | 다크 슬레이트 | `#636879` |
| Table Even Row BG | 라이트 그레이 | `#eff0f5` |
| Content BG | 라이트 그레이 | `#e5e7ec` |
| Sidebar Gradient Start | 딥 퍼플 | `#4e39d1` |
| Sidebar Gradient End | 블루 | `#6787ff` |
| Header Logo BG | 블루 | `#6580fb` |
| Login BG Overlay | 반투명 화이트 | `rgba(255,255,255,0.85)` |
| Login Title | 다크 네이비 | `rgba(25,35,75,1)` / `#26356f` |
| Input Focus BG | 옐로우 | `#fffabd` |
| Input Focus Border | 블루 | `#6787ff` |

### 2.3 레이아웃 / 스페이싱

| 항목 | 값 |
|------|-----|
| Sidebar 너비 | 235px |
| Content 최소 너비 | 1400px |
| Content 패딩 | top: 65px, sides: 30px |
| Content 영역 border-radius | 20px |
| Table 셀 패딩 | 9px |
| 버튼 패딩 | 9px 7px, min-width: 60px |
| 버튼 border-radius | 3px |
| Card/검색 영역 border-radius | 5px |
| 로그인 패널 | 450x450px, border-radius: 50% (원형) |

### 2.4 반응형 Breakpoints

| Breakpoint | 용도 |
|------------|------|
| max-width: 595px | 모바일 (로그인 패널 조정) |
| max-width: 768px | 태블릿 (사이드바 숨김, 헤더 조정) |
| max-width: 1000px | 테이블 오버플로우 처리 |

### 2.5 UI 컴포넌트 패턴

| 컴포넌트 | 구현 방식 |
|----------|----------|
| Sidebar | Fixed left, 235px, 그라디언트 배경, 접이식 서브메뉴 |
| Header | Fixed top, full-width, 햄버거 토글 |
| Mini-toggle | Sidebar 숨김 (`mini-toggle` 클래스) |
| Flyout 패널 | 오른쪽 슬라이드아웃 패널 (iframe, WeLinkScript.Layer) |
| Modal | 오버레이 + z-index 관리 |
| Loading | 전체 페이지 오버레이 (animated GIF) |
| Datepicker | jQuery UI datepicker (`yy-mm-dd`) |
| Toast/Alert | 커스텀 alert/confirm (`showAlert`, `showConfirm`) |
| Pagination | 서버사이드 (`fn_MakePage`, `fn_SetPage`) |
| Tables | 교차 행 색상, iframe 기반 확장 가능한 서브 행 |

---

## 3. 인증 흐름

### 3.1 로그인 (2단계)

**Step 1 — 아이디/비밀번호 인증**

```
POST /Account/Login
Content-Type: application/x-www-form-urlencoded

Body: UserID={id}&PassWord={pw}

Response: {ResultCode, Message}
  ResultCode == "1" → 로그인 성공, "/" 리다이렉트
  ResultCode == "2" → 2FA 필요, Message에 마스킹된 전화번호
  기타 → 에러 메시지
```

**Step 2 — SMS 2FA (ResultCode == 2인 경우)**

```
1. POST /Account/TimeKey → 시간 기반 키 발급
2. POST /Account/SMSCertifyRequest
   Body: {MobileNumber, TimeKey, SMS_Type: "LOGINCMS"}
3. 사용자가 4자리 인증번호 입력
4. POST /Account/MemberCertify
   Body: {MobileNumber, CertificationNumber, UserID, PassWord, SaveID}
   ResultCode == "1" → 성공, "/" 리다이렉트
```

### 3.2 세션 관리

| 항목 | 값 |
|------|-----|
| 세션 쿠키 | `Hogak` (ASP.NET Core Data Protection 암호화) |
| 세션 만료 | 12시간 (`max-age=43200`) |
| httponly | ✅ (JS 접근 불가) |
| SameSite | Lax |
| Secure | ❌ (**HTTP 전송, 취약**) |
| Cache 정책 | `no-cache, no-store`, `Pragma: no-cache` |

### 3.3 비밀번호 정책

- 영문 + 숫자 조합, 최소 8자
- 클라이언트 밸리데이션: `dataformat="eng_numeric"`, `fn_IsAlphaNumericBoth()`

---

## 4. API 엔드포인트

### 4.1 활성 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/Account/Login` | 로그인 인증 |
| POST | `/Account/TimeKey` | SMS 인증용 시간 키 발급 |
| POST | `/Account/SMSCertifyRequest` | SMS 인증번호 발송 |
| POST | `/Account/MemberCertify` | SMS 인증 확인 + 로그인 완료 |
| GET | `/Account/Index` | 로그인 페이지 |
| GET | `/Account/Logout` | 로그아웃 (302 리다이렉트) |
| POST | `/CommonAjax/TimeKey` | 대체 TimeKey 엔드포인트 |
| POST/GET | `/Team/Adress` | Naver 지오코딩 프록시 |
| GET | `/Health` | 헬스체크 ("OK" 반환) |

### 4.2 레거시/비활성 엔드포인트 (코드 내 주석/참조)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/Monitoring/UpdateIntegrationReferrerStatus` | 레퍼러 등급 상태 업데이트 |
| POST | `/Monitoring/ReferrerDetail` | 레퍼러 상세 정보 |
| GET | `/Monitoring/AppRentention` | 앱 리텐션 통계 (팝업) |
| POST | `/User/RequestPRMethod` | PR/프로모션 방법 요청 |
| POST | `/User/Campaign_Member_Block_Insert` | 캠페인 멤버 차단 |
| GET | `/Board/ChargeDetail` | 충전 상세 정보 (iframe) |

### 4.3 AJAX 패턴

```javascript
// 공통 AJAX 호출 패턴
WeLinkScript.GetJsonData(url, params, callback)
customPostAjax(url, params, successFn, errorFn)
customGetAjax(url, params, successFn, errorFn)
customPromisePostAjax(url, params)
customFormPostAjax(url, formData, successFn)

// 표준 응답 형식
{ResultCode: "1"/"2"/..., Message: "..."}
```

---

## 5. 프론트엔드 라우트

### 5.1 인증 필요 라우트 (302 → 로그인)

```
/                          홈 / 대시보드
/Home/Index                메인 페이지
/Monitoring                모니터링 섹션
/System                    시스템 관리
/Team/Adress               팀 주소/지오코딩
```

### 5.2 공개 라우트

```
/Account/Index             로그인 페이지
/Account                   계정 섹션
/Health                    헬스체크
/Error                     에러 페이지 (302 → 로그인)
```

### 5.3 레거시 코드 참조 라우트 (존재 여부 미확인)

```
/Monitoring/CampaignJoin
/Monitoring/AppRentention
/Monitoring/ReferrerDetail
/Monitoring/UpdateIntegrationReferrerStatus
/User/RequestPRMethod
/User/Campaign_Member_Block_Insert
/Board/ChargeDetail
```

---

## 6. 외부 서비스 연동

| 서비스 | 용도 |
|--------|------|
| Daum Postcode API | 주소 검색 (우편번호) |
| Naver Geocoding API | 좌표 조회 (`/Team/Adress` 프록시) |
| SMS Service | 2FA 로그인 인증 |
| AWS ALB | Application Load Balancer |
| jsDelivr CDN | 한국어 폰트 호스팅 (S-CoreDream) |

---

## 7. 파일 구조

```
/css/
  base.css               CSS 리셋 및 기본 타이포그래피
  layout.css             페이지 레이아웃 (header, sidebar, content, login)
  common.css             공통 컴포넌트 (버튼, 테이블, 폼, 아이콘)
  page.css               페이지별 스타일
  tencons.css            커스텀 아이콘 폰트

/js/
  jquery-latest.min.js   jQuery 1.11.1
  jquery-ui.js           jQuery UI 1.11.2
  jquery.tmpl.min.js     jQuery Templates
  ui.common.js           UI 컨트롤 (탭, 사이드메뉴, datepicker, multiselect)
  core.common.js         Core 유틸 (iframe 토글, 날짜, 윈도우, 포맷팅)
  JFramework/
    JFramework.Validate.js     폼 밸리데이션
    JFramework.Pagination.js   페이지네이션
    JFramework.Common.js       공통 유틸, 레거시 엔드포인트 함수

/Scripts/
  jquery.blockUI.js      로딩 오버레이 플러그인 v2.7
  WeLinkScript.js        레이어/패널 시스템, AJAX 래퍼, 날짜 포맷

/assets/
  images/Hogak_logo.svg  로고 (Adobe Photoshop 25.11, 2024년 9월)
  css/style.css          Sash Bootstrap 5 어드민 템플릿 CSS
  js/index.js            C3.js 차트 설정
  js/custom.js           테마/레이아웃 관리

/img/
  favicon.ico
  loading.gif / loading@2x.gif    로딩 스피너
  logo_wh_all.png                 화이트 로고
  BO_admin.png                    로그인 배경 이미지
  icon_menu_on.svg / off.svg      메뉴 토글 아이콘
  icon_date.png                   데이트피커 아이콘
  bg_sprite.png                   CSS 스프라이트
  bg_shapes_sprite.png            쉐이프 스프라이트 (아이콘)

/fonts/
  Tencons-Regular.eot/ttf/woff/svg   커스텀 아이콘 폰트
```

---

## 8. 코드 컨벤션 / 네이밍

| 패턴 | 용도 |
|------|------|
| `form_` prefix | 폼 자동 추출 필드 |
| `select_` prefix | 검색/필터 필드 |
| `div_` prefix | 컨테이너 div |
| `AddressType`, `SiGunGuCode`, `ZipCode`, `Latitude`, `Longitude` | 주소 히든 필드 |
| `hdCurrentPage`, `hdPageSize` | 페이지네이션 히든 필드 |

---

## 9. 보안 이슈 및 개선 사항

### 9.1 보안 취약점

| 이슈 | 심각도 | 상세 |
|------|--------|------|
| HTTPS 미적용 | **Critical** | HTTP 평문 전송, 비밀번호/세션 탈취 가능 |
| jQuery 1.11.1 (2014) | **Critical** | 알려진 XSS 취약점 다수, 12년 된 라이브러리 |
| 비밀번호 평문 전송 | **High** | 클라이언트 해싱/암호화 없이 전송 |
| console.log 디버깅 코드 | **Medium** | `customPostAjax()`에서 모든 POST 데이터 콘솔 로깅 |
| 동기 AJAX 호출 | Low | `async: false` 사용 (UI 블로킹, deprecated) |
| Secure 쿠키 플래그 미설정 | **High** | 세션 쿠키가 HTTP로 전송 가능 |

### 9.2 긍정적 보안 사항

| 항목 | 상태 |
|------|------|
| httponly 쿠키 | ✅ JS 접근 불가 |
| SameSite=Lax | ✅ CSRF 기본 방어 |
| 캐시 비활성화 | ✅ 인증 페이지 캐싱 방지 |
| SMS 2FA | ✅ 2단계 인증 지원 |
| 세션 타임아웃 | ✅ 12시간 |
| 서버 버전 미노출 | ✅ Nginx만 표시 |

---

## 10. 아키텍처 메모

### 10.1 레거시 히스토리

- 원래 **"WeLink"** CMS 시스템으로 개발됨
- `WeLinkScript.js`에 원래 회사명 잔존
- 주석에 `devcms.WeLink.kr`, `global.devcms.WeLink.kr` 참조
- 이후 Hogak용으로 리브랜딩/적용

### 10.2 아키텍처 패턴

- 전통적 ASP.NET Core MVC + Razor 뷰 (서버사이드 렌더링)
- jQuery로 동적 동작 처리
- AJAX 폼 제출 및 데이터 로딩
- iframe 기반 상세 패널 (오른쪽 슬라이드아웃, WeLinkScript.Layer)
- **모던 프론트엔드 프레임워크 미사용**

### 10.3 Public Site vs BO 비교

| 항목 | Public (pochak.live) | BO (corehub.hogak.live) |
|------|---------------------|------------------------|
| 프레임워크 | React (CRA) | ASP.NET Core MVC |
| 렌더링 | SPA (클라이언트) | SSR (서버) |
| JS | 모던 번들 (Webpack) | jQuery 1.11.1 |
| 스타일링 | CSS Modules | 커스텀 CSS + Bootstrap 5 |
| 인증 | OAuth (카카오/구글/애플/네이버) | ID/PW + SMS 2FA |
| API | AWS API Gateway + Lambda | ASP.NET Core 직접 |
| 상태 | 분리 (프론트/백 독립) | 통합 (서버 세션) |
| 주요 폰트 | Pretendard | S-CoreDream |
| Primary 색상 | `#428bca` | `#6787ff` |
