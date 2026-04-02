package com.pochak.commerce.purchase.repository;

import com.pochak.commerce.purchase.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    Page<Purchase> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
