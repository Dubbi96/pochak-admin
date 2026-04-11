-- ============================================================================
-- V028: Partners
-- 파트너(시설 운영자) 엔티티 + 파트너-장소 연결
-- ============================================================================

-- 파트너 정보
CREATE TABLE IF NOT EXISTS identity.partners (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE,     -- identity.users(id) 참조
    business_name       VARCHAR(200) NOT NULL,
    business_number     VARCHAR(20) NOT NULL UNIQUE,
    contact_phone       VARCHAR(20) NOT NULL,
    bank_account        VARCHAR(50),
    bank_name           VARCHAR(50),
    commission_rate     NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 파트너-장소 다대다 매핑
-- NOTE: venue_id references operation.venues(id) (cross-schema, FK not enforced)
CREATE TABLE IF NOT EXISTS identity.partner_venues (
    id                  BIGSERIAL PRIMARY KEY,
    partner_id          BIGINT NOT NULL REFERENCES identity.partners(id),
    venue_id            INT NOT NULL,               -- operation.venues(id) 참조 (cross-schema)
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (partner_id, venue_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_partners_user_id ON identity.partners (user_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON identity.partners (status);
CREATE INDEX IF NOT EXISTS idx_partners_business_number ON identity.partners (business_number);
CREATE INDEX IF NOT EXISTS idx_partner_venues_partner_id ON identity.partner_venues (partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_venues_venue_id ON identity.partner_venues (venue_id);
