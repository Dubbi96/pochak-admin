-- POC-223: BO 관리자 테스트 계정 seed
-- 기존 admin 계정: login_id='admin', password='admin1234!'
-- 신규 테스트 계정: login_id='test_admin', password='Pochak2026!'

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
