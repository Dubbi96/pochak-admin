package com.pochak.content.asset.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.asset.dto.vod.VodAssetListResponse;
import com.pochak.content.asset.service.VodAssetService;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class VodControllerTest {

    @Mock
    private VodAssetService vodAssetService;

    @InjectMocks
    private VodController vodController;

    @Test
    @DisplayName("GET /contents/vod - should return vod list with page meta")
    void list_success() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        VodAssetListResponse item = VodAssetListResponse.builder()
                .id(1L)
                .title("Highlights")
                .viewCount(5000)
                .createdAt(LocalDateTime.now())
                .build();
        Page<VodAssetListResponse> page = new PageImpl<>(List.of(item), pageable, 1);

        given(vodAssetService.list(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), eq(pageable)))
                .willReturn(page);

        // when
        ApiResponse<List<VodAssetListResponse>> result =
                vodController.list(null, null, null, null, null, null, pageable);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).hasSize(1);
        assertThat(result.getData().get(0).getTitle()).isEqualTo("Highlights");
        assertThat(result.getMeta()).isNotNull();
        assertThat(result.getMeta().getTotalCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("GET /contents/vod - should return empty list")
    void list_empty() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<VodAssetListResponse> page = new PageImpl<>(List.of(), pageable, 0);

        given(vodAssetService.list(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), eq(pageable)))
                .willReturn(page);

        // when
        ApiResponse<List<VodAssetListResponse>> result =
                vodController.list(null, null, null, null, null, null, pageable);

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).isEmpty();
    }
}
