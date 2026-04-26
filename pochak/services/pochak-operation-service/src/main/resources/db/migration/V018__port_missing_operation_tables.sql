-- V018: Port operation-scoped DDL that previously only lived in pochak/db/migrations/V*.sql
--
-- db/migrations/V*.sql 는 postgres 최초 부팅 시 init-db.sh 로만 적용되며,
-- 기존 볼륨에는 V024(recording_schedules) 이후로 추가된 파일이 누락되어 있다.
-- 서비스 Flyway 경로(services/pochak-operation-service/.../db/migration)에는
-- V000, V004, V017 만 존재해 컨테이너 재기동 시 Hibernate schema-validate 가 실패한다.
-- 엔티티 기준으로 필요한 테이블들을 서비스 Flyway 로 정식 이관한다.
--
-- 포함 범위: 현재 엔티티가 요구하는 테이블만 (outbox_events/processed_events/product_season_prices 제외).
--   - recording_schedules / recording_sessions
--   - recording_notification_preferences
--   - venue_products / venue_time_slots
--   - venue_closed_days / product_price_history
--   - vpu_contracts / vpu_devices
--   - camera_hub_units

-- ---------------------------------------------------------------------------
-- Recording Schedules (raw V024)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operation.recording_schedules (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    venue_id        INT NOT NULL REFERENCES operation.venues(id),
    title           VARCHAR(200) NOT NULL,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    memo            TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recording_schedules_user_id
    ON operation.recording_schedules (user_id);
CREATE INDEX IF NOT EXISTS idx_recording_schedules_venue_id
    ON operation.recording_schedules (venue_id);
CREATE INDEX IF NOT EXISTS idx_recording_schedules_venue_time
    ON operation.recording_schedules (venue_id, start_time, end_time)
    WHERE is_active = TRUE AND status != 'CANCELLED';
CREATE INDEX IF NOT EXISTS idx_recording_schedules_status
    ON operation.recording_schedules (status)
    WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- Recording Sessions (raw V025)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operation.recording_sessions (
    id              BIGSERIAL PRIMARY KEY,
    schedule_id     BIGINT NOT NULL REFERENCES operation.recording_schedules(id),
    camera_id       BIGINT REFERENCES operation.cameras(id),
    user_id         BIGINT NOT NULL,
    venue_id        INT NOT NULL REFERENCES operation.venues(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'RECORDING',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stopped_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recording_sessions_schedule_id
    ON operation.recording_sessions (schedule_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_user_id
    ON operation.recording_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_status
    ON operation.recording_sessions (status);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_venue_id
    ON operation.recording_sessions (venue_id);

-- ---------------------------------------------------------------------------
-- Recording Notification Preferences (raw V027)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operation.recording_notification_preferences (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL UNIQUE,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    start_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rec_notif_pref_user_id
    ON operation.recording_notification_preferences (user_id);

-- ---------------------------------------------------------------------------
-- Venue Products + Time Slots (raw V029)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operation.venue_products (
    id                  BIGSERIAL PRIMARY KEY,
    venue_id            INT NOT NULL REFERENCES operation.venues(id),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    product_type        VARCHAR(30) NOT NULL,
    price_per_hour      INT NOT NULL DEFAULT 0,
    price_per_day       INT,
    max_capacity        INT,
    included_cameras    INT NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operation.venue_time_slots (
    id                  BIGSERIAL PRIMARY KEY,
    venue_product_id    BIGINT NOT NULL REFERENCES operation.venue_products(id),
    day_of_week         INT NOT NULL,
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    is_available        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_products_venue_id
    ON operation.venue_products (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_products_type
    ON operation.venue_products (product_type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_venue_time_slots_product_id
    ON operation.venue_time_slots (venue_product_id);
CREATE INDEX IF NOT EXISTS idx_venue_time_slots_day
    ON operation.venue_time_slots (day_of_week, is_available) WHERE is_available = TRUE;

-- ---------------------------------------------------------------------------
-- Venue Closed Days + Product Price History (raw V033, operation parts only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operation.venue_closed_days (
    id              BIGSERIAL PRIMARY KEY,
    venue_id        INT NOT NULL REFERENCES operation.venues(id),
    closed_type     VARCHAR(20) NOT NULL,
    day_of_week     INT,
    closed_date     DATE,
    reason          VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_closed_days_venue_id
    ON operation.venue_closed_days (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_closed_days_date
    ON operation.venue_closed_days (closed_date) WHERE closed_date IS NOT NULL;

CREATE TABLE IF NOT EXISTS operation.product_price_history (
    id                    BIGSERIAL PRIMARY KEY,
    product_id            BIGINT NOT NULL REFERENCES operation.venue_products(id),
    changed_by            BIGINT NOT NULL,
    prev_price_per_hour   INT NOT NULL,
    new_price_per_hour    INT NOT NULL,
    prev_price_per_day    INT,
    new_price_per_day     INT,
    change_reason         VARCHAR(500),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_price_history_product_id
    ON operation.product_price_history (product_id);

-- ---------------------------------------------------------------------------
-- VPU Contracts + Devices (raw V037)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operation.vpu_contracts (
    id              BIGSERIAL PRIMARY KEY,
    contract_number VARCHAR(50)  UNIQUE NOT NULL,
    organization_id BIGINT,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    start_date      DATE,
    end_date        DATE,
    device_count    INTEGER      DEFAULT 0,
    contact_person  VARCHAR(100),
    contact_phone   VARCHAR(20),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operation.vpu_devices (
    id               BIGSERIAL PRIMARY KEY,
    contract_id      BIGINT REFERENCES operation.vpu_contracts(id),
    serial_number    VARCHAR(100) UNIQUE NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'INACTIVE',
    firmware_version VARCHAR(50),
    location         VARCHAR(200),
    last_heartbeat   TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vpu_contracts_status
    ON operation.vpu_contracts (status);
CREATE INDEX IF NOT EXISTS idx_vpu_contracts_organization_id
    ON operation.vpu_contracts (organization_id);
CREATE INDEX IF NOT EXISTS idx_vpu_devices_contract_id
    ON operation.vpu_devices (contract_id);
CREATE INDEX IF NOT EXISTS idx_vpu_devices_status
    ON operation.vpu_devices (status);

-- ---------------------------------------------------------------------------
-- Camera Hub Units (raw V038)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operation.camera_hub_units (
    id                BIGSERIAL PRIMARY KEY,
    contract_id       BIGINT REFERENCES operation.vpu_contracts(id),
    mac_address       VARCHAR(17)  UNIQUE NOT NULL,
    ip_address        VARCHAR(45),
    status            VARCHAR(20)  NOT NULL DEFAULT 'DISCONNECTED',
    firmware_version  VARCHAR(50),
    location          VARCHAR(200),
    last_connected_at TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chu_status
    ON operation.camera_hub_units (status);
CREATE INDEX IF NOT EXISTS idx_chu_contract_id
    ON operation.camera_hub_units (contract_id);

COMMENT ON TABLE operation.camera_hub_units IS 'Skylife Camera Hub Unit (CHU) 장치 목록';
COMMENT ON TABLE operation.vpu_contracts    IS 'VPU(Video Processing Unit) 계약 정보';
COMMENT ON TABLE operation.vpu_devices      IS 'VPU 디바이스 목록';
