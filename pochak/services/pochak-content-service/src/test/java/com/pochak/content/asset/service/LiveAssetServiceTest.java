package com.pochak.content.asset.service;

import com.pochak.content.asset.dto.BulkVisibilityRequest;
import com.pochak.content.asset.dto.live.CreateLiveAssetRequest;
import com.pochak.content.asset.dto.live.LiveAssetDetailResponse;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.repository.MatchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class LiveAssetServiceTest {

    @Mock
    private LiveAssetRepository liveAssetRepository;

    @Mock
    private MatchRepository matchRepository;

    @InjectMocks
    private LiveAssetService liveAssetService;

    private Match testMatch;

    @BeforeEach
    void setUp() {
        Competition competition = Competition.builder()
                .id(1L)
                .name("Test Competition")
                .build();

        testMatch = Match.builder()
                .id(1L)
                .competition(competition)
                .title("Team A vs Team B")
                .startTime(LocalDateTime.of(2026, 3, 20, 15, 0))
                .build();
    }

    @Test
    @DisplayName("Should create a live asset successfully")
    void testCreateLive() {
        // given
        CreateLiveAssetRequest request = CreateLiveAssetRequest.builder()
                .matchId(1L)
                .cameraId(1L)
                .streamUrl("rtmp://stream.example.com/live1")
                .panoramaUrl("https://cdn.example.com/panorama1")
                .hdUrl("https://cdn.example.com/hd1")
                .thumbnailUrl("https://cdn.example.com/thumb1.jpg")
                .startTime(LocalDateTime.of(2026, 3, 20, 15, 0))
                .visibility(LiveAsset.Visibility.PUBLIC)
                .ownerType(LiveAsset.OwnerType.SYSTEM)
                .build();

        given(matchRepository.findById(1L)).willReturn(Optional.of(testMatch));

        LiveAsset savedEntity = LiveAsset.builder()
                .id(1L)
                .match(testMatch)
                .cameraId(1L)
                .streamUrl("rtmp://stream.example.com/live1")
                .panoramaUrl("https://cdn.example.com/panorama1")
                .hdUrl("https://cdn.example.com/hd1")
                .thumbnailUrl("https://cdn.example.com/thumb1.jpg")
                .startTime(LocalDateTime.of(2026, 3, 20, 15, 0))
                .visibility(LiveAsset.Visibility.PUBLIC)
                .ownerType(LiveAsset.OwnerType.SYSTEM)
                .status(LiveAsset.LiveStatus.SCHEDULED)
                .isDisplayed(true)
                .viewCount(0)
                .build();

        given(liveAssetRepository.save(any(LiveAsset.class))).willReturn(savedEntity);

        // when
        LiveAssetDetailResponse result = liveAssetService.create(request);

        // then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getMatchId()).isEqualTo(1L);
        assertThat(result.getCameraId()).isEqualTo(1L);
        assertThat(result.getStreamUrl()).isEqualTo("rtmp://stream.example.com/live1");
        assertThat(result.getVisibility()).isEqualTo(LiveAsset.Visibility.PUBLIC);
        assertThat(result.getStatus()).isEqualTo(LiveAsset.LiveStatus.SCHEDULED);
        assertThat(result.getIsDisplayed()).isTrue();
        verify(liveAssetRepository).save(any(LiveAsset.class));
    }

    @Test
    @DisplayName("Should bulk update visibility for live assets")
    void testBulkVisibility() {
        // given
        LiveAsset asset1 = LiveAsset.builder()
                .id(1L).match(testMatch)
                .startTime(LocalDateTime.now())
                .isDisplayed(true).build();
        LiveAsset asset2 = LiveAsset.builder()
                .id(2L).match(testMatch)
                .startTime(LocalDateTime.now())
                .isDisplayed(true).build();

        given(liveAssetRepository.findAllById(List.of(1L, 2L)))
                .willReturn(List.of(asset1, asset2));

        BulkVisibilityRequest request = BulkVisibilityRequest.builder()
                .ids(List.of(1L, 2L))
                .isDisplayed(false)
                .build();

        // when
        liveAssetService.bulkUpdateVisibility(request);

        // then
        assertThat(asset1.getIsDisplayed()).isFalse();
        assertThat(asset2.getIsDisplayed()).isFalse();
    }
}
