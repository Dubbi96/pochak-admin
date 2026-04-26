-- V021: operation.studio_sessions 에 entity 가 요구하는 컬럼 추가
--
-- StudioSession entity 는 reservation_id, pixellot_session_id 를 가지지만 raw DDL 에는
-- pixellot_event_id / live_url / panorama_live_url 등 다른 명세로 생성됨. 누락 컬럼만 추가.
-- 기존 잉여 컬럼은 Hibernate validate 에 영향 없음 (entity 가 모르는 컬럼은 무시됨).

ALTER TABLE operation.studio_sessions
    ADD COLUMN IF NOT EXISTS reservation_id      BIGINT,
    ADD COLUMN IF NOT EXISTS pixellot_session_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_studio_sessions_reservation_id
    ON operation.studio_sessions (reservation_id) WHERE reservation_id IS NOT NULL;
