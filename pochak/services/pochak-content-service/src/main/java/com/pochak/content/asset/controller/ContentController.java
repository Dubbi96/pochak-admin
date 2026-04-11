package com.pochak.content.asset.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.search.dto.UnifiedSearchResponse;
import com.pochak.content.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Legacy content controller. Endpoints have been moved to:
 * - LiveController (/contents/live)
 * - VodController (/contents/vod)
 * - ClipController (/contents/clips)
 * - TagController (/contents/tags)
 */
@RestController
@RequestMapping("/contents")
@RequiredArgsConstructor
public class ContentController {

    private final SearchService searchService;

    @GetMapping("/search")
    public ApiResponse<UnifiedSearchResponse> search(@RequestParam("q") String query) {
        return ApiResponse.success(searchService.search(query, null));
    }
}
