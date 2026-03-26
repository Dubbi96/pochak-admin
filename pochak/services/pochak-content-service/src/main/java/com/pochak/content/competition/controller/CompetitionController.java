package com.pochak.content.competition.controller;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.competition.dto.*;
import com.pochak.content.competition.entity.Competition;
import com.pochak.content.competition.service.CompetitionService;
import com.pochak.content.competition.service.InviteCodeRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/competitions")
@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionService competitionService;
    private final InviteCodeRateLimiter inviteCodeRateLimiter;

    @GetMapping
    public ApiResponse<List<CompetitionListResponse>> listCompetitions(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean isDisplayed,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {

        Competition.CompetitionStatus competitionStatus = null;
        if (status != null) {
            competitionStatus = Competition.CompetitionStatus.valueOf(status);
        }

        Page<CompetitionListResponse> page = competitionService.listCompetitions(
                sportId, competitionStatus, isDisplayed, keyword, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/{id}")
    public ApiResponse<CompetitionDetailResponse> getCompetition(@PathVariable Long id) {
        return ApiResponse.success(competitionService.getCompetitionDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CompetitionDetailResponse> createCompetition(
            @Valid @RequestBody CreateCompetitionRequest request) {
        return ApiResponse.success(competitionService.createCompetition(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<CompetitionDetailResponse> updateCompetition(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCompetitionRequest request) {
        return ApiResponse.success(competitionService.updateCompetition(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteCompetition(@PathVariable Long id) {
        competitionService.deleteCompetition(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/access")
    public ApiResponse<CompetitionDetailResponse> accessPrivateCompetition(
            @RequestParam String inviteCode,
            @RequestParam Long userId,
            HttpServletRequest request) {

        String userKey = "user:" + userId;
        String ipKey = "ip:" + request.getRemoteAddr();

        if (!inviteCodeRateLimiter.isAllowed(userKey) || !inviteCodeRateLimiter.isAllowed(ipKey)) {
            throw new BusinessException(ErrorCode.TOO_MANY_REQUESTS,
                    "Too many invite code attempts. Try again later.");
        }

        return ApiResponse.success(competitionService.accessPrivateCompetition(inviteCode, userId));
    }

    @GetMapping("/visited")
    public ApiResponse<List<CompetitionListResponse>> getVisitedCompetitions(
            @RequestParam Long userId) {
        return ApiResponse.success(competitionService.getVisitedCompetitions(userId));
    }
}
