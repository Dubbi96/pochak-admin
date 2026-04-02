-- Coupon tables for commerce schema

CREATE TABLE IF NOT EXISTS commerce.coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    discount_type VARCHAR(30) NOT NULL,
    discount_value INTEGER NOT NULL,
    min_purchase_amount INTEGER DEFAULT 0,
    max_discount_amount INTEGER,
    max_usage_count INTEGER,
    current_usage_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commerce.user_coupons (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    coupon_id BIGINT NOT NULL REFERENCES commerce.coupons(id),
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    used_at TIMESTAMP,
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, coupon_id)
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON commerce.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active_dates ON commerce.coupons(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user ON commerce.user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_coupon ON commerce.user_coupons(user_id, coupon_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_status ON commerce.user_coupons(user_id, status);
