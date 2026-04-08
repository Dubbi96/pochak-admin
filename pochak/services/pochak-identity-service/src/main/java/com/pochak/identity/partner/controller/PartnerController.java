package com.pochak.identity.partner.controller;

import com.pochak.common.constant.HeaderConstants;
import com.pochak.common.response.ApiResponse;
import com.pochak.identity.partner.dto.PartnerResponse;
import com.pochak.identity.partner.dto.RegisterPartnerRequest;
import com.pochak.identity.partner.service.PartnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/partners")
@RequiredArgsConstructor
public class PartnerController {

    private final PartnerService partnerService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PartnerResponse> register(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId,
            @Valid @RequestBody RegisterPartnerRequest request) {
        return ApiResponse.success(partnerService.register(userId, request));
    }

    @GetMapping("/me")
    public ApiResponse<PartnerResponse> getMyPartnerInfo(
            @RequestHeader(HeaderConstants.X_USER_ID) Long userId) {
        return ApiResponse.success(partnerService.getMyPartnerInfo(userId));
    }
}
