package com.pochak.content.asset.service;

import com.pochak.content.asset.dto.vod.CreateVodAssetRequest;
import com.pochak.content.asset.dto.vod.VodAssetDetailResponse;
import com.pochak.content.asset.dto.vod.VodAssetListResponse;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class VodAssetServiceTest {

    @Mock
    private VodAssetRepository vodAssetRepository;

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private LiveAssetRepository liveAssetRepository;

    @InjectMocks
    private VodAssetService vodAssetService;

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
    @DisplayName("Should create a VOD asset successfully")
    void testCreateVod() {
        // given
        CreateVodAssetRequest request = CreateVodAssetRequest.builder()
                .matchId(1L)
                .title("Highlights - Team A vs Team B")
                .vodUrl("https://cdn.example.com/vod/highlight1.mp4")
                .thumbnailUrl("https://cdn.example.com/thumb/vod1.jpg")
                .duration(3600)
                .visibility(LiveAsset.Visibility.PUBLIC)
                .ownerType(LiveAsset.OwnerType.SYSTEM)
                .build();

        given(matchRepository.findById(1L)).willReturn(Optional.of(testMatch));

        VodAsset savedEntity = VodAsset.builder()
                .id(1L)
                .match(testMatch)
                .title("Highlights - Team A vs Team B")
                .vodUrl("https://cdn.example.com/vod/highlight1.mp4")
                .thumbnailUrl("https://cdn.example.com/thumb/vod1.jpg")
                .duration(3600)
                .encodingStatus(VodAsset.EncodingStatus.PENDING)
                .visibility(LiveAsset.Visibility.PUBLIC)
                .ownerType(LiveAsset.OwnerType.SYSTEM)
                .isDisplayed(true)
                .viewCount(0)
                .build();

        given(vodAssetRepository.save(any(VodAsset.class))).willReturn(savedEntity);

        // when
        VodAssetDetailResponse result = vodAssetService.create(request);

        // then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Highlights - Team A vs Team B");
        assertThat(result.getEncodingStatus()).isEqualTo(VodAsset.EncodingStatus.PENDING);
        assertThat(result.getVisibility()).isEqualTo(LiveAsset.Visibility.PUBLIC);
        assertThat(result.getIsDisplayed()).isTrue();
        verify(vodAssetRepository).save(any(VodAsset.class));
    }

    @Test
    @DisplayName("Should list VOD assets with filters")
    void testListWithFilters() {
        // given
        Pageable pageable = PageRequest.of(0, 20);

        VodAsset vod1 = VodAsset.builder()
                .id(1L).match(testMatch).title("VOD 1")
                .vodUrl("https://cdn.example.com/vod1.mp4")
                .visibility(LiveAsset.Visibility.PUBLIC)
                .ownerType(LiveAsset.OwnerType.SYSTEM)
                .encodingStatus(VodAsset.EncodingStatus.COMPLETED)
                .isDisplayed(true).viewCount(100)
                .build();
        VodAsset vod2 = VodAsset.builder()
                .id(2L).match(testMatch).title("VOD 2")
                .vodUrl("https://cdn.example.com/vod2.mp4")
                .visibility(LiveAsset.Visibility.PUBLIC)
                .ownerType(LiveAsset.OwnerType.SYSTEM)
                .encodingStatus(VodAsset.EncodingStatus.PENDING)
                .isDisplayed(true).viewCount(50)
                .build();

        Page<VodAsset> page = new PageImpl<>(List.of(vod1, vod2), pageable, 2);

        given(vodAssetRepository.findWithFilters(
                isNull(), isNull(), isNull(), isNull(), eq(true), isNull(), eq(pageable)))
                .willReturn(page);

        // when
        Page<VodAssetListResponse> result = vodAssetService.list(
                null, null, null, null, true, null, pageable);

        // then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("VOD 1");
        assertThat(result.getContent().get(1).getTitle()).isEqualTo("VOD 2");
        assertThat(result.getTotalElements()).isEqualTo(2);
    }
}
