package com.pochak.commerce.payment;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Stub implementation of PaymentGatewayService for development and testing.
 * Always returns success. Replace with a real PG integration for production.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "pochak.payment.provider", havingValue = "stub", matchIfMissing = true)
public class StubPaymentGatewayService implements PaymentGatewayService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final AtomicLong sequence = new AtomicLong(1);

    @PostConstruct
    void warnStubMode() {
        log.warn("============================================================");
        log.warn("  STUB PaymentGatewayService is active.                     ");
        log.warn("  All payments will be auto-approved without real PG calls.  ");
        log.warn("  Set pochak.payment.provider to 'kcp', 'google', or        ");
        log.warn("  'apple' for production use.                                ");
        log.warn("============================================================");
    }

    @Override
    public PaymentResult verifyPayment(String pgType, BigDecimal amount, String receiptData) {
        log.info("[STUB] verifyPayment called: pgType={}, amount={}, receiptData={}",
                pgType, amount, maskReceiptData(receiptData));

        simulateNetworkDelay();

        String transactionId = generateTransactionId(pgType);
        log.info("[STUB] Payment verified successfully. pgTransactionId={}", transactionId);

        return PaymentResult.success(transactionId,
                "Stub verification successful for " + pgType);
    }

    @Override
    public PaymentResult refundPayment(String pgTransactionId, BigDecimal amount) {
        log.info("[STUB] refundPayment called: pgTransactionId={}, amount={}",
                pgTransactionId, amount);

        simulateNetworkDelay();

        String refundTransactionId = "RF-" + pgTransactionId;
        log.info("[STUB] Refund processed successfully. refundTransactionId={}", refundTransactionId);

        return PaymentResult.success(refundTransactionId,
                "Stub refund successful for original transaction " + pgTransactionId);
    }

    private String generateTransactionId(String pgType) {
        String prefix = switch (pgType.toUpperCase()) {
            case "KCP" -> "KCP";
            case "INAPP_GOOGLE" -> "GPY";
            case "INAPP_APPLE" -> "APL";
            default -> "PGX";
        };
        String date = LocalDate.now().format(DATE_FMT);
        long seq = sequence.getAndIncrement();
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return String.format("%s-%s-%04d%04d", prefix, date, seq, random);
    }

    private void simulateNetworkDelay() {
        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String maskReceiptData(String receiptData) {
        if (receiptData == null || receiptData.length() <= 8) {
            return "****";
        }
        return receiptData.substring(0, 4) + "****" + receiptData.substring(receiptData.length() - 4);
    }
}
