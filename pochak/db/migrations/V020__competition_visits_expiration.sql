-- DATA-008: competition_visits expiration support
ALTER TABLE content.competition_visits ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE content.competition_visits ADD COLUMN IF NOT EXISTS invite_code_version VARCHAR(50);
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS invite_code_version INTEGER DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_competition_visits_expires ON content.competition_visits(expires_at) WHERE expires_at IS NOT NULL;

-- DATA-006: community_posts FK to organizations
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_community_posts_organization'
    ) THEN
        ALTER TABLE content.community_posts
            ADD CONSTRAINT fk_community_posts_organization
            FOREIGN KEY (organization_id) REFERENCES content.organizations(id) ON DELETE SET NULL;
    END IF;
END $$;
