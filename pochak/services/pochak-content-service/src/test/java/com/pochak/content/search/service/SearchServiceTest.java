package com.pochak.content.search.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.competition.repository.CompetitionRepository;
import com.pochak.content.competition.repository.MatchRepository;
import com.pochak.content.organization.repository.OrganizationRepository;
import com.pochak.content.search.dto.SearchSection;
import com.pochak.content.search.dto.UnifiedSearchResponse;
import com.pochak.content.sport.entity.Sport;
import com.pochak.content.team.entity.Team;
import com.pochak.content.team.repository.TeamRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private LiveAssetRepository liveAssetRepository;

    @Mock
    private VodAssetRepository vodAssetRepository;

    @Mock
    private ClipAssetRepository clipAssetRepository;

    @Mock
    private CompetitionRepository competitionRepository;

    @Mock
    private MatchRepository matchRepository;

    @InjectMocks
    private SearchService searchService;

    @Test
    @DisplayName("Should perform unified search and return sections in order")
    void testUnifiedSearch() {
        // given
        Sport sport = Sport.builder().id(1L).name("Football").code("FOOTBALL").build();
        Team team = Team.builder()
                .id(10L)
                .sport(sport)
                .name("Hong Min FC")
                .shortName("HMF")
                .active(true)
                .build();

        given(teamRepository.searchByName(eq("홍민"), any(Pageable.class)))
                .willReturn(List.of(team));
        given(organizationRepository.searchByName(eq("홍민"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(liveAssetRepository.searchByTitle(eq("홍민"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(matchRepository.searchByTitle(eq("홍민"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(competitionRepository.searchByName(eq("홍민"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(vodAssetRepository.searchByTitle(eq("홍민"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(clipAssetRepository.searchByTitle(eq("홍민"), any(Pageable.class)))
                .willReturn(Collections.emptyList());

        // when
        UnifiedSearchResponse result = searchService.search("홍민", null);

        // then
        assertThat(result.getQuery()).isEqualTo("홍민");
        assertThat(result.getSections()).hasSize(1);
        assertThat(result.getSections().get(0).getType()).isEqualTo(SearchSection.SearchType.TEAM);
        assertThat(result.getSections().get(0).getLayout()).isEqualTo(SearchSection.LayoutType.HORIZONTAL);
        assertThat(result.getSections().get(0).getItems()).hasSize(1);
        assertThat(result.getSections().get(0).getItems().get(0).getTitle()).isEqualTo("Hong Min FC");
        assertThat(result.getRecommendations()).isNull();
    }

    @Test
    @DisplayName("Should show recommendations when no results found")
    void testSearchNoResults_showRecommendations() {
        // given
        given(teamRepository.searchByName(eq("없는검색어"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(organizationRepository.searchByName(eq("없는검색어"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(liveAssetRepository.searchByTitle(eq("없는검색어"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(matchRepository.searchByTitle(eq("없는검색어"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(competitionRepository.searchByName(eq("없는검색어"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(vodAssetRepository.searchByTitle(eq("없는검색어"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(clipAssetRepository.searchByTitle(eq("없는검색어"), any(Pageable.class)))
                .willReturn(Collections.emptyList());

        // Recommendations
        ClipAsset recommendedClip = ClipAsset.builder()
                .id(1L)
                .title("Popular Clip")
                .sourceType(ClipAsset.SourceType.VOD)
                .sourceId(1L)
                .creatorUserId(1L)
                .startTimeSec(0)
                .endTimeSec(30)
                .duration(30)
                .thumbnailUrl("https://example.com/clip.jpg")
                .viewCount(1000)
                .build();
        VodAsset recommendedVod = VodAsset.builder()
                .id(2L)
                .title("Popular VOD")
                .vodUrl("https://example.com/vod.mp4")
                .thumbnailUrl("https://example.com/vod.jpg")
                .viewCount(2000)
                .build();

        given(clipAssetRepository.findPopularClips(any(Pageable.class)))
                .willReturn(List.of(recommendedClip));
        given(vodAssetRepository.findPopularVods(any(Pageable.class)))
                .willReturn(List.of(recommendedVod));

        // when
        UnifiedSearchResponse result = searchService.search("없는검색어", null);

        // then
        assertThat(result.getQuery()).isEqualTo("없는검색어");
        assertThat(result.getSections()).isEmpty();
        assertThat(result.getRecommendations()).isNotNull();
        assertThat(result.getRecommendations().getClips()).hasSize(1);
        assertThat(result.getRecommendations().getClips().get(0).getTitle()).isEqualTo("Popular Clip");
        assertThat(result.getRecommendations().getVods()).hasSize(1);
        assertThat(result.getRecommendations().getVods().get(0).getTitle()).isEqualTo("Popular VOD");
    }

    @Test
    @DisplayName("Should reject empty search query")
    void testSearch_emptyQuery() {
        assertThatThrownBy(() -> searchService.search("", null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("must not be empty");
    }

    @Test
    @DisplayName("Should truncate query to 25 chars max")
    void testSearch_longQuery() {
        // given
        String longQuery = "abcdefghijklmnopqrstuvwxyz1234567890";
        given(teamRepository.searchByName(eq("abcdefghijklmnopqrstuvwxy"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(organizationRepository.searchByName(eq("abcdefghijklmnopqrstuvwxy"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(liveAssetRepository.searchByTitle(eq("abcdefghijklmnopqrstuvwxy"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(matchRepository.searchByTitle(eq("abcdefghijklmnopqrstuvwxy"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(competitionRepository.searchByName(eq("abcdefghijklmnopqrstuvwxy"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(vodAssetRepository.searchByTitle(eq("abcdefghijklmnopqrstuvwxy"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(clipAssetRepository.searchByTitle(eq("abcdefghijklmnopqrstuvwxy"), any(Pageable.class)))
                .willReturn(Collections.emptyList());
        given(clipAssetRepository.findPopularClips(any(Pageable.class))).willReturn(Collections.emptyList());
        given(vodAssetRepository.findPopularVods(any(Pageable.class))).willReturn(Collections.emptyList());

        // when
        UnifiedSearchResponse result = searchService.search(longQuery, null);

        // then
        assertThat(result.getQuery()).hasSize(25);
    }
}
