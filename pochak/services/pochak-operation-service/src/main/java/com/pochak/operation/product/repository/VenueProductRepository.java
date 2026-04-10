package com.pochak.operation.product.repository;

import com.pochak.operation.product.entity.VenueProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VenueProductRepository extends JpaRepository<VenueProduct, Long> {

    List<VenueProduct> findByVenueIdAndIsActiveTrueOrderByCreatedAtDesc(Long venueId);

    Optional<VenueProduct> findByIdAndIsActiveTrue(Long id);

    @Query("SELECT p FROM VenueProduct p JOIN Venue v ON p.venueId = v.id " +
           "WHERE v.ownerId = :ownerId AND p.isActive = true ORDER BY p.createdAt DESC")
    List<VenueProduct> findByVenueOwnerIdAndIsActiveTrue(@Param("ownerId") Long ownerId);
}
