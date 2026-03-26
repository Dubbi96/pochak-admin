package com.pochak.content.recommendation.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.recommendation.dto.RecommendedContentResponse;
import com.pochak.content.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/personalized")
    public ApiResponse<List<RecommendedContentResponse>> getPersonalized(
            @RequestHeader("X-User-Id") Long userId) {
        return ApiResponse.success(recommendationService.getPersonalizedContent(userId));
    }

    @GetMapping("/similar/{contentId}")
    public ApiResponse<List<RecommendedContentResponse>> getSimilar(
            @PathVariable Long contentId) {
        return ApiResponse.success(recommendationService.getSimilarContent(contentId));
    }

    @GetMapping("/trending")
    public ApiResponse<List<RecommendedContentResponse>> getTrending() {
        return ApiResponse.success(recommendationService.getTrendingContent());
    }

    @GetMapping("/feed")
    public ApiResponse<List<RecommendedContentResponse>> getPersonalizedFeed(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(recommendationService.getPersonalizedFeed(userId, page, size));
    }

    @GetMapping("/content-based/{contentId}")
    public ApiResponse<List<RecommendedContentResponse>> getContentBased(
            @PathVariable Long contentId,
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success(recommendationService.getContentBasedRecommendations(contentId, limit));
    }
}
