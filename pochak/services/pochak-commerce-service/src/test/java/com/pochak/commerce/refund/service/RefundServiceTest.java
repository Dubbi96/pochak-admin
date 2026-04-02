package com.pochak.commerce.refund.service;

import com.pochak.commerce.purchase.entity.Purchase;
import com.pochak.commerce.purchase.entity.PgType;
import com.pochak.commerce.purchase.entity.PurchaseStatus;
import com.pochak.commerce.purchase.repository.PurchaseRepository;
import com.pochak.commerce.refund.dto.ProcessRefundRequest;
import com.pochak.commerce.refund.dto.RefundRequest;
import com.pochak.commerce.refund.dto.RefundResponse;
import com.pochak.commerce.refund.entity.Refund;
import com.pochak.commerce.refund.entity.RefundStatus;
import com.pochak.commerce.refund.repository.RefundRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefundServiceTest {

    @InjectMocks
    private RefundService refundService;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private PurchaseRepository purchaseRepository;

    @Test
    @DisplayName("Should create refund for completed purchase")
    void testCreateRefund() {
        Long userId = 1L;
        Purchase purchase = Purchase.builder()
                .id(10L)
                .userId(userId)
                .productId(1L)
                .pgType(PgType.KCP)
                .amount(new BigDecimal("9900"))
                .status(PurchaseStatus.COMPLETED)
                .build();

        RefundRequest request = RefundRequest.builder()
                .purchaseId(10L)
                .reason("Changed my mind")
                .build();

        when(purchaseRepository.findById(10L)).thenReturn(Optional.of(purchase));
        when(refundRepository.save(any(Refund.class))).thenAnswer(i -> {
            Refund r = i.getArgument(0);
            return Refund.builder()
                    .id(1L)
                    .purchaseId(r.getPurchaseId())
                    .userId(r.getUserId())
                    .refundAmount(r.getRefundAmount())
                    .reason(r.getReason())
                    .status(RefundStatus.REQUESTED)
                    .build();
        });

        RefundResponse response = refundService.createRefund(userId, request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(10L, response.getPurchaseId());
        assertEquals(RefundStatus.REQUESTED, response.getStatus());
        assertEquals(new BigDecimal("9900"), response.getRefundAmount());
        assertEquals("Changed my mind", response.getReason());
    }

    @Test
    @DisplayName("Should throw exception when creating refund for non-completed purchase")
    void testCreateRefund_nonCompleted() {
        Long userId = 1L;
        Purchase purchase = Purchase.builder()
                .id(10L)
                .userId(userId)
                .productId(1L)
                .pgType(PgType.KCP)
                .amount(new BigDecimal("9900"))
                .status(PurchaseStatus.PENDING)
                .build();

        RefundRequest request = RefundRequest.builder()
                .purchaseId(10L)
                .reason("Changed my mind")
                .build();

        when(purchaseRepository.findById(10L)).thenReturn(Optional.of(purchase));

        assertThrows(IllegalStateException.class, () -> refundService.createRefund(userId, request));
    }

    @Test
    @DisplayName("Should process refund approval and mark purchase as refunded")
    void testProcessRefund_approve() {
        Refund refund = Refund.builder()
                .id(1L)
                .purchaseId(10L)
                .userId(1L)
                .refundAmount(new BigDecimal("9900"))
                .reason("Changed my mind")
                .status(RefundStatus.REQUESTED)
                .build();

        Purchase purchase = Purchase.builder()
                .id(10L)
                .userId(1L)
                .productId(1L)
                .pgType(PgType.KCP)
                .amount(new BigDecimal("9900"))
                .status(PurchaseStatus.COMPLETED)
                .build();

        ProcessRefundRequest request = ProcessRefundRequest.builder()
                .approved(true)
                .adminNote("Approved by admin")
                .build();

        when(refundRepository.findById(1L)).thenReturn(Optional.of(refund));
        when(purchaseRepository.findById(10L)).thenReturn(Optional.of(purchase));

        RefundResponse response = refundService.processRefund(1L, request);

        assertNotNull(response);
        assertEquals(RefundStatus.COMPLETED, response.getStatus());
        assertEquals(PurchaseStatus.REFUNDED, purchase.getStatus());
    }

    @Test
    @DisplayName("Should process refund rejection")
    void testProcessRefund_reject() {
        Refund refund = Refund.builder()
                .id(1L)
                .purchaseId(10L)
                .userId(1L)
                .refundAmount(new BigDecimal("9900"))
                .reason("Changed my mind")
                .status(RefundStatus.REQUESTED)
                .build();

        ProcessRefundRequest request = ProcessRefundRequest.builder()
                .approved(false)
                .adminNote("Outside refund window")
                .build();

        when(refundRepository.findById(1L)).thenReturn(Optional.of(refund));

        RefundResponse response = refundService.processRefund(1L, request);

        assertNotNull(response);
        assertEquals(RefundStatus.REJECTED, response.getStatus());
    }
}
