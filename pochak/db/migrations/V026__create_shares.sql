-- ============================================================================
-- V026: Shares
-- 콘텐츠 공유 이벤트 기록 (content-service)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content.shares (
    id              BIGSERIAL PRIMARY KEY,
    content_id      BIGINT NOT NULL,
    content_type    VARCHAR(20) NOT NULL,       -- VOD / CLIP / LIVE / MATCH
    user_id         BIGINT NOT NULL,            -- identity.users(id) 참조 (cross-schema)
    platform        VARCHAR(30) NOT NULL,       -- KAKAO / TWITTER / FACEBOOK / INSTAGRAM / LINK / OTHER
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_shares_content
    ON content.shares (content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_shares_user
    ON content.shares (user_id);

CREATE INDEX IF NOT EXISTS idx_shares_created
    ON content.shares (created_at DESC);
