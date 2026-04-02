-- DATA-006: Add FK constraint for community_posts.organization_id and
-- create trigger for automatic comment_count sync.

-- FK constraint (SET NULL on delete to prevent orphans)
ALTER TABLE content.community_posts
    ADD CONSTRAINT fk_community_posts_organization
    FOREIGN KEY (organization_id) REFERENCES content.organizations(id)
    ON DELETE SET NULL;

-- Index for FK lookups (if not already created)
CREATE INDEX IF NOT EXISTS idx_community_posts_org_id
    ON content.community_posts (organization_id)
    WHERE organization_id IS NOT NULL AND deleted_at IS NULL;

-- Trigger function to keep comment_count in sync atomically
CREATE OR REPLACE FUNCTION content.sync_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE content.community_posts
        SET comment_count = comment_count + 1
        WHERE id = NEW.content_id AND NEW.content_type = 'POST';
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle soft-delete toggle on comments
        IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
            UPDATE content.community_posts
            SET comment_count = GREATEST(comment_count - 1, 0)
            WHERE id = NEW.content_id AND NEW.content_type = 'POST';
        ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
            UPDATE content.community_posts
            SET comment_count = comment_count + 1
            WHERE id = NEW.content_id AND NEW.content_type = 'POST';
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_post_comment_count ON content.comments;
CREATE TRIGGER trg_sync_post_comment_count
    AFTER INSERT OR UPDATE OF is_deleted ON content.comments
    FOR EACH ROW
    EXECUTE FUNCTION content.sync_post_comment_count();
