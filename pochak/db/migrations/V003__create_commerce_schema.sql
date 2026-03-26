-- ============================================================================
-- V003: Commerce Schema
-- Pochak OTT Platform - Products, wallets, purchases, entitlements, refunds
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS commerce;

-- 상품 정의
CREATE TABLE IF NOT EXISTS commerce.products (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    product_type    VARCHAR(30) NOT NULL,
    price_krw       DECIMAL(12,2) NOT NULL,
    price_point     INT,
    duration_days   INT,
    reference_type  VARCHAR(20),
    reference_id    BIGINT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 포인트(뽈) 지갑
-- NOTE: user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS commerce.wallets (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE, -- identity.users(id) 참조 (cross-schema)
    balance         INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 지갑 원장
CREATE TABLE IF NOT EXISTS commerce.wallet_ledger (
    id              BIGSERIAL PRIMARY KEY,
    wallet_id       BIGINT NOT NULL REFERENCES commerce.wallets(id),
    ledger_type     VARCHAR(20) NOT NULL,
    amount          INT NOT NULL,
    balance_after   INT NOT NULL,
    reference_type  VARCHAR(30),
    reference_id    BIGINT,
    description     VARCHAR(500),
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 구매
-- NOTE: user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS commerce.purchases (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,        -- identity.users(id) 참조 (cross-schema)
    product_id      INT NOT NULL REFERENCES commerce.products(id),
    pg_type         VARCHAR(20) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    pg_transaction_id VARCHAR(200),
    receipt_data    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 권한 부여 (시청권한)
-- NOTE: user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS commerce.entitlements (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,        -- identity.users(id) 참조 (cross-schema)
    purchase_id     BIGINT REFERENCES commerce.purchases(id),
    entitlement_type VARCHAR(30) NOT NULL,
    scope_type      VARCHAR(20),
    scope_id        BIGINT,
    starts_at       TIMESTAMPTZ NOT NULL,
    expires_at      TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 환불
-- NOTE: user_id references identity.users(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS commerce.refunds (
    id              BIGSERIAL PRIMARY KEY,
    purchase_id     BIGINT NOT NULL REFERENCES commerce.purchases(id),
    user_id         BIGINT NOT NULL,        -- identity.users(id) 참조 (cross-schema)
    refund_type     VARCHAR(20) NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    reason          TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    processed_by    BIGINT,
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 기프트볼
CREATE TABLE IF NOT EXISTS commerce.gift_balls (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    point_amount    INT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
    issue_count     INT NOT NULL DEFAULT 0,
    used_count      INT NOT NULL DEFAULT 0,
    valid_from      TIMESTAMPTZ NOT NULL,
    valid_until     TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Wallet user lookup
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON commerce.wallets (user_id);

-- Wallet ledger
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet_id ON commerce.wallet_ledger (wallet_id);

-- Purchase user and status
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON commerce.purchases (user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON commerce.purchases (status);
CREATE INDEX IF NOT EXISTS idx_purchases_user_status ON commerce.purchases (user_id, status);

-- Entitlement user, active, and scope
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON commerce.entitlements (user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_active ON commerce.entitlements (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_entitlements_user_active ON commerce.entitlements (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_entitlements_scope ON commerce.entitlements (scope_type, scope_id);

-- Refunds
CREATE INDEX IF NOT EXISTS idx_refunds_purchase_id ON commerce.refunds (purchase_id);
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON commerce.refunds (user_id);
