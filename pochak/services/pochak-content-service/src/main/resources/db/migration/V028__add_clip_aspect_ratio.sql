ALTER TABLE content.clip_assets
    ADD COLUMN IF NOT EXISTS aspect_ratio VARCHAR(16);

UPDATE content.clip_assets
SET aspect_ratio = 'RATIO_16_9'
WHERE aspect_ratio IS NULL;

ALTER TABLE content.clip_assets
    ALTER COLUMN aspect_ratio SET DEFAULT 'RATIO_16_9';

ALTER TABLE content.clip_assets
    ALTER COLUMN aspect_ratio SET NOT NULL;
