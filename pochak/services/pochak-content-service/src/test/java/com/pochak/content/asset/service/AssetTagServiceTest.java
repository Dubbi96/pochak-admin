package com.pochak.content.asset.service;

import com.pochak.content.asset.dto.tag.AssetTagResponse;
import com.pochak.content.asset.dto.tag.CreateAssetTagRequest;
import com.pochak.content.asset.entity.AssetTag;
import com.pochak.content.asset.entity.LiveAsset;
import com.pochak.content.asset.repository.AssetTagRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AssetTagServiceTest {

    @Mock
    private AssetTagRepository assetTagRepository;

    @InjectMocks
    private AssetTagService assetTagService;

    @Test
    @DisplayName("Should create an asset tag successfully")
    void testCreateTag() {
        // given
        CreateAssetTagRequest request = CreateAssetTagRequest.builder()
                .sportTagId(5)
                .assetType("LIVE")
                .assetId(10L)
                .taggerUserId(100L)
                .tagTimeSec(1200)
                .tagName("GOAL")
                .teamId(1L)
                .uniformNumber(7)
                .build();

        AssetTag savedEntity = AssetTag.builder()
                .id(1L)
                .sportTagId(5)
                .assetType("LIVE")
                .assetId(10L)
                .taggerUserId(100L)
                .tagTimeSec(1200)
                .tagName("GOAL")
                .teamId(1L)
                .uniformNumber(7)
                .visibility(LiveAsset.Visibility.PUBLIC)
                .isDisplayed(true)
                .build();

        given(assetTagRepository.save(any(AssetTag.class))).willReturn(savedEntity);

        // when
        AssetTagResponse result = assetTagService.create(request);

        // then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getSportTagId()).isEqualTo(5);
        assertThat(result.getAssetType()).isEqualTo("LIVE");
        assertThat(result.getAssetId()).isEqualTo(10L);
        assertThat(result.getTagTimeSec()).isEqualTo(1200);
        assertThat(result.getTagName()).isEqualTo("GOAL");
        assertThat(result.getTeamId()).isEqualTo(1L);
        assertThat(result.getUniformNumber()).isEqualTo(7);
        assertThat(result.getVisibility()).isEqualTo(LiveAsset.Visibility.PUBLIC);
        assertThat(result.getIsDisplayed()).isTrue();
        verify(assetTagRepository).save(any(AssetTag.class));
    }
}
