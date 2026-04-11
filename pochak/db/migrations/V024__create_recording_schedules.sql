-- ============================================================================
-- V024: Recording Schedules
-- 사용자 촬영 일정 관리 (operation-service)
-- ============================================================================

CREATE TABLE IF NOT EXISTS operation.recording_schedules (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,            -- identity.users(id) 참조 (cross-schema)
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

-- ============================================================================
-- Indexes
-- ============================================================================

-- User schedule lookups
CREATE INDEX IF NOT EXISTS idx_recording_schedules_user_id
    ON operation.recording_schedules (user_id);

-- Venue schedule lookups
CREATE INDEX IF NOT EXISTS idx_recording_schedules_venue_id
    ON operation.recording_schedules (venue_id);

-- Time-based conflict detection
CREATE INDEX IF NOT EXISTS idx_recording_schedules_venue_time
    ON operation.recording_schedules (venue_id, start_time, end_time)
    WHERE is_active = TRUE AND status != 'CANCELLED';

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_recording_schedules_status
    ON operation.recording_schedules (status)
    WHERE is_active = TRUE;
