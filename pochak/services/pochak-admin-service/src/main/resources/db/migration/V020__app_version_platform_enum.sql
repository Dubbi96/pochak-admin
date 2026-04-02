-- ============================================================================
-- V020: L7 - Convert app_versions.os_type from VARCHAR to Platform enum
-- Only AOS and IOS values are allowed.
-- ============================================================================

-- Create enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'platform_type') THEN
        CREATE TYPE admin.platform_type AS ENUM ('AOS', 'IOS');
    END IF;
END$$;

-- Rename old column and add new typed column
ALTER TABLE admin.app_versions
    ADD COLUMN IF NOT EXISTS platform VARCHAR(10);

-- Migrate existing data (os_type -> platform)
UPDATE admin.app_versions SET platform = os_type WHERE platform IS NULL;

-- Make platform NOT NULL
ALTER TABLE admin.app_versions
    ALTER COLUMN platform SET NOT NULL;
