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
            "AND (CAST(:ownerType AS string) IS NULL OR v.ownerType = :ownerType) " +
            "AND (CAST(:venueType AS string) IS NULL OR v.venueType = :venueType) " +
            "AND (CAST(:sportId AS long) IS NULL OR v.sportId = :sportId) " +
            "AND (CAST(:name AS string) IS NULL OR LOWER(CAST(v.name AS string)) LIKE LOWER(CAST(CONCAT('%', :name, '%') AS string)))")
    Page<Venue> findByFilters(
            @Param("ownerType") OwnerType ownerType,
            @Param("venueType") VenueType venueType,
            @Param("sportId") Long sportId,
            @Param("name") String name,
            Pageable pageable);

    @Query("SELECT v FROM Venue v WHERE v.isActive = true" +
            " AND (CAST(:keyword AS string) IS NULL OR LOWER(CAST(v.name AS string)) LIKE LOWER(CAST(CONCAT('%', :keyword, '%') AS string)))" +
            " AND (CAST(:sportId AS long) IS NULL OR v.sportId = :sportId)" +
            " AND (CAST(:siGunGuCode AS string) IS NULL OR v.siGunGuCode = :siGunGuCode)" +
            " AND (CAST(:venueType AS string) IS NULL OR v.venueType = :venueType)" +
            " AND (CAST(:ownerType AS string) IS NULL OR v.ownerType = :ownerType)" +
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
