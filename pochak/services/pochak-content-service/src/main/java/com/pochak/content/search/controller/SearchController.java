package com.pochak.content.search.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.search.dto.SearchSuggestion;
import com.pochak.content.search.dto.TrendingSearchResponse;
import com.pochak.content.search.dto.UnifiedSearchResponse;
import com.pochak.content.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ApiResponse<UnifiedSearchResponse> search(
            @RequestParam("q") String query,
            @RequestParam(value = "types", required = false) String types) {

        Set<String> typeSet = null;
        if (types != null && !types.isBlank()) {
            typeSet = Arrays.stream(types.split(","))
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
        }

        return ApiResponse.success(searchService.search(query, typeSet));
    }

    @GetMapping("/suggest")
    public ApiResponse<List<SearchSuggestion>> suggest(
            @RequestParam("q") String query) {
        return ApiResponse.success(searchService.getSuggestions(query));
    }

    @GetMapping("/trending")
    public ApiResponse<TrendingSearchResponse> trending() {
        return ApiResponse.success(searchService.getTrendingSearchTerms());
    }
}
