package com.pochak.content.follow.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.follow.dto.*;
import com.pochak.content.follow.service.FollowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    /**
     * Follow a target (targetType + targetId).
     * POST /follows
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FollowResponse> follow(@Valid @RequestBody FollowRequest request) {
        return ApiResponse.success(followService.follow(request));
    }

    /**
     * Unfollow a target.
     * DELETE /follows?followerUserId=&targetType=&targetId=
     */
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> unfollow(
            @RequestParam Long followerUserId,
            @RequestParam String targetType,
            @RequestParam Long targetId) {
        followService.unfollow(followerUserId, targetType, targetId);
        return ApiResponse.success(null);
    }

    /**
     * List all entities a user is following.
     * GET /follows/following?userId=
     */
    @GetMapping("/following")
    public ApiResponse<List<FollowResponse>> listFollowing(@RequestParam Long userId) {
        return ApiResponse.success(followService.listFollowing(userId));
    }

    /**
     * Get follower count for a target.
     * GET /follows/count?targetType=&targetId=
     */
    @GetMapping("/count")
    public ApiResponse<FollowCountResponse> getFollowerCount(
            @RequestParam String targetType,
            @RequestParam Long targetId) {
        return ApiResponse.success(followService.getFollowerCount(targetType, targetId));
    }
}
