package com.pochak.content.club.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.common.response.PageMeta;
import com.pochak.content.club.dto.*;
import com.pochak.content.club.service.ClubService;
import com.pochak.content.membership.dto.MembershipResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;

    @GetMapping
    public ApiResponse<List<ClubListResponse>> getClubs(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ClubListResponse> page = clubService.getClubs(sportId, keyword, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/nearby")
    public ApiResponse<List<ClubListResponse>> getNearbyClubs(
            @RequestParam(required = false) Long sportId,
            @RequestParam(required = false) String siGunGuCode,
            @RequestParam(required = false) BigDecimal lat,
            @RequestParam(required = false) BigDecimal lng,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ClubListResponse> page = clubService.getNearbyClubs(sportId, siGunGuCode, lat, lng, pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/popular")
    public ApiResponse<List<ClubListResponse>> getPopularClubs(
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ClubListResponse> page = clubService.getPopularClubs(pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/recent")
    public ApiResponse<List<ClubListResponse>> getRecentClubs(
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ClubListResponse> page = clubService.getRecentClubs(pageable);

        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return ApiResponse.success(page.getContent(), meta);
    }

    @GetMapping("/{teamId}")
    public ApiResponse<ClubDetailResponse> getClubDetail(@PathVariable Long teamId) {
        return ApiResponse.success(clubService.getClubDetail(teamId));
    }

    @PostMapping("/{teamId}/join")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MembershipResponse> joinClub(
            @PathVariable Long teamId,
            @Valid @RequestBody JoinClubRequest request) {
        return ApiResponse.success(clubService.joinClub(teamId, request));
    }

    @GetMapping("/{teamId}/members")
    public ApiResponse<List<ClubMemberResponse>> getClubMembers(@PathVariable Long teamId) {
        return ApiResponse.success(clubService.getClubMembers(teamId));
    }

    @GetMapping("/{clubId}/customization")
    public ApiResponse<ClubCustomizationResponse> getClubCustomization(
            @PathVariable Long clubId,
            @RequestParam Long partnerId) {
        return ApiResponse.success(clubService.getClubCustomization(clubId, partnerId));
    }

    @PutMapping("/{clubId}/customization")
    public ApiResponse<ClubCustomizationResponse> upsertClubCustomization(
            @PathVariable Long clubId,
            @Valid @RequestBody UpdateClubCustomizationRequest request) {
        return ApiResponse.success(clubService.upsertClubCustomization(clubId, request));
    }
}
