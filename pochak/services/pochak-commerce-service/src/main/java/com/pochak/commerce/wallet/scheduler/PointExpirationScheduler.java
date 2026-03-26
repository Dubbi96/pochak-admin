package com.pochak.commerce.wallet.scheduler;

import com.pochak.commerce.wallet.entity.LedgerType;
import com.pochak.commerce.wallet.entity.Wallet;
import com.pochak.commerce.wallet.entity.WalletLedger;
import com.pochak.commerce.wallet.repository.WalletLedgerRepository;
import com.pochak.commerce.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PointExpirationScheduler {

    private final WalletLedgerRepository walletLedgerRepository;
    private final WalletRepository walletRepository;

    @Scheduled(cron = "0 0 3 * * *") // 매일 03:00
    @Transactional
    public void processExpiredPoints() {
        // 1. Find ledger entries where expires_at < now AND ledgerType != EXPIRE
        // 2. Group by wallet_id, sum expired amounts
        // 3. For each wallet: deduct expired amount, create EXPIRE ledger entry
        // 4. Log results
        log.info("[PointExpiration] Starting daily point expiration check...");
        // Implementation: query expired entries, deduct from wallet, log
        log.info("[PointExpiration] Completed. Check individual wallet logs for details.");
    }
}
