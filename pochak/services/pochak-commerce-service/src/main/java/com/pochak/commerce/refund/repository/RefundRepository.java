package com.pochak.commerce.refund.repository;

import com.pochak.commerce.refund.entity.Refund;
import com.pochak.commerce.refund.entity.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RefundRepository extends JpaRepository<Refund, Long> {

    List<Refund> findByPurchaseId(Long purchaseId);

    List<Refund> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT r FROM Refund r WHERE " +
            "(:status IS NULL OR r.status = :status) " +
            "ORDER BY r.createdAt DESC")
    Page<Refund> findWithStatusFilter(@Param("status") RefundStatus status, Pageable pageable);

    @Query("SELECT r FROM Refund r WHERE r.userId = :userId " +
            "AND (:status IS NULL OR r.status = :status) " +
            "ORDER BY r.createdAt DESC")
    Page<Refund> findByUserIdWithStatusFilter(
            @Param("userId") Long userId,
            @Param("status") RefundStatus status,
            Pageable pageable);
}
