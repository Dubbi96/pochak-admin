-- V029: CMS-style public landing pages per organization/club/competition

CREATE TABLE IF NOT EXISTS content.organization_sites (
    id                  BIGSERIAL       PRIMARY KEY,
    owner_type          VARCHAR(30)     NOT NULL,
    owner_id            BIGINT          NOT NULL,
    title               VARCHAR(200),
    description         TEXT,
    meta_title          VARCHAR(200),
    meta_description    VARCHAR(500),
    favicon_url         VARCHAR(500),
    is_published        BOOLEAN         NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_org_sites_owner
    ON content.organization_sites (owner_type, owner_id);

CREATE TABLE IF NOT EXISTS content.organization_site_pages (
    id              BIGSERIAL       PRIMARY KEY,
    site_id         BIGINT          NOT NULL REFERENCES content.organization_sites(id) ON DELETE CASCADE,
    page_key        VARCHAR(50)     NOT NULL,
    title           VARCHAR(200),
    display_order   INTEGER         NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_site_pages_key
    ON content.organization_site_pages (site_id, page_key);

CREATE TABLE IF NOT EXISTS content.organization_site_sections (
    id              BIGSERIAL       PRIMARY KEY,
    page_id         BIGINT          NOT NULL REFERENCES content.organization_site_pages(id) ON DELETE CASCADE,
    section_type    VARCHAR(30)     NOT NULL,
    title           VARCHAR(200),
    content_json    JSONB,
    display_order   INTEGER         NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.organization_site_themes (
    id              BIGSERIAL       PRIMARY KEY,
    site_id         BIGINT          NOT NULL REFERENCES content.organization_sites(id) ON DELETE CASCADE,
    primary_color   VARCHAR(20),
    secondary_color VARCHAR(20),
    font_family     VARCHAR(100),
    logo_url        VARCHAR(500),
    banner_url      VARCHAR(500),
    custom_css      TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_site_themes
    ON content.organization_site_themes (site_id);

COMMENT ON TABLE content.organization_sites IS 'CMS: top-level site definition for org/club/venue';
COMMENT ON COLUMN content.organization_sites.owner_type IS 'ORGANIZATION, CLUB, VENUE, COMPETITION, PARTNER';
COMMENT ON COLUMN content.organization_site_sections.section_type IS 'HERO, TEXT, GALLERY, CTA, VIDEO, SCHEDULE, FAQ, CONTACT';
