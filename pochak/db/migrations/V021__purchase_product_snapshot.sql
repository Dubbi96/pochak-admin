-- V021: Add product snapshot fields to purchases table
-- Captures product details at purchase time for accurate refunds, receipts, and audit trail.

ALTER TABLE commerce.purchases ADD COLUMN IF NOT EXISTS product_name VARCHAR(200);
ALTER TABLE commerce.purchases ADD COLUMN IF NOT EXISTS product_type VARCHAR(30);
ALTER TABLE commerce.purchases ADD COLUMN IF NOT EXISTS product_price_krw NUMERIC(12,2);
ALTER TABLE commerce.purchases ADD COLUMN IF NOT EXISTS product_price_point INTEGER;
ALTER TABLE commerce.purchases ADD COLUMN IF NOT EXISTS product_duration_days INTEGER;
ALTER TABLE commerce.purchases ADD COLUMN IF NOT EXISTS product_snapshot JSONB;

-- Backfill existing purchases from current product data
UPDATE commerce.purchases p SET
    product_name = pr.name,
    product_type = pr.product_type,
    product_price_krw = pr.price_krw,
    product_price_point = pr.price_point,
    product_duration_days = pr.duration_days
FROM commerce.products pr
WHERE p.product_id = pr.id
  AND p.product_name IS NULL;
