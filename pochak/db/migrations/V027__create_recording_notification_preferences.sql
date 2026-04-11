-- ============================================================================
-- V027: Recording Notification Preferences
-- 촬영 알림 ON/OFF 설정 (operation-service)
-- ============================================================================

CREATE TABLE IF NOT EXISTS operation.recording_notification_preferences (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,     -- identity.users(id) 참조 (cross-schema)
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    start_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rec_notif_pref_user_id
    ON operation.recording_notification_preferences (user_id);
