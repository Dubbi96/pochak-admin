package com.pochak.commerce.product.repository;

import com.pochak.commerce.product.entity.Product;
import com.pochak.commerce.product.entity.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByIsActiveTrue();

    List<Product> findByProductTypeAndIsActiveTrue(ProductType productType);

    @Query("SELECT p FROM Product p WHERE " +
            "(:productType IS NULL OR p.productType = :productType) AND " +
            "(:isActive IS NULL OR p.isActive = :isActive)")
    Page<Product> findWithFilters(
            @Param("productType") ProductType productType,
            @Param("isActive") Boolean isActive,
            Pageable pageable);
}
