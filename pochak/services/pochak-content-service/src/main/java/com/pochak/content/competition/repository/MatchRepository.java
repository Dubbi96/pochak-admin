package com.pochak.content.competition.repository;

import com.pochak.content.competition.entity.Match;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long>, JpaSpecificationExecutor<Match> {

    List<Match> findByCompetitionIdOrderByStartTimeAsc(Long competitionId);

    List<Match> findByStatusAndStartTimeBetween(Match.MatchStatus status, LocalDateTime start, LocalDateTime end);

    List<Match> findByStatusOrderByStartTimeAsc(Match.MatchStatus status);

    Optional<Match> findByIdAndActiveTrue(Long id);

    @Query("SELECT DISTINCT m FROM Match m LEFT JOIN FETCH m.competition LEFT JOIN FETCH m.participants p " +
            "LEFT JOIN FETCH p.team WHERE m.active = true AND m.isDisplayed = true " +
            "AND (CAST(:sportId AS long) IS NULL OR m.sport.id = :sportId) " +
            "AND (CAST(:competitionId AS long) IS NULL OR m.competition.id = :competitionId) " +
            "AND m.startTime >= :dateFrom AND m.startTime < :dateTo " +
            "ORDER BY m.startTime ASC")
    List<Match> findScheduleMatches(
            @Param("sportId") Long sportId,
            @Param("competitionId") Long competitionId,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo);

    @Query("SELECT m FROM Match m WHERE m.active = true" +
            " AND (CAST(:competitionId AS long) IS NULL OR m.competition.id = :competitionId)" +
            " AND (CAST(:sportId AS long) IS NULL OR m.sport.id = :sportId)" +
            " AND (CAST(:venueId AS long) IS NULL OR m.venueId = :venueId)" +
            " AND (CAST(:status AS string) IS NULL OR m.status = :status)" +
            " AND (CAST(:isDisplayed AS boolean) IS NULL OR m.isDisplayed = :isDisplayed)" +
            " AND (CAST(:dateFrom AS timestamp) IS NULL OR m.startTime >= :dateFrom)" +
            " AND (CAST(:dateTo AS timestamp) IS NULL OR m.startTime <= :dateTo)" +
            " ORDER BY m.startTime DESC")
    Page<Match> findWithFilters(
            @Param("competitionId") Long competitionId,
            @Param("sportId") Long sportId,
            @Param("venueId") Long venueId,
            @Param("status") Match.MatchStatus status,
            @Param("isDisplayed") Boolean isDisplayed,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable);

    @Query("SELECT m FROM Match m WHERE m.active = true AND m.isDisplayed = true" +
            " AND LOWER(CAST(m.title AS string)) LIKE LOWER(CAST(CONCAT('%', :keyword, '%') AS string))" +
            " ORDER BY m.startTime DESC")
    List<Match> searchByTitle(@Param("keyword") String keyword, Pageable pageable);
}
