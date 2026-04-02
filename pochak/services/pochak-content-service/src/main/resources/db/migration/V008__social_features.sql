-- ============================================================================
-- V008: Social Features (Phase 7)
-- ============================================================================

-- Step 1: Organization access_type model
ALTER TABLE content.organizations
    ADD COLUMN IF NOT EXISTS access_type VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    ADD COLUMN IF NOT EXISTS auto_approve BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS manager_only_booking BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS default_content_visibility VARCHAR(30) NOT NULL DEFAULT 'PUBLIC';

COMMENT ON COLUMN content.organizations.access_type IS 'OPEN = 포착 시티 (open community), CLOSED = 포착 클럽 (closed/private)';
COMMENT ON COLUMN content.organizations.auto_approve IS 'true for OPEN (auto-approve joins), false for CLOSED (manual approval)';
COMMENT ON COLUMN content.organizations.manager_only_booking IS 'false for OPEN (anyone can book), true for CLOSED (manager only)';
COMMENT ON COLUMN content.organizations.default_content_visibility IS 'PUBLIC for OPEN, MEMBERS_ONLY for CLOSED';

CREATE INDEX IF NOT EXISTS idx_organizations_access_type ON content.organizations(access_type);

-- Step 2: Membership approval flow enhancements
ALTER TABLE content.memberships
    ADD COLUMN IF NOT EXISTS approved_by BIGINT,
    ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500),
    ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE content.memberships
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

COMMENT ON COLUMN content.memberships.approved_by IS 'User ID of manager/admin who approved or rejected';
COMMENT ON COLUMN content.memberships.rejection_reason IS 'Reason for rejection, if applicable';

CREATE INDEX IF NOT EXISTS idx_memberships_active ON content.memberships(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_memberships_approved_by ON content.memberships(approved_by) WHERE approved_by IS NOT NULL;

-- Step 3: Comments table
CREATE TABLE IF NOT EXISTS content.comments (
    id              BIGSERIAL PRIMARY KEY,
    content_id      BIGINT NOT NULL,
    content_type    VARCHAR(20) NOT NULL,
    user_id         BIGINT NOT NULL,        -- identity.users(id) cross-schema
    body            VARCHAR(2000) NOT NULL,
    parent_id       BIGINT REFERENCES content.comments(id),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_content ON content.comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON content.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON content.comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_created ON content.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_not_deleted ON content.comments(content_type, content_id)
    WHERE is_deleted = FALSE;

-- Step 4: Follows table
CREATE TABLE IF NOT EXISTS content.follows (
    id                  BIGSERIAL PRIMARY KEY,
    follower_user_id    BIGINT NOT NULL,        -- identity.users(id) cross-schema
    target_type         VARCHAR(30) NOT NULL,
    target_id           BIGINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(follower_user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON content.follows(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_follows_target ON content.follows(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_follows_created ON content.follows(created_at DESC);
