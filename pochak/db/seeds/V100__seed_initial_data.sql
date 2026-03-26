-- ============================================================================
-- V100: Seed Initial Data
-- Pochak OTT Platform - Default admin, roles, groups, sports, and terms
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Default admin user
--    password: admin1234! (bcrypt hash)
-- ----------------------------------------------------------------------------
INSERT INTO admin.admin_users (login_id, password_hash, name, email)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '시스템 관리자',
    'admin@pochak.com'
) ON CONFLICT (login_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Default admin role
-- ----------------------------------------------------------------------------
INSERT INTO admin.admin_roles (name, code, description, display_order, is_active)
VALUES (
    '마스터 BO',
    'MASTER_BO',
    '모든 BO 기능 접근 권한을 가진 최상위 역할',
    1,
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Default admin group
-- ----------------------------------------------------------------------------
INSERT INTO admin.admin_groups (name, code, description, display_order, is_active)
VALUES (
    'Pochak 관리자',
    'POCHAK_ADMIN',
    '포착 플랫폼 최상위 관리자 그룹',
    1,
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Link admin user to group and role
-- ----------------------------------------------------------------------------

-- admin user -> POCHAK_ADMIN group
INSERT INTO admin.admin_group_users (group_id, user_id)
SELECT g.id, u.id
FROM admin.admin_groups g, admin.admin_users u
WHERE g.code = 'POCHAK_ADMIN' AND u.login_id = 'admin'
ON CONFLICT (group_id, user_id) DO NOTHING;

-- POCHAK_ADMIN group -> MASTER_BO role
INSERT INTO admin.admin_group_roles (group_id, role_id)
SELECT g.id, r.id
FROM admin.admin_groups g, admin.admin_roles r
WHERE g.code = 'POCHAK_ADMIN' AND r.code = 'MASTER_BO'
ON CONFLICT (group_id, role_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. Initial sports
-- ----------------------------------------------------------------------------
INSERT INTO content.sports (name, code, display_order, is_active) VALUES
    ('축구',   'SOCCER',     1, TRUE),
    ('농구',   'BASKETBALL', 2, TRUE),
    ('배구',   'VOLLEYBALL', 3, TRUE),
    ('야구',   'BASEBALL',   4, TRUE),
    ('풋살',   'FUTSAL',     5, TRUE)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 6. Initial terms
-- ----------------------------------------------------------------------------
INSERT INTO admin.terms (term_type, title, content, is_essential, is_active, version, effective_date) VALUES
    ('SERVICE',    '서비스이용약관',         '서비스이용약관 내용입니다. 실제 약관 내용으로 교체해 주세요.',        TRUE,  TRUE, 1, NOW()),
    ('PRIVACY',    '개인정보처리방침',       '개인정보처리방침 내용입니다. 실제 약관 내용으로 교체해 주세요.',      TRUE,  TRUE, 1, NOW()),
    ('LOCATION',   '위치기반서비스이용약관', '위치기반서비스이용약관 내용입니다. 실제 약관 내용으로 교체해 주세요.', FALSE, TRUE, 1, NOW()),
    ('MARKETING',  '마케팅수신동의',         '마케팅수신동의 내용입니다. 실제 약관 내용으로 교체해 주세요.',        FALSE, TRUE, 1, NOW())
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. Test user accounts (앱/웹 테스트용)
--    비밀번호: Test1234! (앱에서 직접 가입하거나 아래 계정으로 테스트)
-- ----------------------------------------------------------------------------
INSERT INTO identity.users (username, email, phone, name, birthday, gender, nationality, status, is_marketing, is_age_14_above)
VALUES
    ('testuser',   'test@pochak.co.kr',       '010-1234-5678', '테스트유저', '2000-01-01', 'MALE',   'DOMESTIC', 'ACTIVE', TRUE, TRUE),
    ('pochak2026', 'kimpochak@hogak.co.kr',   '010-9876-5432', '김포착',    '1995-05-15', 'FEMALE', 'DOMESTIC', 'ACTIVE', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;

INSERT INTO identity.user_auth_accounts (user_id, provider, provider_key)
SELECT id, 'EMAIL', username FROM identity.users WHERE username IN ('testuser', 'pochak2026')
ON CONFLICT (provider, provider_key) DO NOTHING;

INSERT INTO commerce.wallets (user_id, balance)
SELECT id, 10000 FROM identity.users WHERE username = 'testuser'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO commerce.wallets (user_id, balance)
SELECT id, 5000 FROM identity.users WHERE username = 'pochak2026'
ON CONFLICT (user_id) DO NOTHING;
