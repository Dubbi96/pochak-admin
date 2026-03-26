package com.pochak.content.membership.dto;

import com.pochak.content.membership.entity.Membership;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipResponse {

    private Long id;
    private Long userId;
    private String targetType;
    private Long targetId;
    private String role;
    private Long positionId;
    private Integer uniformNumber;
    private String nickname;
    private String joinType;
    private String approvalStatus;
    private Long approvedBy;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MembershipResponse from(Membership membership) {
        return MembershipResponse.builder()
                .id(membership.getId())
                .userId(membership.getUserId())
                .targetType(membership.getTargetType().name())
                .targetId(membership.getTargetId())
                .role(membership.getRole().name())
                .positionId(membership.getPositionId())
                .uniformNumber(membership.getUniformNumber())
                .nickname(membership.getNickname())
                .joinType(membership.getJoinType().name())
                .approvalStatus(membership.getApprovalStatus().name())
                .approvedBy(membership.getApprovedBy())
                .approvedAt(membership.getApprovedAt())
                .rejectionReason(membership.getRejectionReason())
                .active(membership.getActive())
                .createdAt(membership.getCreatedAt())
                .updatedAt(membership.getUpdatedAt())
                .build();
    }
}
