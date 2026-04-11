-- ============================================================================
-- V033: Venue Schedule Management & Product Price History
-- POC-80: 시설 운영시간 및 휴무일 관리
-- POC-82: 상품 가격 이력 및 시즌별 가격 관리
-- ============================================================================

-- ----------------------------------------------------------------------------
-- POC-80: 시설 휴무일 (정기/임시)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS operation.venue_closed_days (
    id              BIGSERIAL PRIMARY KEY,
    venue_id        INT NOT NULL REFERENCES operation.venues(id),
    closed_type     VARCHAR(20) NOT NULL,       -- REGULAR (정기) / TEMPORARY (임시)
    day_of_week     INT,                        -- 1=Mon~7=Sun, REGULAR 전용
    closed_date     DATE,                       -- TEMPORARY 전용
    reason          VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_closed_days_venue_id ON operation.venue_closed_days (venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_closed_days_date ON operation.venue_closed_days (closed_date) WHERE closed_date IS NOT NULL;

-- ----------------------------------------------------------------------------
-- POC-82: 상품 가격 변경 이력
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS operation.product_price_history (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES operation.venue_products(id),
    changed_by      BIGINT NOT NULL,            -- identity.users(id) 참조 (cross-schema)
    prev_price_per_hour  INT NOT NULL,
    new_price_per_hour   INT NOT NULL,
    prev_price_per_day   INT,
    new_price_per_day    INT,
    change_reason   VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_price_history_product_id ON operation.product_price_history (product_id);

-- ----------------------------------------------------------------------------
-- POC-82: 시즌별 차등 가격
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS operation.product_season_prices (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES operation.venue_products(id),
    season_name     VARCHAR(100) NOT NULL,      -- 예: "성수기", "비수기", "여름특가"
    season_type     VARCHAR(20) NOT NULL,       -- PEAK / OFF_PEAK / SPECIAL
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    day_type        VARCHAR(20),                -- WEEKDAY / WEEKEND / ALL (null=ALL)
    time_zone       VARCHAR(20),                -- MORNING / AFTERNOON / NIGHT (null=ALL)
    price_per_hour  INT NOT NULL,
    price_per_day   INT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (start_date <= end_date)
);

CREATE INDEX IF NOT EXISTS idx_product_season_prices_product_id ON operation.product_season_prices (product_id);
CREATE INDEX IF NOT EXISTS idx_product_season_prices_dates ON operation.product_season_prices (start_date, end_date) WHERE is_active = TRUE;
