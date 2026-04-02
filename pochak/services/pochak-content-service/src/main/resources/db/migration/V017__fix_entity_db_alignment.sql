-- ============================================================================
-- V017: Fix Entity-DB Alignment (content portion)
-- ============================================================================

-- 1. content.competitions - Fix type mismatches & add missing columns
ALTER TABLE content.competitions
    ALTER COLUMN start_date TYPE DATE USING start_date::DATE,
    ALTER COLUMN end_date TYPE DATE USING end_date::DATE;

ALTER TABLE content.competitions ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE content.competitions ALTER COLUMN end_date DROP NOT NULL;

ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS name_en VARCHAR(200);
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS season VARCHAR(10);
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);

-- 4. content.sports - Add missing columns
ALTER TABLE content.sports ADD COLUMN IF NOT EXISTS name_en VARCHAR(100);
ALTER TABLE content.sports ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE content.sports ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500);

-- 5. content.teams - Add missing columns
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS name_en VARCHAR(100);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS home_stadium VARCHAR(200);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS organization_id BIGINT;
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 6. content.team_members - Add missing columns
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS name_en VARCHAR(100);
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS position VARCHAR(20);
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS jersey_number INTEGER;
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE content.team_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 7. content.matches - Add missing columns
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS title VARCHAR(200);
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS venue VARCHAR(200);
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS round VARCHAR(50);
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS description TEXT;

-- Copy name -> title for existing rows
UPDATE content.matches SET title = name WHERE title IS NULL AND name IS NOT NULL;

-- 8. content.match_participants - Add missing column
ALTER TABLE content.match_participants ADD COLUMN IF NOT EXISTS score INTEGER;

-- 9. content.view_history -> view_histories (Entity table name mismatch)
ALTER TABLE IF EXISTS content.view_history RENAME TO view_histories;

ALTER TABLE content.view_histories ADD COLUMN IF NOT EXISTS watch_duration_seconds INTEGER DEFAULT 0;
ALTER TABLE content.view_histories ADD COLUMN IF NOT EXISTS last_position_seconds INTEGER DEFAULT 0;
ALTER TABLE content.view_histories ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

UPDATE content.view_histories SET watch_duration_seconds = watch_duration WHERE watch_duration_seconds IS NULL OR watch_duration_seconds = 0;
UPDATE content.view_histories SET last_position_seconds = last_position WHERE last_position_seconds IS NULL OR last_position_seconds = 0;

-- 10. content.display_sections - Add missing columns
ALTER TABLE content.display_sections ADD COLUMN IF NOT EXISTS content_query VARCHAR(500);
ALTER TABLE content.display_sections ADD COLUMN IF NOT EXISTS target_page VARCHAR(50) DEFAULT 'HOME';

-- 17. Drop old indexes from renamed tables and recreate
DROP INDEX IF EXISTS content.idx_view_history_user_id;
DROP INDEX IF EXISTS content.idx_view_history_asset;

CREATE INDEX IF NOT EXISTS idx_view_histories_user_id ON content.view_histories (user_id);
CREATE INDEX IF NOT EXISTS idx_view_histories_asset ON content.view_histories (asset_type, asset_id);
