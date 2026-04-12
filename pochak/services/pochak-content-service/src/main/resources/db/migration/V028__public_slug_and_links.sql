-- V028: Add public_slug to key entities + unified public_links resolve table

-- 1. Add slug columns to existing tables
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS public_slug VARCHAR(100);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS public_slug VARCHAR(100);
ALTER TABLE content.organizations ADD COLUMN IF NOT EXISTS public_slug VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS uq_competitions_public_slug
    ON content.competitions (public_slug) WHERE public_slug IS NOT NULL AND is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uq_teams_public_slug
    ON content.teams (public_slug) WHERE public_slug IS NOT NULL AND is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uq_organizations_public_slug
    ON content.organizations (public_slug) WHERE public_slug IS NOT NULL AND is_active = true;

-- 2. Unified public_links table for cross-entity slug resolve
CREATE TABLE IF NOT EXISTS content.public_links (
    id              BIGSERIAL       PRIMARY KEY,
    slug            VARCHAR(100)    NOT NULL,
    resource_type   VARCHAR(30)     NOT NULL,
    resource_id     BIGINT          NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_public_links_slug
    ON content.public_links (slug) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_public_links_resource
    ON content.public_links (resource_type, resource_id) WHERE is_active = true;

COMMENT ON TABLE content.public_links IS 'Unified slug-to-resource mapping for public URL resolve';
COMMENT ON COLUMN content.public_links.resource_type IS 'COMPETITION, CLUB, ORGANIZATION, VENUE, PARTNER';
