package com.pochak.operation.product.repository;

import com.pochak.operation.product.entity.ProductPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductPriceHistoryRepository extends JpaRepository<ProductPriceHistory, Long> {

    List<ProductPriceHistory> findByProductIdOrderByCreatedAtDesc(Long productId);
}
