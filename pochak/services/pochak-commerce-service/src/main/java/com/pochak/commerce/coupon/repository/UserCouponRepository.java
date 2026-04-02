package com.pochak.commerce.coupon.repository;

import com.pochak.commerce.coupon.entity.CouponStatus;
import com.pochak.commerce.coupon.entity.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {

    List<UserCoupon> findByUserId(Long userId);

    List<UserCoupon> findByUserIdAndStatus(Long userId, CouponStatus status);

    Optional<UserCoupon> findByUserIdAndCouponId(Long userId, Long couponId);

    long countByUserIdAndCouponId(Long userId, Long couponId);
}
