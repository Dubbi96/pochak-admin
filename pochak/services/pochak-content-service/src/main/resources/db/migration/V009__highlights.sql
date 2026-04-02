-- Phase 9: AI Highlights table

CREATE TABLE IF NOT EXISTS content.highlights (
    id BIGSERIAL PRIMARY KEY,
    content_id BIGINT NOT NULL,
    content_type VARCHAR(10) NOT NULL,
    start_time_seconds INTEGER NOT NULL,
    end_time_seconds INTEGER NOT NULL,
    highlight_type VARCHAR(30) NOT NULL,
    confidence_score DECIMAL(3,2),
    description TEXT,
    is_auto_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_highlights_content ON content.highlights(content_id, content_type);
