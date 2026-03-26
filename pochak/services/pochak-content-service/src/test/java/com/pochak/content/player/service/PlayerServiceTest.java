package com.pochak.content.player.service;

import com.pochak.content.asset.entity.AssetTag;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.AssetTagRepository;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.player.dto.PlayerDetailResponse;
import com.pochak.content.sport.entity.Sport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class PlayerServiceTest {

    @Mock
    private LiveAssetRepository liveAssetRepository;
    @Mock
    private VodAssetRepository vodAssetRepository;
    @Mock
    private ClipAssetRepository clipAssetRepository;
    @Mock
    private AssetTagRepository assetTagRepository;

    @InjectMocks
    private PlayerService playerService;

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
                .build();

        testMatch = Match.builder()
                .id(1L)
                .competition(testCompetition)
                .sport(testSport)
                .title("FC Seoul vs Suwon FC")
                .startTime(LocalDateTime.of(2026, 3, 19, 19, 0))
                .build();
    }

    @Test
    @DisplayName("Should return live player detail with related content")
    void testGetLivePlayerDetail() {
        // given
        LiveAsset liveAsset = LiveAsset.builder()
                .id(1L)
                .match(testMatch)
                .status(LiveAsset.LiveStatus.BROADCASTING)
                .streamUrl("rtmp://stream.example.com/live1")
                .thumbnailUrl("https://cdn.example.com/thumb.jpg")
                .startTime(LocalDateTime.of(2026, 3, 19, 19, 0))
                .viewCount(3000)
                .build();

        AssetTag tag1 = AssetTag.builder()
                .id(1L).assetType("LIVE").assetId(1L).tagName("골")
                .taggerUserId(1L).tagTimeSec(100).build();
        AssetTag tag2 = AssetTag.builder()
                .id(2L).assetType("LIVE").assetId(1L).tagName("FC Seoul")
                .taggerUserId(1L).tagTimeSec(200).build();

        given(liveAssetRepository.findByIdAndDeletedAtIsNull(1L))
                .willReturn(Optional.of(liveAsset));
        given(assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("LIVE", 1L))
                .willReturn(List.of(tag1, tag2));
        given(liveAssetRepository.findLiveByCompetitionId(eq(1L), any(Pageable.class)))
                .willReturn(List.of());
        given(clipAssetRepository.findByMatchIdAndDeletedAtIsNull(eq(1L), any(Pageable.class)))
                .willReturn(List.of());
        given(clipAssetRepository.findByTagNames(anyCollection(), any(Pageable.class)))
                .willReturn(List.of());
        given(vodAssetRepository.findByTagNames(anyCollection(), any(Pageable.class)))
                .willReturn(List.of());
        given(clipAssetRepository.findPopularClips(any(Pageable.class)))
                .willReturn(List.of());

        // when
        PlayerDetailResponse response = playerService.getLivePlayerDetail(1L);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getAsset()).isNotNull();
        assertThat(response.getAsset().get("type")).isEqualTo("LIVE");
        assertThat(response.getMatchInfo()).isNotNull();
        assertThat(response.getMatchInfo().getCompetitionName()).isEqualTo("K리그 2026");
        assertThat(response.getTags()).containsExactly("골", "FC Seoul");
    }

    @Test
    @DisplayName("Should return VOD player detail")
    void testGetVodPlayerDetail() {
        // given
        VodAsset vodAsset = VodAsset.builder()
                .id(1L)
                .match(testMatch)
                .title("FC Seoul vs Suwon FC Highlights")
                .vodUrl("https://cdn.example.com/vod1.mp4")
                .thumbnailUrl("https://cdn.example.com/vod-thumb.jpg")
                .duration(600)
                .viewCount(8000)
                .build();

        given(vodAssetRepository.findByIdAndDeletedAtIsNull(1L))
                .willReturn(Optional.of(vodAsset));
        given(assetTagRepository.findByAssetTypeAndAssetIdOrderByTagTimeSecAsc("VOD", 1L))
                .willReturn(List.of());
        given(liveAssetRepository.findLiveByCompetitionId(eq(1L), any(Pageable.class)))
                .willReturn(List.of());
        given(clipAssetRepository.findByMatchIdAndDeletedAtIsNull(eq(1L), any(Pageable.class)))
                .willReturn(List.of());
        given(clipAssetRepository.findPopularClips(any(Pageable.class)))
                .willReturn(List.of());

        // when
        PlayerDetailResponse response = playerService.getVodPlayerDetail(1L);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getAsset()).isNotNull();
        assertThat(response.getAsset().get("type")).isEqualTo("VOD");
        assertThat(response.getAsset().get("title")).isEqualTo("FC Seoul vs Suwon FC Highlights");
        assertThat(response.getAsset().get("duration")).isEqualTo(600);
        assertThat(response.getMatchInfo()).isNotNull();
        assertThat(response.getMatchInfo().getMatchName()).isEqualTo("FC Seoul vs Suwon FC");
    }
}
