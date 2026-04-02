package com.pochak.content.player.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.player.dto.PlayerDetailResponse;
import com.pochak.content.player.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/contents")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @GetMapping("/live/{id}/player")
    public ApiResponse<PlayerDetailResponse> getLivePlayer(@PathVariable Long id) {
        PlayerDetailResponse response = playerService.getLivePlayerDetail(id);
        return ApiResponse.success(response);
    }

    @GetMapping("/vod/{id}/player")
    public ApiResponse<PlayerDetailResponse> getVodPlayer(@PathVariable Long id) {
        PlayerDetailResponse response = playerService.getVodPlayerDetail(id);
        return ApiResponse.success(response);
    }

    @GetMapping("/clips/{id}/player")
    public ApiResponse<PlayerDetailResponse> getClipPlayer(@PathVariable Long id) {
        PlayerDetailResponse response = playerService.getClipPlayerDetail(id);
        return ApiResponse.success(response);
    }
}
