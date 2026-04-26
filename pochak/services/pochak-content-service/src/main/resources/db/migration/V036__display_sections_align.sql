-- V036: content.display_sections 를 DisplaySection entity 와 정합화
--
-- entity 가 link_url, admin_banner_id 컬럼을 요구하고 display_order 를 Integer 로 사용한다.
-- DB 는 link_url/admin_banner_id 가 누락이고 display_order 는 SMALLINT 로 생성됨.

ALTER TABLE content.display_sections
    ADD COLUMN IF NOT EXISTS link_url        VARCHAR(500),
    ADD COLUMN IF NOT EXISTS admin_banner_id BIGINT;

ALTER TABLE content.display_sections
    ALTER COLUMN display_order TYPE INTEGER;
