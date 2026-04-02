-- ============================================================================
-- V002: Content Schema
-- Pochak OTT Platform - Sports, teams, matches, media assets, and engagement
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS content;

-- 종목
CREATE TABLE IF NOT EXISTS content.sports (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(50) NOT NULL UNIQUE,
    image_url       VARCHAR(500),
    display_order   SMALLINT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 종목 태그
CREATE TABLE IF NOT EXISTS content.sport_tags (
    id              SERIAL PRIMARY KEY,
    sport_id        INT NOT NULL REFERENCES content.sports(id),
    name            VARCHAR(100) NOT NULL,
    english_name    VARCHAR(100),
    image_url       VARCHAR(500),
    display_order   SMALLINT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 협회
CREATE TABLE IF NOT EXISTS content.associations (
    id              BIGSERIAL PRIMARY KEY,
    sport_id        INT NOT NULL REFERENCES content.sports(id),
    name            VARCHAR(200) NOT NULL,
    short_name      VARCHAR(20),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    website_url     VARCHAR(500),
    description     TEXT,
    phone           VARCHAR(20),
    si_gun_gu_code  VARCHAR(10),
    is_auto_join    BOOLEAN NOT NULL DEFAULT FALSE,
    is_displayed    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 단체 (폐쇄형/개방형)
CREATE TABLE IF NOT EXISTS content.organizations (
    id              BIGSERIAL PRIMARY KEY,
    sport_id        INT REFERENCES content.sports(id),
    name            VARCHAR(200) NOT NULL,
    short_name      VARCHAR(20),
    org_type        VARCHAR(20) NOT NULL,   -- PRIVATE / PUBLIC
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    phone           VARCHAR(20),
    website_url     VARCHAR(500),
    description     TEXT,
    si_gun_gu_code  VARCHAR(10),
    member_limit    INT,
    is_displayed    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 지점
CREATE TABLE IF NOT EXISTS content.branches (
    id              BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES content.organizations(id),
    name            VARCHAR(200) NOT NULL,
    short_name      VARCHAR(20),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    phone           VARCHAR(20),
    si_gun_gu_code  VARCHAR(10),
    is_displayed    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 팀
-- NOTE: manager_user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS content.teams (
    id              BIGSERIAL PRIMARY KEY,
    sport_id        INT NOT NULL REFERENCES content.sports(id),
    name            VARCHAR(200) NOT NULL,
    short_name      VARCHAR(20),
    team_type       VARCHAR(20) NOT NULL,   -- ELITE / CLUB
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    phone           VARCHAR(20),
    website_url     VARCHAR(500),
    description     TEXT,
    manager_user_id BIGINT,                 -- identity.users(id) 참조 (cross-schema)
    si_gun_gu_code  VARCHAR(10),
    is_auto_join    BOOLEAN NOT NULL DEFAULT FALSE,
    is_displayed    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 팀 멤버
-- NOTE: user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS content.team_members (
    id              BIGSERIAL PRIMARY KEY,
    team_id         BIGINT NOT NULL REFERENCES content.teams(id),
    user_id         BIGINT NOT NULL,        -- identity.users(id) 참조 (cross-schema)
    member_type     VARCHAR(20) NOT NULL,
    position_id     INT,
    uniform_number  INT,
    nickname        VARCHAR(100),
    join_type       VARCHAR(20),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE(team_id, user_id)
);

-- 대회
CREATE TABLE IF NOT EXISTS content.competitions (
    id              BIGSERIAL PRIMARY KEY,
    sport_id        INT REFERENCES content.sports(id),
    name            VARCHAR(200) NOT NULL,
    short_name      VARCHAR(50),
    competition_type VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    start_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ NOT NULL,
    website_url     VARCHAR(500),
    description     TEXT,
    qualification   TEXT,
    rules           TEXT,
    is_free         BOOLEAN NOT NULL DEFAULT FALSE,
    is_displayed    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 경기 일정
-- NOTE: venue_id references operation.venues(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS content.matches (
    id              BIGSERIAL PRIMARY KEY,
    competition_id  BIGINT REFERENCES content.competitions(id),
    venue_id        INT,                    -- operation.venues(id) 참조 (cross-schema)
    sport_id        INT REFERENCES content.sports(id),
    name            VARCHAR(200) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    home_score      INT,
    away_score      INT,
    is_panorama     BOOLEAN NOT NULL DEFAULT FALSE,
    is_scoreboard   BOOLEAN NOT NULL DEFAULT FALSE,
    is_displayed    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 경기 참가팀
CREATE TABLE IF NOT EXISTS content.match_participants (
    id              BIGSERIAL PRIMARY KEY,
    match_id        BIGINT NOT NULL REFERENCES content.matches(id),
    team_id         BIGINT NOT NULL REFERENCES content.teams(id),
    side            VARCHAR(10) NOT NULL,
    team_name       VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LIVE 자산
-- NOTE: camera_id references operation.cameras(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS content.live_assets (
    id              BIGSERIAL PRIMARY KEY,
    match_id        BIGINT REFERENCES content.matches(id),
    camera_id       BIGINT,                 -- operation.cameras(id) 참조 (cross-schema)
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    stream_url      VARCHAR(500),
    panorama_url    VARCHAR(500),
    hd_url          VARCHAR(500),
    thumbnail_url   VARCHAR(500),
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ,
    view_count      INT NOT NULL DEFAULT 0,
    visibility      VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    owner_type      VARCHAR(20),
    owner_id        BIGINT,
    pixellot_event_id VARCHAR(100),
    is_displayed    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- VOD 자산
CREATE TABLE IF NOT EXISTS content.vod_assets (
    id              BIGSERIAL PRIMARY KEY,
    match_id        BIGINT REFERENCES content.matches(id),
    live_asset_id   BIGINT REFERENCES content.live_assets(id),
    title           VARCHAR(200) NOT NULL,
    vod_url         VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500),
    duration        INT NOT NULL DEFAULT 0,
    encoding_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    encoding_progress INT DEFAULT 0,
    view_count      INT NOT NULL DEFAULT 0,
    visibility      VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    owner_type      VARCHAR(20),
    owner_id        BIGINT,
    is_main         BOOLEAN NOT NULL DEFAULT FALSE,
    is_displayed    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- CLIP 자산
-- NOTE: creator_user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS content.clip_assets (
    id              BIGSERIAL PRIMARY KEY,
    source_type     VARCHAR(10) NOT NULL,
    source_id       BIGINT NOT NULL,
    match_id        BIGINT REFERENCES content.matches(id),
    creator_user_id BIGINT NOT NULL,        -- identity.users(id) 참조 (cross-schema)
    title           VARCHAR(255) NOT NULL,
    clip_url        VARCHAR(500),
    thumbnail_url   VARCHAR(500),
    start_time_sec  INT NOT NULL,
    end_time_sec    INT NOT NULL,
    duration        INT NOT NULL,
    encoding_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    view_count      INT NOT NULL DEFAULT 0,
    visibility      VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    visible_team_id BIGINT,
    is_displayed    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 태그
-- NOTE: tagger_user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS content.asset_tags (
    id              BIGSERIAL PRIMARY KEY,
    sport_tag_id    INT REFERENCES content.sport_tags(id),
    asset_type      VARCHAR(10) NOT NULL,
    asset_id        BIGINT NOT NULL,
    tagger_user_id  BIGINT NOT NULL,        -- identity.users(id) 참조 (cross-schema)
    tag_time_sec    INT NOT NULL,
    tag_name        VARCHAR(100),
    team_id         BIGINT REFERENCES content.teams(id),
    uniform_number  INT,
    visibility      VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    is_displayed    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 시청 기록
-- NOTE: user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS content.view_history (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,        -- identity.users(id) 참조 (cross-schema)
    asset_type      VARCHAR(10) NOT NULL,
    asset_id        BIGINT NOT NULL,
    last_position   INT DEFAULT 0,
    watch_duration  INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 전시 섹션
CREATE TABLE IF NOT EXISTS content.display_sections (
    id              SERIAL PRIMARY KEY,
    section_type    VARCHAR(30) NOT NULL,
    title           VARCHAR(200),
    page            VARCHAR(30) NOT NULL,
    display_order   SMALLINT NOT NULL DEFAULT 0,
    config          JSONB,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 즐겨찾기
-- NOTE: user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS content.favorites (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,        -- identity.users(id) 참조 (cross-schema)
    target_type     VARCHAR(20) NOT NULL,
    target_id       BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- 시청 예약
-- NOTE: user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS content.watch_reservations (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,        -- identity.users(id) 참조 (cross-schema)
    match_id        BIGINT NOT NULL REFERENCES content.matches(id),
    notify_before   INT DEFAULT 10,
    is_notified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 알림
CREATE TABLE IF NOT EXISTS content.notifications (
    id              BIGSERIAL PRIMARY KEY,
    notification_type VARCHAR(30) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL,
    link_url        VARCHAR(500),
    is_advertisement BOOLEAN NOT NULL DEFAULT FALSE,
    send_at         TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 알림 수신 기록
-- NOTE: user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS content.notification_recipients (
    id              BIGSERIAL PRIMARY KEY,
    notification_id BIGINT NOT NULL REFERENCES content.notifications(id),
    user_id         BIGINT NOT NULL,        -- identity.users(id) 참조 (cross-schema)
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    is_clicked      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Sport lookups
CREATE INDEX IF NOT EXISTS idx_sports_code ON content.sports (code);
CREATE INDEX IF NOT EXISTS idx_sports_active_order ON content.sports (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_sport_tags_sport_id ON content.sport_tags (sport_id);

-- Association / Organization / Branch lookups
CREATE INDEX IF NOT EXISTS idx_associations_sport_id ON content.associations (sport_id);
CREATE INDEX IF NOT EXISTS idx_organizations_sport_id ON content.organizations (sport_id);
CREATE INDEX IF NOT EXISTS idx_branches_organization_id ON content.branches (organization_id);

-- Team lookups
CREATE INDEX IF NOT EXISTS idx_teams_sport_id ON content.teams (sport_id);
CREATE INDEX IF NOT EXISTS idx_teams_displayed ON content.teams (is_displayed) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON content.team_members (user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON content.team_members (team_id);

-- Match status and time queries
CREATE INDEX IF NOT EXISTS idx_matches_status ON content.matches (status);
CREATE INDEX IF NOT EXISTS idx_matches_start_time ON content.matches (start_time);
CREATE INDEX IF NOT EXISTS idx_matches_sport_status_time ON content.matches (sport_id, status, start_time);
CREATE INDEX IF NOT EXISTS idx_matches_displayed ON content.matches (is_displayed) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON content.match_participants (match_id);

-- Competition lookups
CREATE INDEX IF NOT EXISTS idx_competitions_sport_id ON content.competitions (sport_id);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON content.competitions (status);

-- Asset visibility and display
CREATE INDEX IF NOT EXISTS idx_live_assets_match_id ON content.live_assets (match_id);
CREATE INDEX IF NOT EXISTS idx_live_assets_status ON content.live_assets (status);
CREATE INDEX IF NOT EXISTS idx_live_assets_visibility ON content.live_assets (visibility, is_displayed) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vod_assets_match_id ON content.vod_assets (match_id);
CREATE INDEX IF NOT EXISTS idx_vod_assets_visibility ON content.vod_assets (visibility, is_displayed) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clip_assets_match_id ON content.clip_assets (match_id);
CREATE INDEX IF NOT EXISTS idx_clip_assets_creator ON content.clip_assets (creator_user_id);
CREATE INDEX IF NOT EXISTS idx_clip_assets_visibility ON content.clip_assets (visibility, is_displayed) WHERE deleted_at IS NULL;

-- Asset tags
CREATE INDEX IF NOT EXISTS idx_asset_tags_asset ON content.asset_tags (asset_type, asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_tags_sport_tag ON content.asset_tags (sport_tag_id);

-- View history
CREATE INDEX IF NOT EXISTS idx_view_history_user_id ON content.view_history (user_id);
CREATE INDEX IF NOT EXISTS idx_view_history_asset ON content.view_history (asset_type, asset_id);

-- User favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON content.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_target ON content.favorites (target_type, target_id);

-- Watch reservations
CREATE INDEX IF NOT EXISTS idx_watch_reservations_user_id ON content.watch_reservations (user_id);
CREATE INDEX IF NOT EXISTS idx_watch_reservations_match_id ON content.watch_reservations (match_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_id ON content.notification_recipients (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification_id ON content.notification_recipients (notification_id);
CREATE INDEX IF NOT EXISTS idx_notifications_send_at ON content.notifications (send_at);

-- Display sections
CREATE INDEX IF NOT EXISTS idx_display_sections_page_active ON content.display_sections (page, is_active, display_order);
