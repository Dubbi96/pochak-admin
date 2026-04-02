package com.pochak.content.asset.repository;

import com.pochak.content.asset.entity.LiveAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface LiveAssetRepository extends JpaRepository<LiveAsset, Long> {

    Page<LiveAsset> findByDeletedAtIsNullOrderByStartTimeDesc(Pageable pageable);

    @Query("SELECT la FROM LiveAsset la LEFT JOIN FETCH la.match m LEFT JOIN FETCH m.competition " +
            "LEFT JOIN FETCH m.participants p LEFT JOIN FETCH p.team " +
            "WHERE la.deletedAt IS NULL AND la.status = :status AND la.isDisplayed = true")
    List<LiveAsset> findByStatusWithMatchDetails(@Param("status") LiveAsset.LiveStatus status);

    @Query("SELECT la FROM LiveAsset la LEFT JOIN FETCH la.match m LEFT JOIN FETCH m.competition " +
            "WHERE la.deletedAt IS NULL AND la.isDisplayed = true AND m.competition.id = :competitionId " +
            "AND la.status = 'BROADCASTING' ORDER BY la.startTime DESC")
    List<LiveAsset> findLiveByCompetitionId(@Param("competitionId") Long competitionId, Pageable pageable);

    @Query("SELECT la FROM LiveAsset la WHERE la.deletedAt IS NULL AND la.match.id IN :matchIds")
    List<LiveAsset> findByMatchIdIn(@Param("matchIds") Collection<Long> matchIds);

    Optional<LiveAsset> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT la FROM LiveAsset la LEFT JOIN la.match m WHERE la.deletedAt IS NULL" +
            " AND (CAST(:ownerType AS string) IS NULL OR la.ownerType = :ownerType)" +
            " AND (CAST(:venueId AS long) IS NULL OR m.venueId = :venueId)" +
            " AND (CAST(:dateFrom AS localdatetime) IS NULL OR la.startTime >= :dateFrom)" +
            " AND (CAST(:dateTo AS localdatetime) IS NULL OR la.startTime <= :dateTo)" +
            " AND (CAST(:isDisplayed AS boolean) IS NULL OR la.isDisplayed = :isDisplayed)" +
            " AND (CAST(:visibility AS string) IS NULL OR la.visibility = :visibility)" +
            " ORDER BY la.createdAt DESC")
    Page<LiveAsset> findWithFilters(
            @Param("ownerType") LiveAsset.OwnerType ownerType,
            @Param("venueId") Long venueId,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("isDisplayed") Boolean isDisplayed,
            @Param("visibility") LiveAsset.Visibility visibility,
            Pageable pageable);

    @Query("SELECT la FROM LiveAsset la LEFT JOIN la.match m WHERE la.deletedAt IS NULL AND la.isDisplayed = true" +
            " AND m IS NOT NULL AND LOWER(CAST(m.title AS string)) LIKE LOWER(CAST(CONCAT('%', :keyword, '%') AS string))" +
            " ORDER BY la.createdAt DESC")
    List<LiveAsset> searchByTitle(@Param("keyword") String keyword, Pageable pageable);
}
