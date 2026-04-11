# Partner 관리 화면 미리보기 설계

## 목표
- 파트너가 클럽/시설 정보를 저장하기 전에 실제 노출 형태를 확인할 수 있게 한다.
- 현재 저장 API를 최대한 재사용하고, 서버 변경은 "임시 미리보기 세션" 최소 단위로 추가한다.
- UI에서 "실패를 성공처럼 숨기지 않도록" 미리보기/저장 상태를 명확히 분리한다.

## 적용 범위 (v1)
- `partner-web`:
  - `ClubEditPage`
  - `ClubCustomizePage`
  - `VenuesPage`(등록/수정 폼 도입 시점 기준)
- `partner-bff` + `content-service`:
  - 클럽 커스터마이징 미리보기 세션 생성/조회 API
  - 임시 데이터 TTL 만료 처리

## UX/동작 시나리오
1. 사용자가 편집 폼 입력
2. `미리보기` 버튼 클릭
3. 서버에 임시 draft 저장 (`previewToken` 발급, 기본 TTL 15분)
4. 우측 패널/모달에서 Public 노출과 동일한 컴포넌트로 렌더링
5. `저장` 클릭 시 draft를 확정 반영하거나, 기존 저장 API에 최종 payload 전달
6. 저장 성공 후 draft 폐기

## API 재사용/추가안

### 재사용 API
- `GET /api/v1/partner/partners/{partnerId}/clubs/{clubId}/customization`
- `PUT /api/v1/partner/partners/{partnerId}/clubs/{clubId}/customization`

위 API는 최종 저장 경로로 유지하고, 미리보기는 별도 draft 경로를 추가한다.

### 신규 API (제안)
- `POST /api/v1/partner/partners/{partnerId}/clubs/{clubId}/customization/preview`
  - 요청: 커스터마이징 payload
  - 응답: `previewToken`, `expiresAt`, `renderModel`
- `GET /api/v1/partner/partners/{partnerId}/clubs/{clubId}/customization/preview/{previewToken}`
  - 응답: `renderModel` (Public 렌더와 동일한 normalized 모델)
- `DELETE /api/v1/partner/partners/{partnerId}/clubs/{clubId}/customization/preview/{previewToken}`
  - 수동 폐기

## 데이터 모델
- 저장소: Redis 권장 (`preview:{partnerId}:{clubId}:{token}`)
- TTL: 15분 (만료 시 자동 삭제)
- 페이로드:
  - `bannerUrl`, `logoUrl`, `themeColor`, `introText`, `socialLinksJson`
  - 서버에서 sanitize/normalize 수행 후 `renderModel` 생성

## 프론트 구현 포인트
- `ClubEditPage`, `ClubCustomizePage` 공통 훅 추가: `useClubPreview`
  - `createPreview(payload)`
  - `loadPreview(token)`
  - `discardPreview(token)`
- 상태 분리:
  - `isPreviewing` / `isSaving` / `previewError`
  - 저장 성공 메시지와 미리보기 생성 성공 메시지 분리
- URL 쿼리로 `previewToken` 보관하면 새로고침 복원 가능

## 백엔드 구현 포인트
- `partner-bff`:
  - 신규 preview 엔드포인트 추가
  - downstream(`content-service`) 호출 오류를 그대로 전달 (null fallback 금지)
- `content-service`:
  - preview draft 저장/조회/삭제 API
  - 렌더 모델 직렬화 규칙을 Public Web과 맞춤

## 보안/권한
- `partnerId`, `clubId` 소유권 검증 필수
- previewToken은 랜덤 UUID + 파트너/클럽 바인딩
- TTL 만료/삭제된 토큰 조회 시 `404`

## 단계별 일정
- 1단계: 클럽 커스터마이징 미리보기(텍스트/이미지/색상)
- 2단계: 클럽 기본정보 + 소셜링크 미리보기 통합
- 3단계: 시설(Venue) 등록/수정 미리보기 확장

## 오픈 이슈
- Public Web 렌더 컴포넌트를 공용 패키지로 분리할지 여부
- 이미지 URL 유효성 검사 시점(클라이언트 vs 서버) 확정 필요
- 미리보기 draft를 저장 API에서 직접 consume할지(2-phase) 결정 필요
