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
    public ApiResponse<List<ClubMemberResponse>> getClubMembers(
            @PathVariable Long teamId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(clubService.getClubMembers(teamId, status));
    }

    @PatchMapping("/{teamId}/members/{membershipId}/role")
    public ApiResponse<ClubMemberResponse> updateMemberRole(
            @PathVariable Long teamId,
            @PathVariable Long membershipId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {
        return ApiResponse.success(clubService.updateMemberRole(teamId, membershipId, request));
    }

    @DeleteMapping("/{teamId}/members/{membershipId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(
            @PathVariable Long teamId,
            @PathVariable Long membershipId) {
        clubService.removeMember(teamId, membershipId);
    }

    @PatchMapping("/{teamId}/members/{membershipId}/approve")
    public ApiResponse<ClubMemberResponse> approveMember(
            @PathVariable Long teamId,
            @PathVariable Long membershipId,
            @RequestBody(required = false) ApproveMemberRequest request) {
        return ApiResponse.success(clubService.approveMember(teamId, membershipId,
                request != null ? request : new ApproveMemberRequest()));
    }

    @GetMapping("/{clubId}/posts")
    public ApiResponse<List<ClubPostResponse>> getClubPosts(
            @PathVariable Long clubId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ClubPostResponse> page = clubService.getClubPosts(clubId, pageable);
        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
        return ApiResponse.success(page.getContent(), meta);
    }

    @PostMapping("/{clubId}/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ClubPostResponse> createClubPost(
            @PathVariable Long clubId,
            @Valid @RequestBody CreateClubPostRequest request) {
        return ApiResponse.success(clubService.createClubPost(clubId, request));
    }

    @PutMapping("/{clubId}/posts/{postId}")
    public ApiResponse<ClubPostResponse> updateClubPost(
            @PathVariable Long clubId,
            @PathVariable Long postId,
            @RequestBody UpdateClubPostRequest request) {
        return ApiResponse.success(clubService.updateClubPost(clubId, postId, request));
    }

    @DeleteMapping("/{clubId}/posts/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteClubPost(
            @PathVariable Long clubId,
            @PathVariable Long postId) {
        clubService.deleteClubPost(clubId, postId);
    }

    @PostMapping("/{clubId}/status")
    public ApiResponse<ClubDetailResponse> updateClubStatus(
            @PathVariable Long clubId,
            @RequestBody UpdateClubStatusRequest request) {
        return ApiResponse.success(clubService.updateClubStatus(clubId, request));
    }

    @GetMapping("/{clubId}/stats")
    public ApiResponse<ClubStatsResponse> getClubStats(@PathVariable Long clubId) {
        return ApiResponse.success(clubService.getClubStats(clubId));
    }

    @GetMapping("/by-partner")
    public ApiResponse<List<ClubCustomizationResponse>> getClubsByPartner(
            @RequestParam Long partnerId) {
        return ApiResponse.success(clubService.getClubsByPartnerId(partnerId));
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
