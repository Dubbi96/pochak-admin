-- BIZ-006: Community moderation tables and fields
-- Hybrid moderation: post-moderation default, pre-moderation for warned users
-- 9-category report system with org-level moderators (ADMIN/MANAGER)

-- Post reports
CREATE TABLE IF NOT EXISTS content.post_reports (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES content.community_posts(id),
    reporter_user_id BIGINT NOT NULL,
    category VARCHAR(20) NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resolved_by_user_id BIGINT,
    resolution_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Moderation actions
CREATE TABLE IF NOT EXISTS content.moderation_actions (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES content.community_posts(id),
    moderator_user_id BIGINT NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add moderation fields to community_posts
ALTER TABLE content.community_posts ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'APPROVED';
ALTER TABLE content.community_posts ADD COLUMN IF NOT EXISTS warning_count INTEGER DEFAULT 0;
ALTER TABLE content.community_posts ADD COLUMN IF NOT EXISTS auto_flag_reason TEXT;

-- Indexes for efficient querying
CREATE INDEX idx_post_reports_post ON content.post_reports(post_id);
CREATE INDEX idx_post_reports_status ON content.post_reports(status) WHERE status = 'PENDING';
CREATE INDEX idx_moderation_actions_post ON content.moderation_actions(post_id);
CREATE INDEX idx_community_posts_mod_status ON content.community_posts(moderation_status) WHERE moderation_status = 'PENDING';
