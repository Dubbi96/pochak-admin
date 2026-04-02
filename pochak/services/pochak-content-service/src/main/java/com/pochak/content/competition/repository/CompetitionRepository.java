package com.pochak.content.competition.repository;

import com.pochak.content.competition.entity.Competition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pochak.content.competition.entity.CompetitionVisit;
import com.pochak.content.competition.entity.CompetitionVisibility;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, Long>, JpaSpecificationExecutor<Competition> {

    List<Competition> findBySportIdAndStatus(Long sportId, Competition.CompetitionStatus status);

    List<Competition> findBySportIdOrderByStartDateDesc(Long sportId);

    Optional<Competition> findByIdAndActiveTrue(Long id);

    @Query("SELECT c FROM Competition c WHERE c.active = true AND c.isDisplayed = true " +
            "AND c.status IN ('SCHEDULED', 'IN_PROGRESS') " +
            "AND (CAST(:sportId AS long) IS NULL OR c.sport.id = :sportId) " +
            "AND (c.startDate <= :endDate AND (c.endDate IS NULL OR c.endDate >= :startDate)) " +
            "ORDER BY c.startDate ASC")
    List<Competition> findActiveCompetitions(
            @Param("sportId") Long sportId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT c FROM Competition c WHERE c.active = true AND c.isDisplayed = true " +
            "AND c.status IN ('SCHEDULED', 'IN_PROGRESS') ORDER BY c.startDate ASC")
    List<Competition> findAllActiveDisplayed();

    @Query("SELECT c FROM Competition c WHERE c.active = true" +
            " AND (CAST(:sportId AS long) IS NULL OR c.sport.id = :sportId)" +
            " AND (CAST(:status AS string) IS NULL OR c.status = :status)" +
            " AND (CAST(:isDisplayed AS boolean) IS NULL OR c.isDisplayed = :isDisplayed)" +
            " AND (CAST(:keyword AS string) IS NULL OR LOWER(CAST(c.name AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            " ORDER BY c.startDate DESC")
    Page<Competition> findWithFilters(
            @Param("sportId") Long sportId,
            @Param("status") Competition.CompetitionStatus status,
            @Param("isDisplayed") Boolean isDisplayed,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("SELECT c FROM Competition c WHERE c.active = true AND c.isDisplayed = true" +
            " AND LOWER(CAST(c.name AS string)) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            " ORDER BY c.startDate DESC")
    List<Competition> searchByName(@Param("keyword") String keyword, Pageable pageable);

    Optional<Competition> findByInviteCodeAndActiveTrue(String inviteCode);

    @Query("SELECT c FROM Competition c WHERE c.active = true" +
            " AND c.visibility = :visibility" +
            " AND (CAST(:sportId AS long) IS NULL OR c.sport.id = :sportId)" +
            " AND (CAST(:status AS string) IS NULL OR c.status = :status)" +
            " AND (CAST(:isDisplayed AS boolean) IS NULL OR c.isDisplayed = :isDisplayed)" +
            " AND (CAST(:keyword AS string) IS NULL OR LOWER(CAST(c.name AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            " ORDER BY c.startDate DESC")
    Page<Competition> findWithFiltersAndVisibility(
            @Param("sportId") Long sportId,
            @Param("status") Competition.CompetitionStatus status,
            @Param("isDisplayed") Boolean isDisplayed,
            @Param("keyword") String keyword,
            @Param("visibility") CompetitionVisibility visibility,
            Pageable pageable);

    @Query("SELECT cv.competition FROM CompetitionVisit cv" +
            " WHERE cv.userId = :userId AND cv.competition.active = true" +
            " AND cv.competition.visibility = 'PRIVATE'" +
            " AND (cv.expiresAt IS NULL OR cv.expiresAt > CURRENT_TIMESTAMP)" +
            " AND (cv.inviteCodeVersion IS NULL OR cv.inviteCodeVersion = cv.competition.inviteCode)" +
            " ORDER BY cv.firstVisitedAt DESC")
    List<Competition> findVisitedPrivateCompetitions(@Param("userId") Long userId);
}
