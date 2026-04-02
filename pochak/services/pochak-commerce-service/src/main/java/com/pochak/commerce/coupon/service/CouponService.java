package com.pochak.commerce.coupon.service;

import com.pochak.commerce.coupon.dto.CouponResponse;
import com.pochak.commerce.coupon.entity.Coupon;
import com.pochak.commerce.coupon.entity.CouponStatus;
import com.pochak.commerce.coupon.entity.UserCoupon;
import com.pochak.commerce.coupon.repository.CouponRepository;
import com.pochak.commerce.coupon.repository.UserCouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository;
    private final UserCouponRepository userCouponRepository;

    /**
     * Get all coupons for a user, optionally filtered by status.
     */
    public List<CouponResponse> getMyCoupons(Long userId, CouponStatus status) {
        List<UserCoupon> userCoupons = (status != null)
                ? userCouponRepository.findByUserIdAndStatus(userId, status)
                : userCouponRepository.findByUserId(userId);

        return userCoupons.stream()
                .map(CouponResponse::from)
                .toList();
    }

    /**
     * Register a coupon by code for a user.
     */
    @Transactional
    public CouponResponse registerCoupon(Long userId, String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 쿠폰 코드입니다."));

        if (!coupon.isUsable()) {
            throw new IllegalStateException("사용할 수 없는 쿠폰입니다.");
        }

        // Check if already registered
        if (userCouponRepository.countByUserIdAndCouponId(userId, coupon.getId()) > 0) {
            throw new IllegalStateException("이미 등록된 쿠폰입니다.");
        }

        // Check per-user limit
        if (coupon.getPerUserLimit() != null) {
            long count = userCouponRepository.countByUserIdAndCouponId(userId, coupon.getId());
            if (count >= coupon.getPerUserLimit()) {
                throw new IllegalStateException("쿠폰 등록 횟수를 초과했습니다.");
            }
        }

        UserCoupon userCoupon = UserCoupon.builder()
                .userId(userId)
                .coupon(coupon)
                .status(CouponStatus.AVAILABLE)
                .assignedAt(LocalDateTime.now())
                .build();

        userCouponRepository.save(userCoupon);
        coupon.incrementUsageCount();

        return CouponResponse.from(userCoupon);
    }

    /**
     * Use a coupon.
     */
    @Transactional
    public CouponResponse useCoupon(Long userId, Long userCouponId) {
        UserCoupon userCoupon = userCouponRepository.findById(userCouponId)
                .orElseThrow(() -> new IllegalArgumentException("쿠폰을 찾을 수 없습니다."));

        if (!userCoupon.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 쿠폰만 사용할 수 있습니다.");
        }

        if (userCoupon.getStatus() != CouponStatus.AVAILABLE) {
            throw new IllegalStateException("사용할 수 없는 쿠폰입니다.");
        }

        if (userCoupon.getCoupon().isExpired()) {
            userCoupon.expire();
            throw new IllegalStateException("만료된 쿠폰입니다.");
        }

        userCoupon.use();
        return CouponResponse.from(userCoupon);
    }

    /**
     * List all currently available public coupons.
     */
    public List<CouponResponse> getAvailableCoupons() {
        LocalDateTime now = LocalDateTime.now();
        return couponRepository.findByIsActiveTrueAndStartDateBeforeAndEndDateAfter(now, now)
                .stream()
                .map(CouponResponse::from)
                .toList();
    }
}
