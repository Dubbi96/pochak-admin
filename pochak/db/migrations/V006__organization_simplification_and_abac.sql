-- ============================================================================
-- V006: Organization Simplification + ABAC (ADR-001)
--
-- 1. 조직 통합: associations + organizations + branches → organizations 단일
-- 2. 멤버십 통합: team_members → memberships
-- 3. ABAC: video_acl, user_relations 추가
-- ============================================================================

-- ── Step 1: 기존 테이블 드롭 (새로 시작하므로 데이터 이관 불필요) ──

DROP TABLE IF EXISTS content.team_members CASCADE;
DROP TABLE IF EXISTS content.branches CASCADE;

-- 기존 organizations 테이블 재생성 (associations 통합)
DROP TABLE IF EXISTS content.associations CASCADE;

-- organizations 테이블에 새 컬럼 추가 (이미 존재하면 ALTER)
ALTER TABLE content.organizations
    ADD COLUMN IF NOT EXISTS parent_id BIGINT REFERENCES content.organizations(id),
    ADD COLUMN IF NOT EXISTS can_host_competition BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_auto_join BOOLEAN NOT NULL DEFAULT FALSE;

-- org_type 확장: 기존 PRIVATE/PUBLIC에 ASSOCIATION 추가
-- (VARCHAR이므로 enum 변경 불필요, 값만 추가)

-- teams에 organization_id 추가
ALTER TABLE content.teams
    ADD COLUMN IF NOT EXISTS organization_id BIGINT REFERENCES content.organizations(id);

-- ── Step 2: 멤버십 통합 테이블 ──

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

-- ── Step 3: 영상 접근 제어 (ABAC) ──

CREATE TABLE IF NOT EXISTS content.video_acl (
    id              BIGSERIAL PRIMARY KEY,
    content_type    VARCHAR(10) NOT NULL,   -- LIVE / VOD / CLIP
    content_id      BIGINT NOT NULL,
    default_policy  VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    -- PUBLIC / AUTHENTICATED / SUBSCRIBERS / MEMBERS_ONLY / PRIVATE
    policy          JSONB NOT NULL DEFAULT '{}',
    -- 구조:
    -- {
    --   "allowedUsers": [1001, 1002],
    --   "blockedUsers": [2001],
    --   "allowedRoles": ["MANAGER", "COACH"],
    --   "allowedRelations": ["family", "coach"],
    --   "allowedOrganizations": [100, 101],
    --   "allowedTeams": [50, 51],
    --   "protectionLevel": "STANDARD",
    --   "validFrom": "2026-01-01T00:00:00Z",
    --   "validUntil": "2026-12-31T23:59:59Z"
    -- }
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_video_acl_content ON content.video_acl(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_video_acl_policy ON content.video_acl USING GIN (policy);

-- ── Step 4: 사용자 관계 (가족/코치/보호자) ──

CREATE TABLE IF NOT EXISTS identity.user_relations (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,        -- identity.users(id)
    related_user_id BIGINT NOT NULL,        -- identity.users(id)
    relation_type   VARCHAR(20) NOT NULL,   -- FAMILY / COACH / GUARDIAN / FRIEND
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, related_user_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_user_relations_user ON identity.user_relations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_relations_related ON identity.user_relations(related_user_id);

-- ── Step 5: organizations 인덱스 보강 ──

CREATE INDEX IF NOT EXISTS idx_organizations_parent ON content.organizations(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_type ON content.organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_competition ON content.organizations(can_host_competition) WHERE can_host_competition = TRUE;
CREATE INDEX IF NOT EXISTS idx_teams_org ON content.teams(organization_id) WHERE organization_id IS NOT NULL;
