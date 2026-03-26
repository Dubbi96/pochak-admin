package com.pochak.commerce.purchase.service;

import com.pochak.commerce.entitlement.entity.Entitlement;
import com.pochak.commerce.entitlement.entity.EntitlementType;
import com.pochak.commerce.entitlement.service.EntitlementService;
import com.pochak.commerce.product.entity.Product;
import com.pochak.commerce.product.entity.ProductType;
import com.pochak.commerce.product.service.ProductService;
import com.pochak.commerce.purchase.dto.PurchaseRequest;
import com.pochak.commerce.purchase.dto.PurchaseResponse;
import com.pochak.commerce.purchase.entity.PgType;
import com.pochak.commerce.purchase.entity.Purchase;
import com.pochak.commerce.purchase.entity.PurchaseStatus;
import com.pochak.commerce.purchase.repository.PurchaseRepository;
import com.pochak.commerce.wallet.service.WalletService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceTest {

    @InjectMocks
    private PurchaseService purchaseService;

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private ProductService productService;

    @Mock
    private EntitlementService entitlementService;

    @Mock
    private WalletService walletService;

    @Captor
    private ArgumentCaptor<Purchase> purchaseCaptor;

    @Test
    @DisplayName("Should snapshot product details at purchase time")
    void testCreatePurchase_snapshotsProductDetails() {
        Long userId = 1L;
        Product product = Product.builder()
                .id(10L)
                .name("Monthly Subscription")
                .productType(ProductType.SUBSCRIPTION)
                .priceKrw(new BigDecimal("9900"))
                .pricePoint(null)
                .durationDays(30)
                .referenceType(null)
                .referenceId(null)
                .isActive(true)
                .build();

        PurchaseRequest request = mock(PurchaseRequest.class);
        when(request.getProductId()).thenReturn(10L);
        when(request.getPgType()).thenReturn(PgType.KCP);
        when(request.getAmount()).thenReturn(new BigDecimal("9900"));
        when(request.getReceiptData()).thenReturn(null);

        when(productService.findProductById(10L)).thenReturn(product);

        Purchase savedPurchase = Purchase.builder()
                .id(1L)
                .userId(userId)
                .productId(10L)
                .pgType(PgType.KCP)
                .amount(new BigDecimal("9900"))
                .status(PurchaseStatus.PENDING)
                .productName("Monthly Subscription")
                .productType(ProductType.SUBSCRIPTION)
                .productPriceKrw(new BigDecimal("9900"))
                .productDurationDays(30)
                .build();
        when(purchaseRepository.save(purchaseCaptor.capture())).thenReturn(savedPurchase);

        when(entitlementService.grantEntitlement(
                eq(userId), eq(1L), eq(EntitlementType.SUBSCRIPTION),
                isNull(), isNull(), eq(30)))
                .thenReturn(Entitlement.builder()
                        .id(1L)
                        .userId(userId)
                        .entitlementType(EntitlementType.SUBSCRIPTION)
                        .startsAt(LocalDateTime.now())
                        .build());

        PurchaseResponse response = purchaseService.createPurchase(userId, request);

        // Verify snapshot fields were set on the purchase before save
        Purchase capturedPurchase = purchaseCaptor.getValue();
        assertEquals("Monthly Subscription", capturedPurchase.getProductName());
        assertEquals(ProductType.SUBSCRIPTION, capturedPurchase.getProductType());
        assertEquals(new BigDecimal("9900"), capturedPurchase.getProductPriceKrw());
        assertEquals(30, capturedPurchase.getProductDurationDays());
        assertNull(capturedPurchase.getProductPricePoint());
        assertNotNull(capturedPurchase.getProductSnapshot());

        // Verify response includes snapshot fields
        assertEquals("Monthly Subscription", response.getProductName());
        assertEquals(ProductType.SUBSCRIPTION, response.getProductType());
    }

    @Test
    @DisplayName("Should create purchase successfully with COMPLETED status")
    void testCreatePurchase_success() {
        Long userId = 1L;
        Product product = Product.builder()
                .id(10L)
                .name("Monthly Subscription")
                .productType(ProductType.SUBSCRIPTION)
                .priceKrw(new BigDecimal("9900"))
                .durationDays(30)
                .isActive(true)
                .build();

        PurchaseRequest request = mock(PurchaseRequest.class);
        when(request.getProductId()).thenReturn(10L);
        when(request.getPgType()).thenReturn(PgType.KCP);
        when(request.getAmount()).thenReturn(new BigDecimal("9900"));
        when(request.getReceiptData()).thenReturn(null);

        when(productService.findProductById(10L)).thenReturn(product);

        Purchase savedPurchase = Purchase.builder()
                .id(1L)
                .userId(userId)
                .productId(10L)
                .pgType(PgType.KCP)
                .amount(new BigDecimal("9900"))
                .status(PurchaseStatus.PENDING)
                .build();
        when(purchaseRepository.save(any(Purchase.class))).thenReturn(savedPurchase);

        when(entitlementService.grantEntitlement(
                eq(userId), eq(1L), eq(EntitlementType.SUBSCRIPTION),
                isNull(), isNull(), eq(30)))
                .thenReturn(Entitlement.builder()
                        .id(1L)
                        .userId(userId)
                        .entitlementType(EntitlementType.SUBSCRIPTION)
                        .startsAt(LocalDateTime.now())
                        .build());

        PurchaseResponse response = purchaseService.createPurchase(userId, request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(PurchaseStatus.COMPLETED, response.getStatus());
        assertNotNull(response.getPgTransactionId());
        verify(entitlementService).grantEntitlement(eq(userId), eq(1L), eq(EntitlementType.SUBSCRIPTION),
                isNull(), isNull(), eq(30));
        verify(walletService, never()).creditWallet(anyLong(), anyInt(), anyString(), anyLong(), anyString());
    }

    @Test
    @DisplayName("Should create purchase and auto-create entitlement for SUBSCRIPTION")
    void testCreatePurchase_autoEntitlement() {
        Long userId = 1L;
        Product product = Product.builder()
                .id(10L)
                .name("Season Pass")
                .productType(ProductType.SEASON_PASS)
                .priceKrw(new BigDecimal("49900"))
                .durationDays(90)
                .referenceType("LEAGUE")
                .referenceId(5L)
                .isActive(true)
                .build();

        PurchaseRequest request = mock(PurchaseRequest.class);
        when(request.getProductId()).thenReturn(10L);
        when(request.getPgType()).thenReturn(PgType.INAPP_GOOGLE);
        when(request.getAmount()).thenReturn(new BigDecimal("49900"));
        when(request.getReceiptData()).thenReturn("google-receipt");

        when(productService.findProductById(10L)).thenReturn(product);

        Purchase savedPurchase = Purchase.builder()
                .id(2L)
                .userId(userId)
                .productId(10L)
                .pgType(PgType.INAPP_GOOGLE)
                .amount(new BigDecimal("49900"))
                .status(PurchaseStatus.PENDING)
                .build();
        when(purchaseRepository.save(any(Purchase.class))).thenReturn(savedPurchase);

        when(entitlementService.grantEntitlement(
                eq(userId), eq(2L), eq(EntitlementType.SEASON_PASS),
                eq("LEAGUE"), eq(5L), eq(90)))
                .thenReturn(Entitlement.builder().id(2L).build());

        PurchaseResponse response = purchaseService.createPurchase(userId, request);

        assertNotNull(response);
        assertEquals(PurchaseStatus.COMPLETED, response.getStatus());
        verify(entitlementService).grantEntitlement(
                eq(userId), eq(2L), eq(EntitlementType.SEASON_PASS),
                eq("LEAGUE"), eq(5L), eq(90));
    }

    @Test
    @DisplayName("Should credit wallet for POINT_CHARGE product")
    void testCreatePurchase_pointCharge_creditsWallet() {
        Long userId = 1L;
        Product product = Product.builder()
                .id(20L)
                .name("1000 Points")
                .productType(ProductType.POINT_CHARGE)
                .priceKrw(new BigDecimal("1000"))
                .pricePoint(1000)
                .isActive(true)
                .build();

        PurchaseRequest request = mock(PurchaseRequest.class);
        when(request.getProductId()).thenReturn(20L);
        when(request.getPgType()).thenReturn(PgType.KCP);
        when(request.getAmount()).thenReturn(new BigDecimal("1000"));
        when(request.getReceiptData()).thenReturn(null);

        when(productService.findProductById(20L)).thenReturn(product);

        Purchase savedPurchase = Purchase.builder()
                .id(3L)
                .userId(userId)
                .productId(20L)
                .pgType(PgType.KCP)
                .amount(new BigDecimal("1000"))
                .status(PurchaseStatus.PENDING)
                .build();
        when(purchaseRepository.save(any(Purchase.class))).thenReturn(savedPurchase);

        PurchaseResponse response = purchaseService.createPurchase(userId, request);

        assertNotNull(response);
        verify(walletService).creditWallet(eq(userId), eq(1000), eq("PURCHASE"), eq(3L), anyString());
        verify(entitlementService, never()).grantEntitlement(anyLong(), anyLong(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should throw exception when product is inactive")
    void testCreatePurchase_inactiveProduct() {
        Long userId = 1L;
        Product product = Product.builder()
                .id(10L)
                .name("Old Product")
                .productType(ProductType.SUBSCRIPTION)
                .isActive(false)
                .build();

        PurchaseRequest request = mock(PurchaseRequest.class);
        when(request.getProductId()).thenReturn(10L);

        when(productService.findProductById(10L)).thenReturn(product);

        assertThrows(IllegalStateException.class, () -> purchaseService.createPurchase(userId, request));
    }
}
