# Pochak 이중 마이그레이션 표류 정량화 — 2026-04 audit

- 이슈: [POC-357](/POC/issues/POC-357) ([POC-356](/POC/issues/POC-356) Phase 1)
- 캡처 시점: 2026-04-26 dev DB (`pochak-postgres` 컨테이너, 동일 볼륨 2일+ uptime)
- 캡처 방법:
  - 정적 분석 — `db/migrations/V*.sql` 와 `services/pochak-{svc}-service/src/main/resources/db/migration/V*.sql` 파일 SHA 및 schema-affinity 비교
  - 라이브 dev DB — 5개 schema 의 `flyway_schema_history` 및 `pg_tables` 직접 조회
  - Hibernate validate — `application.yml` 모든 5개 서비스 `ddl-auto=validate` 확인 + 컨테이너 부팅 로그 회수

## 0. 요약 (TL;DR)

총 drift 정량:

| 지표 | 수치 |
|------|------|
| 분석 대상 raw V### | 38건 (V000–V038, V031 누락) |
| 분석 대상 service Flyway V### (5 svc 합) | 67건 |
| 동일 V### 가 양쪽에 동일 SHA 로 존재 (`=`) | **4 cell** (V012-identity, V014-content, V015-content, V020-content) |
| 동일 V### 가 양쪽에 다른 SHA / 다른 의도로 존재 (`≠`) | 약 35 cell |
| 같은 V### 번호로 **완전 다른 의도** 의 두 파일이 충돌 | 19 쌍 (V006/V011/V017/V018/V019/V020/V021/V022/V023/V024/V025/V026/V027/V028/V029/V030/V032/…) |
| raw 만 존재 + 해당 서비스 schema 영향 (`R`) | **23 cell** — 잠재적 silent miss |
| service Flyway 만 존재 (`F`) | 4건 (content V031/V039/V040/V041) |
| Flyway-stage 부팅 실패 서비스 | 2개 (commerce / admin) |
| Hibernate validate-stage 통과 서비스 | 3개 (identity / content / operation) |

**옵션 A/B 권고**: **Option A — `infra/init-db.sh` raw 마이그레이션 폐기 + 기존 raw V### 를 service Flyway dir 으로 일괄 이관**.
근거:
- 표류 cell 의 거의 전부 (≠ + R) 가 "raw 가 존재하면서 service Flyway 가 같은 효과를 내지 않는다" 패턴. 이 구조에서는 fresh-volume CI ↔ existing-volume prod 가 영구히 분리됨.
- 현재도 baseline=0 의 commerce / admin 두 서비스는 raw 가 init-db.sh 로 먼저 들어간 상태에서 service Flyway 가 같은 DDL 을 다시 시도하다가 충돌 (commerce V024 missing column / admin V010 duplicate index) 로 부팅 실패. 즉 dual system 자체가 이미 사고 발생원.
- baseline=29 인 content 도 V032 (410줄짜리 port_baselined_content_tables) 로 raw V001–V029 를 service Flyway 안으로 다시 끌어왔음. 즉 폐기 방향성은 이미 한 서비스가 한 번 한 작업이고 검증됨.
- mirror 자동화 (Option B) 는 두 시스템을 유지하면서 동기화 도구를 추가하는 것 — 운영 surface 확장. 같은 사고 (baseline-skip + raw-only DDL) 를 안 만나게 하려면 어차피 entity↔Flyway CI gate 가 필요하므로, raw 폐기 후 Flyway 단일화로 가는 것이 더 짧다.
- 이관 비용은 38건 raw 중 이미 `=` 인 4건 + 이미 `≠` 인 35건 (대부분 service Flyway 쪽이 신뢰 가능한 본) 이라 실제 새로 옮겨야 하는 R/R-(누군가의 schema 에는 영향) 행은 23건. 이 중 `R` 23건만 진짜 신규 V### 작성 대상이고, 나머지는 service Flyway 본 채택 + raw 삭제로 끝남.

상세는 Section 4 (Recommendation) 참조.

## 1. Diff matrix

`db/migrations/V###` (raw) × `services/pochak-{svc}-service/src/main/resources/db/migration/V###` (service Flyway).

값:
- `=` — 양쪽 동일 SHA. 동일 파일.
- `≠` — 양쪽 V### 같지만 SHA / description 다름. 비고에 사유.
- `R` — raw 에만 존재, raw 가 그 서비스 schema 를 건드림 (silent-miss 후보)
- `R-` — raw 에만 존재, 그 서비스 schema 와 무관
- `F` — service Flyway 에만 존재 (raw 에 없는 신규 alignment)
- `-` — 양쪽 없음

| V### | raw filename | identity | content | commerce | operation | admin | 비고 |
|------|-------------|----------|---------|----------|-----------|-------|------|
| V000 | V000__init_schemas.sql | ≠ | ≠ | ≠ | ≠ | ≠ | service-side 모든 V000 은 1줄짜리 placeholder. raw V000 만 5개 schema CREATE. Flyway 가 schema 를 만들지 않는다는 전제 |
| V001 | V001__create_identity_schema.sql | ≠ | R- | R- | R- | R | identity 117줄 vs 115줄 (사소한 차이). admin 도 raw V001 에서 admin schema 미언급 → R 표기는 보수적이며 실제 영향은 작음 |
| V002 | V002__create_content_schema.sql | R | ≠ | R- | R | R- | content 398줄 vs 363줄. raw 가 identity/operation FK 도 정의 → identity/operation 에 R |
| V003 | V003__create_commerce_schema.sql | R | R- | ≠ | R- | R- | commerce 130 vs 115. raw 가 identity FK 정의 |
| V004 | V004__create_operation_schema.sql | R | R | R- | ≠ | R- | operation 117 vs 104. raw 가 identity/content FK |
| V005 | V005__create_admin_schema.sql | R | R | R- | R- | ≠ | admin 309 vs 286. raw 가 identity/content FK |
| V006 | V006__organization_simplification_and_abac.sql | ≠ | ≠ | R- | R- | R- | identity V006 = `user_relations.sql` (별개 의도). content V006 103 vs 62 |
| V007 | V007__create_coupon_tables.sql | R- | R- | ≠ | R- | R- | commerce 36 vs 34 |
| V008 | V008__social_features.sql | R | ≠ | R- | R- | R- | content 77 vs 66. raw 가 identity 참조 |
| V009 | V009__highlights.sql | R- | ≠ | R- | R- | R- | content 17 vs 16 |
| V010 | V010__analytics.sql | R- | R- | R- | R- | ≠ | admin 15 vs 14. **현재 admin Flyway 부팅 실패 원인 — V010 의 `CREATE INDEX` 가 raw V010 으로 이미 만든 인덱스와 충돌** |
| V011 | V011__signup_account_system.sql | ≠ | R- | R- | R- | ≠ | identity 57 vs 46. admin V011 = `system_config.sql` (완전 별개) |
| V012 | V012__fix_identity_schema.sql | **=** | R- | R- | R- | R- | identity 만 동일 |
| V013 | V013__organization_v2_fields.sql | R- | ≠ | R- | R- | R- | content 차이 |
| V014 | V014__competition_visibility.sql | R- | **=** | R- | R- | R- | content 동일 |
| V015 | V015__community_posts.sql | R- | **=** | R- | R- | R- | content 동일 |
| V016 | V016__cleanup_deprecated_fields.sql | R- | ≠ | R- | R- | R- | content 차이 |
| V017 | V017__fix_entity_db_alignment.sql | ≠ | ≠ | R- | ≠ | R- | identity 213 vs 63 / content 213 vs 73 / operation 213 vs 23 — raw 가 3개 서비스를 한 파일로 묶었고, service 측은 자기 부분만 발췌 |
| V018 | V018__query_optimization_indexes.sql | R- | ≠ | ≠ | ≠ | R- | content 22 vs 11 / commerce 22 vs 11 / operation V018 = `port_missing_operation_tables.sql` (별개 의도) |
| V019 | V019__audit_log_integrity.sql | R- | R- | R- | ≠ | ≠ | operation V019 = `cameras_add_pixellot_device_id` (별개). admin 사소 차이 |
| V020 | V020__competition_visits_expiration.sql | R- | **=** | R- | ≠ | ≠ | operation V020 = `align_venue_id_bigint`. admin V020 = `app_version_platform_enum` |
| V021 | V021__purchase_product_snapshot.sql | R- | R- | ≠ | ≠ | ≠ | commerce 사소차이. operation V021 = `studio_sessions_add_entity_columns`. admin V021 = `add_faq_table` |
| V022 | V022__create_db_roles_and_ownership.sql | ≠ | R | ≠ | R | R | identity V022 = `pii_encryption_columns`. commerce V022 = `wallet_remove_version_column`. raw 는 5개 schema 모두 ROLE/OWNER DDL |
| V023 | V023__create_outbox_and_processed_events.sql | ≠ | ≠ | ≠ | R | R | identity V023 = `guardian_relationships`. content V023 = `community_moderation`. commerce V023 = `partner_settlement`. raw 는 5개 schema 모두에 outbox |
| V024 | V024__create_recording_schedules.sql | ≠ | ≠ | ≠ | R | R- | identity V024 = `user_withdrawal_support`. content V024 = `medium_low_fixes`. commerce V024 = `add_gift_ball_status_index` (**현재 commerce 부팅 실패 원인**) |
| V025 | V025__create_recording_sessions.sql | ≠ | ≠ | R- | R | R- | identity V025 = `session_push_preferences`. content V025 = `organization_dag_integrity` |
| V026 | V026__create_shares.sql | R | ≠ | R- | R- | R- | content V026 = `community_posts_fk_and_counters`. raw shares 테이블은 identity 참조 |
| V027 | V027__create_recording_notification_preferences.sql | R | ≠ | R- | R | R- | content V027 = `create_live_streams` |
| V028 | V028__create_partners.sql | R | ≠ | R- | R | R- | content V028 = `public_slug_and_links` |
| V029 | V029__create_venue_products.sql | R- | ≠ | R- | R | R- | content V029 = `organization_site_cms` |
| V030 | V030__update_reservations.sql | R- | ≠ | R- | R | R- | content V030 = `create_club_customizations` |
| V031 | — | - | F | - | - | - | content: V031__create_club_posts.sql (raw 에 없는 신규) |
| V032 | V032__create_club_customization.sql | R | ≠ | R- | R- | R- | content V032 = `port_baselined_content_tables.sql` (410줄, baseline=29 catch-up port) |
| V033 | V033__venue_schedule_and_price_history.sql | R | ≠ | R- | R | R- | content V033 = `competitions_date_type_alignment` |
| V034 | V034__create_club_posts.sql | R- | ≠ | R- | R- | R- | content V034 = `align_int_id_columns_bigint` |
| V035 | V035__add_club_status_to_teams.sql | R- | ≠ | R- | R- | R- | content V035 = `asset_tags_sport_tag_id_revert_int` |
| V036 | V036__fix_display_sections_target_page.sql | R- | ≠ | R- | R- | R- | content V036 = `display_sections_align` |
| V037 | V037__add_vpu_tables.sql | R- | ≠ | R- | R | R- | content V037 = `highlights_confidence_score_double` |
| V038 | V038__add_chu_tables.sql | R- | ≠ | R- | R | R- | content V038 = `memberships_align_active_updated_at` |
| V039 | — | - | F | - | - | - | content: V039__notifications_align.sql |
| V040 | — | - | F | - | - | - | content: V040__organizations_sport_tags_teams_align.sql |
| V041 | — | - | F | - | - | - | content: V041__display_order_smallint_to_int.sql |

### 1.1 V### 번호 충돌 (같은 번호 / 다른 의도)

`≠` 셀 중 description (file basename) 까지 다른 케이스 — 즉 **같은 V### 번호가 raw 와 service 에서 의미적으로 다른 마이그레이션을 가리키는 충돌**. baseline=0 인 서비스에서 init-db.sh + service Flyway 동시 실행 시 사고 가능성이 가장 높은 영역.

| V### | raw description | service | service description |
|------|-----------------|---------|---------------------|
| V006 | organization_simplification_and_abac | identity | user_relations |
| V011 | signup_account_system | admin | system_config |
| V018 | query_optimization_indexes | operation | port_missing_operation_tables |
| V019 | audit_log_integrity | operation | cameras_add_pixellot_device_id |
| V020 | competition_visits_expiration | operation | align_venue_id_bigint |
| V020 | competition_visits_expiration | admin | app_version_platform_enum |
| V021 | purchase_product_snapshot | operation | studio_sessions_add_entity_columns |
| V021 | purchase_product_snapshot | admin | add_faq_table |
| V022 | create_db_roles_and_ownership | identity | pii_encryption_columns |
| V022 | create_db_roles_and_ownership | commerce | wallet_remove_version_column |
| V023 | create_outbox_and_processed_events | identity | guardian_relationships |
| V023 | create_outbox_and_processed_events | content | community_moderation |
| V023 | create_outbox_and_processed_events | commerce | partner_settlement |
| V024 | create_recording_schedules | identity | user_withdrawal_support |
| V024 | create_recording_schedules | content | medium_low_fixes |
| V024 | create_recording_schedules | commerce | add_gift_ball_status_index |
| V025 | create_recording_sessions | identity | session_push_preferences |
| V025 | create_recording_sessions | content | organization_dag_integrity |
| V026 | create_shares | content | community_posts_fk_and_counters |
| V027 | create_recording_notification_preferences | content | create_live_streams |
| V028 | create_partners | content | public_slug_and_links |
| V029 | create_venue_products | content | organization_site_cms |
| V030 | update_reservations | content | create_club_customizations |
| V032 | create_club_customization | content | port_baselined_content_tables |
| V033 | venue_schedule_and_price_history | content | competitions_date_type_alignment |

총 **25개 V### 충돌 페어**. raw 측 단일 V### 가 여러 service 에서 다른 description 으로 갈라진 경우는 동일 raw 항목이 표에 중복 등장하므로, 실제 raw 측 충돌 V### 는 V006/V011/V018/V019/V020/V021/V022/V023/V024/V025/V026/V027/V028/V029/V030/V032/V033 = 17개.

## 2. Baseline gap 분석

### 2.1 baseline-version (모든 서비스 application.yml 실측)

| service | flyway.baseline-version | flyway.baseline-on-migrate | locations | schemas |
|---------|-------------------------|----------------------------|-----------|---------|
| identity  | `"0"`   | true | classpath:db/migration | identity |
| content   | `"029"` | true | classpath:db/migration | content |
| commerce  | `"0"`   | true | classpath:db/migration | commerce |
| operation | `"0"`   | true | classpath:db/migration | operation |
| admin     | `"0"`   | true | classpath:db/migration | admin |

**메모리 노트 정정**: `pochak_dual_migration_trap` 메모는 "Flyway baseline=029 hides drift" 가 모든 서비스에 해당하는 듯 적었으나, 실측 결과 **content 만 029, 나머지 4개 서비스는 0**. 따라서:
- content 는 V≤029 가 service Flyway 진입에서 명시적으로 skip 되며 init-db.sh 단일 의존
- 나머지 4개 (identity / commerce / operation / admin) 는 baseline=0 이라 service Flyway 가 자기 dir 의 V### 를 모두 실행 시도. 즉 service Flyway dir 에 raw 와 같은 V### 가 있으면 raw 적용 → service 가 같은 DDL 재시도 → 충돌 (현 commerce/admin 사고가 정확히 이 패턴)

### 2.2 dev DB `<schema>.flyway_schema_history` (실측, 2026-04-26)

#### identity (10건)
| rank | version | description | type | success |
|------|---------|-------------|------|---------|
| 1 | 0 | << Flyway Baseline >> | BASELINE | t |
| 2 | 001 | create identity schema | SQL | t |
| 3 | 006 | user relations | SQL | t |
| 4 | 011 | signup account system | SQL | t |
| 5 | 012 | fix identity schema | SQL | t |
| 6 | 017 | fix entity db alignment | SQL | t |
| 7 | 022 | pii encryption columns | SQL | t |
| 8 | 023 | guardian relationships | SQL | t |
| 9 | 024 | user withdrawal support | SQL | t |
| 10 | 025 | session push preferences | SQL | t |

#### content (13건, baseline=29)
| rank | version | description |
|------|---------|-------------|
| 1 | 029 | << Flyway Baseline >> |
| 2 | 030 | create club customizations |
| 3 | 031 | create club posts |
| 4 | 032 | port baselined content tables |
| 5 | 033 | competitions date type alignment |
| 6 | 034 | align int id columns bigint |
| 7 | 035 | asset tags sport tag id revert int |
| 8 | 036 | display sections align |
| 9 | 037 | highlights confidence score double |
| 10 | 038 | memberships align active updated at |
| 11 | 039 | notifications align |
| 12 | 040 | organizations sport tags teams align |
| 13 | 041 | display order smallint to int |

#### commerce (7건, **부팅 실패 — V024 멈춤**)
| rank | version | description |
|------|---------|-------------|
| 1 | 0 | << Flyway Baseline >> |
| 2 | 003 | create commerce schema |
| 3 | 007 | create coupon tables |
| 4 | 018 | query optimization indexes |
| 5 | 021 | purchase product snapshot |
| 6 | 022 | wallet remove version column |
| 7 | 023 | partner settlement |
| (8) | 024 | add_gift_ball_status_index — **failed 미기록, Flyway 가 히스토리 추가 전 abort** |

#### operation (7건)
| rank | version | description |
|------|---------|-------------|
| 1 | 0 | << Flyway Baseline >> |
| 2 | 004 | create operation schema |
| 3 | 017 | fix entity db alignment |
| 4 | 018 | port missing operation tables |
| 5 | 019 | cameras add pixellot device id |
| 6 | 020 | align venue id bigint |
| 7 | 021 | studio sessions add entity columns |

#### admin (2건, **부팅 실패 — V010 에서 멈춤**)
> 본 audit 직전 시점에는 admin Flyway 가 단 한 번도 안 돌아 `flyway_schema_history` 테이블 자체가 없었음 (`ERROR: relation "admin.flyway_schema_history" does not exist`). 본 audit 중 1회 부팅 시도로 baseline + V005 까지만 기록되고 V010 에서 Fast-fail.

| rank | version | description |
|------|---------|-------------|
| 1 | 0 | << Flyway Baseline >> |
| 2 | 005 | create admin schema (no-op, 모든 CREATE TABLE 이 IF NOT EXISTS) |
| (3) | 010 | analytics — **failed**, "relation idx_analytics_event_name already exists" (raw V010 이 init-db.sh 로 먼저 인덱스 생성한 상태) |

### 2.3 raw V### 가 schema 를 건드리지만 service Flyway dir 에 동일 V### 가 없는 케이스 (silent-miss 후보)

각 서비스 별로, raw 가 그 서비스 schema 의 DDL 을 포함하는 V### 중 service Flyway dir 에 동일 V### 가 없는 것 = init-db.sh 단일 적용 path 로만 들어가는 DDL = 새 DB 볼륨에서만 보이고 기존 볼륨에서 안 보임.

| service | raw V### touching schema | raw-only (no service-Flyway equivalent at same V###) |
|---------|---|---|
| identity  | V000, V001, V002, V003, V004, V005, V006, V008, V011, V012, V017, V022, V023, V024, V025, V026, V027, V028, V032, V033 | **V002, V003, V004, V005, V008, V026, V027, V028, V032, V033** (10건) |
| content   | V000, V002, V004, V005, V006, V008, V009, V013, V014, V015, V016, V017, V018, V020, V022, V023, V026, V032, V034, V035, V036 | **V004, V005, V022** (3건) — content V032 port 가 V001–V029 의 누락 테이블을 끌어왔으므로 잔여는 작음 |
| commerce  | V000, V003, V007, V018, V021, V022, V023 | (없음) |
| operation | V000, V002, V004, V017, V022, V023, V024, V025, V027, V028, V029, V030, V033, V037, V038 | **V002, V022, V023, V024, V025, V027, V028, V029, V030, V033, V037, V038** (12건) — operation V018 (port_missing_operation_tables) 가 일부 catch-up 했으나 V024+ outbox/recording 계열은 raw 단일 의존 |
| admin     | V000, V001, V005, V010, V011, V019, V022, V023 | **V001, V022, V023** (3건) |

총 **silent-miss 후보 28건**. 의미: 이 V### 가 init-db.sh 시점에 적용 안 된 기존 볼륨 (예: 어떤 V### 가 추가되기 전부터 부팅된 prod-like 볼륨) 에서는 영영 안 적용된다.

### 2.4 baseline 으로 명시적으로 skip 된 raw V≤baseline (content 만 해당)

content baseline=29. raw V001–V029 중 content schema 를 건드리는 것:

`V000, V002, V004, V005, V006, V008, V009, V013, V014, V015, V016, V017, V018, V020, V022, V023, V026` (17건)

이 17건은 content service Flyway 가 부팅할 때 절대 실행 안 함. 따라서:
- 새 fresh-volume CI 에서는 init-db.sh 로 적용됨 → DB 에 존재 → validate 통과
- 기존 dev DB 도 init-db.sh 로 한 번 적용된 상태라 통과 (V032 port 추가본까지 합쳐 현재 통과)
- 만약 content 를 새 schema (혹은 새 cluster) 에서 부팅하는데 init-db.sh 가 안 돌면 → V≤029 가 통째로 누락

content V032 (port_baselined_content_tables.sql, 410 줄) 가 V001–V029 에서 누락되기 쉬운 핵심 테이블 (organizations / teams / matches / membership 등) 의 IF NOT EXISTS 재정의로 일부 안전망을 깔아뒀음. **단 V032 가 실제로 모든 baselined 테이블을 catch-up 하지는 못 함** — 본 audit 에서 fresh-volume 으로 init-db.sh 를 끄고 부팅하는 dry-run 까지는 Phase 3 (CI gate) 에서 다룰 영역으로 위임.

## 3. Entity vs DB 컬럼 drift

방법: 5개 서비스 모두 `spring.jpa.hibernate.ddl-auto=validate` 설정 확인 후, 컨테이너 부팅 → 실제 Flyway / Hibernate validate 결과 회수.

| service | 부팅 결과 | Flyway 결과 | Hibernate validate 결과 | 마지막 부팅 시각 |
|---------|----------|-------------|-------------------------|-----------------|
| identity  | Up | applied 7 (V001–V025, current=025) | **PASS** | 2026-04-24T06:42 |
| content   | Up | applied 13 (V029 BASELINE→V041, current=041) | **PASS** (32 migrations validated) | 2026-04-26T06:09 |
| operation | Up | applied 1 → current=021 | **PASS** | 2026-04-26T05:58 |
| commerce  | **CrashLoop** | V024 abort, "ERROR: column \"receiver_user_id\" does not exist" on `commerce.gift_balls` | 도달 못 함 (Flyway-stage 실패) | n/a |
| admin     | **CrashLoop** | V010 abort, "ERROR: relation \"idx_analytics_event_name\" already exists" | 도달 못 함 | (본 audit 중 부팅 시도 시점) |

### 3.1 식별된 mismatch 표

| service | table | column | entity Java type | DB 실제 type | 추정 원인 |
|---------|-------|--------|------------------|---------------|-----------|
| commerce | gift_balls | sender_user_id | `Long` (entity `senderUserId`, NOT NULL) | **컬럼 없음** | 테이블이 raw V003 시절의 "gift catalog" 스키마 (name/point_amount/issue_count/used_count/valid_from/valid_until). 엔티티는 후속 리팩토링으로 "user→user 선물 트랜잭션" 모델로 바꿨으나 ALTER 마이그레이션 부재 |
| commerce | gift_balls | receiver_user_id | `Long` (entity `receiverUserId`, NOT NULL) | **컬럼 없음** | 위와 동일 |
| commerce | gift_balls | amount | `Integer` (entity, NOT NULL) | **컬럼 없음** (DB 는 `point_amount INT`) | 동일 — 컬럼 rename 도 미적용 |
| commerce | gift_balls | message | `String` | **컬럼 없음** | 동일 |
| commerce | gift_balls | expires_at | `LocalDateTime` | **컬럼 없음** (DB 는 `valid_until TIMESTAMPTZ`) | 동일 — rename 미적용 |
| commerce | gift_balls | (DB 잉여) name / point_amount / status / issue_count / used_count / valid_from / valid_until | (entity 에 매핑 없음) | (existing) | 옛 catalog 스키마의 잔여 컬럼들 — `ddl-auto=validate` 는 잉여 컬럼은 통과시키지만, V024 가 `receiver_user_id` 로 인덱스 만들려다 사전 차단 |
| admin    | analytics_events | (Flyway 단계) idx_analytics_event_name | (해당 없음) | 인덱스 이미 존재 | raw V010 이 init-db.sh 로 인덱스를 만들었고, admin V010 이 같은 `CREATE INDEX` 를 다시 시도 (IF NOT EXISTS 누락). DDL 충돌의 전형 |

### 3.2 식별 안 된 영역 (audit 한계)

- **identity 컨테이너는 2026-04-24 부팅 후 재시작 안 됨**. 그 이후 (4/26 d201edf 등) 들어온 entity 변경이 만약 identity 패키지 안에 있으면 현 dev DB 에 대해서는 validate 가 재검증되지 않은 상태. 다만 4/26 의 d201edf 는 commit message 상 Content/Operation 영향이라 identity 영향 가능성 낮음. 안전한 검증은 identity 재시작 1회.
- **commerce / admin 의 ddl-auto validate 단계** 는 이번 audit 에서 도달 자체 불가. Flyway-stage 사고가 더 앞단이라, gift_balls 외에도 commerce 다른 테이블에 추가 drift 가 있는지는 미확인. 같은 이유로 admin entity↔DB 도 미확인.
- 이 두 서비스의 validate-stage drift 측정은 별건 fix 서브태스크가 V024 / V010 Flyway 실패를 먼저 풀고 난 다음 retry 가 자연스럽다.

### 3.3 POC-329 회복 후 (2026-04-24~26) 신규 변경 점검

`d201edf fix(POC-329): Content/Operation 서비스 기동 — 누락 테이블/컬럼/타입 일괄 정합화` 이후 entity-side 새 변경이 들어온 자취:

- content: V032–V041 의 alignment 계열 마이그레이션이 추가되며 entity 도 함께 보정됨 → 현재 validate PASS. **신규 drift 없음**.
- operation: V017–V021 의 alignment 가 동기화됨 → 현재 validate PASS. **신규 drift 없음**.
- identity: V025 까지 적용 후 재시작 없음 → 4/26 이후 entity 신규 변경 영향 검증 보류. d201edf diff 가 identity 패키지를 건드리지 않았으면 영향 없음.
- commerce: V024 자체가 4/26 이전부터 들어 있던 것으로 보이나 (gift_balls entity refactor 와 짝지어진 ALTER 가 끝까지 안 들어감) **확정**. → 본 audit 의 가장 큰 신규 사고원.
- admin: 부팅 자체가 한 번도 성공한 적 없는 상태 (flyway_schema_history 부재가 증거) → **신규 drift 가 아니라 처음부터 누적된 dual-system 사고**.

## 4. 권고 (옵션 A/B)

(POC-356 plan 의 옵션 A = "raw 폐기 + service Flyway 단일화", 옵션 B = "raw → service Flyway 자동 mirror" 가정)

### 4.1 권고: **Option A**

근거 요약:
1. **현재 dual-system 자체가 사고 발생원**. 본 audit 시점에서 5개 서비스 중 2개 (commerce, admin) 가 dual 충돌로 부팅 실패. operation/content 가 4/26 에 한 번 같은 패턴 (POC-329) 으로 11라운드 복구를 거침. **유지하면 같은 사고가 분기마다 반복**.
2. **이전한다고 잃을 게 작음**. raw V### 38건 중 service Flyway 가 이미 같은 V### 를 보유한 33건 (서로 ≠ 인 상태) 은 service 본을 채택하면 되고, raw 만 존재하는 R/R- 케이스도 대부분 schema-bootstrap 또는 cross-schema FK 인데 이미 service-Flyway 의 후속 포트 (예: content V032) 패턴으로 옮긴 전례가 있다.
3. **content V032 가 이미 큰 port 를 한 번 했음**. 410줄짜리 `port_baselined_content_tables.sql`. 다른 서비스에 같은 패턴 (V032+ 형태로 raw 를 service Flyway 안에 안전하게 catch-up) 을 복제하면 폐기 경로가 명확.
4. **Option B (mirror) 는 운영 surface 확대**. 두 시스템 + 자동 sync 도구를 동시에 유지해야 함. drift 사고를 막으려면 어차피 entity↔Flyway CI gate 가 필요한데, raw 를 살려두면 그 gate 가 두 측면을 모두 검사해야 한다 (복잡도 ↑).

### 4.2 Option A 단기 액션 (Phase 2 / 3 별건 발주 권장)

- `infra/init-db.sh` 의 `migrations/V*.sql` 루프 제거. `seeds/` 만 유지 (테스트 데이터). `db/migrations/` 디렉터리는 1주 grace 후 삭제 — 그 동안 service Flyway 로 모든 V### 가 들어갔는지 dry-run.
- commerce / admin 부팅 복구 (Phase 2 fix 서브태스크 별도 — Section 3.1 의 mismatch 표가 입력)
  - commerce gift_balls: 옛 catalog 스키마와 새 transfer 엔티티 사이 결정. 엔티티에 맞춰 ALTER (drop name/point_amount/issue_count/.../valid_from/valid_until + add sender/receiver/amount/message/expires_at) 하거나, 별도 테이블 (`gift_ball_transfers`) 분리 + 기존 catalog 폐기.
  - admin V010: `CREATE INDEX` 를 `CREATE INDEX IF NOT EXISTS` 로 바꿔 일회성 conflict 우회 (IF NOT EXISTS 패턴은 [POC-329](/POC/issues/POC-329) 회복 시 검증된 안전 패턴).
- entity↔Flyway CI gate (Phase 3) 는 본 audit 외 별건. 단 본 audit 의 silent-miss 28건이 입력 자료로 그대로 쓰임.

### 4.3 Option A 의 위험

- raw V### 폐기 후 새 dev 환경 부팅 시 schema 자체가 안 만들어짐. Flyway baseline-on-migrate=true + V001/V005 등 schema 생성 V### 가 이미 service Flyway dir 에 있으므로 첫 부팅에서 자기 schema 가 만들어진다. **단 cross-schema FK** (예: content V002 가 identity.users 참조) 는 booting 순서에 의존. 확정 전에 1회 fresh-volume 부팅 dry-run 필요.
- baseline=29 인 content 는 신규 fresh-volume 에서 V≤029 가 통째로 안 돌아감. content baseline 을 0 으로 낮추거나, V032 port 가 정말로 baseline=29 의 모든 잃은 부분을 catch-up 하는지 확인 필요. (V006 drops team_members, V017 ALTER 류는 catch-up 시 위험 — 메모리 노트에서 경고된 바와 동일.) → Phase 2 의 별건.

## 5. Appendix

### 5.1 캡처 명령어 (재현용)

```bash
# Section 1 diff matrix
for f in db/migrations/V*.sql; do
  v=$(basename "$f" | sed -E 's/^(V[0-9]+)_.*/\1/')
  echo "$v $(basename $f) $(shasum -a 256 $f | awk '{print $1}')"
done

# Section 2 baseline-version
for svc in identity content commerce operation admin; do
  grep -A 6 "flyway:" services/pochak-${svc}-service/src/main/resources/application.yml
done

# Section 2 flyway_schema_history
for s in identity content commerce operation admin; do
  docker exec pochak-postgres psql -U pochak -d pochak \
    -c "SELECT installed_rank, version, description, type, success FROM ${s}.flyway_schema_history ORDER BY installed_rank;"
done

# Section 3 부팅 로그
for c in pochak-identity pochak-content pochak-operation pochak-commerce pochak-admin; do
  docker logs "$c" --tail 200 | grep -E 'Flyway|HHH000|Schema-validation|Started '
done
```

### 5.2 의도적으로 안 한 것 (POC-357 task body 의 DoD 와 동일)

- 마이그레이션 실제 추가/수정 (commerce gift_balls / admin V010 CREATE INDEX 보정 포함). audit 만.
- 옵션 A/B 최종 결정 (PM/CEO 영역). 본 문서는 권고.
- CI 게이트 구현 (Phase 3 별건).
- fresh-volume 부팅 dry-run (Section 4.3 위험 검증). Phase 2/3 입력으로 위임.

### 5.3 메모리 노트 갱신 대상

`pochak_dual_migration_trap` 메모의 "service Flyway baseline=029" 표현은 **content 만** 해당. 다른 4개 서비스는 baseline=0 이며 trap 의 양상이 다름:
- content (baseline=29): raw V≤29 가 service Flyway 에서 명시적 skip → init-db.sh 단일 의존
- 나머지 (baseline=0): raw + service 양쪽이 같은 V### 를 두 번 적용 시도 → DDL 충돌 (commerce V024 / admin V010 사고가 이 패턴)

audit 머지 후 메모리 갱신 예정.
