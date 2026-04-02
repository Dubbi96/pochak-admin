-- DATA-004: Composite indexes for entitlement and membership scope-filtered queries.
-- Target: P95 latency < 700ms for scope-based access checks.

-- Entitlement: composite index for findActiveByUserAndScope / existsActiveByUserAndScope
CREATE INDEX IF NOT EXISTS idx_entitlements_user_active_scope
    ON commerce.entitlements (user_id, is_active, scope_type, scope_id)
    WHERE is_active = true;

-- Entitlement: covering index for time-bounded active lookups
CREATE INDEX IF NOT EXISTS idx_entitlements_user_active_type_time
    ON commerce.entitlements (user_id, is_active, entitlement_type, starts_at, expires_at)
    WHERE is_active = true;

-- Membership: composite index for scope-filtered queries
CREATE INDEX IF NOT EXISTS idx_memberships_user_active_scope
    ON content.memberships (user_id, is_active, target_type, target_id)
    WHERE is_active = true;

-- Membership: composite index for approved active members per target (used by popular targets, member listing)
CREATE INDEX IF NOT EXISTS idx_memberships_target_active_approved
    ON content.memberships (target_type, target_id, approval_status, is_active)
    WHERE is_active = true AND approval_status = 'APPROVED';
