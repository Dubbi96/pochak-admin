-- ============================================================================
-- V001: Identity Schema
-- Pochak OTT Platform - User identity, authentication, and preferences
-- ============================================================================

-- 회원 기본 정보
CREATE TABLE IF NOT EXISTS identity.users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(100) UNIQUE NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    name            VARCHAR(100) NOT NULL,
    birthday        DATE,
    gender          VARCHAR(10),          -- MALE / FEMALE / OTHER
    nationality     VARCHAR(10),          -- DOMESTIC / FOREIGN
    profile_image   VARCHAR(500),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    -- UNVERIFIED / GUEST / ACTIVE / DORMANT_PENDING / DORMANT / BLOCKED / WITHDRAWN
    is_marketing    BOOLEAN NOT NULL DEFAULT FALSE,
    is_age_14_above BOOLEAN NOT NULL DEFAULT FALSE,
    ci              VARCHAR(100),         -- 본인확인 CI
    di              VARCHAR(100),         -- 중복확인 DI
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- SNS 인증 계정 연동
CREATE TABLE IF NOT EXISTS identity.user_auth_accounts (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES identity.users(id),
    provider        VARCHAR(20) NOT NULL,   -- EMAIL / KAKAO / NAVER / APPLE / GOOGLE
    provider_key    VARCHAR(255) NOT NULL,
    access_token    TEXT,
    refresh_token   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_key)
);

-- 약관 동의
-- NOTE: term_id references admin.terms(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS identity.user_consents (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES identity.users(id),
    term_id         BIGINT NOT NULL,        -- admin.terms(id) 참조 (FK 미설정, cross-schema)
    is_agreed       BOOLEAN NOT NULL,
    agreed_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 사용자 선호 정보
CREATE TABLE IF NOT EXISTS identity.user_preferences (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES identity.users(id),
    preferred_sports JSONB,               -- [{sportId, sportName}]
    preferred_areas  JSONB,               -- [{siGunGuCode, areaName}]
    usage_purpose   VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 회원 상태 변경 이력
CREATE TABLE IF NOT EXISTS identity.user_status_history (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES identity.users(id),
    from_status     VARCHAR(20),
    to_status       VARCHAR(20) NOT NULL,
    reason          TEXT,
    changed_by      BIGINT,               -- 관리자 ID or system
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 리프레시 토큰
CREATE TABLE IF NOT EXISTS identity.user_refresh_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES identity.users(id),
    token           VARCHAR(500) NOT NULL UNIQUE,
    device_type     VARCHAR(20),          -- AOS / IOS / WEB
    device_info     VARCHAR(200),
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 푸시 토큰
CREATE TABLE IF NOT EXISTS identity.user_push_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES identity.users(id),
    token           VARCHAR(500) NOT NULL,
    device_type     VARCHAR(20) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 알림 설정
CREATE TABLE IF NOT EXISTS identity.user_notification_settings (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES identity.users(id) UNIQUE,
    is_app_push     BOOLEAN NOT NULL DEFAULT TRUE,
    is_sms          BOOLEAN NOT NULL DEFAULT FALSE,
    is_email        BOOLEAN NOT NULL DEFAULT FALSE,
    is_night_quiet  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON identity.users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON identity.users (phone);
CREATE INDEX IF NOT EXISTS idx_users_status ON identity.users (status);
CREATE INDEX IF NOT EXISTS idx_user_auth_provider_key ON identity.user_auth_accounts (provider, provider_key);
CREATE INDEX IF NOT EXISTS idx_user_refresh_token ON identity.user_refresh_tokens (token);
