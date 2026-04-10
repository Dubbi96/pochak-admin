package com.pochak.commerce.purchase.service;

import com.pochak.commerce.entitlement.entity.EntitlementType;
import com.pochak.commerce.entitlement.service.EntitlementService;
import com.pochak.commerce.payment.PaymentGatewayService;
import com.pochak.commerce.payment.PaymentResult;
import com.pochak.commerce.product.entity.Product;
import com.pochak.commerce.product.entity.ProductType;
import com.pochak.commerce.product.service.ProductService;
import com.pochak.commerce.purchase.dto.PurchaseRequest;
import com.pochak.commerce.purchase.dto.PurchaseResponse;
import com.pochak.commerce.purchase.entity.Purchase;
import com.pochak.commerce.purchase.entity.PurchaseStatus;
import com.pochak.commerce.purchase.repository.PurchaseRepository;
import com.pochak.commerce.event.PurchaseCompletedEvent;
import com.pochak.commerce.event.SubscriptionActivatedEvent;
import com.pochak.commerce.wallet.service.WalletService;
import com.pochak.common.event.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductService productService;
    private final EntitlementService entitlementService;
    private final WalletService walletService;
    private final EventPublisher eventPublisher;
    private final PaymentGatewayService paymentGatewayService;

    @Transactional
    public PurchaseResponse createPurchase(Long userId, PurchaseRequest request) {
        // 1. Validate product exists and is active
        Product product = productService.findProductById(request.getProductId());
        if (!product.getIsActive()) {
            throw new IllegalStateException("Product is not active: " + product.getId());
        }

        // 2. Create purchase with PENDING status and snapshot product details
        Purchase purchase = Purchase.builder()
                .userId(userId)
                .productId(request.getProductId())
                .pgType(request.getPgType())
                .amount(request.getAmount())
                .receiptData(request.getReceiptData())
                .build();
        purchase.snapshotProduct(product);
        Purchase saved = purchaseRepository.save(purchase);

        // 3. PG verification -> set COMPLETED
        PaymentResult paymentResult = paymentGatewayService.verifyPayment(
                saved.getPgType().name(), saved.getAmount(), saved.getReceiptData());
        if (!paymentResult.isSuccess()) {
            saved.cancel();
            throw new IllegalStateException("Payment verification failed: " + paymentResult.getMessage());
        }
        saved.complete(paymentResult.getPgTransactionId());

        // 4. Auto-create Entitlement based on product type
        grantEntitlementForProduct(userId, saved.getId(), product);

        // 5. If POINT_CHARGE, credit wallet
        if (product.getProductType() == ProductType.POINT_CHARGE) {
            int pointAmount = product.getPricePoint() != null ? product.getPricePoint() : 0;
            walletService.creditWallet(userId, pointAmount, "PURCHASE", saved.getId(),
                    "Point charge from purchase #" + saved.getId());
        }

        // 6. Publish domain events
        eventPublisher.publish(new PurchaseCompletedEvent(
                userId, product.getId(), saved.getAmount(), saved.getPgType().name()));

        if (product.getProductType() == ProductType.SUBSCRIPTION) {
            LocalDateTime expiresAt = product.getDurationDays() != null
                    ? LocalDateTime.now().plusDays(product.getDurationDays()) : null;
            eventPublisher.publish(new SubscriptionActivatedEvent(
                    userId, product.getName(), expiresAt));
        }

        return PurchaseResponse.from(saved);
    }

    public Page<PurchaseResponse> getPurchases(Long userId, Pageable pageable) {
        return purchaseRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(PurchaseResponse::from);
    }

    public PurchaseResponse getPurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Purchase not found: " + id));
        return PurchaseResponse.from(purchase);
    }

    @Transactional
    public PurchaseResponse cancelPurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Purchase not found: " + id));
        if (purchase.getStatus() != PurchaseStatus.PENDING) {
            throw new IllegalStateException("Only PENDING purchases can be cancelled. Current status: " + purchase.getStatus());
        }
        purchase.cancel();
        return PurchaseResponse.from(purchase);
    }

    private void grantEntitlementForProduct(Long userId, Long purchaseId, Product product) {
        EntitlementType entitlementType = mapProductTypeToEntitlementType(product.getProductType());
        if (entitlementType == null) {
            // POINT_CHARGE and GIFT_BALL don't create entitlements
            return;
        }

        entitlementService.grantEntitlement(
                userId,
                purchaseId,
                entitlementType,
                product.getReferenceType(),
                product.getReferenceId(),
                product.getDurationDays()
        );
    }

    private EntitlementType mapProductTypeToEntitlementType(ProductType productType) {
        return switch (productType) {
            case SUBSCRIPTION -> EntitlementType.SUBSCRIPTION;
            case SEASON_PASS -> EntitlementType.SEASON_PASS;
            case MATCH_TICKET -> EntitlementType.MATCH_TICKET;
            case SPORT_PASS -> EntitlementType.SEASON_PASS;
            case COMPETITION_PASS -> EntitlementType.MATCH_TICKET;
            case POINT_CHARGE, GIFT_BALL -> null;
        };
    }
}
