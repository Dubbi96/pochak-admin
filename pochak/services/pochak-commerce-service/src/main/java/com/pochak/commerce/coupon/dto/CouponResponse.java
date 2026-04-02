package com.pochak.commerce.coupon.dto;

import com.pochak.commerce.coupon.entity.Coupon;
import com.pochak.commerce.coupon.entity.CouponStatus;
import com.pochak.commerce.coupon.entity.UserCoupon;
import lombok.Builder;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
@Builder
public class CouponResponse {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private Long id;
    private String code;
    private String title;
    private String discountLabel;
    private String description;
    private Integer minPurchaseAmount;
    private String expiryDate;
    private String status;
    private String usedAt;

    public static CouponResponse from(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .title(coupon.getTitle())
                .discountLabel(coupon.getDiscountLabel())
                .description(coupon.getTitle())
                .minPurchaseAmount(coupon.getMinPurchaseAmount())
                .expiryDate(coupon.getEndDate().format(DATE_FMT))
                .status(coupon.isExpired() ? CouponStatus.EXPIRED.name() : CouponStatus.AVAILABLE.name())
                .build();
    }

    public static CouponResponse from(UserCoupon userCoupon) {
        Coupon coupon = userCoupon.getCoupon();
        return CouponResponse.builder()
                .id(userCoupon.getId())
                .code(coupon.getCode())
                .title(coupon.getTitle())
                .discountLabel(coupon.getDiscountLabel())
                .description(coupon.getTitle())
                .minPurchaseAmount(coupon.getMinPurchaseAmount())
                .expiryDate(coupon.getEndDate().format(DATE_FMT))
                .status(userCoupon.getStatus().name())
                .usedAt(userCoupon.getUsedAt() != null ? userCoupon.getUsedAt().format(DATE_FMT) : null)
                .build();
    }
}
