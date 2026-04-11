-- ============================================================================
-- V030: Update Reservations for Product-Based Booking
-- 상품 기반 예약 + 결제 연동 + 파트너 승인 워크플로우
-- ============================================================================

-- 상품 연결 + 가격 + 결제 상태 필드 추가
ALTER TABLE operation.reservations
    ADD COLUMN IF NOT EXISTS venue_product_id BIGINT REFERENCES operation.venue_products(id),
    ADD COLUMN IF NOT EXISTS total_price INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS refund_amount INT DEFAULT 0;

-- 기존 status 값에 PARTNER_APPROVED, PAYMENT_PENDING 추가 (enum 확장은 코드에서 처리)

COMMENT ON COLUMN operation.reservations.venue_product_id IS '선택한 장소 상품 (nullable for legacy reservations)';
COMMENT ON COLUMN operation.reservations.total_price IS '총 결제 금액 (원)';
COMMENT ON COLUMN operation.reservations.payment_status IS 'NONE / PENDING / COMPLETED / REFUNDED / PARTIAL_REFUND';
COMMENT ON COLUMN operation.reservations.refund_amount IS '환불 금액 (원)';

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_reservations_product_id
    ON operation.reservations (venue_product_id) WHERE venue_product_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_payment_status
    ON operation.reservations (payment_status);
