-- V039: content.notifications 컬럼 정합화
-- entity Notification 은 target_user_id, is_read 컬럼을 요구하지만 raw DDL 은 둘 다 누락.

ALTER TABLE content.notifications
    ADD COLUMN IF NOT EXISTS target_user_id BIGINT  NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_read        BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_target_user
    ON content.notifications (target_user_id, is_read);
