package com.pochak.content.membership.repository;

import com.pochak.content.membership.entity.Membership;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {

    List<Membership> findByUserId(Long userId);

    List<Membership> findByTargetTypeAndTargetId(Membership.TargetType targetType, Long targetId);

    boolean existsByUserIdAndTargetTypeAndTargetId(Long userId, Membership.TargetType targetType, Long targetId);

    List<Membership> findByUserIdAndApprovalStatus(Long userId, Membership.ApprovalStatus status);

    List<Membership> findByTargetTypeAndTargetIdAndApprovalStatus(
            Membership.TargetType targetType, Long targetId, Membership.ApprovalStatus status);

    List<Membership> findByUserIdAndTargetTypeAndActiveTrue(Long userId, Membership.TargetType targetType);

    long countByTargetTypeAndTargetIdAndApprovalStatusAndActiveTrue(
            Membership.TargetType targetType, Long targetId, Membership.ApprovalStatus approvalStatus);

    @Query("SELECT m.targetId, COUNT(m) as cnt FROM Membership m" +
            " WHERE m.targetType = :targetType AND m.approvalStatus = 'APPROVED' AND m.active = true" +
            " GROUP BY m.targetId ORDER BY cnt DESC")
    List<Object[]> findPopularTargetIds(@Param("targetType") Membership.TargetType targetType, Pageable pageable);

    List<Membership> findByTargetTypeAndTargetIdAndActiveTrueAndApprovalStatus(
            Membership.TargetType targetType, Long targetId, Membership.ApprovalStatus approvalStatus);

    /**
     * Find a user's active membership for a specific organization (used for manager auth checks).
     */
    java.util.Optional<Membership> findByUserIdAndTargetTypeAndTargetIdAndActiveTrue(
            Long userId, Membership.TargetType targetType, Long targetId);

    /**
     * Check if user already has an active (non-rejected) membership.
     */
    boolean existsByUserIdAndTargetTypeAndTargetIdAndActiveTrue(
            Long userId, Membership.TargetType targetType, Long targetId);

    /**
     * Find all active memberships for a given target (used for cascade soft-delete).
     */
    List<Membership> findByTargetTypeAndTargetIdAndActiveTrue(
            Membership.TargetType targetType, Long targetId);

    /**
     * BIZ-003/004: Unified "단체" query — find active approved memberships across multiple target types
     * (ORGANIZATION + TEAM) in a single query, avoiding N+1 separate queries.
     */
    List<Membership> findByUserIdAndTargetTypeInAndActiveTrueAndApprovalStatus(
            Long userId, List<Membership.TargetType> types, Membership.ApprovalStatus status);

    /**
     * DATA-004: Scope-filtered query — find active approved membership for a specific user + target.
     * Uses composite index (user_id, is_active, target_type, target_id) for P95 < 700ms.
     */
    @Query("SELECT m FROM Membership m WHERE m.userId = :userId AND m.active = true " +
            "AND m.approvalStatus = 'APPROVED' AND m.targetType = :targetType AND m.targetId = :targetId")
    java.util.Optional<Membership> findActiveApprovedByUserAndScope(
            @Param("userId") Long userId,
            @Param("targetType") Membership.TargetType targetType,
            @Param("targetId") Long targetId);

    /**
     * DATA-004: Existence check for active approved membership — lightweight boolean check.
     */
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Membership m " +
            "WHERE m.userId = :userId AND m.active = true " +
            "AND m.approvalStatus = 'APPROVED' AND m.targetType = :targetType AND m.targetId = :targetId")
    boolean existsActiveApprovedByUserAndScope(
            @Param("userId") Long userId,
            @Param("targetType") Membership.TargetType targetType,
            @Param("targetId") Long targetId);

    /**
     * DATA-001: Delete all memberships for a withdrawn user.
     */
    @Modifying
    @Query("DELETE FROM Membership m WHERE m.userId = :userId")
    int deleteAllByUserId(@Param("userId") Long userId);
}

