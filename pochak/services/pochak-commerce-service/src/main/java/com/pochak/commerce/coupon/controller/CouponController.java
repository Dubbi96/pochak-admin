package com.pochak.commerce.coupon.controller;

import com.pochak.commerce.common.ApiResponse;
import com.pochak.commerce.coupon.dto.CouponResponse;
import com.pochak.commerce.coupon.dto.RegisterCouponRequest;
import com.pochak.commerce.coupon.entity.CouponStatus;
import com.pochak.commerce.coupon.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    /**
     * GET /coupons/my - Get the authenticated user's coupons.
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getMyCoupons(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) CouponStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(couponService.getMyCoupons(userId, status)));
    }

    /**
     * POST /coupons/register - Register a coupon by code.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<CouponResponse>> registerCoupon(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody RegisterCouponRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(couponService.registerCoupon(userId, request.getCode())));
    }

    /**
     * POST /coupons/{id}/use - Use a coupon.
     */
    @PostMapping("/{id}/use")
    public ResponseEntity<ApiResponse<CouponResponse>> useCoupon(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(couponService.useCoupon(userId, id)));
    }

    /**
     * GET /coupons/available - List all currently available public coupons.
     */
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAvailableCoupons() {
        return ResponseEntity.ok(ApiResponse.ok(couponService.getAvailableCoupons()));
    }
}
