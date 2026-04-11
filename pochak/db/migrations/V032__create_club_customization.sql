-- ============================================================================
-- V032: Club Customization
-- 파트너(업주)가 Club 페이지를 커스터마이징할 수 있는 데이터 모델
-- partner_id references identity.partners(id) (cross-schema, FK not enforced)
-- club_id (team_id) references content.teams(id)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content.club_customizations (
    id              BIGSERIAL PRIMARY KEY,
    club_id         BIGINT NOT NULL REFERENCES content.teams(id),
    partner_id      BIGINT NOT NULL,                -- identity.partners(id) 참조 (cross-schema)
    banner_url      VARCHAR(500),
    logo_url        VARCHAR(500),
    theme_color     VARCHAR(20),
    intro_text      TEXT,
    sections_json   JSONB,
    social_links_json JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (club_id, partner_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_club_customizations_club_id ON content.club_customizations (club_id);
CREATE INDEX IF NOT EXISTS idx_club_customizations_partner_id ON content.club_customizations (partner_id);
