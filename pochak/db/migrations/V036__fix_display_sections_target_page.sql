-- V036: Fix display_sections.target_page for rows where it is NULL but page is set.
-- The entity queries on target_page; V017 added the column but existing seed rows
-- populated only the legacy `page` column, leaving target_page NULL.
UPDATE content.display_sections
SET target_page = page
WHERE target_page IS NULL
  AND page IS NOT NULL;
