-- ============================================================================
-- V038: Camera Hub Unit (CHU) 테이블 생성
-- FIXLIST #40, #41, #43: Skylife CHU 도메인
-- ============================================================================

CREATE TABLE IF NOT EXISTS operation.camera_hub_units (
    id                BIGSERIAL PRIMARY KEY,
    contract_id       BIGINT REFERENCES operation.vpu_contracts(id),
    mac_address       VARCHAR(17)  UNIQUE NOT NULL,
    ip_address        VARCHAR(45),
    status            VARCHAR(20)  NOT NULL DEFAULT 'DISCONNECTED',
    firmware_version  VARCHAR(50),
    location          VARCHAR(200),
    last_connected_at TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chu_status
    ON operation.camera_hub_units (status);

CREATE INDEX IF NOT EXISTS idx_chu_contract_id
    ON operation.camera_hub_units (contract_id);

-- Comments
COMMENT ON TABLE operation.camera_hub_units IS 'Skylife Camera Hub Unit (CHU) 장치 목록';
COMMENT ON COLUMN operation.camera_hub_units.mac_address IS 'MAC 주소 (AA:BB:CC:DD:EE:FF 형식)';
COMMENT ON COLUMN operation.camera_hub_units.status      IS 'CONNECTED / DISCONNECTED / ERROR';
COMMENT ON COLUMN operation.camera_hub_units.last_connected_at IS '마지막 연결 시각';
