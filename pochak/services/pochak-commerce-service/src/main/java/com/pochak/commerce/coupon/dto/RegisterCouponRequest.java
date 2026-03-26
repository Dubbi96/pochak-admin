package com.pochak.commerce.coupon.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RegisterCouponRequest {

    @NotBlank(message = "쿠폰 코드를 입력해주세요.")
    private String code;
}
