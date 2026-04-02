-- ============================================================================
-- V022: L6 - Remove version column from wallets table
-- PESSIMISTIC_WRITE lock in WalletRepository is sufficient; @Version (optimistic lock)
-- caused unnecessary OptimisticLockException under contention.
-- ============================================================================

ALTER TABLE commerce.wallets
    DROP COLUMN IF EXISTS version;
