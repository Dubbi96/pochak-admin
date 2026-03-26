package com.pochak.content.competition.repository;

import com.pochak.content.competition.entity.CompetitionVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompetitionVisitRepository extends JpaRepository<CompetitionVisit, Long> {

    Optional<CompetitionVisit> findByUserIdAndCompetitionId(Long userId, Long competitionId);

    boolean existsByUserIdAndCompetitionId(Long userId, Long competitionId);

    /**
     * Check if a valid (non-expired, matching invite code version) visit exists.
     */
    @Query("SELECT CASE WHEN COUNT(cv) > 0 THEN true ELSE false END FROM CompetitionVisit cv" +
            " WHERE cv.userId = :userId AND cv.competition.id = :competitionId" +
            " AND (cv.expiresAt IS NULL OR cv.expiresAt > CURRENT_TIMESTAMP)" +
            " AND (cv.inviteCodeVersion IS NULL OR cv.inviteCodeVersion = cv.competition.inviteCode)")
    boolean existsValidVisit(@Param("userId") Long userId, @Param("competitionId") Long competitionId);
}
