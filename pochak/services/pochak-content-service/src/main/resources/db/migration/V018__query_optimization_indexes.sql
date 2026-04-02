-- DATA-004: Composite indexes for membership scope-filtered queries (content portion)

-- Membership: composite index for scope-filtered queries
CREATE INDEX IF NOT EXISTS idx_memberships_user_active_scope
    ON content.memberships (user_id, is_active, target_type, target_id)
    WHERE is_active = true;

-- Membership: composite index for approved active members per target
CREATE INDEX IF NOT EXISTS idx_memberships_target_active_approved
    ON content.memberships (target_type, target_id, approval_status, is_active)
    WHERE is_active = true AND approval_status = 'APPROVED';
