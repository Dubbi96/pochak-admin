-- ============================================================================
-- V029: Venue Products + Time Slots
-- 장소 상품 (공간+카메라 패키지) 및 시간대 가용성 관리
-- ============================================================================

-- 장소 상품
CREATE TABLE IF NOT EXISTS operation.venue_products (
    id                  BIGSERIAL PRIMARY KEY,
    venue_id            INT NOT NULL REFERENCES operation.venues(id),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    product_type        VARCHAR(30) NOT NULL,       -- SPACE_ONLY / SPACE_WITH_CAMERA / CAMERA_ONLY
    price_per_hour      INT NOT NULL DEFAULT 0,
    price_per_day       INT,
    max_capacity        INT,
    included_cameras    INT NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 시간대별 가용성
CREATE TABLE IF NOT EXISTS operation.venue_time_slots (
    id                  BIGSERIAL PRIMARY KEY,
    venue_product_id    BIGINT NOT NULL REFERENCES operation.venue_products(id),
    day_of_week         INT NOT NULL,               -- 1=Monday ~ 7=Sunday (ISO)
    start_time          TIME NOT NULL,
    end_time            TIME NOT NULL,
    is_available        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_venue_products_venue_id
    ON operation.venue_products (venue_id);

CREATE INDEX IF NOT EXISTS idx_venue_products_type
    ON operation.venue_products (product_type) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_venue_time_slots_product_id
    ON operation.venue_time_slots (venue_product_id);

CREATE INDEX IF NOT EXISTS idx_venue_time_slots_day
    ON operation.venue_time_slots (day_of_week, is_available) WHERE is_available = TRUE;
