-- ============================================================
-- V012: Fix identity schema to match JPA Entity definitions
-- ============================================================

-- 1. Add columns that Entity expects but DB doesn't have
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER';
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS login_id VARCHAR(100);
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS is_minor BOOLEAN DEFAULT false;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS guardian_user_id BIGINT;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR(20);
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS guardian_consent_at TIMESTAMP;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS guardian_override_limit INTEGER;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS is_marketing BOOLEAN DEFAULT false;

-- 2. Copy data from old columns to new columns
UPDATE identity.users SET birth_date = birthday WHERE birth_date IS NULL AND birthday IS NOT NULL;
UPDATE identity.users SET phone_number = phone WHERE phone_number IS NULL AND phone IS NOT NULL;
UPDATE identity.users SET profile_image_url = profile_image WHERE profile_image_url IS NULL AND profile_image IS NOT NULL;
UPDATE identity.users SET nickname = username WHERE nickname IS NULL AND username IS NOT NULL;
UPDATE identity.users SET nickname = 'user_' || id WHERE nickname IS NULL OR nickname = '';

-- 3. Make legacy NOT NULL columns nullable (Entity doesn't use them)
ALTER TABLE identity.users ALTER COLUMN username DROP NOT NULL;
ALTER TABLE identity.users ALTER COLUMN name DROP NOT NULL;

-- 4. Fix user_auth_accounts
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE identity.user_auth_accounts ADD COLUMN IF NOT EXISTS provider_user_id VARCHAR(255);
ALTER TABLE identity.user_auth_accounts ADD COLUMN IF NOT EXISTS provider_email VARCHAR(255);
ALTER TABLE identity.user_auth_accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE identity.user_auth_accounts ALTER COLUMN provider_key DROP NOT NULL;

-- Copy provider_key to provider_user_id
UPDATE identity.user_auth_accounts SET provider_user_id = provider_key WHERE provider_user_id IS NULL;

-- 5. Fix user_refresh_tokens
ALTER TABLE identity.user_refresh_tokens ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE identity.user_refresh_tokens ALTER COLUMN expires_at DROP NOT NULL;
