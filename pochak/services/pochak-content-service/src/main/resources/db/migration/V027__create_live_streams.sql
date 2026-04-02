-- V027: Create live_streams table for LIVE broadcast lifecycle management
CREATE TABLE IF NOT EXISTS content.live_streams (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    streamer_user_id BIGINT         NOT NULL,
    match_id        BIGINT          REFERENCES content.matches(id) ON DELETE SET NULL,
    stream_key      VARCHAR(255)    NOT NULL UNIQUE,
    stream_url      VARCHAR(500),
    thumbnail_url   VARCHAR(500),
    status          VARCHAR(20)     NOT NULL DEFAULT 'SCHEDULED',
    visibility      VARCHAR(20)    NOT NULL DEFAULT 'PUBLIC',
    scheduled_at    TIMESTAMPTZ,
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    peak_viewer_count INTEGER       NOT NULL DEFAULT 0,
    total_view_count  BIGINT        NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_live_streams_streamer ON content.live_streams(streamer_user_id);
CREATE INDEX idx_live_streams_status ON content.live_streams(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_live_streams_match ON content.live_streams(match_id) WHERE match_id IS NOT NULL;
CREATE INDEX idx_live_streams_scheduled ON content.live_streams(scheduled_at) WHERE status = 'SCHEDULED' AND deleted_at IS NULL;

COMMENT ON TABLE content.live_streams IS 'LIVE broadcast sessions with lifecycle management';
