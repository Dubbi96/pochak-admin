-- Add club_status column to teams for admin management (ACTIVE/SUSPENDED/DISSOLVED)
ALTER TABLE content.teams
    ADD COLUMN IF NOT EXISTS club_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
