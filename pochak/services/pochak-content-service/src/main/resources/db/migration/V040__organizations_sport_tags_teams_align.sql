-- V040: organizations / sport_tags / teams 의 누락 entity 컬럼 일괄 보정
-- audit (entity vs DB) 결과 11 개 컬럼이 entity 에서만 정의되어 schema-validate 실패.

-- organizations
ALTER TABLE content.organizations
    ADD COLUMN IF NOT EXISTS name_en             VARCHAR(200),
    ADD COLUMN IF NOT EXISTS logo_url            VARCHAR(500),
    ADD COLUMN IF NOT EXISTS display_area        VARCHAR(10) DEFAULT 'CLUB',
    ADD COLUMN IF NOT EXISTS is_verified         BOOLEAN     DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_cug              BOOLEAN     DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS join_policy         VARCHAR(20),
    ADD COLUMN IF NOT EXISTS reservation_policy  VARCHAR(20);

-- sport_tags
ALTER TABLE content.sport_tags
    ADD COLUMN IF NOT EXISTS tag VARCHAR(100);

-- teams
ALTER TABLE content.teams
    ADD COLUMN IF NOT EXISTS club_status VARCHAR(20) DEFAULT 'ACTIVE';
