package com.pochak.identity.partner.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.identity.partner.dto.PartnerResponse;
import com.pochak.identity.partner.entity.PartnerStatus;
import com.pochak.identity.partner.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/partners")
@RequiredArgsConstructor
public class AdminPartnerController {

    private final PartnerService partnerService;

    @PutMapping("/{id}/approve")
    public ApiResponse<PartnerResponse> approve(@PathVariable Long id) {
        return ApiResponse.success(partnerService.approve(id));
    }

    @GetMapping
    public ApiResponse<List<PartnerResponse>> getPartners(
            @RequestParam(required = false, defaultValue = "PENDING") PartnerStatus status,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<PartnerResponse> page = partnerService.getPartnersByStatus(status, pageable);

        PageMeta meta = PageMeta.of(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());

        return ApiResponse.success(page.getContent(), meta);
    }
}
