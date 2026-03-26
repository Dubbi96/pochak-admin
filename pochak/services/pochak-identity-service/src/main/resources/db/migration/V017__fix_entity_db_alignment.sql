-- ============================================================================
-- V017: Fix Entity-DB Alignment (identity portion)
-- ============================================================================

-- 12. identity.user_status_histories (Entity table name)
-- Entity says @Table(name = "user_status_histories") but DB table is "user_status_history"
ALTER TABLE IF EXISTS identity.user_status_history RENAME TO user_status_histories;

-- Entity uses previous_status/new_status but DB has from_status/to_status
ALTER TABLE identity.user_status_histories ADD COLUMN IF NOT EXISTS previous_status VARCHAR(20);
ALTER TABLE identity.user_status_histories ADD COLUMN IF NOT EXISTS new_status VARCHAR(20);

-- Copy old data
UPDATE identity.user_status_histories SET previous_status = from_status WHERE previous_status IS NULL;
UPDATE identity.user_status_histories SET new_status = to_status WHERE new_status IS NULL;

-- 13. identity.user_consents - Add missing columns
-- Entity has consent_type, agreed, agreed_at, updated_at
ALTER TABLE identity.user_consents ADD COLUMN IF NOT EXISTS consent_type VARCHAR(50);
ALTER TABLE identity.user_consents ADD COLUMN IF NOT EXISTS agreed BOOLEAN DEFAULT FALSE;
ALTER TABLE identity.user_consents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 14. identity.user_notification_settings - Add missing columns
-- Entity has notification_type, push_enabled, email_enabled per row
ALTER TABLE identity.user_notification_settings ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50);
ALTER TABLE identity.user_notification_settings ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE identity.user_notification_settings ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT FALSE;

-- Drop UNIQUE constraint on user_id so entity can have multiple rows per user
ALTER TABLE identity.user_notification_settings DROP CONSTRAINT IF EXISTS user_notification_settings_user_id_key;

-- 15. identity.user_push_tokens - Add missing columns
-- Entity has push_token, device_id, active fields
ALTER TABLE identity.user_push_tokens ADD COLUMN IF NOT EXISTS push_token VARCHAR(500);
ALTER TABLE identity.user_push_tokens ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);
ALTER TABLE identity.user_push_tokens ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Copy token -> push_token for existing rows
UPDATE identity.user_push_tokens SET push_token = token WHERE push_token IS NULL AND token IS NOT NULL;

-- 16. identity.user_preferences - Add missing column
ALTER TABLE identity.user_preferences ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'ko';

-- user_status_histories indexes
CREATE INDEX IF NOT EXISTS idx_user_status_histories_user_id ON identity.user_status_histories (user_id);
