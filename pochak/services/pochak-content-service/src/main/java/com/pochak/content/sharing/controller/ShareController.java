package com.pochak.content.sharing.controller;

import com.pochak.common.constant.HeaderConstants;
import com.pochak.common.response.ApiResponse;
import com.pochak.content.sharing.dto.CreateShareRequest;
import com.pochak.content.sharing.dto.ShareInfoResponse;
import com.pochak.content.sharing.dto.ShareResponse;
import com.pochak.content.sharing.service.ShareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contents/{contentId}")
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @PostMapping("/shares")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ShareResponse> createShare(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable Long contentId,
            @Valid @RequestBody CreateShareRequest request) {
        return ApiResponse.success(shareService.createShare(userId, contentId, request));
    }

    @GetMapping("/share-info")
    public ApiResponse<ShareInfoResponse> getShareInfo(
            @PathVariable Long contentId,
            @RequestParam String contentType) {
        return ApiResponse.success(shareService.getShareInfo(contentId, contentType));
    }
}
