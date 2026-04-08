-- V024: Index for withdrawn user lookup (prevent re-registration with same email hash)
CREATE INDEX IF NOT EXISTS idx_users_withdrawn_email
    ON identity.users(email) WHERE status = 'WITHDRAWN';
