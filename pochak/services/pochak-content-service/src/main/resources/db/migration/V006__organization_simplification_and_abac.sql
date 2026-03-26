-- ============================================================================
-- V006: Organization Simplification + ABAC (ADR-001) - content portion
-- ============================================================================

-- Step 1: Drop deprecated tables
DROP TABLE IF EXISTS content.team_members CASCADE;
DROP TABLE IF EXISTS content.branches CASCADE;
DROP TABLE IF EXISTS content.associations CASCADE;

-- Organizations: add new columns
ALTER TABLE content.organizations
    ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES content.organizations(id),
    ADD COLUMN IF NOT EXISTS can_host_competition BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_auto_join BOOLEAN NOT NULL DEFAULT FALSE;

-- teams: add organization_id
ALTER TABLE content.teams
    ADD COLUMN IF NOT EXISTS organization_id BIGINT REFERENCES content.organizations(id);

-- Step 2: Membership unified table
CREATE TABLE IF NOT EXISTS content.memberships (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    target_type     VARCHAR(20) NOT NULL,   -- ORGANIZATION / TEAM
    target_id       BIGINT NOT NULL,
    role            VARCHAR(20) NOT NULL,   -- ADMIN / MANAGER / COACH / PLAYER / GUARDIAN / MEMBER
    position_id     INT,
    uniform_number  INT,
    nickname        VARCHAR(100),
    join_type       VARCHAR(20),            -- DIRECT / INVITED / AUTO
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON content.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_target ON content.memberships(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON content.memberships(role);
CREATE INDEX IF NOT EXISTS idx_memberships_approval ON content.memberships(approval_status) WHERE deleted_at IS NULL;

-- Step 3: Video ACL (ABAC)
CREATE TABLE IF NOT EXISTS content.video_acl (
    id              BIGSERIAL PRIMARY KEY,
    content_type    VARCHAR(10) NOT NULL,   -- LIVE / VOD / CLIP
    content_id      BIGINT NOT NULL,
    default_policy  VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    policy          JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_video_acl_content ON content.video_acl(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_video_acl_policy ON content.video_acl USING GIN (policy);

-- Step 5: organizations index improvements
CREATE INDEX IF NOT EXISTS idx_organizations_parent ON content.organizations(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_type ON content.organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_competition ON content.organizations(can_host_competition) WHERE can_host_competition = TRUE;
CREATE INDEX IF NOT EXISTS idx_teams_org ON content.teams(organization_id) WHERE organization_id IS NOT NULL;
