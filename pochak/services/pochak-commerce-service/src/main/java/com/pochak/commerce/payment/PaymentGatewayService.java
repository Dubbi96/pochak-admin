package com.pochak.commerce.payment;

import java.math.BigDecimal;

/**
 * Abstraction for payment gateway operations.
 * Implementations include a stub for development and real PG integrations (KCP, Google, Apple) for production.
 */
public interface PaymentGatewayService {

    /**
     * Verify a payment with the PG and return the result.
     *
     * @param pgType      the payment gateway type (e.g., "KCP", "INAPP_GOOGLE", "INAPP_APPLE")
     * @param amount      the payment amount
     * @param receiptData the receipt or token from the client
     * @return verification result including the PG transaction ID
     */
    PaymentResult verifyPayment(String pgType, BigDecimal amount, String receiptData);

    /**
     * Request a refund from the PG.
     *
     * @param pgTransactionId the original PG transaction ID
     * @param amount          the refund amount
     * @return refund result
     */
    PaymentResult refundPayment(String pgTransactionId, BigDecimal amount);
}
