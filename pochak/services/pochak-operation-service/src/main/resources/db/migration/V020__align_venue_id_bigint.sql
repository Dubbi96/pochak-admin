-- V020: operation.venues(id) 와 모든 venue_id FK 컬럼을 BIGINT 로 정합화
--
-- 기존 init-db.sh 라인업은 venues.id 를 INT 로 생성했지만 entity Venue.id 는 Long.
-- venue_id 를 참조하는 7개 테이블 + venues.sport_id 도 모두 INT → BIGINT 로 widening 한다.
-- FK 제약은 type compatibility 때문에 drop → alter → re-add 순서로 처리.

-- ---------------------------------------------------------------------------
-- 1) venues 를 참조하는 FK 일괄 drop (type compatibility 확보)
-- ---------------------------------------------------------------------------
ALTER TABLE operation.recording_schedules DROP CONSTRAINT IF EXISTS recording_schedules_venue_id_fkey;
ALTER TABLE operation.recording_sessions  DROP CONSTRAINT IF EXISTS recording_sessions_venue_id_fkey;
ALTER TABLE operation.reservations        DROP CONSTRAINT IF EXISTS reservations_venue_id_fkey;
ALTER TABLE operation.studio_sessions     DROP CONSTRAINT IF EXISTS studio_sessions_venue_id_fkey;
ALTER TABLE operation.venue_cameras       DROP CONSTRAINT IF EXISTS venue_cameras_venue_id_fkey;
ALTER TABLE operation.venue_closed_days   DROP CONSTRAINT IF EXISTS venue_closed_days_venue_id_fkey;
ALTER TABLE operation.venue_products      DROP CONSTRAINT IF EXISTS venue_products_venue_id_fkey;

-- ---------------------------------------------------------------------------
-- 2) 컬럼 타입 widening (INT → BIGINT, 데이터 손실 없음)
-- ---------------------------------------------------------------------------
ALTER TABLE operation.recording_schedules ALTER COLUMN venue_id TYPE BIGINT;
ALTER TABLE operation.recording_sessions  ALTER COLUMN venue_id TYPE BIGINT;
ALTER TABLE operation.reservations        ALTER COLUMN venue_id TYPE BIGINT;
ALTER TABLE operation.studio_sessions     ALTER COLUMN venue_id TYPE BIGINT;
ALTER TABLE operation.venue_cameras       ALTER COLUMN venue_id TYPE BIGINT;
ALTER TABLE operation.venue_closed_days   ALTER COLUMN venue_id TYPE BIGINT;
ALTER TABLE operation.venue_products      ALTER COLUMN venue_id TYPE BIGINT;

ALTER TABLE operation.venues              ALTER COLUMN id       TYPE BIGINT;
ALTER TABLE operation.venues              ALTER COLUMN sport_id TYPE BIGINT;

-- ---------------------------------------------------------------------------
-- 3) FK 재생성
-- ---------------------------------------------------------------------------
ALTER TABLE operation.recording_schedules
    ADD CONSTRAINT recording_schedules_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES operation.venues(id);

ALTER TABLE operation.recording_sessions
    ADD CONSTRAINT recording_sessions_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES operation.venues(id);

ALTER TABLE operation.reservations
    ADD CONSTRAINT reservations_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES operation.venues(id);

ALTER TABLE operation.studio_sessions
    ADD CONSTRAINT studio_sessions_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES operation.venues(id);

ALTER TABLE operation.venue_cameras
    ADD CONSTRAINT venue_cameras_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES operation.venues(id);

ALTER TABLE operation.venue_closed_days
    ADD CONSTRAINT venue_closed_days_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES operation.venues(id);

ALTER TABLE operation.venue_products
    ADD CONSTRAINT venue_products_venue_id_fkey
    FOREIGN KEY (venue_id) REFERENCES operation.venues(id);
