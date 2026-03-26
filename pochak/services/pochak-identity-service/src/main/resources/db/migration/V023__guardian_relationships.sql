-- V023: Guardian relationships table for BIZ-005
-- Decision 5-1: 1:N relationship (separate table)
-- Decision 5-3: Payment limit only (monthly_payment_limit)
-- Decision 5-4: Under 14 years old

CREATE TABLE IF NOT EXISTS identity.guardian_relationships (
    id BIGSERIAL PRIMARY KEY,
    guardian_id BIGINT NOT NULL REFERENCES identity.users(id),
    minor_id BIGINT NOT NULL REFERENCES identity.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    consent_method VARCHAR(20) NOT NULL,
    consented_at TIMESTAMPTZ,
    monthly_payment_limit INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(guardian_id, minor_id)
);

CREATE INDEX idx_guardian_rel_guardian ON identity.guardian_relationships(guardian_id);
CREATE INDEX idx_guardian_rel_minor ON identity.guardian_relationships(minor_id);
