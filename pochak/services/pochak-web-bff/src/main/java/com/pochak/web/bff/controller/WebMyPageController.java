package com.pochak.web.bff.controller;

import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.security.UserContextHolder;
import com.pochak.web.bff.client.CommerceServiceClient;
import com.pochak.web.bff.client.ContentServiceClient;
import com.pochak.web.bff.client.IdentityServiceClient;
import com.pochak.web.bff.dto.WebMyPageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class WebMyPageController {

    private final IdentityServiceClient identityClient;
    private final ContentServiceClient contentClient;
    private final CommerceServiceClient commerceClient;

    @GetMapping("/mypage")
    public ApiResponse<WebMyPageResponse> getMyPage() {
        Long userId = UserContextHolder.getUserId();
        if (userId == null) {
            return ApiResponse.error(ErrorCode.UNAUTHORIZED);
        }

        log.debug("Fetching my page data for userId={}", userId);

        WebMyPageResponse response = WebMyPageResponse.builder()
                .userProfile(identityClient.getCurrentUser(userId))
                .watchHistory(contentClient.getWatchHistory(userId, 10))
                .favorites(contentClient.getFavorites(userId, 10))
                .wallet(commerceClient.getWallet(userId))
                .entitlements(commerceClient.getEntitlements(userId))
                .build();

        return ApiResponse.success(response);
    }
}
