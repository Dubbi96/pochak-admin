-- V024: GiftBall 관리자 조회 성능을 위한 인덱스 보강 (항목 39)
-- gift_balls 테이블은 이미 V003 초기 스키마에 존재하므로 인덱스만 추가.

CREATE INDEX IF NOT EXISTS idx_gift_balls_status_created
    ON commerce.gift_balls (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gift_balls_receiver_status
    ON commerce.gift_balls (receiver_user_id, status);

COMMENT ON TABLE commerce.gift_balls IS 'Gift Ball 지급 내역 (관리자 직접 지급 포함)';
