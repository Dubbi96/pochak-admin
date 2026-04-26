-- V034: content schema 의 INT 기반 id/sport_id/sport_tag_id 등을 BIGINT 로 정합화
--
-- 다수 entity (Sport, SportTag, Competition.sport, Organization.sportId, Team.sportId, ...)
-- 가 Long 타입을 사용하지만 V002 raw DDL 은 SERIAL/INT 로 생성되어 있다. V017 에서도 일부만
-- 다뤘기 때문에 여전히 schema-validate 가 실패한다. type widening (INT → BIGINT) 은
-- 데이터 손실 없는 안전 변환이며 FK 들을 drop → alter → re-add 한다.

-- ---------------------------------------------------------------------------
-- 1) FK drop
-- ---------------------------------------------------------------------------
ALTER TABLE content.sport_tags    DROP CONSTRAINT IF EXISTS sport_tags_sport_id_fkey;
ALTER TABLE content.organizations DROP CONSTRAINT IF EXISTS organizations_sport_id_fkey;
ALTER TABLE content.teams         DROP CONSTRAINT IF EXISTS teams_sport_id_fkey;
ALTER TABLE content.competitions  DROP CONSTRAINT IF EXISTS competitions_sport_id_fkey;
ALTER TABLE content.matches       DROP CONSTRAINT IF EXISTS matches_sport_id_fkey;
ALTER TABLE content.asset_tags    DROP CONSTRAINT IF EXISTS asset_tags_sport_tag_id_fkey;

-- ---------------------------------------------------------------------------
-- 2) PK / FK 컬럼 widening
-- ---------------------------------------------------------------------------
ALTER TABLE content.sports        ALTER COLUMN id      TYPE BIGINT;
ALTER TABLE content.sport_tags    ALTER COLUMN id      TYPE BIGINT;
ALTER TABLE content.sport_tags    ALTER COLUMN sport_id TYPE BIGINT;
ALTER TABLE content.competitions  ALTER COLUMN sport_id TYPE BIGINT;
ALTER TABLE content.organizations ALTER COLUMN sport_id TYPE BIGINT;
ALTER TABLE content.teams         ALTER COLUMN sport_id TYPE BIGINT;
ALTER TABLE content.matches       ALTER COLUMN sport_id TYPE BIGINT;
ALTER TABLE content.matches       ALTER COLUMN venue_id TYPE BIGINT;
ALTER TABLE content.asset_tags    ALTER COLUMN sport_tag_id TYPE BIGINT;
ALTER TABLE content.memberships   ALTER COLUMN position_id TYPE BIGINT;
ALTER TABLE content.display_sections ALTER COLUMN id TYPE BIGINT;

-- ---------------------------------------------------------------------------
-- 3) FK 재생성
-- ---------------------------------------------------------------------------
ALTER TABLE content.sport_tags
    ADD CONSTRAINT sport_tags_sport_id_fkey
    FOREIGN KEY (sport_id) REFERENCES content.sports(id);

ALTER TABLE content.organizations
    ADD CONSTRAINT organizations_sport_id_fkey
    FOREIGN KEY (sport_id) REFERENCES content.sports(id);

ALTER TABLE content.teams
    ADD CONSTRAINT teams_sport_id_fkey
    FOREIGN KEY (sport_id) REFERENCES content.sports(id);

ALTER TABLE content.competitions
    ADD CONSTRAINT competitions_sport_id_fkey
    FOREIGN KEY (sport_id) REFERENCES content.sports(id);

ALTER TABLE content.matches
    ADD CONSTRAINT matches_sport_id_fkey
    FOREIGN KEY (sport_id) REFERENCES content.sports(id);

ALTER TABLE content.asset_tags
    ADD CONSTRAINT asset_tags_sport_tag_id_fkey
    FOREIGN KEY (sport_tag_id) REFERENCES content.sport_tags(id);
