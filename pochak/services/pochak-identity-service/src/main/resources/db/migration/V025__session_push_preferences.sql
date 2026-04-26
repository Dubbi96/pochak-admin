-- V025: Session management + push notification preferences

-- 1. User sessions (replaces single refresh token per user)
CREATE TABLE IF NOT EXISTS identity.user_sessions (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    refresh_token   VARCHAR(500)    NOT NULL,
    device_type     VARCHAR(20),
    device_name     VARCHAR(200),
    device_id       VARCHAR(255),
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    last_active_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user
    ON identity.user_sessions (user_id) WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_sessions_token
    ON identity.user_sessions (refresh_token) WHERE is_active = true;

-- 2. Push notification preferences
CREATE TABLE IF NOT EXISTS identity.push_notification_preferences (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    category        VARCHAR(50)     NOT NULL,
    enabled         BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_push_prefs_user_category
    ON identity.push_notification_preferences (user_id, category);

COMMENT ON TABLE identity.user_sessions IS 'Multi-device session tracking with refresh tokens';
COMMENT ON TABLE identity.push_notification_preferences IS 'Per-category push opt-in/opt-out';
COMMENT ON COLUMN identity.push_notification_preferences.category IS 'RESERVATION, LIVE_START, PAYMENT, PARTNER_MESSAGE, ANNOUNCEMENT, MARKETING';
