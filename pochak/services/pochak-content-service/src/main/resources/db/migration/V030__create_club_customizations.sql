-- V030: Create content.club_customizations
-- Partner(업주)가 Club(team) 페이지를 커스터마이징할 수 있는 데이터 모델.
-- 원래 POC-74 에서 추가될 예정이었으나 마이그레이션 파일이 잘못된 경로(pochak/db/migrations)에 생성되어
-- Flyway 가 스캔하지 못했음. 본 V030 에서 엔티티(ClubCustomization) 와 정합하도록 테이블을 생성한다.
-- club_id → content.teams(id), partner_id → identity.partners(id) (cross-schema, FK 미강제).

CREATE TABLE IF NOT EXISTS content.club_customizations (
    id                  BIGSERIAL       PRIMARY KEY,
    club_id             BIGINT          NOT NULL REFERENCES content.teams(id) ON DELETE CASCADE,
    partner_id          BIGINT          NOT NULL,
    banner_url          VARCHAR(500),
    logo_url            VARCHAR(500),
    theme_color         VARCHAR(20),
    intro_text          TEXT,
    sections_json       JSONB,
    social_links_json   JSONB,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (club_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_club_customizations_club_id
    ON content.club_customizations (club_id);

CREATE INDEX IF NOT EXISTS idx_club_customizations_partner_id
    ON content.club_customizations (partner_id);

COMMENT ON TABLE content.club_customizations IS
    'Per-partner customization of a club page (banner/logo/theme/sections/social links).';
COMMENT ON COLUMN content.club_customizations.partner_id IS
    'identity.partners(id) — cross-schema reference, FK not enforced.';
