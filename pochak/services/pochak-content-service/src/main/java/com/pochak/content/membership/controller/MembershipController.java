package com.pochak.content.membership.controller;

import com.pochak.common.response.ApiResponse;
import com.pochak.content.membership.dto.*;
import com.pochak.content.membership.service.MembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MembershipResponse> createMembership(
            @Valid @RequestBody CreateMembershipRequest request) {
        return ApiResponse.success(membershipService.createMembership(request));
    }

    /**
     * Join an organization. If OPEN -> auto APPROVED; If CLOSED -> PENDING.
     */
    @PostMapping("/join")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MembershipResponse> joinOrganization(
            @Valid @RequestBody JoinOrganizationRequest request) {
        return ApiResponse.success(membershipService.joinOrganization(
                request.getUserId(), request.getOrganizationId(), request.getNickname()));
    }

    @GetMapping
    public ApiResponse<List<MembershipResponse>> listMemberships(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) Long targetId) {
        return ApiResponse.success(membershipService.listMemberships(userId, targetType, targetId));
    }

    /**
     * List pending memberships for an organization (manager only).
     */
    @GetMapping("/pending")
    public ApiResponse<List<MembershipResponse>> listPendingMemberships(
            @RequestParam Long orgId) {
        return ApiResponse.success(membershipService.listPendingMemberships(orgId));
    }

    @PutMapping("/{id}")
    public ApiResponse<MembershipResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMembershipRoleRequest request) {
        return ApiResponse.success(membershipService.updateRole(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteMembership(@PathVariable Long id) {
        membershipService.deleteMembership(id);
        return ApiResponse.success(null);
    }

    /**
     * Approve a pending membership (manager only).
     */
    @PutMapping("/{id}/approve")
    public ApiResponse<MembershipResponse> approveMembership(
            @PathVariable Long id,
            @Valid @RequestBody ApproveMembershipRequest request) {
        return ApiResponse.success(membershipService.approveMembership(id, request.getManagerId()));
    }

    /**
     * Reject a pending membership with reason (manager only).
     */
    @PutMapping("/{id}/reject")
    public ApiResponse<MembershipResponse> rejectMembership(
            @PathVariable Long id,
            @Valid @RequestBody RejectMembershipRequest request) {
        return ApiResponse.success(membershipService.rejectMembership(
                id, request.getManagerId(), request.getReason()));
    }
}
