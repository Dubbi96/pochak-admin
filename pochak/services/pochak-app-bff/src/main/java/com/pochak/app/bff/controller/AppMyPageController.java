package com.pochak.app.bff.controller;

import com.pochak.app.bff.client.CommerceServiceClient;
import com.pochak.app.bff.client.ContentServiceClient;
import com.pochak.app.bff.client.IdentityServiceClient;
import com.pochak.app.bff.dto.AppMyPageResponse;
import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.security.UserContextHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AppMyPageController {

    private final IdentityServiceClient identityClient;
    private final CommerceServiceClient commerceClient;
    private final ContentServiceClient contentClient;

    @GetMapping("/mypage")
    public ApiResponse<AppMyPageResponse> getMyPage() {
        Long userId = UserContextHolder.getUserId();
        if (userId == null) {
            return ApiResponse.error(ErrorCode.UNAUTHORIZED);
        }

        log.debug("Fetching app my page data for userId={}", userId);

        AppMyPageResponse response = AppMyPageResponse.builder()
                .userProfile(identityClient.getCurrentUser(userId))
                .guardianInfo(identityClient.getMyGuardian(userId))
                .wallet(commerceClient.getWallet(userId))
                .watchHistory(contentClient.getWatchHistory(userId, 10))
                .favorites(contentClient.getFavorites(userId, 10))
                .build();

        return ApiResponse.success(response);
    }
}
