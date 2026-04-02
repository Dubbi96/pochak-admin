-- ============================================================================
-- V017: Fix Entity-DB Alignment
-- Aligns PostgreSQL schema with JPA Entity definitions across all services.
-- Resolves lower(bytea) JPQL errors on Competition/Venue text searches.
-- ============================================================================

-- ============================================================================
-- 1. content.competitions - Fix type mismatches & add missing columns
-- ============================================================================

-- Fix start_date / end_date: Entity uses LocalDate (DATE), migration was TIMESTAMPTZ
ALTER TABLE content.competitions
    ALTER COLUMN start_date TYPE DATE USING start_date::DATE,
    ALTER COLUMN end_date TYPE DATE USING end_date::DATE;

-- Allow NULLs (Entity doesn't mark them as nullable=false)
ALTER TABLE content.competitions ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE content.competitions ALTER COLUMN end_date DROP NOT NULL;

-- Add missing columns the Entity expects
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS name_en VARCHAR(200);
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS season VARCHAR(10);
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);

-- ============================================================================
-- 2. operation.venue_cameras - Fix column mismatches
-- ============================================================================

-- Entity has 'position' VARCHAR, DB has 'is_main' BOOLEAN - add the entity's column
ALTER TABLE operation.venue_cameras ADD COLUMN IF NOT EXISTS position VARCHAR(100);

-- Entity has 'assigned_at' TIMESTAMPTZ, DB has 'created_at' - add the entity's column
ALTER TABLE operation.venue_cameras ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();

-- Copy created_at -> assigned_at for existing rows
UPDATE operation.venue_cameras SET assigned_at = created_at WHERE assigned_at IS NULL AND created_at IS NOT NULL;

-- ============================================================================
-- 3. operation.cameras - Add missing columns
-- ============================================================================

-- Entity has model/manufacturer fields, DB migration V004 doesn't include them
ALTER TABLE operation.cameras ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE operation.cameras ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100);

-- Entity has is_active BOOLEAN, DB uses status VARCHAR + deleted_at pattern
ALTER TABLE operation.cameras ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- ============================================================================
-- 4. content.sports - Add missing columns
-- ============================================================================

-- Entity has name_en, description, icon_url that V002 doesn't define
ALTER TABLE content.sports ADD COLUMN IF NOT EXISTS name_en VARCHAR(100);
ALTER TABLE content.sports ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE content.sports ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500);

-- ============================================================================
-- 5. content.teams - Add missing columns for Entity alignment
-- ============================================================================

ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS name_en VARCHAR(100);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS home_stadium VARCHAR(200);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS organization_id BIGINT;
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- ============================================================================
-- 6. content.team_members - Add missing columns
-- ============================================================================

-- Entity was redesigned: has name, name_en, position, jersey_number, profile_image_url, is_active
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS name_en VARCHAR(100);
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS position VARCHAR(20);
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS jersey_number INTEGER;
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- 7. content.matches - Add missing columns
-- ============================================================================

-- Entity has title (DB has name), venue (String), round, is_active, description
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS title VARCHAR(200);
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS venue VARCHAR(200);
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS round VARCHAR(50);
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS description TEXT;

-- Copy name -> title for existing rows
UPDATE content.matches SET title = name WHERE title IS NULL AND name IS NOT NULL;

-- ============================================================================
-- 8. content.match_participants - Add missing column
-- ============================================================================

-- Entity has 'score' column not in V002
ALTER TABLE content.match_participants ADD COLUMN IF NOT EXISTS score INTEGER;

-- ============================================================================
-- 9. content.view_history → view_histories (Entity table name mismatch)
-- ============================================================================

-- Entity says @Table(name = "view_histories") but DB table is "view_history"
-- Rename the table to match Entity
ALTER TABLE IF EXISTS content.view_history RENAME TO view_histories;

-- Entity has different column names:
-- Entity: watch_duration_seconds, last_position_seconds, completed
-- DB: last_position, watch_duration
ALTER TABLE content.view_histories ADD COLUMN IF NOT EXISTS watch_duration_seconds INTEGER DEFAULT 0;
ALTER TABLE content.view_histories ADD COLUMN IF NOT EXISTS last_position_seconds INTEGER DEFAULT 0;
ALTER TABLE content.view_histories ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Copy old data
UPDATE content.view_histories SET watch_duration_seconds = watch_duration WHERE watch_duration_seconds IS NULL OR watch_duration_seconds = 0;
UPDATE content.view_histories SET last_position_seconds = last_position WHERE last_position_seconds IS NULL OR last_position_seconds = 0;

-- ============================================================================
-- 10. content.display_sections - Add missing columns
-- ============================================================================

-- Entity has content_query, target_page that V002 doesn't define
ALTER TABLE content.display_sections ADD COLUMN IF NOT EXISTS content_query VARCHAR(500);
ALTER TABLE content.display_sections ADD COLUMN IF NOT EXISTS target_page VARCHAR(50) DEFAULT 'HOME';

-- ============================================================================
-- 11. operation.venues - Change latitude/longitude to NUMERIC for BigDecimal
-- ============================================================================

-- Entity uses BigDecimal with precision=10, scale=7 but DB has DOUBLE PRECISION
ALTER TABLE operation.venues
    ALTER COLUMN latitude TYPE NUMERIC(10,7) USING latitude::NUMERIC(10,7),
    ALTER COLUMN longitude TYPE NUMERIC(10,7) USING longitude::NUMERIC(10,7);

-- Entity doesn't require address NOT NULL
ALTER TABLE operation.venues ALTER COLUMN address DROP NOT NULL;

-- ============================================================================
-- 12. identity.user_status_histories (Entity table name)
-- ============================================================================

-- Entity says @Table(name = "user_status_histories") but DB table is "user_status_history"
ALTER TABLE IF EXISTS identity.user_status_history RENAME TO user_status_histories;

-- Entity uses previous_status/new_status but DB has from_status/to_status
ALTER TABLE identity.user_status_histories ADD COLUMN IF NOT EXISTS previous_status VARCHAR(20);
ALTER TABLE identity.user_status_histories ADD COLUMN IF NOT EXISTS new_status VARCHAR(20);

-- Copy old data
UPDATE identity.user_status_histories SET previous_status = from_status WHERE previous_status IS NULL;
UPDATE identity.user_status_histories SET new_status = to_status WHERE new_status IS NULL;

-- ============================================================================
-- 13. identity.user_consents - Add missing columns
-- ============================================================================

-- Entity has consent_type, agreed, agreed_at, updated_at
-- DB has term_id, is_agreed, agreed_at
ALTER TABLE identity.user_consents ADD COLUMN IF NOT EXISTS consent_type VARCHAR(50);
ALTER TABLE identity.user_consents ADD COLUMN IF NOT EXISTS agreed BOOLEAN DEFAULT FALSE;
ALTER TABLE identity.user_consents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- 14. identity.user_notification_settings - Add missing columns
-- ============================================================================

-- Entity has notification_type, push_enabled, email_enabled per row
-- DB has is_app_push, is_sms, is_email, is_night_quiet as single row
ALTER TABLE identity.user_notification_settings ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50);
ALTER TABLE identity.user_notification_settings ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE identity.user_notification_settings ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT FALSE;

-- Drop UNIQUE constraint on user_id so entity can have multiple rows per user
ALTER TABLE identity.user_notification_settings DROP CONSTRAINT IF EXISTS user_notification_settings_user_id_key;

-- ============================================================================
-- 15. identity.user_push_tokens - Add missing columns
-- ============================================================================

-- Entity has push_token, device_id, active fields
ALTER TABLE identity.user_push_tokens ADD COLUMN IF NOT EXISTS push_token VARCHAR(500);
ALTER TABLE identity.user_push_tokens ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);
ALTER TABLE identity.user_push_tokens ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Copy token -> push_token for existing rows
UPDATE identity.user_push_tokens SET push_token = token WHERE push_token IS NULL AND token IS NOT NULL;

-- ============================================================================
-- 16. identity.user_preferences - Add missing column
-- ============================================================================

ALTER TABLE identity.user_preferences ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'ko';

-- ============================================================================
-- 17. Drop old indexes from renamed tables and recreate with new names
-- ============================================================================

-- Drop old view_history indexes (they still exist after table rename, causing duplicates)
DROP INDEX IF EXISTS content.idx_view_history_user_id;
DROP INDEX IF EXISTS content.idx_view_history_asset;

-- Recreate with new table name
CREATE INDEX IF NOT EXISTS idx_view_histories_user_id ON content.view_histories (user_id);
CREATE INDEX IF NOT EXISTS idx_view_histories_asset ON content.view_histories (asset_type, asset_id);

-- user_status_histories indexes
CREATE INDEX IF NOT EXISTS idx_user_status_histories_user_id ON identity.user_status_histories (user_id);
