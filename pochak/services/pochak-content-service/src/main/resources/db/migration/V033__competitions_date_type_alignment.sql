-- V033: content.competitions.start_date / end_date 를 TIMESTAMPTZ → DATE 로 정합화
--
-- entity Competition 은 startDate/endDate 를 LocalDate (DATE) 로 가지지만 init-db.sh 가
-- 적용한 V002 raw DDL 은 TIMESTAMPTZ 로 생성. V017 에서 ALTER COLUMN ... TYPE DATE 가
-- 예정돼 있었으나 baseline=029 로 실행되지 않았다. 본 마이그레이션이 그 정렬을 수행.

ALTER TABLE content.competitions
    ALTER COLUMN start_date TYPE DATE USING start_date::DATE,
    ALTER COLUMN end_date   TYPE DATE USING end_date::DATE;

ALTER TABLE content.competitions ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE content.competitions ALTER COLUMN end_date   DROP NOT NULL;
