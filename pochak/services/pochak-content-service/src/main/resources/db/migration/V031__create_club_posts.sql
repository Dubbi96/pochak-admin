-- V031: Create content.club_posts
-- 본래 pochak/db/migrations/V034__create_club_posts.sql 에 raw SQL 로 존재했으나
-- init-db.sh 는 postgres 최초 부팅 시에만 실행되므로 기존 볼륨에서는 테이블이 생성되지 않음.
-- 엔티티 ClubPost 에 맞춰 service Flyway 로 정식 포트.

CREATE TABLE IF NOT EXISTS content.club_posts (
    id              BIGSERIAL       PRIMARY KEY,
    club_id         BIGINT          NOT NULL,
    author_user_id  BIGINT          NOT NULL,
    post_type       VARCHAR(20)     NOT NULL DEFAULT 'FREE',
    title           VARCHAR(200)    NOT NULL,
    content         TEXT,
    image_urls      TEXT,
    is_pinned       BOOLEAN         NOT NULL DEFAULT FALSE,
    view_count      INTEGER         NOT NULL DEFAULT 0,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_club_posts_club_id
    ON content.club_posts (club_id, deleted_at, is_pinned, created_at DESC);

COMMENT ON TABLE content.club_posts IS 'Club(team) 단위 게시글 (공지/자유/모집).';
COMMENT ON COLUMN content.club_posts.post_type IS 'NOTICE / FREE / RECRUIT';
