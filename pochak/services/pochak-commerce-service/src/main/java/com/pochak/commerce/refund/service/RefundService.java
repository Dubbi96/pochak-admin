package com.pochak.commerce.refund.service;

import com.pochak.commerce.entitlement.service.EntitlementService;
import com.pochak.commerce.payment.PaymentGatewayService;
import com.pochak.commerce.payment.PaymentResult;
import com.pochak.commerce.purchase.entity.Purchase;
import com.pochak.commerce.purchase.entity.PurchaseStatus;
import com.pochak.commerce.purchase.repository.PurchaseRepository;
import com.pochak.commerce.refund.dto.ProcessRefundRequest;
import com.pochak.commerce.refund.dto.RefundRequest;
import com.pochak.commerce.refund.dto.RefundResponse;
import com.pochak.commerce.refund.entity.Refund;
import com.pochak.commerce.refund.entity.RefundStatus;
import com.pochak.commerce.event.RefundProcessedEvent;
import com.pochak.commerce.refund.repository.RefundRepository;
import com.pochak.common.event.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RefundService {

    private final RefundRepository refundRepository;
    private final PurchaseRepository purchaseRepository;
    private final PaymentGatewayService paymentGatewayService;
    private final EntitlementService entitlementService;
    private final EventPublisher eventPublisher;

    @Transactional
    public RefundResponse createRefund(Long userId, RefundRequest request) {
        Purchase purchase = purchaseRepository.findById(request.getPurchaseId())
                .orElseThrow(() -> new IllegalArgumentException("Purchase not found: " + request.getPurchaseId()));

        if (purchase.getStatus() != PurchaseStatus.COMPLETED) {
            throw new IllegalStateException("Only COMPLETED purchases can be refunded. Current status: " + purchase.getStatus());
        }

        if (!purchase.getUserId().equals(userId)) {
            throw new IllegalStateException("Purchase does not belong to user");
        }

        Refund refund = Refund.builder()
                .purchaseId(request.getPurchaseId())
                .userId(userId)
                .refundAmount(purchase.getAmount())
                .reason(request.getReason())
                .build();

        Refund saved = refundRepository.save(refund);
        return RefundResponse.from(saved);
    }

    public Page<RefundResponse> getRefunds(RefundStatus status, Pageable pageable) {
        return refundRepository.findWithStatusFilter(status, pageable)
                .map(RefundResponse::from);
    }

    public Page<RefundResponse> getUserRefunds(Long userId, RefundStatus status, Pageable pageable) {
        return refundRepository.findByUserIdWithStatusFilter(userId, status, pageable)
                .map(RefundResponse::from);
    }

    @Transactional
    public RefundResponse processRefund(Long id, ProcessRefundRequest request) {
        Refund refund = refundRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Refund not found: " + id));

        if (request.getApproved()) {
            refund.approve(request.getAdminNote());

            // Issue refund through the payment gateway
            Purchase purchase = purchaseRepository.findById(refund.getPurchaseId())
                    .orElseThrow(() -> new IllegalArgumentException("Purchase not found: " + refund.getPurchaseId()));

            PaymentResult refundResult = paymentGatewayService.refundPayment(
                    purchase.getPgTransactionId(), refund.getRefundAmount());
            if (!refundResult.isSuccess()) {
                log.error("PG refund failed for refund {}: {}", refund.getId(), refundResult.getMessage());
                throw new IllegalStateException("PG refund failed: " + refundResult.getMessage());
            }

            purchase.refund();
            refund.complete();

            // Revoke entitlements linked to this purchase
            entitlementService.revokeByPurchaseId(purchase.getId());

            log.info("Refund {} completed via PG. refundTransactionId={}", refund.getId(), refundResult.getPgTransactionId());

            eventPublisher.publish(new RefundProcessedEvent(
                    refund.getUserId(), refund.getId(), refund.getRefundAmount()));
        } else {
            refund.reject(request.getAdminNote());
        }

        return RefundResponse.from(refund);
    }
}
