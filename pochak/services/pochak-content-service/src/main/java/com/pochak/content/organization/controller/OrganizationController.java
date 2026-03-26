package com.pochak.content.organization.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.organization.dto.*;
import com.pochak.content.organization.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    public ApiResponse<List<OrganizationListResponse>> listOrganizations(
            @RequestParam(required = false) String orgType,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<OrganizationListResponse> page = organizationService.listOrganizations(
                orgType, parentId, sportId, keyword, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/{id}")
    public ApiResponse<OrganizationDetailResponse> getOrganization(@PathVariable Long id) {
        return ApiResponse.success(organizationService.getOrganizationDetail(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrganizationDetailResponse> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request) {
        return ApiResponse.success(organizationService.createOrganization(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<OrganizationDetailResponse> updateOrganization(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrganizationRequest request) {
        return ApiResponse.success(organizationService.updateOrganization(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteOrganization(@PathVariable Long id) {
        organizationService.deleteOrganization(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}/children")
    public ApiResponse<List<OrganizationListResponse>> getChildren(@PathVariable Long id) {
        return ApiResponse.success(organizationService.getChildren(id));
    }
}
