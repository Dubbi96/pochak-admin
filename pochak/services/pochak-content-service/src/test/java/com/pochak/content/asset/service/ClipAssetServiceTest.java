package com.pochak.content.asset.service;

import com.pochak.content.asset.dto.clip.ClipAssetDetailResponse;
import com.pochak.content.asset.dto.clip.CreateClipAssetRequest;
import com.pochak.content.asset.entity.ClipAsset;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.ClipAssetRepository;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ClipAssetServiceTest {

    @Mock
    private ClipAssetRepository clipAssetRepository;

    @Mock
    private MatchRepository matchRepository;

    @InjectMocks
    private ClipAssetService clipAssetService;

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
    @DisplayName("Should create a clip asset successfully")
    void testCreateClip() {
        // given
        CreateClipAssetRequest request = CreateClipAssetRequest.builder()
                .sourceType(ClipAsset.SourceType.LIVE)
                .sourceId(10L)
                .matchId(1L)
                .creatorUserId(100L)
                .title("Amazing Goal")
                .startTimeSec(1200)
                .endTimeSec(1230)
                .visibility(LiveAsset.Visibility.PUBLIC)
                .build();

        given(matchRepository.findById(1L)).willReturn(Optional.of(testMatch));

        ClipAsset savedEntity = ClipAsset.builder()
                .id(1L)
                .sourceType(ClipAsset.SourceType.LIVE)
                .sourceId(10L)
                .match(testMatch)
                .creatorUserId(100L)
                .title("Amazing Goal")
                .startTimeSec(1200)
                .endTimeSec(1230)
                .duration(30)
                .encodingStatus(VodAsset.EncodingStatus.PENDING)
                .visibility(LiveAsset.Visibility.PUBLIC)
                .isDisplayed(true)
                .viewCount(0)
                .build();

        given(clipAssetRepository.save(any(ClipAsset.class))).willReturn(savedEntity);

        // when
        ClipAssetDetailResponse result = clipAssetService.create(request);

        // then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getSourceType()).isEqualTo(ClipAsset.SourceType.LIVE);
        assertThat(result.getSourceId()).isEqualTo(10L);
        assertThat(result.getTitle()).isEqualTo("Amazing Goal");
        assertThat(result.getStartTimeSec()).isEqualTo(1200);
        assertThat(result.getEndTimeSec()).isEqualTo(1230);
        assertThat(result.getVisibility()).isEqualTo(LiveAsset.Visibility.PUBLIC);
        assertThat(result.getEncodingStatus()).isEqualTo(VodAsset.EncodingStatus.PENDING);
        verify(clipAssetRepository).save(any(ClipAsset.class));
    }
}
