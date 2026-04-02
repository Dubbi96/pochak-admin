-- ============================================================================
-- V022: Create DB Roles and Ownership
-- Service-level PostgreSQL roles for schema isolation.
-- Each service gets RW on its own schema and RO on schemas it references.
-- ============================================================================

-- ============================================================================
-- 1. Create service roles
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pochak_identity') THEN
        CREATE ROLE pochak_identity LOGIN PASSWORD 'pochak_identity_2026';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pochak_content') THEN
        CREATE ROLE pochak_content LOGIN PASSWORD 'pochak_content_2026';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pochak_commerce') THEN
        CREATE ROLE pochak_commerce LOGIN PASSWORD 'pochak_commerce_2026';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pochak_operation') THEN
        CREATE ROLE pochak_operation LOGIN PASSWORD 'pochak_operation_2026';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pochak_admin') THEN
        CREATE ROLE pochak_admin LOGIN PASSWORD 'pochak_admin_2026';
    END IF;
END
$$;

-- ============================================================================
-- 2. pochak_identity: RW identity.*, RO admin.terms (cross-schema ref)
-- ============================================================================

-- Own schema: full access
GRANT USAGE ON SCHEMA identity TO pochak_identity;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA identity TO pochak_identity;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA identity TO pochak_identity;

-- Cross-schema reads: identity.user_consents.term_id -> admin.terms
GRANT USAGE ON SCHEMA admin TO pochak_identity;
GRANT SELECT ON ALL TABLES IN SCHEMA admin TO pochak_identity;

-- ============================================================================
-- 3. pochak_content: RW content.*, RO identity.users, operation.venues
--    Cross-schema refs:
--      content.matches.venue_id -> operation.venues
--      content.live_assets.venue_id -> operation.venues
--    Event consumers: UserWithdrawnEvent (reads identity.users)
--    Event consumers: PurchaseCompletedEvent, SubscriptionActivatedEvent,
--                     ReservationCreatedEvent/CancelledEvent (from commerce/operation)
-- ============================================================================

-- Own schema: full access
GRANT USAGE ON SCHEMA content TO pochak_content;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA content TO pochak_content;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA content TO pochak_content;

-- Cross-schema reads: identity.users (for user data, event processing)
GRANT USAGE ON SCHEMA identity TO pochak_content;
GRANT SELECT ON ALL TABLES IN SCHEMA identity TO pochak_content;

-- Cross-schema reads: operation.venues (content.matches.venue_id, content.live_assets.venue_id)
GRANT USAGE ON SCHEMA operation TO pochak_content;
GRANT SELECT ON ALL TABLES IN SCHEMA operation TO pochak_content;

-- Cross-schema reads: commerce.entitlements (for ABAC / video access control)
GRANT USAGE ON SCHEMA commerce TO pochak_content;
GRANT SELECT ON ALL TABLES IN SCHEMA commerce TO pochak_content;

-- ============================================================================
-- 4. pochak_commerce: RW commerce.*, RO identity.users
--    Cross-schema refs:
--      commerce.wallets.user_id -> identity.users
--      commerce.purchases.user_id -> identity.users
--    Event consumers: UserWithdrawnEvent
-- ============================================================================

-- Own schema: full access
GRANT USAGE ON SCHEMA commerce TO pochak_commerce;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA commerce TO pochak_commerce;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA commerce TO pochak_commerce;

-- Cross-schema reads: identity.users (wallet/purchase owner)
GRANT USAGE ON SCHEMA identity TO pochak_commerce;
GRANT SELECT ON ALL TABLES IN SCHEMA identity TO pochak_commerce;

-- ============================================================================
-- 5. pochak_operation: RW operation.*, RO identity.users, content.sports, content.matches
--    Cross-schema refs:
--      operation.venues.sport_id -> content.sports
--      operation.reservations.match_id -> content.matches
--      operation.reservations.reserved_by_user_id -> identity.users
--    Event consumers: UserWithdrawnEvent
-- ============================================================================

-- Own schema: full access
GRANT USAGE ON SCHEMA operation TO pochak_operation;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA operation TO pochak_operation;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA operation TO pochak_operation;

-- Cross-schema reads: identity.users (reservation creator)
GRANT USAGE ON SCHEMA identity TO pochak_operation;
GRANT SELECT ON ALL TABLES IN SCHEMA identity TO pochak_operation;

-- Cross-schema reads: content.sports, content.matches (venue sport type, reservation match)
GRANT USAGE ON SCHEMA content TO pochak_operation;
GRANT SELECT ON ALL TABLES IN SCHEMA content TO pochak_operation;

-- ============================================================================
-- 6. pochak_admin: RW admin.*, RO on ALL other schemas
--    Admin service needs read access everywhere for BO dashboards, CS, analytics
--    Event consumers: UserWithdrawnEvent, ContentPublished, LiveStream*, ClipCreated
-- ============================================================================

-- Own schema: full access
GRANT USAGE ON SCHEMA admin TO pochak_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA admin TO pochak_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA admin TO pochak_admin;

-- Read-only on all other schemas
GRANT USAGE ON SCHEMA identity TO pochak_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA identity TO pochak_admin;

GRANT USAGE ON SCHEMA content TO pochak_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA content TO pochak_admin;

GRANT USAGE ON SCHEMA commerce TO pochak_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA commerce TO pochak_admin;

GRANT USAGE ON SCHEMA operation TO pochak_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA operation TO pochak_admin;

-- ============================================================================
-- 7. Default privileges for FUTURE tables
--    Ensures new tables created by the pochak superuser are also accessible.
-- ============================================================================

-- pochak_identity: RW own, RO admin
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT ALL ON TABLES TO pochak_identity;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT ALL ON SEQUENCES TO pochak_identity;
ALTER DEFAULT PRIVILEGES IN SCHEMA admin GRANT SELECT ON TABLES TO pochak_identity;

-- pochak_content: RW own, RO identity/operation/commerce
ALTER DEFAULT PRIVILEGES IN SCHEMA content GRANT ALL ON TABLES TO pochak_content;
ALTER DEFAULT PRIVILEGES IN SCHEMA content GRANT ALL ON SEQUENCES TO pochak_content;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT SELECT ON TABLES TO pochak_content;
ALTER DEFAULT PRIVILEGES IN SCHEMA operation GRANT SELECT ON TABLES TO pochak_content;
ALTER DEFAULT PRIVILEGES IN SCHEMA commerce GRANT SELECT ON TABLES TO pochak_content;

-- pochak_commerce: RW own, RO identity
ALTER DEFAULT PRIVILEGES IN SCHEMA commerce GRANT ALL ON TABLES TO pochak_commerce;
ALTER DEFAULT PRIVILEGES IN SCHEMA commerce GRANT ALL ON SEQUENCES TO pochak_commerce;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT SELECT ON TABLES TO pochak_commerce;

-- pochak_operation: RW own, RO identity/content
ALTER DEFAULT PRIVILEGES IN SCHEMA operation GRANT ALL ON TABLES TO pochak_operation;
ALTER DEFAULT PRIVILEGES IN SCHEMA operation GRANT ALL ON SEQUENCES TO pochak_operation;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT SELECT ON TABLES TO pochak_operation;
ALTER DEFAULT PRIVILEGES IN SCHEMA content GRANT SELECT ON TABLES TO pochak_operation;

-- pochak_admin: RW own, RO all others
ALTER DEFAULT PRIVILEGES IN SCHEMA admin GRANT ALL ON TABLES TO pochak_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA admin GRANT ALL ON SEQUENCES TO pochak_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT SELECT ON TABLES TO pochak_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA content GRANT SELECT ON TABLES TO pochak_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA commerce GRANT SELECT ON TABLES TO pochak_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA operation GRANT SELECT ON TABLES TO pochak_admin;
