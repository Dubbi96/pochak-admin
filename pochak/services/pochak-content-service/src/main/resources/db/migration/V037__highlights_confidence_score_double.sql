-- V037: Highlight.confidenceScore 가 Double 인데 DB 가 NUMERIC(3) 로 생성된 mismatch 보정
-- Hibernate 는 DOUBLE PRECISION 을 기대한다.

ALTER TABLE content.highlights
    ALTER COLUMN confidence_score TYPE DOUBLE PRECISION USING confidence_score::double precision;
