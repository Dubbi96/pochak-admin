-- DATA-003: DB-level DAG integrity protection for organizations hierarchy.
-- Prevents circular references and enforces max depth via trigger.

CREATE OR REPLACE FUNCTION content.check_organization_dag()
RETURNS TRIGGER AS $$
DECLARE
    max_depth CONSTANT INT := 5;
    current_id BIGINT;
    depth INT := 0;
BEGIN
    -- Skip if no parent set
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Prevent self-reference
    IF NEW.parent_id = NEW.id THEN
        RAISE EXCEPTION 'Organization cannot be its own parent (id=%)', NEW.id;
    END IF;

    -- Walk up the ancestor chain to detect cycles and enforce max depth
    current_id := NEW.parent_id;
    WHILE current_id IS NOT NULL AND depth < max_depth + 1 LOOP
        IF current_id = NEW.id THEN
            RAISE EXCEPTION 'Circular reference detected in organization hierarchy (id=%)', NEW.id;
        END IF;
        SELECT parent_id INTO current_id FROM content.organizations WHERE id = current_id;
        depth := depth + 1;
    END LOOP;

    IF depth > max_depth THEN
        RAISE EXCEPTION 'Organization hierarchy exceeds maximum depth of % levels', max_depth;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organization_dag_check ON content.organizations;
CREATE TRIGGER trg_organization_dag_check
    BEFORE INSERT OR UPDATE OF parent_id ON content.organizations
    FOR EACH ROW
    EXECUTE FUNCTION content.check_organization_dag();
