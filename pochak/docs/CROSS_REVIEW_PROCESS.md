# Pochak — 서비스 안정성/정합성 Cross-Review 프로세스

> 버전: 1.0.0 | 작성: QA Engineer | 날짜: 2026-04-09
> 이슈: [POC-71](/POC/issues/POC-71)

---

## 1. 목적

Agent 간 상호 검토를 통해 구현 품질을 높이고, 서비스 안정성 및 정합성을 보장한다.
단일 Agent가 구현과 검증을 모두 수행하는 방식의 맹점을 제거하고,
독립적 검토자가 APPROVE 해야만 완료 처리되는 구조를 확립한다.

---

## 2. 적용 범위

| 트리거 조건 | 필수 Reviewer |
|------------|---------------|
| Backend 서비스 구현/변경 완료 | QA (API 테스트) → Security (보안 검토) |
| Frontend(Web/App) 구현/변경 완료 | QA (UI 검증) → Backend (API 연동 확인) |
| DB 스키마 변경 (Migration) | Backend (정합성) → QA (영향도) |
| 인프라/배포 변경 | DevOps (검증) → QA (스모크 테스트) |
| 보안 관련 변경 | Security (필수 단독 APPROVE) |

---

## 3. 프로세스 흐름

### 3-A. Backend 구현 완료 시

```
Backend Engineer
  └→ issue 상태: in_review
  └→ comment: "[REVIEW REQUEST] @QA Engineer"
       QA Engineer
         └→ API 테스트 수행 (체크리스트 §4.1)
         └→ comment: "[APPROVE]" 또는 "[REQUEST CHANGES]"
         └→ APPROVE 시 → Security Engineer에 알림
           Security Engineer
             └→ 보안 검토 수행 (체크리스트 §4.2)
             └→ comment: "[APPROVE]" 또는 "[REQUEST CHANGES]"
             └→ 전원 APPROVE → Backend가 status=done
```

### 3-B. Frontend 구현 완료 시

```
Frontend Engineer
  └→ issue 상태: in_review
  └→ comment: "[REVIEW REQUEST] @QA Engineer"
       QA Engineer
         └→ UI 검증 수행 (체크리스트 §4.3)
         └→ comment: "[APPROVE]" 또는 "[REQUEST CHANGES]"
         └→ APPROVE 시 → Backend Engineer에 알림
           Backend Engineer
             └→ API 연동 확인 (체크리스트 §4.4)
             └→ comment: "[APPROVE]" 또는 "[REQUEST CHANGES]"
             └→ 전원 APPROVE → Frontend가 status=done
```

---

## 4. 검토 체크리스트

### 4.1 QA — Backend API 테스트

- [ ] 정상 케이스 응답 코드 및 바디 검증 (2xx)
- [ ] 필수 필드 누락 시 400 반환 확인
- [ ] 인증 없는 요청 시 401 반환 확인
- [ ] 권한 없는 역할로 요청 시 403 반환 확인
- [ ] 존재하지 않는 리소스 요청 시 404 반환 확인
- [ ] 페이지네이션 파라미터(page, size, sort) 동작 확인
- [ ] X-Correlation-Id 헤더 전파 확인
- [ ] 응답 스키마가 API_SPECIFICATION과 일치 확인
- [ ] DB 실제 반영 여부 (side-effect) 확인
- [ ] 이벤트 발행 필요 시 RabbitMQ 메시지 발행 확인

### 4.2 Security Engineer — 보안 검토

- [ ] JWT 검증 우회 가능성 없음 확인
- [ ] SQL Injection / OGNL Injection 방어 확인
- [ ] IDOR(객체 수준 인가) 취약점 없음 확인
- [ ] 민감 데이터(PII, 토큰) 응답에 미포함 확인
- [ ] Rate Limit 적용 여부 (필요한 엔드포인트)
- [ ] CORS 정책 적절성 확인
- [ ] 파일 업로드 시 Content-Type / 크기 제한 확인
- [ ] 비밀값(secret, key) 하드코딩 없음 확인
- [ ] SECURITY_AUDIT_REPORT.md 기존 이슈 재발 없음 확인

### 4.3 QA — Frontend UI 검증

- [ ] 정상 데이터 렌더링 확인
- [ ] 빈 상태(empty state) / 로딩 상태 표시 확인
- [ ] 에러 응답 시 사용자 피드백 메시지 확인
- [ ] 권한별 UI 분기 (BO 관리자 vs 일반 사용자) 확인
- [ ] 반응형 레이아웃 (모바일/태블릿/데스크탑) 확인
- [ ] API 호출 시 올바른 Gateway 경로 사용 확인
- [ ] 로그인/로그아웃 후 상태 초기화 확인
- [ ] WCAG AA 수준 접근성 기본 항목 확인

### 4.4 Backend Engineer — API 연동 확인

- [ ] Frontend가 호출하는 엔드포인트가 Gateway에 라우트되어 있음 확인
- [ ] 요청/응답 DTO 타입이 Frontend 기대값과 일치 확인
- [ ] 페이지네이션 응답 구조 (totalElements, content[]) 일치 확인
- [ ] 서비스 간 이벤트(RabbitMQ) 전파로 인한 Frontend 상태 변경 확인
- [ ] BFF 레이어에서 불필요한 데이터 노출 없음 확인

---

## 5. 코멘트 작성 형식 (Paperclip 이슈)

### APPROVE

```markdown
## [APPROVE] {역할} Cross-Review

**검토 대상**: {이슈 제목}
**검토일**: YYYY-MM-DD
**검토자**: {Agent 이름}

### 통과 항목
- [x] (체크리스트 항목)

### 특이사항
- (없으면 "없음")

> ✅ APPROVE — 다음 검토 단계로 진행 가능
```

### REQUEST CHANGES

```markdown
## [REQUEST CHANGES] {역할} Cross-Review

**검토 대상**: {이슈 제목}
**검토일**: YYYY-MM-DD
**검토자**: {Agent 이름}

### 실패 항목
- [ ] (실패한 체크리스트 항목 + 재현 방법)

### 요청 사항
1. {구체적인 수정 요청}

> ❌ REQUEST CHANGES — 수정 후 재검토 요청
```

---

## 6. 이슈 상태 전환 규칙

| 상태 | 전환 조건 |
|------|-----------|
| `in_progress` → `in_review` | 구현 Agent가 직접 전환 + [REVIEW REQUEST] 코멘트 |
| `in_review` → `in_progress` | Reviewer가 [REQUEST CHANGES] → 구현 Agent 재작업 |
| `in_review` → `done` | **모든** 필수 Reviewer가 [APPROVE] 코멘트 게시 후 구현 Agent가 전환 |
| `in_review` → `blocked` | 외부 의존성으로 검토 불가 시 |

> **원칙**: 구현 Agent 본인은 자신의 이슈를 `done`으로 전환할 수 없다. 반드시 Reviewer APPROVE 후 전환.

---

## 7. 에스컬레이션

- Reviewer가 48시간 내 응답 없으면 → CEO에게 에스컬레이션
- [REQUEST CHANGES] 3회 반복 시 → CEO가 해결 방향 결정
- 보안 Critical 이슈 발견 시 → Security가 즉시 CEO에 알림 + 이슈 `blocked` 처리
