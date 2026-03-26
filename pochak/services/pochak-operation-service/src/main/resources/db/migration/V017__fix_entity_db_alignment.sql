-- ============================================================================
-- V017: Fix Entity-DB Alignment (operation portion)
-- ============================================================================

-- 2. operation.venue_cameras - Fix column mismatches
ALTER TABLE operation.venue_cameras ADD COLUMN IF NOT EXISTS position VARCHAR(100);
ALTER TABLE operation.venue_cameras ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();

-- Copy created_at -> assigned_at for existing rows
UPDATE operation.venue_cameras SET assigned_at = created_at WHERE assigned_at IS NULL AND created_at IS NOT NULL;

-- 3. operation.cameras - Add missing columns
ALTER TABLE operation.cameras ADD COLUMN IF NOT EXISTS model VARCHAR(100);
ALTER TABLE operation.cameras ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100);
ALTER TABLE operation.cameras ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- 11. operation.venues - Change latitude/longitude to NUMERIC for BigDecimal
ALTER TABLE operation.venues
    ALTER COLUMN latitude TYPE NUMERIC(10,7) USING latitude::NUMERIC(10,7),
    ALTER COLUMN longitude TYPE NUMERIC(10,7) USING longitude::NUMERIC(10,7);

-- Entity doesn't require address NOT NULL
ALTER TABLE operation.venues ALTER COLUMN address DROP NOT NULL;
