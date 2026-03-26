-- ============================================================================
-- V005: Admin Schema
-- Pochak OTT Platform - BO admin users, RBAC, CMS content, audit logs
-- ============================================================================

-- BO 관리자
CREATE TABLE IF NOT EXISTS admin.admin_users (
    id              SERIAL PRIMARY KEY,
    login_id        VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(500) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    profile_image   VARCHAR(500),
    kakao_id        VARCHAR(100),
    skype_id        VARCHAR(100),
    line_id         VARCHAR(100),
    is_blocked      BOOLEAN NOT NULL DEFAULT FALSE,
    fail_count      INT NOT NULL DEFAULT 0,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- BO 역할
CREATE TABLE IF NOT EXISTS admin.admin_roles (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    display_order   INT DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BO 메뉴
CREATE TABLE IF NOT EXISTS admin.admin_menus (
    id              SERIAL PRIMARY KEY,
    parent_id       INT REFERENCES admin.admin_menus(id),
    name            VARCHAR(200) NOT NULL,
    menu_type       VARCHAR(20),
    page_url        VARCHAR(200),
    icon            VARCHAR(200),
    display_order   INT DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BO 세부기능
CREATE TABLE IF NOT EXISTS admin.admin_functions (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(200) NOT NULL UNIQUE,
    name            VARCHAR(200),
    controller      VARCHAR(200),
    action          VARCHAR(200),
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BO 그룹
CREATE TABLE IF NOT EXISTS admin.admin_groups (
    id              SERIAL PRIMARY KEY,
    parent_id       INT REFERENCES admin.admin_groups(id),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    display_order   INT DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 그룹 <-> 사용자
CREATE TABLE IF NOT EXISTS admin.admin_group_users (
    group_id        INT NOT NULL REFERENCES admin.admin_groups(id),
    user_id         INT NOT NULL REFERENCES admin.admin_users(id),
    PRIMARY KEY (group_id, user_id)
);

-- 그룹 <-> 역할
CREATE TABLE IF NOT EXISTS admin.admin_group_roles (
    group_id        INT NOT NULL REFERENCES admin.admin_groups(id),
    role_id         INT NOT NULL REFERENCES admin.admin_roles(id),
    PRIMARY KEY (group_id, role_id)
);

-- 역할 <-> 메뉴
CREATE TABLE IF NOT EXISTS admin.admin_role_menus (
    role_id         INT NOT NULL REFERENCES admin.admin_roles(id),
    menu_id         INT NOT NULL REFERENCES admin.admin_menus(id),
    PRIMARY KEY (role_id, menu_id)
);

-- 역할 <-> 기능
CREATE TABLE IF NOT EXISTS admin.admin_role_functions (
    role_id         INT NOT NULL REFERENCES admin.admin_roles(id),
    function_id     INT NOT NULL REFERENCES admin.admin_functions(id),
    PRIMARY KEY (role_id, function_id)
);

-- 감사 로그
CREATE TABLE IF NOT EXISTS admin.audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    admin_user_id   INT REFERENCES admin.admin_users(id),
    action          VARCHAR(50) NOT NULL,
    target_type     VARCHAR(50) NOT NULL,
    target_id       VARCHAR(50),
    before_data     JSONB,
    after_data      JSONB,
    ip_address      VARCHAR(50),
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 배너
CREATE TABLE IF NOT EXISTS admin.banners (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(400) NOT NULL,
    banner_type     VARCHAR(20),
    sport_id        INT,                    -- content.sports(id) cross-schema
    image_url_pc    VARCHAR(500),
    image_url_mobile VARCHAR(500),
    link_url        VARCHAR(500),
    start_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ NOT NULL,
    display_order   SMALLINT NOT NULL DEFAULT 0,
    view_count      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 팝업
CREATE TABLE IF NOT EXISTS admin.popups (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(400) NOT NULL,
    image_url_pc    VARCHAR(500),
    image_url_mobile VARCHAR(500),
    link_url        VARCHAR(500),
    start_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ NOT NULL,
    display_order   SMALLINT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 공지사항
CREATE TABLE IF NOT EXISTS admin.notices (
    id              SERIAL PRIMARY KEY,
    notice_type     VARCHAR(30) NOT NULL,
    reference_id    BIGINT,
    title           VARCHAR(400) NOT NULL,
    content         TEXT NOT NULL,
    start_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ NOT NULL,
    view_count      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 이벤트
CREATE TABLE IF NOT EXISTS admin.events (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(400) NOT NULL,
    content         TEXT NOT NULL,
    start_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    view_count      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 광고
CREATE TABLE IF NOT EXISTS admin.advertisements (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    ad_type         VARCHAR(30) NOT NULL,
    content         TEXT,
    ad_url          VARCHAR(500),
    start_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ NOT NULL,
    view_count      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 1:1 문의
CREATE TABLE IF NOT EXISTS admin.inquiries (
    id              SERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,        -- identity.users(id) cross-schema
    inquiry_type    VARCHAR(30) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL,
    is_answered     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- 문의 답변
CREATE TABLE IF NOT EXISTS admin.inquiry_answers (
    id              SERIAL PRIMARY KEY,
    inquiry_id      INT NOT NULL REFERENCES admin.inquiries(id),
    content         TEXT NOT NULL,
    answered_by     INT REFERENCES admin.admin_users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 신고
CREATE TABLE IF NOT EXISTS admin.reports (
    id              SERIAL PRIMARY KEY,
    reporter_user_id BIGINT NOT NULL,       -- identity.users(id) cross-schema
    reported_user_id BIGINT,                -- identity.users(id) cross-schema
    report_type     VARCHAR(30) NOT NULL,
    target_type     VARCHAR(30) NOT NULL,
    target_id       BIGINT NOT NULL,
    reason          TEXT,
    detail          TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    admin_comment   TEXT,
    processed_by    INT REFERENCES admin.admin_users(id),
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 약관
CREATE TABLE IF NOT EXISTS admin.terms (
    id              SERIAL PRIMARY KEY,
    term_type       VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL,
    effective_date  TIMESTAMPTZ,
    is_essential    BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    version         INT NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 앱 버전
CREATE TABLE IF NOT EXISTS admin.app_versions (
    id              SERIAL PRIMARY KEY,
    os_type         VARCHAR(10) NOT NULL,
    version         VARCHAR(20) NOT NULL,
    is_force_update BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON admin.audit_logs (admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON admin.audit_logs (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON admin.audit_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_banners_active_dates ON admin.banners (is_active, start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_banners_sport_id ON admin.banners (sport_id);
CREATE INDEX IF NOT EXISTS idx_popups_active_dates ON admin.popups (is_active, start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notices_active_dates ON admin.notices (is_active, start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notices_type ON admin.notices (notice_type);
CREATE INDEX IF NOT EXISTS idx_events_active_dates ON admin.events (is_active, start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_advertisements_active_dates ON admin.advertisements (is_active, start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON admin.inquiries (user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_answered ON admin.inquiries (is_answered);
CREATE INDEX IF NOT EXISTS idx_reports_status ON admin.reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON admin.reports (reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_terms_type_active ON admin.terms (term_type, is_active);
