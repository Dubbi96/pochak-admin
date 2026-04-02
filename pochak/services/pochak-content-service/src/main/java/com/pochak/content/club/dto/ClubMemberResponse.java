package com.pochak.content.club.dto;

import com.pochak.content.membership.entity.Membership;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubMemberResponse {

    private Long membershipId;
    private Long userId;
    private String role;
    private String nickname;
    private Integer uniformNumber;
    private String approvalStatus;
    private LocalDateTime joinedAt;

    public static ClubMemberResponse from(Membership membership) {
        return ClubMemberResponse.builder()
                .membershipId(membership.getId())
                .userId(membership.getUserId())
                .role(membership.getRole().name())
                .nickname(membership.getNickname())
                .uniformNumber(membership.getUniformNumber())
                .approvalStatus(membership.getApprovalStatus().name())
                .joinedAt(membership.getCreatedAt())
                .build();
    }
}
