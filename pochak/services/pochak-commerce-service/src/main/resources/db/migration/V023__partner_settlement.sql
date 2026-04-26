-- V023: Partner settlement/balance tables

CREATE TABLE IF NOT EXISTS commerce.partner_balances (
    id              BIGSERIAL       PRIMARY KEY,
    partner_id      BIGINT          NOT NULL,
    total_revenue   DECIMAL(15, 2)  NOT NULL DEFAULT 0,
    settled_amount  DECIMAL(15, 2)  NOT NULL DEFAULT 0,
    pending_amount  DECIMAL(15, 2)  NOT NULL DEFAULT 0,
    currency        VARCHAR(3)      NOT NULL DEFAULT 'KRW',
    last_settled_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_partner_balances_partner
    ON commerce.partner_balances (partner_id);

CREATE TABLE IF NOT EXISTS commerce.partner_settlements (
    id              BIGSERIAL       PRIMARY KEY,
    partner_id      BIGINT          NOT NULL,
    amount          DECIMAL(15, 2)  NOT NULL,
    currency        VARCHAR(3)      NOT NULL DEFAULT 'KRW',
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    period_from     DATE            NOT NULL,
    period_to       DATE            NOT NULL,
    settled_at      TIMESTAMPTZ,
    note            TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_settlements_partner
    ON commerce.partner_settlements (partner_id, status);

CREATE TABLE IF NOT EXISTS commerce.partner_settlement_disputes (
    id              BIGSERIAL       PRIMARY KEY,
    settlement_id   BIGINT          NOT NULL REFERENCES commerce.partner_settlements(id),
    partner_id      BIGINT          NOT NULL,
    reason          TEXT            NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'OPEN',
    resolution      TEXT,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE commerce.partner_balances IS 'Aggregated partner balance summary';
COMMENT ON TABLE commerce.partner_settlements IS 'Per-period settlement records';
COMMENT ON TABLE commerce.partner_settlement_disputes IS 'Disputes raised by partners against settlements';
