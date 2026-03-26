-- Phase 9: Analytics events table for tracking user behavior
-- Used by pochak-admin-service analytics module

CREATE TABLE IF NOT EXISTS admin.analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    user_id VARCHAR(50),
    session_id VARCHAR(50) NOT NULL,
    properties JSONB,
    event_time TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_event_name ON admin.analytics_events(event_name);
CREATE INDEX idx_analytics_event_time ON admin.analytics_events(event_time);
CREATE INDEX idx_analytics_user ON admin.analytics_events(user_id);
