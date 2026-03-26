CREATE TABLE IF NOT EXISTS content.community_posts (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT,
    author_user_id BIGINT NOT NULL,
    post_type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    image_urls TEXT,
    si_gun_gu_code VARCHAR(10),
    is_pinned BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_community_posts_si_gun_gu ON content.community_posts(si_gun_gu_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_community_posts_org ON content.community_posts(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_community_posts_type ON content.community_posts(post_type) WHERE deleted_at IS NULL;
