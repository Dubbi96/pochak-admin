-- V041: sports / sport_tags display_order SMALLINT → INTEGER 정합화
-- entity 가 Integer 사용. SMALLINT 는 widening 으로 INTEGER 변환 가능 (data 안전).

ALTER TABLE content.sports     ALTER COLUMN display_order TYPE INTEGER;
ALTER TABLE content.sport_tags ALTER COLUMN display_order TYPE INTEGER;
