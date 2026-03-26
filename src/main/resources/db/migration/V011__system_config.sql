-- V011: System config (admin portion)

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
