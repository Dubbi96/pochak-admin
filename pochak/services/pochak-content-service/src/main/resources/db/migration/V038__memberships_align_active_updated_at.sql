-- V038: content.memberships 컬럼 정합화
-- entity Membership 은 @Column(name = "is_active") 로 active 필드를 매핑하지만 raw DDL 은 active 컬럼.
-- 또한 entity 의 updated_at 이 DB 에 누락되어 있다.

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='content' AND table_name='memberships' AND column_name='active'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='content' AND table_name='memberships' AND column_name='is_active'
    ) THEN
        ALTER TABLE content.memberships RENAME COLUMN active TO is_active;
    END IF;
END $$;

ALTER TABLE content.memberships
    ADD COLUMN IF NOT EXISTS is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
