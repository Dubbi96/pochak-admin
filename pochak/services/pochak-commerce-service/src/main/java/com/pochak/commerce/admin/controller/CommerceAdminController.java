package com.pochak.commerce.admin.controller;

import com.pochak.commerce.admin.dto.*;
import com.pochak.commerce.admin.service.CommerceAdminService;
import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.giftball.entity.GiftBallStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * 관리자 Commerce 집계 API (항목 36~39).
 * Gateway 레벨에서 ADMIN 역할 검증이 이루어지므로 컨트롤러 내 역할 체크는 생략.
 */
@RestController
@RequestMapping("/admin/commerce")
@RequiredArgsConstructor
public class CommerceAdminController {

    private final CommerceAdminService commerceAdminService;

    // ──────────────────────────────────────────────
    // 포인트 집계 (항목 36)
    // ──────────────────────────────────────────────

    /**
     * 전체 포인트 통계 (총 발행/사용/잔여).
     * GET /admin/commerce/points/summary
     */
    @GetMapping("/points/summary")
    public ResponseEntity<ApiResponse<PointsSummaryResponse>> getPointsSummary() {
        return ResponseEntity.ok(ApiResponse.ok(commerceAdminService.getPointsSummary()));
    }

    /**
     * 사용자별 포인트 목록 (페이징).
     * GET /admin/commerce/points/users?page=0&size=20
     */
    @GetMapping("/points/users")
    public ResponseEntity<ApiResponse<Page<UserPointsResponse>>> getUserPoints(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(commerceAdminService.getUserPoints(pageable)));
    }

    // ──────────────────────────────────────────────
    // 시즌패스 (항목 37)
    // ──────────────────────────────────────────────

    /**
     * 시즌패스 통계 (기간, 판매수/매출).
     * GET /admin/commerce/season-passes/stats?from=2026-01-01&to=2026-03-31
     */
    @GetMapping("/season-passes/stats")
    public ResponseEntity<ApiResponse<SeasonPassStatsResponse>> getSeasonPassStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(commerceAdminService.getSeasonPassStats(from, to)));
    }

    /**
     * 시즌패스 구매 이력 (페이징).
     * GET /admin/commerce/season-passes/history
     */
    @GetMapping("/season-passes/history")
    public ResponseEntity<ApiResponse<Page<SeasonPassHistoryResponse>>> getSeasonPassHistory(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(commerceAdminService.getSeasonPassHistory(pageable)));
    }

    // ──────────────────────────────────────────────
    // 일별 매출 (항목 38)
    // ──────────────────────────────────────────────

    /**
     * 일별 매출 집계.
     * GET /admin/commerce/revenue/daily?from=2026-01-01&to=2026-01-31
     */
    @GetMapping("/revenue/daily")
    public ResponseEntity<ApiResponse<DailyRevenueResponse>> getDailyRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(commerceAdminService.getDailyRevenue(from, to)));
    }

    // ──────────────────────────────────────────────
    // Gift Ball (항목 39)
    // ──────────────────────────────────────────────

    /**
     * Gift Ball 목록 (status 필터, 페이징).
     * GET /admin/commerce/gift-balls?status=PENDING
     */
    @GetMapping("/gift-balls")
    public ResponseEntity<ApiResponse<Page<GiftBallResponse>>> getGiftBalls(
            @RequestParam(required = false) GiftBallStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(commerceAdminService.getGiftBalls(status, pageable)));
    }

    /**
     * Gift Ball 수동 지급.
     * POST /admin/commerce/gift-balls
     */
    @PostMapping("/gift-balls")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<GiftBallResponse>> grantGiftBall(
            @RequestBody GrantGiftBallRequest request) {
        GiftBallResponse response = commerceAdminService.grantGiftBall(
                request.senderUserId(), request.receiverUserId(),
                request.amount(), request.message());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }
}
