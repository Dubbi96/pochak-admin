-- ============================================================================
-- V023: Create Outbox and Processed Events Tables
-- Transactional outbox pattern for reliable event publishing via RabbitMQ.
-- Each schema that PUBLISHES events gets an outbox_events table.
-- Each schema that CONSUMES events gets a processed_events table.
-- ============================================================================

-- ============================================================================
-- 1. Outbox tables (one per publishing schema)
-- ============================================================================

-- Identity publishes: UserWithdrawnEvent
CREATE TABLE IF NOT EXISTS identity.outbox_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(100) NOT NULL,     -- e.g. 'UserWithdrawnEvent'
    aggregate_id    VARCHAR(100) NOT NULL,      -- e.g. user ID
    payload         JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMPTZ                -- NULL until polled & sent to RabbitMQ
);

CREATE INDEX IF NOT EXISTS idx_identity_outbox_unpublished
    ON identity.outbox_events (created_at)
    WHERE published_at IS NULL;

-- Content publishes: ContentPublishedEvent, LiveStreamStartedEvent, LiveStreamEndedEvent, ClipCreatedEvent
CREATE TABLE IF NOT EXISTS content.outbox_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(100) NOT NULL,
    aggregate_id    VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_content_outbox_unpublished
    ON content.outbox_events (created_at)
    WHERE published_at IS NULL;

-- Commerce publishes: PurchaseCompletedEvent, RefundProcessedEvent, SubscriptionActivatedEvent
CREATE TABLE IF NOT EXISTS commerce.outbox_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(100) NOT NULL,
    aggregate_id    VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_commerce_outbox_unpublished
    ON commerce.outbox_events (created_at)
    WHERE published_at IS NULL;

-- Operation publishes: ReservationCreatedEvent, ReservationCancelledEvent
CREATE TABLE IF NOT EXISTS operation.outbox_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(100) NOT NULL,
    aggregate_id    VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_operation_outbox_unpublished
    ON operation.outbox_events (created_at)
    WHERE published_at IS NULL;

-- ============================================================================
-- 2. Processed events tables (one per consuming schema, for idempotency)
-- ============================================================================

-- Content consumes: UserWithdrawnEvent, PurchaseCompletedEvent,
--   SubscriptionActivatedEvent, ReservationCreatedEvent, ReservationCancelledEvent
CREATE TABLE IF NOT EXISTS content.processed_events (
    event_id        UUID PRIMARY KEY,
    event_type      VARCHAR(100) NOT NULL,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commerce consumes: UserWithdrawnEvent
CREATE TABLE IF NOT EXISTS commerce.processed_events (
    event_id        UUID PRIMARY KEY,
    event_type      VARCHAR(100) NOT NULL,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Operation consumes: UserWithdrawnEvent
CREATE TABLE IF NOT EXISTS operation.processed_events (
    event_id        UUID PRIMARY KEY,
    event_type      VARCHAR(100) NOT NULL,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin consumes: UserWithdrawnEvent, ContentPublishedEvent,
--   LiveStreamStartedEvent, LiveStreamEndedEvent, ClipCreatedEvent
CREATE TABLE IF NOT EXISTS admin.processed_events (
    event_id        UUID PRIMARY KEY,
    event_type      VARCHAR(100) NOT NULL,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. Grant outbox/processed_events tables to service roles
--    (complements V022 default privileges for tables created before roles)
-- ============================================================================

-- Each service needs RW on its own outbox and processed_events
GRANT ALL ON identity.outbox_events TO pochak_identity;
GRANT ALL ON content.outbox_events TO pochak_content;
GRANT ALL ON content.processed_events TO pochak_content;
GRANT ALL ON commerce.outbox_events TO pochak_commerce;
GRANT ALL ON commerce.processed_events TO pochak_commerce;
GRANT ALL ON operation.outbox_events TO pochak_operation;
GRANT ALL ON operation.processed_events TO pochak_operation;
GRANT ALL ON admin.processed_events TO pochak_admin;
