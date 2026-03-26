package com.pochak.commerce.event;

import com.pochak.common.event.RabbitMqConfig;
import com.pochak.common.event.UserWithdrawnEvent;
import com.pochak.commerce.entitlement.repository.EntitlementRepository;
import com.pochak.commerce.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * DATA-001: Handles user withdrawal cleanup for the commerce service.
 *
 * Per-table policy:
 *   - purchases: KEEP (5-year tax record retention), user_id stays for refund/audit trail
 *   - entitlements: revoke (set isActive = false)
 *   - wallets: zero out balance
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserWithdrawalListener {

    private final EntitlementRepository entitlementRepository;
    private final WalletRepository walletRepository;

    @RabbitListener(queues = RabbitMqConfig.QUEUE_COMMERCE)
    @Transactional
    public void handleUserWithdrawn(UserWithdrawnEvent event) {
        if (!UserWithdrawnEvent.ROUTING_KEY.equals(event.getEventType())) {
            return;
        }

        Long userId = event.getUserId();
        log.info("[UserWithdrawal] Processing commerce cleanup for userId={}", userId);

        // 1. entitlements: revoke all active entitlements
        int entitlementsRevoked = entitlementRepository.revokeAllByUserId(userId);
        log.debug("[UserWithdrawal] Revoked {} entitlements for userId={}", entitlementsRevoked, userId);

        // 2. wallets: zero out balance
        int walletsZeroed = walletRepository.zeroBalanceByUserId(userId);
        log.debug("[UserWithdrawal] Zeroed {} wallet(s) for userId={}", walletsZeroed, userId);

        // 3. purchases: intentionally NOT deleted or anonymized
        //    (5-year tax record retention requirement, user_id kept for refund/audit trail)

        log.info("[UserWithdrawal] Commerce cleanup complete for userId={}: " +
                        "entitlements_revoked={}, wallets_zeroed={}",
                userId, entitlementsRevoked, walletsZeroed);
    }
}
