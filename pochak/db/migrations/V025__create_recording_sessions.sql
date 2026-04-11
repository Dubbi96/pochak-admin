-- ============================================================================
-- V025: Recording Sessions
-- 촬영 세션 관리 (시작/중단/완료)
-- ============================================================================

CREATE TABLE IF NOT EXISTS operation.recording_sessions (
    id              BIGSERIAL PRIMARY KEY,
    schedule_id     BIGINT NOT NULL REFERENCES operation.recording_schedules(id),
    camera_id       BIGINT REFERENCES operation.cameras(id),
    user_id         BIGINT NOT NULL,            -- identity.users(id) 참조 (cross-schema)
    venue_id        INT NOT NULL REFERENCES operation.venues(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'RECORDING',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stopped_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_recording_sessions_schedule_id
    ON operation.recording_sessions (schedule_id);

CREATE INDEX IF NOT EXISTS idx_recording_sessions_user_id
    ON operation.recording_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_recording_sessions_status
    ON operation.recording_sessions (status);

CREATE INDEX IF NOT EXISTS idx_recording_sessions_venue_id
    ON operation.recording_sessions (venue_id);
