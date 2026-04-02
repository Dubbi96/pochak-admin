package com.pochak.content.schedule.service;

import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.entity.MatchParticipant;
import com.pochak.content.competition.repository.CompetitionRepository;
import com.pochak.content.competition.repository.MatchRepository;
import com.pochak.content.schedule.dto.MatchScheduleItem;
import com.pochak.content.schedule.dto.TodayCompetitionItem;
import com.pochak.content.sport.entity.Sport;
import com.pochak.content.team.entity.Team;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private CompetitionRepository competitionRepository;
    @Mock
    private MatchRepository matchRepository;
    @Mock
    private LiveAssetRepository liveAssetRepository;
    @Mock
    private VodAssetRepository vodAssetRepository;

    @InjectMocks
    private ScheduleService scheduleService;

    private Sport testSport;
    private Competition testCompetition;
    private Team homeTeam;
    private Team awayTeam;

    @BeforeEach
    void setUp() {
        testSport = Sport.builder()
                .id(1L)
                .name("축구")
                .code("SOCCER")
                .build();

        testCompetition = Competition.builder()
                .id(1L)
                .sport(testSport)
                .name("K리그 2026")
                .startDate(LocalDate.of(2026, 3, 1))
                .endDate(LocalDate.of(2026, 11, 30))
                .status(Competition.CompetitionStatus.ONGOING)
                .isDisplayed(true)
                .build();

        homeTeam = Team.builder()
                .id(1L)
                .sport(testSport)
                .name("FC Seoul")
                .shortName("SEO")
                .logoUrl("https://cdn.example.com/seoul.png")
                .build();

        awayTeam = Team.builder()
                .id(2L)
                .sport(testSport)
                .name("Suwon FC")
                .shortName("SUW")
                .logoUrl("https://cdn.example.com/suwon.png")
                .build();
    }

    @Test
    @DisplayName("Should return today competitions filtered by sport")
    void testGetTodayCompetitions() {
        // given
        given(competitionRepository.findActiveCompetitions(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .willReturn(List.of(testCompetition));

        // when
        List<TodayCompetitionItem> result = scheduleService.getTodayCompetitions(1L, null);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("K리그 2026");
        assertThat(result.get(0).getSportName()).isEqualTo("축구");
    }

    @Test
    @DisplayName("Should return matches grouped by date with hasLive/hasVod flags")
    void testGetMatchesByDate() {
        // given
        Match match1 = Match.builder()
                .id(1L)
                .competition(testCompetition)
                .sport(testSport)
                .title("FC Seoul vs Suwon FC")
                .startTime(LocalDateTime.of(2026, 3, 19, 19, 0))
                .status(Match.MatchStatus.LIVE)
                .venue("서울월드컵경기장")
                .participants(new ArrayList<>())
                .build();

        MatchParticipant hp = MatchParticipant.builder()
                .id(1L).match(match1).team(homeTeam).side(MatchParticipant.Side.HOME).build();
        MatchParticipant ap = MatchParticipant.builder()
                .id(2L).match(match1).team(awayTeam).side(MatchParticipant.Side.AWAY).build();
        match1.getParticipants().add(hp);
        match1.getParticipants().add(ap);

        Match match2 = Match.builder()
                .id(2L)
                .competition(testCompetition)
                .sport(testSport)
                .title("Another Match")
                .startTime(LocalDateTime.of(2026, 3, 20, 15, 0))
                .status(Match.MatchStatus.SCHEDULED)
                .participants(new ArrayList<>())
                .build();

        given(matchRepository.findScheduleMatches(eq(1L), isNull(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .willReturn(List.of(match1, match2));

        LiveAsset liveForMatch1 = LiveAsset.builder()
                .id(1L).match(match1).status(LiveAsset.LiveStatus.BROADCASTING).build();
        given(liveAssetRepository.findByMatchIdIn(anyCollection()))
                .willReturn(List.of(liveForMatch1));

        VodAsset vodForMatch1 = VodAsset.builder()
                .id(1L).match(match1).build();
        given(vodAssetRepository.findByMatchIdIn(anyCollection()))
                .willReturn(List.of(vodForMatch1));

        // when
        LinkedHashMap<LocalDate, List<MatchScheduleItem>> result =
                scheduleService.getMatchesByDate(1L, null, 3, null);

        // then
        assertThat(result).hasSize(2);
        assertThat(result).containsKey(LocalDate.of(2026, 3, 19));
        assertThat(result).containsKey(LocalDate.of(2026, 3, 20));

        List<MatchScheduleItem> day1 = result.get(LocalDate.of(2026, 3, 19));
        assertThat(day1).hasSize(1);
        assertThat(day1.get(0).getName()).isEqualTo("FC Seoul vs Suwon FC");
        assertThat(day1.get(0).getHasLive()).isTrue();
        assertThat(day1.get(0).getHasVod()).isTrue();
        assertThat(day1.get(0).getHomeTeam().getName()).isEqualTo("FC Seoul");
        assertThat(day1.get(0).getAwayTeam().getName()).isEqualTo("Suwon FC");

        List<MatchScheduleItem> day2 = result.get(LocalDate.of(2026, 3, 20));
        assertThat(day2).hasSize(1);
        assertThat(day2.get(0).getHasLive()).isFalse();
        assertThat(day2.get(0).getHasVod()).isFalse();
    }
}
