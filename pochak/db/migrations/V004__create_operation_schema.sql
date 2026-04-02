-- ============================================================================
-- V004: Operation Schema
-- Pochak OTT Platform - Venues, cameras, reservations, studio sessions
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS operation;

-- 구장/시설
-- NOTE: sport_id references content.sports(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS operation.venues (
    id              SERIAL PRIMARY KEY,
    sport_id        INT NOT NULL,           -- content.sports(id) 참조 (cross-schema)
    name            VARCHAR(200) NOT NULL,
    venue_type      VARCHAR(20) NOT NULL,
    owner_type      VARCHAR(20) NOT NULL,
    owner_id        BIGINT,
    address         VARCHAR(500) NOT NULL,
    address_detail  VARCHAR(500),
    si_gun_gu_code  VARCHAR(10),
    zip_code        VARCHAR(10),
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    description     TEXT,
    qr_code         VARCHAR(100),
    pixellot_club_id VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 카메라
CREATE TABLE IF NOT EXISTS operation.cameras (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    camera_type     VARCHAR(50),
    product_type    VARCHAR(20),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    serial_number   VARCHAR(100),
    version         VARCHAR(20),
    is_panorama     BOOLEAN NOT NULL DEFAULT FALSE,
    pixellot_venue_id VARCHAR(100),
    pixellot_club_id  VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 구장-카메라 매핑
CREATE TABLE IF NOT EXISTS operation.venue_cameras (
    venue_id        INT NOT NULL REFERENCES operation.venues(id),
    camera_id       BIGINT NOT NULL REFERENCES operation.cameras(id),
    is_main         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (venue_id, camera_id)
);

-- 촬영 예약
-- NOTE: match_id references content.matches(id) (cross-schema, FK not enforced)
-- NOTE: reserved_by_user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS operation.reservations (
    id              BIGSERIAL PRIMARY KEY,
    venue_id        INT NOT NULL REFERENCES operation.venues(id),
    match_id        BIGINT,                 -- content.matches(id) 참조 (cross-schema)
    reserved_by_user_id BIGINT NOT NULL,    -- identity.users(id) 참조 (cross-schema)
    reservation_type VARCHAR(20) NOT NULL,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    point_cost      INT DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 스튜디오 세션
-- NOTE: match_id references content.matches(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS operation.studio_sessions (
    id              BIGSERIAL PRIMARY KEY,
    match_id        BIGINT NOT NULL,        -- content.matches(id) 참조 (cross-schema)
    venue_id        INT NOT NULL REFERENCES operation.venues(id),
    camera_id       BIGINT REFERENCES operation.cameras(id),
    pixellot_event_id VARCHAR(100),
    status          VARCHAR(20) NOT NULL DEFAULT 'READY',
    live_url        VARCHAR(500),
    panorama_live_url VARCHAR(500),
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Venue sport, type, and location lookups
CREATE INDEX IF NOT EXISTS idx_venues_sport_id ON operation.venues (sport_id);
CREATE INDEX IF NOT EXISTS idx_venues_venue_type ON operation.venues (venue_type);
CREATE INDEX IF NOT EXISTS idx_venues_si_gun_gu_code ON operation.venues (si_gun_gu_code);
CREATE INDEX IF NOT EXISTS idx_venues_active ON operation.venues (is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_venues_location ON operation.venues (latitude, longitude) WHERE is_active = TRUE AND deleted_at IS NULL;

-- Reservation venue, status, and time lookups
CREATE INDEX IF NOT EXISTS idx_reservations_venue_id ON operation.reservations (venue_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON operation.reservations (status);
CREATE INDEX IF NOT EXISTS idx_reservations_time ON operation.reservations (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_reservations_venue_status ON operation.reservations (venue_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON operation.reservations (reserved_by_user_id);

-- Camera lookups
CREATE INDEX IF NOT EXISTS idx_cameras_status ON operation.cameras (status) WHERE deleted_at IS NULL;

-- Studio session lookups
CREATE INDEX IF NOT EXISTS idx_studio_sessions_match_id ON operation.studio_sessions (match_id);
CREATE INDEX IF NOT EXISTS idx_studio_sessions_venue_id ON operation.studio_sessions (venue_id);
CREATE INDEX IF NOT EXISTS idx_studio_sessions_status ON operation.studio_sessions (status);
