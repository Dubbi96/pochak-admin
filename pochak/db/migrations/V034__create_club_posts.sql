-- Club Posts table for ClubManagerPage content management
CREATE TABLE IF NOT EXISTS content.club_posts (
    id              BIGSERIAL PRIMARY KEY,
    club_id         BIGINT       NOT NULL,
    author_user_id  BIGINT       NOT NULL,
    post_type       VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    title           VARCHAR(200) NOT NULL,
    content         TEXT,
    image_urls      TEXT,
    is_pinned       BOOLEAN      NOT NULL DEFAULT FALSE,
    view_count      INTEGER      NOT NULL DEFAULT 0,
    deleted_at      TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_club_posts_club_id ON content.club_posts (club_id, deleted_at, is_pinned, created_at DESC);
