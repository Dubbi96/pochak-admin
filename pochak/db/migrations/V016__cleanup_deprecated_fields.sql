-- Policy v2 cleanup: rename ORGANIZATION_ONLY to MEMBERS_ONLY in existing data
UPDATE content.live_assets SET visibility = 'MEMBERS_ONLY' WHERE visibility = 'ORGANIZATION_ONLY';
UPDATE content.vod_assets SET visibility = 'MEMBERS_ONLY' WHERE visibility = 'ORGANIZATION_ONLY';
UPDATE content.clip_assets SET visibility = 'MEMBERS_ONLY' WHERE visibility = 'ORGANIZATION_ONLY';
UPDATE content.asset_tags SET visibility = 'MEMBERS_ONLY' WHERE visibility = 'ORGANIZATION_ONLY';

-- Note: The following columns are deprecated but NOT removed yet for backward compatibility:
-- content.organizations.access_type → replaced by display_area + join_policy
-- content.organizations.auto_approve → replaced by join_policy
-- content.organizations.is_auto_join → replaced by join_policy
-- content.organizations.manager_only_booking → replaced by reservation_policy
-- These will be dropped in a future migration after all services are updated.
