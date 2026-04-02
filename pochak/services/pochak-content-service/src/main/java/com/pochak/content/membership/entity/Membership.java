package com.pochak.content.membership.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "memberships", schema = "content")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 30)
    private TargetType targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private MembershipRole role = MembershipRole.MEMBER;

    @Column(name = "position_id")
    private Long positionId;

    @Column(name = "uniform_number")
    private Integer uniformNumber;

    @Column(length = 100)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(name = "join_type", length = 20)
    @Builder.Default
    private JoinType joinType = JoinType.REQUEST;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum TargetType {
        ORGANIZATION, TEAM
    }

    public enum MembershipRole {
        ADMIN, MANAGER, COACH, PLAYER, GUARDIAN, MEMBER
    }

    public enum JoinType {
        REQUEST, INVITE, AUTO
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }

    public void updateRole(MembershipRole newRole) {
        this.role = newRole;
    }

    public void approve(Long managerId) {
        this.approvalStatus = ApprovalStatus.APPROVED;
        this.approvedBy = managerId;
        this.approvedAt = LocalDateTime.now();
    }

    public void reject(Long managerId, String reason) {
        this.approvalStatus = ApprovalStatus.REJECTED;
        this.approvedBy = managerId;
        this.approvedAt = LocalDateTime.now();
        this.rejectionReason = reason;
    }

    public void deactivate() {
        this.active = false;
    }
}
