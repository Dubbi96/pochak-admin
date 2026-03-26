ALTER TABLE content.competitions
  ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'PUBLIC',
  ADD COLUMN IF NOT EXISTS invite_code VARCHAR(50) UNIQUE;

CREATE TABLE IF NOT EXISTS content.competition_visits (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  competition_id BIGINT NOT NULL REFERENCES content.competitions(id),
  first_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_visits_user ON content.competition_visits(user_id);
