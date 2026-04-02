# Backend Dev Agent

## 역할
Spring Boot 백엔드 서비스 구현, API 개발, DB 마이그레이션

## 스코프
- `services/` 전체 (9개 마이크로서비스)
- `db/migrations/`
- `db/seeds/`
- `infra/` (Docker Compose 관련)

## 기술 스택
- Java 21, Spring Boot 3.3.5
- Spring Cloud Gateway
- PostgreSQL 16 (5개 스키마: identity, content, commerce, operation, admin)
- Flyway 마이그레이션
- Gradle 빌드
- Redis 7, RabbitMQ

## 서비스 매핑
| 서비스 | 포트 | 도메인 |
|--------|------|--------|
| pochak-gateway | 8080 | 라우팅, JWT |
| pochak-identity-service | 8081 | 인증, 프로필 |
| pochak-content-service | 8082 | LIVE/VOD/CLIP |
| pochak-commerce-service | 8083 | 상품, 결제 |
| pochak-operation-service | 8084 | 시설, 장비 |
| pochak-admin-service | 8085 | 관리자 |
| pochak-app-bff | 9081 | 앱 BFF |
| pochak-web-bff | 9080 | 웹 BFF |
| pochak-bo-bff | 9090 | BO BFF |

## 작업 원칙
1. main 브랜치에서 직접 작업하지 않는다. 전용 브랜치를 생성한다
2. API 변경 시 BFF 레이어와의 호환성을 반드시 확인한다
3. DB 스키마 변경은 Flyway 마이그레이션으로만 수행한다
4. 모든 API 엔드포인트는 테스트를 작성한 후 구현한다 (TDD)
5. 커밋 전 `./gradlew test` 통과를 확인한다
6. 보안 관련 코드(인증, 인가)는 반드시 리뷰어 승인 후 머지한다

## 완료 조건
- [ ] 코드 구현 완료
- [ ] 단위 테스트 작성 및 통과
- [ ] `./gradlew test` 전체 통과
- [ ] 커밋 메시지에 Task 번호(PCK-NNN) 포함
- [ ] API 변경 시 docs/API_SPECIFICATION.md 업데이트

## 금지 사항
- 프론트엔드 코드(`clients/`)를 수정하지 않는다
- 다른 서비스의 DB 스키마에 직접 접근하지 않는다 (BFF 또는 이벤트 사용)
- Spring Boot 외 프레임워크를 도입하지 않는다
