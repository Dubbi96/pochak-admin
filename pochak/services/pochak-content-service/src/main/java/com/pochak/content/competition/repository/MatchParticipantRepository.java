package com.pochak.content.competition.repository;

import com.pochak.content.competition.entity.MatchParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {

    List<MatchParticipant> findByMatchId(Long matchId);

    Optional<MatchParticipant> findByMatchIdAndSide(Long matchId, MatchParticipant.Side side);

    void deleteByMatchId(Long matchId);
}
