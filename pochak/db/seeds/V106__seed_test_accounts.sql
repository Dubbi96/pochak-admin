-- POC-223/224/225: 테스트 계정 seed
-- BO 관리자: login_id='admin' / 'test_admin', password='admin1234!' / 'Pochak2026!'
-- Web/App 유저: email='user@pochak.live', password='Pochak2026!'
-- Partner: email='partner@pochak.live', password='Pochak2026!'

INSERT INTO admin.admin_users (login_id, password_hash, name, email, is_blocked, fail_count, is_active, created_at, updated_at)
VALUES (
    'test_admin',
    '$2b$10$edMHq3tU2zvI0/GmiXfyKugvySszi3naUYk7rpa2xrdYqhXtGVxSi',
    '테스트관리자',
    'testadmin@pochak.com',
    false,
    0,
    true,
    NOW(),
    NOW()
) ON CONFLICT (login_id) DO NOTHING;

-- POCHAK_ADMIN 그룹(id=1)에 test_admin 매핑
INSERT INTO admin.admin_group_users (group_id, admin_user_id, created_at)
SELECT 1, u.id, NOW()
FROM admin.admin_users u
WHERE u.login_id = 'test_admin'
ON CONFLICT DO NOTHING;

-- POC-224: Web/App 테스트 유저 계정 (이메일 로그인, identity 서비스)
-- password: Pochak2026!  hash: $2b$10$edMHq3tU2zvI0/GmiXfyKugvySszi3naUYk7rpa2xrdYqhXtGVxSi
INSERT INTO identity.users (email, password_hash, nickname, phone_number, status, role, is_marketing, is_minor, phone_verified, created_at, updated_at)
SELECT 'user@pochak.live', '$2b$10$edMHq3tU2zvI0/GmiXfyKugvySszi3naUYk7rpa2xrdYqhXtGVxSi', '포착유저', NULL, 'ACTIVE', 'USER', false, false, false, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM identity.users WHERE email = 'user@pochak.live');

INSERT INTO identity.user_auth_accounts (user_id, provider, provider_user_id, provider_email, created_at, updated_at)
SELECT u.id, 'EMAIL', 'user@pochak.live', 'user@pochak.live', NOW(), NOW()
FROM identity.users u
WHERE u.email = 'user@pochak.live'
  AND NOT EXISTS (SELECT 1 FROM identity.user_auth_accounts WHERE provider = 'EMAIL' AND provider_user_id = 'user@pochak.live');

INSERT INTO commerce.wallets (user_id, balance, created_at, updated_at)
SELECT u.id, 50000, NOW(), NOW()
FROM identity.users u
WHERE u.email = 'user@pochak.live'
ON CONFLICT (user_id) DO NOTHING;
