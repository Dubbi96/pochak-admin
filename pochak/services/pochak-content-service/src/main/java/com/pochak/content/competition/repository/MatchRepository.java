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
            "AND (:sportId IS NULL OR m.sport.id = :sportId) " +
            "AND (:competitionId IS NULL OR m.competition.id = :competitionId) " +
            "AND m.startTime >= :dateFrom AND m.startTime < :dateTo " +
            "ORDER BY m.startTime ASC")
    List<Match> findScheduleMatches(
            @Param("sportId") Long sportId,
            @Param("competitionId") Long competitionId,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo);

    @Query("SELECT m FROM Match m WHERE m.active = true" +
            " AND (:competitionId IS NULL OR m.competition.id = :competitionId)" +
            " AND (:sportId IS NULL OR m.sport.id = :sportId)" +
            " AND (:venueId IS NULL OR m.venueId = :venueId)" +
            " AND (:status IS NULL OR m.status = :status)" +
            " AND (:isDisplayed IS NULL OR m.isDisplayed = :isDisplayed)" +
            " AND (:dateFrom IS NULL OR m.startTime >= :dateFrom)" +
            " AND (:dateTo IS NULL OR m.startTime <= :dateTo)" +
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
            " AND LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            " ORDER BY m.startTime DESC")
    List<Match> searchByTitle(@Param("keyword") String keyword, Pageable pageable);
}
