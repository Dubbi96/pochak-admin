package com.pochak.operation.event;

import com.pochak.common.event.RabbitMqConfig;
import com.pochak.common.event.UserWithdrawnEvent;
import com.pochak.operation.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * DATA-001: Handles user withdrawal cleanup for the operation service.
 *
 * Per-table policy:
 *   - reservations (active: PENDING/CONFIRMED): cancel
 *   - reservations (completed): anonymize (reserved_by_user_id -> -1)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserWithdrawalListener {

    private final ReservationRepository reservationRepository;

    @RabbitListener(queues = RabbitMqConfig.QUEUE_OPERATION)
    @Transactional
    public void handleUserWithdrawn(UserWithdrawnEvent event) {
        if (!UserWithdrawnEvent.ROUTING_KEY.equals(event.getEventType())) {
            return;
        }

        Long userId = event.getUserId();
        log.info("[UserWithdrawal] Processing operation cleanup for userId={}", userId);

        // 1. Cancel active reservations (PENDING, CONFIRMED)
        int reservationsCancelled = reservationRepository.cancelActiveByUserId(userId);
        log.debug("[UserWithdrawal] Cancelled {} active reservations for userId={}", reservationsCancelled, userId);

        // 2. Anonymize completed reservations (keep record, hide user identity)
        int reservationsAnonymized = reservationRepository.anonymizeCompletedByUserId(userId);
        log.debug("[UserWithdrawal] Anonymized {} completed reservations for userId={}", reservationsAnonymized, userId);

        log.info("[UserWithdrawal] Operation cleanup complete for userId={}: " +
                        "reservations_cancelled={}, reservations_anonymized={}",
                userId, reservationsCancelled, reservationsAnonymized);
    }
}
