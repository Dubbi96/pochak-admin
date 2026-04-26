-- V019: Camera 엔티티 정합화 — pixellot_device_id 컬럼 추가
--
-- operation.cameras 는 init-db.sh 시점의 raw DDL 기준으로 생성됐으나,
-- entity Camera 가 후행 추가한 pixellot_device_id 컬럼이 마이그레이션에 빠져 있어
-- Hibernate schema-validate 가 실패한다. 단일 ALTER 로 정합화한다.

ALTER TABLE operation.cameras
    ADD COLUMN IF NOT EXISTS pixellot_device_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_cameras_pixellot_device_id
    ON operation.cameras (pixellot_device_id) WHERE pixellot_device_id IS NOT NULL;
