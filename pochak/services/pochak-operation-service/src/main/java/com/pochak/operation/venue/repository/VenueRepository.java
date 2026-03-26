package com.pochak.operation.venue.repository;

import com.pochak.operation.venue.entity.OwnerType;
import com.pochak.operation.venue.entity.Venue;
import com.pochak.operation.venue.entity.VenueType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByIsActiveTrue();

    List<Venue> findBySportIdAndIsActiveTrue(Long sportId);

    @Query("SELECT v FROM Venue v WHERE v.isActive = true " +
            "AND (:ownerType IS NULL OR v.ownerType = :ownerType) " +
            "AND (:venueType IS NULL OR v.venueType = :venueType) " +
            "AND (:sportId IS NULL OR v.sportId = :sportId) " +
            "AND (:name IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<Venue> findByFilters(
            @Param("ownerType") OwnerType ownerType,
            @Param("venueType") VenueType venueType,
            @Param("sportId") Long sportId,
            @Param("name") String name,
            Pageable pageable);

    @Query("SELECT v FROM Venue v WHERE v.isActive = true" +
            " AND (:keyword IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            " AND (:sportId IS NULL OR v.sportId = :sportId)" +
            " AND (:siGunGuCode IS NULL OR v.siGunGuCode = :siGunGuCode)" +
            " AND (:venueType IS NULL OR v.venueType = :venueType)" +
            " AND (:ownerType IS NULL OR v.ownerType = :ownerType)" +
            " ORDER BY v.name ASC")
    Page<Venue> searchVenues(
            @Param("keyword") String keyword,
            @Param("sportId") Long sportId,
            @Param("siGunGuCode") String siGunGuCode,
            @Param("venueType") VenueType venueType,
            @Param("ownerType") OwnerType ownerType,
            Pageable pageable);

    @Query("SELECT v FROM Venue v WHERE v.isActive = true" +
            " AND v.latitude IS NOT NULL AND v.longitude IS NOT NULL" +
            " AND v.latitude BETWEEN :minLat AND :maxLat" +
            " AND v.longitude BETWEEN :minLng AND :maxLng" +
            " ORDER BY v.name ASC")
    Page<Venue> findNearby(
            @Param("minLat") java.math.BigDecimal minLat,
            @Param("maxLat") java.math.BigDecimal maxLat,
            @Param("minLng") java.math.BigDecimal minLng,
            @Param("maxLng") java.math.BigDecimal maxLng,
            Pageable pageable);
}
