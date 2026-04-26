-- V035: V034 over-widening 보정 — AssetTag.sportTagId 는 Integer 타입이므로 INT 로 환원
--
-- AssetTag entity 는 sportTagId 를 Integer 로, SportTag entity 는 id 를 Long 으로 사용한다.
-- (entity 측 inconsistency 이지만 본 이슈 범위에서 entity 수정은 다루지 않음.)
-- V034 가 양쪽을 모두 BIGINT 로 widening 했으므로 asset_tags.sport_tag_id 만 INT 로 환원.
-- type 이 달라지므로 FK 는 drop 후 재생성하지 않는다 (어차피 PostgreSQL 이 cross-type FK 를 거부).

ALTER TABLE content.asset_tags DROP CONSTRAINT IF EXISTS asset_tags_sport_tag_id_fkey;
ALTER TABLE content.asset_tags ALTER COLUMN sport_tag_id TYPE INTEGER;
