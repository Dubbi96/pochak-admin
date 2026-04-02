# Pochak 멀티 에이전트 워크플로우

## 역할 구성

| Agent | 파일 | 담당 | 수정 가능 경로 |
|-------|------|------|----------------|
| Planner | `planner.md` | 요구사항 → Task 분해 | `docs/tasks/` |
| Backend Dev | `backend-dev.md` | Spring Boot API, DB | `services/`, `db/` |
| Frontend Dev | `frontend-dev.md` | React/Next.js UI | `clients/` |
| Tester | `tester.md` | 테스트 작성, 커버리지 | `**/test/`, `**/*.test.*` |
| Reviewer | `reviewer.md` | 코드 리뷰, 머지 승인 | 없음 (읽기 전용) |

## 기본 원칙

1. **main에서 직접 작업하지 않는다.** 각 에이전트는 `pck/PCK-NNN-설명` 형식의 브랜치에서 작업한다.
2. **역할 경계를 침범하지 않는다.** Backend Dev는 `clients/`를, Frontend Dev는 `services/`를 수정하지 않는다.
3. **완료는 커밋과 테스트로 증명한다.** "된 것 같다"는 완료가 아니다.
4. **한 Task = 한 브랜치 = 한 PR.** 여러 Task를 한 브랜치에 섞지 않는다.
5. **Reviewer 승인 없이 main에 머지하지 않는다.**

## 작업 흐름

```
[1] Planner
    요구사항 분석 → PCK-NNN Task 생성
    수락 기준 + 담당 에이전트 지정
         ↓
[2] Dev Agent (Backend / Frontend)
    브랜치 생성: pck/PCK-NNN-설명
    TDD: 테스트 먼저 → 구현 → 테스트 통과
    커밋 (PCK-NNN 번호 포함)
         ↓
[3] Tester
    추가 테스트 작성, 커버리지 확인
    수락 기준 체크리스트 검증
         ↓
[4] Reviewer
    diff 리뷰 + 체크리스트
    APPROVE → main 머지 / REJECT → Dev에게 반환
         ↓
[5] main 반영
```

## Task 상태 관리

```
BACKLOG → ASSIGNED → IN_PROGRESS → REVIEW → DONE
                                      ↓
                                   REJECTED → IN_PROGRESS (수정 후 재제출)
```

## 브랜치 네이밍

```
pck/PCK-001-login-api          # 백엔드 Task
pck/PCK-002-login-page-ui      # 프론트엔드 Task
pck/PCK-003-login-e2e-test     # 테스트 Task
```

## 커밋 메시지 형식

```
feat(PCK-001): 로그인 API 엔드포인트 구현

- POST /api/auth/login 구현
- JWT 토큰 발급 로직 추가
- 단위 테스트 3개 통과
```

## Paperclip Heartbeat 연동

각 에이전트는 heartbeat 주기로 다음을 보고한다:
- 현재 Task 번호 및 상태
- 진행률 (%)
- 블로커 유무
- 마지막 커밋 해시

## 에스컬레이션 규칙

- 에이전트가 30분 이상 같은 에러로 막히면 → 사람에게 에스컬레이션
- 스코프 밖 작업이 필요하면 → 해당 역할 에이전트에게 Task 생성 요청
- 아키텍처 변경이 필요하면 → Planner에게 ADR 작성 요청
