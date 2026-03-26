-- DATA-004: Composite indexes for entitlement scope-filtered queries (commerce portion)

-- Entitlement: composite index for findActiveByUserAndScope / existsActiveByUserAndScope
CREATE INDEX IF NOT EXISTS idx_entitlements_user_active_scope
    ON commerce.entitlements (user_id, is_active, scope_type, scope_id)
    WHERE is_active = true;

-- Entitlement: covering index for time-bounded active lookups
CREATE INDEX IF NOT EXISTS idx_entitlements_user_active_type_time
    ON commerce.entitlements (user_id, is_active, entitlement_type, starts_at, expires_at)
    WHERE is_active = true;
