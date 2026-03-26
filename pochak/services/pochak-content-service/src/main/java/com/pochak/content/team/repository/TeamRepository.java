package com.pochak.content.team.repository;

import com.pochak.content.team.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findBySportIdAndActiveTrue(Long sportId);

    Optional<Team> findByIdAndActiveTrue(Long id);

    @Query("SELECT t FROM Team t WHERE t.active = true" +
            " AND (:sportId IS NULL OR t.sport.id = :sportId)" +
            " AND (:siGunGuCode IS NULL OR t.siGunGuCode = :siGunGuCode)" +
            " ORDER BY t.name ASC")
    Page<Team> findNearbyBySiGunGuCode(
            @Param("sportId") Long sportId,
            @Param("siGunGuCode") String siGunGuCode,
            Pageable pageable);

    @Query("SELECT t FROM Team t WHERE t.active = true" +
            " AND (:sportId IS NULL OR t.sport.id = :sportId)" +
            " AND t.latitude IS NOT NULL AND t.longitude IS NOT NULL" +
            " AND t.latitude BETWEEN :minLat AND :maxLat" +
            " AND t.longitude BETWEEN :minLng AND :maxLng" +
            " ORDER BY t.name ASC")
    Page<Team> findNearbyByLatLng(
            @Param("sportId") Long sportId,
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLng") BigDecimal minLng,
            @Param("maxLng") BigDecimal maxLng,
            Pageable pageable);

    @Query("SELECT t FROM Team t WHERE t.active = true ORDER BY t.createdAt DESC")
    Page<Team> findRecentTeams(Pageable pageable);

    @Query("SELECT t FROM Team t WHERE t.active = true" +
            " AND LOWER(CAST(t.name AS string)) LIKE LOWER(CAST(CONCAT('%', :keyword, '%') AS string))" +
            " ORDER BY t.name ASC")
    List<Team> searchByName(@Param("keyword") String keyword, Pageable pageable);
}
