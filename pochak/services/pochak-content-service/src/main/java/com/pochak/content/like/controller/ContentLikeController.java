package com.pochak.content.like.controller;

import com.pochak.common.constant.HeaderConstants;
import com.pochak.common.response.ApiResponse;
import com.pochak.content.like.dto.LikeCountResponse;
import com.pochak.content.like.service.ContentLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contents/{type}/{id}/like")
@RequiredArgsConstructor
public class ContentLikeController {

    private final ContentLikeService contentLikeService;

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Void> toggleLike(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable("type") String type,
            @PathVariable("id") Long id) {

        contentLikeService.toggleLike(userId, type, id);
        return ApiResponse.success(null);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Void> removeLike(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable("type") String type,
            @PathVariable("id") Long id) {

        contentLikeService.removeLike(userId, type, id);
        return ApiResponse.success(null);
    }

    @GetMapping("-count")
    public ApiResponse<LikeCountResponse> getLikeCount(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @PathVariable("type") String type,
            @PathVariable("id") Long id) {

        return ApiResponse.success(contentLikeService.getLikeCount(userId, type, id));
    }
}
