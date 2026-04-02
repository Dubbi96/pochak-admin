# Pochak Task Backlog

## 상태 범례
- `BACKLOG` — 정의됨, 미착수
- `ASSIGNED` — 에이전트 배정됨
- `IN_PROGRESS` — 작업 중
- `REVIEW` — 리뷰 대기
- `DONE` — 완료
- `REJECTED` — 반려, 수정 필요

---

## Phase 1: 기반 안정화

| Task | 제목 | 담당 | 상태 | 의존성 |
|------|------|------|------|--------|
| PCK-001 | Mock API → 실제 BFF API 전환 (web-front) | Frontend Dev | BACKLOG | - |
| PCK-002 | Mock API → 실제 BFF API 전환 (bo-web) | Frontend Dev | BACKLOG | - |
| PCK-003 | Entity-DB 매핑 정합성 검증 | Backend Dev | BACKLOG | - |
| PCK-004 | 보안 감사 잔여 14건 수정 | Backend Dev | BACKLOG | PCK-003 |
| PCK-005 | 인증 플로우 E2E 테스트 (Kakao/Google OAuth) | Tester | BACKLOG | PCK-001 |

## Phase 2: 핵심 기능

| Task | 제목 | 담당 | 상태 | 의존성 |
|------|------|------|------|--------|
| PCK-006 | 영상 재생 플레이어 (HLS.js) 안정화 | Frontend Dev | BACKLOG | PCK-001 |
| PCK-007 | LIVE 스트리밍 API 구현 | Backend Dev | BACKLOG | PCK-003 |
| PCK-008 | VOD/CLIP CRUD API 구현 | Backend Dev | BACKLOG | PCK-003 |
| PCK-009 | 상품/구독 결제 플로우 구현 | Backend Dev | BACKLOG | PCK-003 |
| PCK-010 | BO 대시보드 통계 API + UI | Backend Dev + Frontend Dev | BACKLOG | PCK-002 |

## Phase 3: 폴리싱

| Task | 제목 | 담당 | 상태 | 의존성 |
|------|------|------|------|--------|
| PCK-011 | Web Front 디자인 Figma 정합 | Frontend Dev | BACKLOG | PCK-006 |
| PCK-012 | BO Web 디자인 Figma 정합 | Frontend Dev | BACKLOG | PCK-010 |
| PCK-013 | 전체 테스트 커버리지 90% 달성 | Tester | BACKLOG | PCK-005 |
| PCK-014 | API 스펙 문서 최신화 | Planner | BACKLOG | PCK-007, PCK-008 |
