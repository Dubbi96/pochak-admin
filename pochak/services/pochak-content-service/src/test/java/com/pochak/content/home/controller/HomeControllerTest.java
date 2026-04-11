package com.pochak.content.home.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.home.dto.HomeResponse;
import com.pochak.content.home.service.HomeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class HomeControllerTest {

    @Mock
    private HomeService homeService;

    @InjectMocks
    private HomeController homeController;

    @Test
    @DisplayName("GET /home - should return home data successfully")
    void getHome_success() {
        // given
        HomeResponse homeResponse = HomeResponse.builder()
                .mainBanners(List.of())
                .liveContents(List.of())
                .competitionBanners(List.of())
                .contentSections(List.of())
                .build();
        given(homeService.getHome()).willReturn(homeResponse);

        // when
        ApiResponse<HomeResponse> result = homeController.getHome();

        // then
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getData()).isNotNull();
        assertThat(result.getData().getMainBanners()).isEmpty();
        assertThat(result.getData().getLiveContents()).isEmpty();
        verify(homeService).getHome();
    }

    @Test
    @DisplayName("GET /home - should propagate exception from service")
    void getHome_serviceThrows() {
        // given
        given(homeService.getHome()).willThrow(new RuntimeException("Internal error"));

        // when / then
        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class,
                () -> homeController.getHome());
    }
}
