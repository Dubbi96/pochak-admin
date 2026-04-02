-- V024: MEDIUM/LOW issue fixes
-- L5: Rename CompetitionStatus IN_PROGRESS -> ONGOING
UPDATE content.competitions SET status = 'ONGOING' WHERE status = 'IN_PROGRESS';

-- L4: Rename PostType values: RECRUITING -> RECRUIT, RECRUITMENT -> GENERAL
UPDATE content.community_posts SET post_type = 'RECRUIT' WHERE post_type = 'RECRUITING';
UPDATE content.community_posts SET post_type = 'GENERAL' WHERE post_type = 'RECRUITMENT';

-- M6: Add time range columns to video_acl
ALTER TABLE content.video_acl ADD COLUMN IF NOT EXISTS valid_from TIMESTAMP;
ALTER TABLE content.video_acl ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;
