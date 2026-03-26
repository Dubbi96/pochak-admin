-- ============================================================================
-- V006: User Relations (identity portion of ADR-001)
-- Adds user-to-user relationship tracking (family/coach/guardian/friend)
-- ============================================================================

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
