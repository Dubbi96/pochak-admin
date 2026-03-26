package com.pochak.content.competition.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.competition.dto.*;
import com.pochak.content.competition.entity.Match;
import com.pochak.content.competition.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping
    public ApiResponse<List<MatchListResponse>> listMatches(
            @RequestParam(required = false) Long competitionId,
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean isDisplayed,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @PageableDefault(size = 20) Pageable pageable) {

        Match.MatchStatus matchStatus = null;
        if (status != null) {
            matchStatus = Match.MatchStatus.valueOf(status);
        }

        Page<MatchListResponse> page = matchService.listMatches(
                competitionId, sportId, venueId, matchStatus, isDisplayed, dateFrom, dateTo, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/{id}")
    public ApiResponse<MatchDetailResponse> getMatch(@PathVariable Long id) {
        return ApiResponse.success(matchService.getMatchDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MatchDetailResponse> createMatch(
            @Valid @RequestBody CreateMatchRequest request) {
        return ApiResponse.success(matchService.createMatch(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<MatchDetailResponse> updateMatch(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMatchRequest request) {
        return ApiResponse.success(matchService.updateMatch(id, request));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<MatchDetailResponse> changeMatchStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeMatchStatusRequest request) {
        return ApiResponse.success(matchService.changeMatchStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteMatch(@PathVariable Long id) {
        matchService.deleteMatch(id);
        return ApiResponse.success(null);
    }
}
