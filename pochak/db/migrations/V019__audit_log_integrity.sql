-- SEC-007: Audit log integrity — JSONB detail + SHA-256 hash chain.

-- Convert detail column from TEXT to JSONB
ALTER TABLE admin.audit_logs
    ALTER COLUMN detail TYPE jsonb USING detail::jsonb;

-- Add hash chain columns for tamper detection
ALTER TABLE admin.audit_logs
    ADD COLUMN IF NOT EXISTS hash VARCHAR(64);

ALTER TABLE admin.audit_logs
    ADD COLUMN IF NOT EXISTS previous_hash VARCHAR(64);

-- Index on hash for chain verification queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_hash
    ON admin.audit_logs (hash);

-- Index on created_at for sequential chain lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON admin.audit_logs (created_at);
