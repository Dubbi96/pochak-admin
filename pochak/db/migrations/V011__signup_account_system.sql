-- V011: Signup & Account System
-- Adds phone/email verification, guardian support, and system config

-- 1. Users table additions
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS login_id VARCHAR(100);
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS is_minor BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS guardian_user_id BIGINT REFERENCES identity.users(id);
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR(20);
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS guardian_consent_at TIMESTAMPTZ;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS guardian_override_limit INT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_login_id ON identity.users(login_id) WHERE login_id IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON identity.users(phone_number) WHERE phone_number IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_guardian ON identity.users(guardian_user_id);

-- 2. Phone verifications
CREATE TABLE IF NOT EXISTS identity.phone_verifications (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    purpose VARCHAR(30) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_token VARCHAR(200),
    attempt_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_phone_ver_phone ON identity.phone_verifications(phone, purpose);

-- 3. Email verifications (foreigner)
CREATE TABLE IF NOT EXISTS identity.email_verifications (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    purpose VARCHAR(30) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_token VARCHAR(200),
    attempt_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. System config
CREATE TABLE IF NOT EXISTS admin.system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO admin.system_config (config_key, config_value, description) VALUES
    ('MAX_MINOR_ACCOUNTS_PER_GUARDIAN', '5', '법정대리인 1인당 최대 미성년자 계정 수'),
    ('PHONE_VERIFY_CODE_LENGTH', '6', 'SMS 인증 코드 자릿수'),
    ('PHONE_VERIFY_EXPIRY_SECONDS', '180', 'SMS 인증 코드 유효시간')
ON CONFLICT (config_key) DO NOTHING;
