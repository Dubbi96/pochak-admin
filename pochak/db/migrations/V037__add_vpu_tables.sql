-- ============================================================================
-- V037: VPU Contract & Device 테이블 생성
-- FIXLIST #26: VPU Contract 도메인
-- ============================================================================

CREATE TABLE IF NOT EXISTS operation.vpu_contracts (
    id              BIGSERIAL PRIMARY KEY,
    contract_number VARCHAR(50)  UNIQUE NOT NULL,
    organization_id BIGINT,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    start_date      DATE,
    end_date        DATE,
    device_count    INTEGER      DEFAULT 0,
    contact_person  VARCHAR(100),
    contact_phone   VARCHAR(20),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operation.vpu_devices (
    id               BIGSERIAL PRIMARY KEY,
    contract_id      BIGINT REFERENCES operation.vpu_contracts(id),
    serial_number    VARCHAR(100) UNIQUE NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'INACTIVE',
    firmware_version VARCHAR(50),
    location         VARCHAR(200),
    last_heartbeat   TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vpu_contracts_status
    ON operation.vpu_contracts (status);

CREATE INDEX IF NOT EXISTS idx_vpu_contracts_organization_id
    ON operation.vpu_contracts (organization_id);

CREATE INDEX IF NOT EXISTS idx_vpu_devices_contract_id
    ON operation.vpu_devices (contract_id);

CREATE INDEX IF NOT EXISTS idx_vpu_devices_status
    ON operation.vpu_devices (status);

-- Comments
COMMENT ON TABLE operation.vpu_contracts IS 'VPU(Video Processing Unit) 계약 정보';
COMMENT ON TABLE operation.vpu_devices   IS 'VPU 디바이스 목록';
COMMENT ON COLUMN operation.vpu_contracts.status IS 'PENDING / ACTIVE / EXPIRED';
COMMENT ON COLUMN operation.vpu_devices.status   IS 'ACTIVE / INACTIVE / MAINTENANCE';
