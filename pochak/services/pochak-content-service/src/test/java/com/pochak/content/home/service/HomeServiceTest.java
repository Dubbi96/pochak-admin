package com.pochak.content.home.service;

import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.repository.CompetitionRepository;
import com.pochak.content.display.entity.DisplaySection;
import com.pochak.content.display.repository.DisplaySectionRepository;
import com.pochak.content.home.dto.HomeResponse;
import com.pochak.content.sport.entity.Sport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class HomeServiceTest {

    @Mock
    private LiveAssetRepository liveAssetRepository;
    @Mock
    private VodAssetRepository vodAssetRepository;
    @Mock
    private ClipAssetRepository clipAssetRepository;
    @Mock
    private CompetitionRepository competitionRepository;
    @Mock
    private DisplaySectionRepository displaySectionRepository;

    @InjectMocks
    private HomeService homeService;

    private Sport testSport;
    private Competition testCompetition;
    private Match testMatch;

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

        testMatch = Match.builder()
                .id(1L)
                .competition(testCompetition)
                .sport(testSport)
                .title("Team A vs Team B")
                .startTime(LocalDateTime.of(2026, 3, 19, 19, 0))
                .build();
    }

    @Test
    @DisplayName("Should return home response with live content")
    void testGetHome_withLiveContent() {
        // given
        LiveAsset liveAsset = LiveAsset.builder()
                .id(1L)
                .match(testMatch)
                .status(LiveAsset.LiveStatus.BROADCASTING)
                .thumbnailUrl("https://cdn.example.com/thumb.jpg")
                .startTime(LocalDateTime.of(2026, 3, 19, 19, 0))
                .viewCount(1500)
                .isDisplayed(true)
                .build();

        VodAsset vodAsset = VodAsset.builder()
                .id(1L)
                .match(testMatch)
                .title("Highlights")
                .vodUrl("https://cdn.example.com/vod1.mp4")
                .thumbnailUrl("https://cdn.example.com/vod-thumb.jpg")
                .duration(300)
                .viewCount(5000)
                .isDisplayed(true)
                .build();

        ClipAsset clipAsset = ClipAsset.builder()
                .id(1L)
                .match(testMatch)
                .title("Goal!")
                .sourceType(ClipAsset.SourceType.LIVE)
                .sourceId(1L)
                .creatorUserId(1L)
                .thumbnailUrl("https://cdn.example.com/clip-thumb.jpg")
                .startTimeSec(100)
                .endTimeSec(130)
                .duration(30)
                .viewCount(10000)
                .isDisplayed(true)
                .build();

        given(displaySectionRepository.findByActiveTrueAndTargetPageOrderByDisplayOrderAsc("HOME"))
                .willReturn(List.of());
        given(liveAssetRepository.findByStatusWithMatchDetails(LiveAsset.LiveStatus.BROADCASTING))
                .willReturn(List.of(liveAsset));
        given(competitionRepository.findAllActiveDisplayed())
                .willReturn(List.of(testCompetition));
        given(clipAssetRepository.findPopularClips(any(Pageable.class)))
                .willReturn(List.of(clipAsset));
        given(vodAssetRepository.findRecentVods(any(Pageable.class)))
                .willReturn(List.of(vodAsset));
        given(vodAssetRepository.findPopularVods(any(Pageable.class)))
                .willReturn(List.of(vodAsset));

        // when
        HomeResponse response = homeService.getHome();

        // then
        assertThat(response).isNotNull();
        assertThat(response.getLiveContents()).hasSize(1);
        assertThat(response.getLiveContents().get(0).getBadge()).isEqualTo("LIVE");
        assertThat(response.getCompetitionBanners()).hasSize(1);
        assertThat(response.getCompetitionBanners().get(0).getName()).isEqualTo("K리그 2026");
        assertThat(response.getContentSections()).isNotEmpty();
    }

    @Test
    @DisplayName("Should return home response with no live content")
    void testGetHome_noLive() {
        // given
        given(displaySectionRepository.findByActiveTrueAndTargetPageOrderByDisplayOrderAsc("HOME"))
                .willReturn(List.of());
        given(liveAssetRepository.findByStatusWithMatchDetails(LiveAsset.LiveStatus.BROADCASTING))
                .willReturn(List.of());
        given(competitionRepository.findAllActiveDisplayed())
                .willReturn(List.of());
        given(clipAssetRepository.findPopularClips(any(Pageable.class)))
                .willReturn(List.of());
        given(vodAssetRepository.findRecentVods(any(Pageable.class)))
                .willReturn(List.of());
        given(vodAssetRepository.findPopularVods(any(Pageable.class)))
                .willReturn(List.of());

        // when
        HomeResponse response = homeService.getHome();

        // then
        assertThat(response).isNotNull();
        assertThat(response.getLiveContents()).isEmpty();
        assertThat(response.getCompetitionBanners()).isEmpty();
        assertThat(response.getMainBanners()).isEmpty();
        assertThat(response.getContentSections()).isNotEmpty(); // default sections still present
    }
}
