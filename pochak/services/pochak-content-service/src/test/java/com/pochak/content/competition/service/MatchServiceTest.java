package com.pochak.content.competition.service;

import com.pochak.common.exception.BusinessException;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private MatchParticipantRepository matchParticipantRepository;

    @Mock
    private CompetitionRepository competitionRepository;

    @Mock
    private SportRepository sportRepository;

    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private MatchService matchService;

    private Sport testSport;
    private Competition testCompetition;
    private Team homeTeam;
    private Team awayTeam;
    private Match testMatch;

    @BeforeEach
    void setUp() {
        testSport = Sport.builder()
                .id(1L)
                .name("Football")
                .nameEn("Football")
                .code("SOCCER")
                .active(true)
                .displayOrder(1)
                .tags(new ArrayList<>())
                .build();

        testCompetition = Competition.builder()
                .id(1L)
                .name("K League 2025")
                .sport(testSport)
                .status(Competition.CompetitionStatus.SCHEDULED)
                .active(true)
                .build();

        homeTeam = Team.builder()
                .id(1L)
                .name("Seoul FC")
                .shortName("SEO")
                .sport(testSport)
                .active(true)
                .build();

        awayTeam = Team.builder()
                .id(2L)
                .name("Busan United")
                .shortName("BUS")
                .sport(testSport)
                .active(true)
                .build();

        testMatch = Match.builder()
                .id(1L)
                .competition(testCompetition)
                .sport(testSport)
                .title("Seoul FC vs Busan United")
                .startTime(LocalDateTime.of(2025, 4, 1, 19, 0))
                .endTime(LocalDateTime.of(2025, 4, 1, 21, 0))
                .status(Match.MatchStatus.SCHEDULED)
                .isPanorama(false)
                .isScoreboard(true)
                .isDisplayed(true)
                .active(true)
                .participants(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should list matches with pagination")
    void testListMatches() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<Match> page = new PageImpl<>(List.of(testMatch), pageable, 1);
        given(matchRepository.findWithFilters(
                isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), eq(pageable)))
                .willReturn(page);

        // when
        Page<MatchListResponse> result = matchService.listMatches(
                null, null, null, null, null, null, null, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Seoul FC vs Busan United");
        assertThat(result.getContent().get(0).getCompetitionName()).isEqualTo("K League 2025");
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should create a match with home and away teams")
    void testCreateMatch() {
        // given
        CreateMatchRequest request = CreateMatchRequest.builder()
                .competitionId(1L)
                .sportId(1L)
                .name("Seoul FC vs Busan United")
                .startTime(LocalDateTime.of(2025, 4, 1, 19, 0))
                .endTime(LocalDateTime.of(2025, 4, 1, 21, 0))
                .homeTeamId(1L)
                .awayTeamId(2L)
                .isPanorama(false)
                .isScoreboard(true)
                .build();

        given(competitionRepository.findById(1L)).willReturn(Optional.of(testCompetition));
        given(sportRepository.findById(1L)).willReturn(Optional.of(testSport));
        given(teamRepository.findById(1L)).willReturn(Optional.of(homeTeam));
        given(teamRepository.findById(2L)).willReturn(Optional.of(awayTeam));
        given(matchRepository.save(any(Match.class))).willReturn(testMatch);
        given(matchParticipantRepository.save(any(MatchParticipant.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        MatchParticipant homeParticipant = MatchParticipant.builder()
                .id(1L).match(testMatch).team(homeTeam).side(MatchParticipant.Side.HOME).build();
        MatchParticipant awayParticipant = MatchParticipant.builder()
                .id(2L).match(testMatch).team(awayTeam).side(MatchParticipant.Side.AWAY).build();
        given(matchParticipantRepository.findByMatchId(1L))
                .willReturn(List.of(homeParticipant, awayParticipant));

        // when
        MatchDetailResponse result = matchService.createMatch(request);

        // then
        assertThat(result.getTitle()).isEqualTo("Seoul FC vs Busan United");
        assertThat(result.getHomeTeam()).isNotNull();
        assertThat(result.getHomeTeam().getTeamName()).isEqualTo("Seoul FC");
        assertThat(result.getAwayTeam()).isNotNull();
        assertThat(result.getAwayTeam().getTeamName()).isEqualTo("Busan United");
    }

    @Test
    @DisplayName("Should change match status following valid transition")
    void testChangeStatus() {
        // given
        given(matchRepository.findByIdAndActiveTrue(1L)).willReturn(Optional.of(testMatch));
        given(matchParticipantRepository.findByMatchId(1L)).willReturn(Collections.emptyList());

        ChangeMatchStatusRequest request = ChangeMatchStatusRequest.builder()
                .status("LIVE")
                .build();

        // when
        MatchDetailResponse result = matchService.changeMatchStatus(1L, request);

        // then
        assertThat(result.getStatus()).isEqualTo("LIVE");
    }

    @Test
    @DisplayName("Should reject invalid status transition")
    void testChangeStatus_invalidTransition() {
        // given
        Match completedMatch = Match.builder()
                .id(2L)
                .competition(testCompetition)
                .sport(testSport)
                .title("Completed Match")
                .startTime(LocalDateTime.of(2025, 3, 1, 19, 0))
                .status(Match.MatchStatus.CANCELLED)
                .active(true)
                .participants(new ArrayList<>())
                .build();

        given(matchRepository.findByIdAndActiveTrue(2L)).willReturn(Optional.of(completedMatch));

        ChangeMatchStatusRequest request = ChangeMatchStatusRequest.builder()
                .status("LIVE")
                .build();

        // when & then
        assertThatThrownBy(() -> matchService.changeMatchStatus(2L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid status transition");
    }

    @Test
    @DisplayName("Should filter matches by date range")
    void testFilterByDateRange() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        LocalDateTime dateFrom = LocalDateTime.of(2025, 4, 1, 0, 0);
        LocalDateTime dateTo = LocalDateTime.of(2025, 4, 30, 23, 59);

        Page<Match> page = new PageImpl<>(List.of(testMatch), pageable, 1);
        given(matchRepository.findWithFilters(
                isNull(), isNull(), isNull(), isNull(), isNull(), eq(dateFrom), eq(dateTo), eq(pageable)))
                .willReturn(page);

        // when
        Page<MatchListResponse> result = matchService.listMatches(
                null, null, null, null, null, dateFrom, dateTo, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getStartTime()).isEqualTo(LocalDateTime.of(2025, 4, 1, 19, 0));
    }

    @Test
    @DisplayName("Should soft delete a match")
    void testDeleteMatch() {
        // given
        given(matchRepository.findByIdAndActiveTrue(1L)).willReturn(Optional.of(testMatch));

        // when
        matchService.deleteMatch(1L);

        // then
        assertThat(testMatch.getActive()).isFalse();
    }
}
