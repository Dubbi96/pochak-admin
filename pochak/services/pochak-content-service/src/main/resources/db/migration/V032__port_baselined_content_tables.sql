-- V032: Batch port of content tables that were skipped by Flyway baseline=029
--
-- application.yml 의 baseline-version=029 는 V001~V029 를 모두 baseline 으로 처리해
-- 실제로는 실행되지 않은 마이그레이션이 다수 존재한다. (init-db.sh 가 raw db/migrations/V*.sql
-- 을 postgres 최초 부팅 시에만 실행하지만 기존 볼륨에는 일부만 반영됨.)
-- 그 결과 entity 가 요구하는 다수 테이블이 DB 에 없어 schema-validate 가 실패한다.
-- 본 마이그레이션은 누락된 테이블을 IF NOT EXISTS / ADD COLUMN IF NOT EXISTS 로 안전하게 보정한다.
--
-- 포함:
--  - team_members (V006 에서 drop 된 후 재생성 누락)
--  - community_posts + post_reports + moderation_actions (V015/V023/V026)
--  - competition_visits (V014/V020) + competitions slug/visibility/invite columns
--  - live_streams (V027)
--  - public_links + competitions/teams/organizations.public_slug (V028)
--  - organization_sites/pages/sections/themes (V029)
--  - shares (raw V026__create_shares.sql)
--  - content_likes / match_timeline_events (entity-only, 명시 마이그레이션 없음)
--  - view_history -> view_histories rename + alignment columns (V017)

-- ---------------------------------------------------------------------------
-- V017 entity-DB alignment: 누락된 엔티티 컬럼 보정 (baseline=029 로 V017 이 실제 실행되지 않음)
-- ---------------------------------------------------------------------------
-- competitions
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS name_en VARCHAR(200);
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS season VARCHAR(10);
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);

-- sports
ALTER TABLE content.sports ADD COLUMN IF NOT EXISTS name_en VARCHAR(100);
ALTER TABLE content.sports ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE content.sports ADD COLUMN IF NOT EXISTS icon_url VARCHAR(500);

-- teams
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS name_en VARCHAR(100);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS home_stadium VARCHAR(200);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS organization_id BIGINT;
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- organizations: is_active 컬럼이 entity 에 없을 수도 있지만 본 V032 의 unique index 필터에 사용됨
ALTER TABLE content.organizations ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- matches
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS title VARCHAR(200);
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS venue VARCHAR(200);
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS round VARCHAR(50);
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE content.matches ADD COLUMN IF NOT EXISTS description TEXT;

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='content' AND table_name='matches' AND column_name='name'
    ) THEN
        UPDATE content.matches SET title = name WHERE title IS NULL AND name IS NOT NULL;
    END IF;
END $$;

-- match_participants
ALTER TABLE content.match_participants ADD COLUMN IF NOT EXISTS score INTEGER;

-- display_sections
ALTER TABLE content.display_sections ADD COLUMN IF NOT EXISTS content_query VARCHAR(500);
ALTER TABLE content.display_sections ADD COLUMN IF NOT EXISTS target_page VARCHAR(50) DEFAULT 'HOME';

-- ---------------------------------------------------------------------------
-- competitions: visibility/invite/public_slug 컬럼 (V014/V020/V028)
-- ---------------------------------------------------------------------------
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'PUBLIC';
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50) UNIQUE;
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS invite_code_version INTEGER DEFAULT 1;
ALTER TABLE content.competitions ADD COLUMN IF NOT EXISTS public_slug VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS uq_competitions_public_slug
    ON content.competitions (public_slug) WHERE public_slug IS NOT NULL AND is_active = true;

-- ---------------------------------------------------------------------------
-- teams / organizations: public_slug (V028)
-- ---------------------------------------------------------------------------
ALTER TABLE content.teams ADD COLUMN IF NOT EXISTS public_slug VARCHAR(100);
ALTER TABLE content.organizations ADD COLUMN IF NOT EXISTS public_slug VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS uq_teams_public_slug
    ON content.teams (public_slug) WHERE public_slug IS NOT NULL AND is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uq_organizations_public_slug
    ON content.organizations (public_slug) WHERE public_slug IS NOT NULL AND is_active = true;

-- ---------------------------------------------------------------------------
-- team_members (entity-aligned, V006 drop 이후 누락분 재생성)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content.team_members (
    id                 BIGSERIAL PRIMARY KEY,
    team_id            BIGINT          NOT NULL REFERENCES content.teams(id),
    name               VARCHAR(100)    NOT NULL,
    name_en            VARCHAR(100),
    position           VARCHAR(20),
    jersey_number      INTEGER,
    profile_image_url  VARCHAR(500),
    is_active          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON content.team_members (team_id);

-- ---------------------------------------------------------------------------
-- community_posts (V015) + V023 moderation columns + V026 FK + counters
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content.community_posts (
    id                BIGSERIAL PRIMARY KEY,
    organization_id   BIGINT,
    author_user_id    BIGINT NOT NULL,
    post_type         VARCHAR(20) NOT NULL,
    title             VARCHAR(200) NOT NULL,
    body              TEXT,
    image_urls        TEXT,
    si_gun_gu_code    VARCHAR(10),
    is_pinned         BOOLEAN DEFAULT FALSE,
    view_count        INT DEFAULT 0,
    like_count        INT DEFAULT 0,
    comment_count     INT DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ,
    deleted_at        TIMESTAMPTZ
);

ALTER TABLE content.community_posts ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'APPROVED';
ALTER TABLE content.community_posts ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0;
ALTER TABLE content.community_posts ADD COLUMN IF NOT EXISTS auto_flag_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_community_posts_si_gun_gu
    ON content.community_posts(si_gun_gu_code) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_org
    ON content.community_posts(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_type
    ON content.community_posts(post_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_mod_status
    ON content.community_posts(moderation_status) WHERE moderation_status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_community_posts_org_id
    ON content.community_posts (organization_id)
    WHERE organization_id IS NOT NULL AND deleted_at IS NULL;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_community_posts_organization'
    ) THEN
        ALTER TABLE content.community_posts
            ADD CONSTRAINT fk_community_posts_organization
            FOREIGN KEY (organization_id) REFERENCES content.organizations(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- post_reports / moderation_actions (V023)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content.post_reports (
    id                  BIGSERIAL PRIMARY KEY,
    post_id             BIGINT NOT NULL REFERENCES content.community_posts(id),
    reporter_user_id    BIGINT NOT NULL,
    category            VARCHAR(20) NOT NULL,
    reason              TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resolved_by_user_id BIGINT,
    resolution_note     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS content.moderation_actions (
    id                BIGSERIAL PRIMARY KEY,
    post_id           BIGINT NOT NULL REFERENCES content.community_posts(id),
    moderator_user_id BIGINT NOT NULL,
    action_type       VARCHAR(20) NOT NULL,
    reason            TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_reports_post ON content.post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status
    ON content.post_reports(status) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_moderation_actions_post ON content.moderation_actions(post_id);

-- ---------------------------------------------------------------------------
-- competition_visits (V014 + V020 expires_at)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content.competition_visits (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    competition_id      BIGINT NOT NULL REFERENCES content.competitions(id),
    first_visited_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ,
    invite_code_version VARCHAR(50),
    UNIQUE(user_id, competition_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_visits_user
    ON content.competition_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_visits_expires
    ON content.competition_visits(expires_at) WHERE expires_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- live_streams (V027)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content.live_streams (
    id                BIGSERIAL       PRIMARY KEY,
    title             VARCHAR(255)    NOT NULL,
    description       TEXT,
    streamer_user_id  BIGINT          NOT NULL,
    match_id          BIGINT          REFERENCES content.matches(id) ON DELETE SET NULL,
    stream_key        VARCHAR(255)    NOT NULL UNIQUE,
    stream_url        VARCHAR(500),
    thumbnail_url     VARCHAR(500),
    status            VARCHAR(20)     NOT NULL DEFAULT 'SCHEDULED',
    visibility        VARCHAR(20)     NOT NULL DEFAULT 'PUBLIC',
    scheduled_at      TIMESTAMPTZ,
    started_at        TIMESTAMPTZ,
    ended_at          TIMESTAMPTZ,
    peak_viewer_count INTEGER         NOT NULL DEFAULT 0,
    total_view_count  BIGINT          NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_live_streams_streamer
    ON content.live_streams(streamer_user_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status
    ON content.live_streams(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_live_streams_match
    ON content.live_streams(match_id) WHERE match_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_live_streams_scheduled
    ON content.live_streams(scheduled_at) WHERE status = 'SCHEDULED' AND deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- public_links (V028)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content.public_links (
    id            BIGSERIAL    PRIMARY KEY,
    slug          VARCHAR(100) NOT NULL,
    resource_type VARCHAR(30)  NOT NULL,
    resource_id   BIGINT       NOT NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_public_links_slug
    ON content.public_links (slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_public_links_resource
    ON content.public_links (resource_type, resource_id) WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- organization_sites + pages/sections/themes (V029)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content.organization_sites (
    id               BIGSERIAL    PRIMARY KEY,
    owner_type       VARCHAR(30)  NOT NULL,
    owner_id         BIGINT       NOT NULL,
    title            VARCHAR(200),
    description      TEXT,
    meta_title       VARCHAR(200),
    meta_description VARCHAR(500),
    favicon_url      VARCHAR(500),
    is_published     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_org_sites_owner
    ON content.organization_sites (owner_type, owner_id);

CREATE TABLE IF NOT EXISTS content.organization_site_pages (
    id            BIGSERIAL    PRIMARY KEY,
    site_id       BIGINT       NOT NULL REFERENCES content.organization_sites(id) ON DELETE CASCADE,
    page_key      VARCHAR(50)  NOT NULL,
    title         VARCHAR(200),
    display_order INTEGER      NOT NULL DEFAULT 0,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_site_pages_key
    ON content.organization_site_pages (site_id, page_key);

CREATE TABLE IF NOT EXISTS content.organization_site_sections (
    id            BIGSERIAL    PRIMARY KEY,
    page_id       BIGINT       NOT NULL REFERENCES content.organization_site_pages(id) ON DELETE CASCADE,
    section_type  VARCHAR(30)  NOT NULL,
    title         VARCHAR(200),
    content_json  JSONB,
    display_order INTEGER      NOT NULL DEFAULT 0,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content.organization_site_themes (
    id              BIGSERIAL    PRIMARY KEY,
    site_id         BIGINT       NOT NULL REFERENCES content.organization_sites(id) ON DELETE CASCADE,
    primary_color   VARCHAR(20),
    secondary_color VARCHAR(20),
    font_family     VARCHAR(100),
    logo_url        VARCHAR(500),
    banner_url      VARCHAR(500),
    custom_css      TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_site_themes
    ON content.organization_site_themes (site_id);

-- ---------------------------------------------------------------------------
-- shares (raw db/migrations/V026__create_shares.sql 포트)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content.shares (
    id           BIGSERIAL    PRIMARY KEY,
    content_id   BIGINT       NOT NULL,
    content_type VARCHAR(20)  NOT NULL,
    user_id      BIGINT       NOT NULL,
    platform     VARCHAR(30)  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shares_content
    ON content.shares (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_shares_user
    ON content.shares (user_id);
CREATE INDEX IF NOT EXISTS idx_shares_created
    ON content.shares (created_at DESC);

-- ---------------------------------------------------------------------------
-- content_likes (entity-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content.content_likes (
    id           BIGSERIAL    PRIMARY KEY,
    user_id      BIGINT       NOT NULL,
    content_type VARCHAR(20)  NOT NULL,
    content_id   BIGINT       NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_content_likes UNIQUE (user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_content_likes_target
    ON content.content_likes (content_type, content_id);

-- ---------------------------------------------------------------------------
-- match_timeline_events (entity-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content.match_timeline_events (
    id                BIGSERIAL    PRIMARY KEY,
    content_type      VARCHAR(20)  NOT NULL,
    content_id        BIGINT       NOT NULL,
    event_type        VARCHAR(30)  NOT NULL,
    timestamp_seconds INTEGER      NOT NULL,
    description       VARCHAR(500),
    team_id           BIGINT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_timeline_target
    ON content.match_timeline_events (content_type, content_id);

-- ---------------------------------------------------------------------------
-- view_history -> view_histories (V017): rename if needed + entity columns
-- ---------------------------------------------------------------------------
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'content' AND table_name = 'view_history'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'content' AND table_name = 'view_histories'
    ) THEN
        ALTER TABLE content.view_history RENAME TO view_histories;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS content.view_histories (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    asset_type      VARCHAR(10)  NOT NULL,
    asset_id        BIGINT       NOT NULL,
    last_position   INT          DEFAULT 0,
    watch_duration  INT          DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE content.view_histories ADD COLUMN IF NOT EXISTS watch_duration_seconds INTEGER DEFAULT 0;
ALTER TABLE content.view_histories ADD COLUMN IF NOT EXISTS last_position_seconds INTEGER DEFAULT 0;
ALTER TABLE content.view_histories ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

UPDATE content.view_histories SET watch_duration_seconds = watch_duration
    WHERE watch_duration_seconds IS NULL OR watch_duration_seconds = 0;
UPDATE content.view_histories SET last_position_seconds = last_position
    WHERE last_position_seconds IS NULL OR last_position_seconds = 0;

DROP INDEX IF EXISTS content.idx_view_history_user_id;
DROP INDEX IF EXISTS content.idx_view_history_asset;

CREATE INDEX IF NOT EXISTS idx_view_histories_user_id
    ON content.view_histories (user_id);
CREATE INDEX IF NOT EXISTS idx_view_histories_asset
    ON content.view_histories (asset_type, asset_id);
