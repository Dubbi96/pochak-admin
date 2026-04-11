package com.pochak.content.sharing.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.asset.entity.VodAsset;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.sharing.dto.CreateShareRequest;
import com.pochak.content.sharing.dto.ShareInfoResponse;
import com.pochak.content.sharing.dto.ShareResponse;
import com.pochak.content.sharing.entity.Share;
import com.pochak.content.sharing.entity.SharePlatform;
import com.pochak.content.sharing.repository.ShareRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ShareServiceTest {

    @InjectMocks
    private ShareService shareService;

    @Mock
    private ShareRepository shareRepository;

    @Mock
    private VodAssetRepository vodAssetRepository;

    private Share testShare;
    private VodAsset testVod;

    @BeforeEach
    void setUp() {
        testShare = Share.builder()
                .id(1L)
                .contentId(100L)
                .contentType("VOD")
                .userId(50L)
                .platform(SharePlatform.KAKAO)
                .build();

        testVod = VodAsset.builder()
                .id(100L)
                .title("Test VOD Title")
                .thumbnailUrl("https://cdn.pochak.co.kr/thumb/100.jpg")
                .build();
    }

    @Test
    @DisplayName("Should record a share event successfully")
    void testCreateShare() {
        // given
        CreateShareRequest request = CreateShareRequest.builder()
                .contentType("VOD")
                .platform(SharePlatform.KAKAO)
                .build();

        given(shareRepository.save(any(Share.class))).willReturn(testShare);

        // when
        ShareResponse result = shareService.createShare(50L, 100L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getContentId()).isEqualTo(100L);
        assertThat(result.getContentType()).isEqualTo("VOD");
        assertThat(result.getPlatform()).isEqualTo(SharePlatform.KAKAO);
        assertThat(result.getUserId()).isEqualTo(50L);
    }

    @Test
    @DisplayName("Should return share info with OG meta for VOD")
    void testGetShareInfo_vod() {
        // given
        given(shareRepository.countByContentTypeAndContentId("VOD", 100L)).willReturn(15L);
        given(vodAssetRepository.findByIdAndDeletedAtIsNull(100L)).willReturn(Optional.of(testVod));

        // when
        ShareInfoResponse result = shareService.getShareInfo(100L, "VOD");

        // then
        assertThat(result.getContentId()).isEqualTo(100L);
        assertThat(result.getTitle()).isEqualTo("Test VOD Title");
        assertThat(result.getThumbnailUrl()).isEqualTo("https://cdn.pochak.co.kr/thumb/100.jpg");
        assertThat(result.getShareCount()).isEqualTo(15L);
    }

    @Test
    @DisplayName("Should throw when VOD content not found")
    void testGetShareInfo_notFound() {
        // given
        given(shareRepository.countByContentTypeAndContentId("VOD", 999L)).willReturn(0L);
        given(vodAssetRepository.findByIdAndDeletedAtIsNull(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> shareService.getShareInfo(999L, "VOD"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Content not found");
    }

    @Test
    @DisplayName("Should throw for unsupported content type")
    void testGetShareInfo_unsupportedType() {
        // given
        given(shareRepository.countByContentTypeAndContentId("UNKNOWN", 100L)).willReturn(0L);

        // when & then
        assertThatThrownBy(() -> shareService.getShareInfo(100L, "UNKNOWN"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Unsupported content type");
    }
}
