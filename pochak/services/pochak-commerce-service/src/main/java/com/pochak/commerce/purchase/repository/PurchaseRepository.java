package com.pochak.commerce.purchase.repository;

import com.pochak.commerce.product.entity.ProductType;
import com.pochak.commerce.purchase.entity.Purchase;
import com.pochak.commerce.purchase.entity.PurchaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    Page<Purchase> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** [Admin] 상품 유형별 구매 이력 페이징 조회. */
    Page<Purchase> findByProductTypeOrderByCreatedAtDesc(ProductType productType, Pageable pageable);

    /** [Admin] 시즌패스 기간별 통계용 집계. */
    @Query("SELECT COUNT(p), COALESCE(SUM(p.amount), 0) FROM Purchase p " +
           "WHERE p.productType = :productType " +
           "AND p.status = :status " +
           "AND (:fromDt IS NULL OR p.createdAt >= :fromDt) " +
           "AND (:toDt IS NULL OR p.createdAt <= :toDt)")
    Object[] aggregateByProductTypeAndPeriod(
            @Param("productType") ProductType productType,
            @Param("status") PurchaseStatus status,
            @Param("fromDt") LocalDateTime fromDt,
            @Param("toDt") LocalDateTime toDt);
}
