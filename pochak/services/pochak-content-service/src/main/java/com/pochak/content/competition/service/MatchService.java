package com.pochak.content.competition.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.competition.dto.*;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.entity.MatchParticipant;
import com.pochak.content.competition.repository.CompetitionRepository;
import com.pochak.content.competition.repository.MatchParticipantRepository;
import com.pochak.content.competition.repository.MatchRepository;
import com.pochak.content.sport.entity.Sport;
import com.pochak.content.sport.repository.SportRepository;
import com.pochak.content.team.entity.Team;
import com.pochak.content.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchService {

    private final MatchRepository matchRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final CompetitionRepository competitionRepository;
    private final SportRepository sportRepository;
    private final TeamRepository teamRepository;

    public Page<MatchListResponse> listMatches(Long competitionId,
                                               Long sportId,
                                               Long venueId,
                                               Match.MatchStatus status,
                                               Boolean isDisplayed,
                                               LocalDateTime dateFrom,
                                               LocalDateTime dateTo,
                                               Pageable pageable) {
        Page<Match> page = matchRepository.findWithFilters(
                competitionId, sportId, venueId, status, isDisplayed, dateFrom, dateTo, pageable);
        return page.map(MatchListResponse::from);
    }

    public MatchDetailResponse getMatchDetail(Long id) {
        Match match = findActiveMatch(id);
        List<MatchParticipant> participants = matchParticipantRepository.findByMatchId(id);
        return MatchDetailResponse.from(match, participants);
    }

    @Transactional
    public MatchDetailResponse createMatch(CreateMatchRequest request) {
        Competition competition = competitionRepository.findById(request.getCompetitionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Competition not found: " + request.getCompetitionId()));

        Sport sport = null;
        if (request.getSportId() != null) {
            sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sport not found: " + request.getSportId()));
        }

        Match match = Match.builder()
                .competition(competition)
                .sport(sport)
                .title(request.getName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .venueId(request.getVenueId())
                .isPanorama(request.getIsPanorama() != null ? request.getIsPanorama() : false)
                .isScoreboard(request.getIsScoreboard() != null ? request.getIsScoreboard() : false)
                .isDisplayed(request.getIsDisplayed() != null ? request.getIsDisplayed() : true)
                .build();

        Match saved = matchRepository.save(match);

        // Create home team participant
        if (request.getHomeTeamId() != null) {
            Team homeTeam = teamRepository.findById(request.getHomeTeamId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Home team not found: " + request.getHomeTeamId()));
            MatchParticipant homeParticipant = MatchParticipant.builder()
                    .match(saved)
                    .team(homeTeam)
                    .side(MatchParticipant.Side.HOME)
                    .build();
            matchParticipantRepository.save(homeParticipant);
        }

        // Create away team participant
        if (request.getAwayTeamId() != null) {
            Team awayTeam = teamRepository.findById(request.getAwayTeamId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Away team not found: " + request.getAwayTeamId()));
            MatchParticipant awayParticipant = MatchParticipant.builder()
                    .match(saved)
                    .team(awayTeam)
                    .side(MatchParticipant.Side.AWAY)
                    .build();
            matchParticipantRepository.save(awayParticipant);
        }

        List<MatchParticipant> participants = matchParticipantRepository.findByMatchId(saved.getId());
        return MatchDetailResponse.from(saved, participants);
    }

    @Transactional
    public MatchDetailResponse updateMatch(Long id, UpdateMatchRequest request) {
        Match match = findActiveMatch(id);

        Competition competition = null;
        if (request.getCompetitionId() != null && !request.getCompetitionId().equals(match.getCompetition().getId())) {
            competition = competitionRepository.findById(request.getCompetitionId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Competition not found: " + request.getCompetitionId()));
        }

        Sport sport = null;
        if (request.getSportId() != null) {
            sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sport not found: " + request.getSportId()));
        }

        match.update(
                request.getName(),
                competition,
                sport,
                request.getVenueId(),
                request.getStartTime(),
                request.getEndTime(),
                request.getIsPanorama(),
                request.getIsScoreboard(),
                request.getIsDisplayed()
        );

        // Update participants if team IDs provided
        if (request.getHomeTeamId() != null) {
            updateParticipant(match, request.getHomeTeamId(), MatchParticipant.Side.HOME);
        }
        if (request.getAwayTeamId() != null) {
            updateParticipant(match, request.getAwayTeamId(), MatchParticipant.Side.AWAY);
        }

        List<MatchParticipant> participants = matchParticipantRepository.findByMatchId(id);
        return MatchDetailResponse.from(match, participants);
    }

    @Transactional
    public MatchDetailResponse changeMatchStatus(Long id, ChangeMatchStatusRequest request) {
        Match match = findActiveMatch(id);

        Match.MatchStatus newStatus;
        try {
            newStatus = Match.MatchStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid match status: " + request.getStatus());
        }

        validateStatusTransition(match.getStatus(), newStatus);
        match.changeStatus(newStatus);

        List<MatchParticipant> participants = matchParticipantRepository.findByMatchId(id);
        return MatchDetailResponse.from(match, participants);
    }

    @Transactional
    public void deleteMatch(Long id) {
        Match match = findActiveMatch(id);
        match.softDelete();
    }

    private Match findActiveMatch(Long id) {
        return matchRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Match not found: " + id));
    }

    private void updateParticipant(Match match, Long teamId, MatchParticipant.Side side) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Team not found: " + teamId));

        MatchParticipant existing = matchParticipantRepository
                .findByMatchIdAndSide(match.getId(), side)
                .orElse(null);

        if (existing != null) {
            matchParticipantRepository.delete(existing);
        }

        MatchParticipant participant = MatchParticipant.builder()
                .match(match)
                .team(team)
                .side(side)
                .build();
        matchParticipantRepository.save(participant);
    }

    /**
     * Match status flow:
     * SCHEDULED -> LIVE -> COMPLETED -> CLOSED
     * SCHEDULED -> CANCELLED
     */
    private void validateStatusTransition(Match.MatchStatus current, Match.MatchStatus target) {
        boolean valid = switch (current) {
            case SCHEDULED -> target == Match.MatchStatus.LIVE || target == Match.MatchStatus.CANCELLED;
            case LIVE -> target == Match.MatchStatus.COMPLETED || target == Match.MatchStatus.CANCELLED;
            case COMPLETED -> target == Match.MatchStatus.CLOSED;
            case CANCELLED, CLOSED -> false;
        };

        if (!valid) {
            throw new BusinessException(ErrorCode.INVALID_INPUT,
                    "Invalid status transition: " + current + " -> " + target);
        }
    }
}
