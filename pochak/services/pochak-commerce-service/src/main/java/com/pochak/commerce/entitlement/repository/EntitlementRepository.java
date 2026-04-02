package com.pochak.commerce.entitlement.repository;

import com.pochak.commerce.entitlement.entity.Entitlement;
import com.pochak.commerce.entitlement.entity.EntitlementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EntitlementRepository extends JpaRepository<Entitlement, Long> {

    @Query("SELECT e FROM Entitlement e WHERE e.userId = :userId AND e.isActive = true " +
            "AND e.startsAt <= :now AND (e.expiresAt IS NULL OR e.expiresAt > :now)")
    List<Entitlement> findActiveEntitlements(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Query("SELECT e FROM Entitlement e WHERE e.userId = :userId AND e.entitlementType = :type " +
            "AND e.isActive = true AND e.startsAt <= :now AND (e.expiresAt IS NULL OR e.expiresAt > :now)")
    List<Entitlement> findActiveEntitlementsByType(
            @Param("userId") Long userId,
            @Param("type") EntitlementType type,
            @Param("now") LocalDateTime now);

    /**
     * DATA-004: Scope-filtered query — avoids loading all entitlements then filtering in-memory.
     * Uses composite index (user_id, is_active, scope_type, scope_id) for P95 < 700ms.
     */
    @Query("SELECT e FROM Entitlement e WHERE e.userId = :userId AND e.isActive = true " +
            "AND e.scopeType = :scopeType AND e.scopeId = :scopeId " +
            "AND e.startsAt <= :now AND (e.expiresAt IS NULL OR e.expiresAt > :now)")
    Optional<Entitlement> findActiveByUserAndScope(
            @Param("userId") Long userId,
            @Param("scopeType") String scopeType,
            @Param("scopeId") Long scopeId,
            @Param("now") LocalDateTime now);

    /**
     * DATA-004: Check existence of an active entitlement for a specific scope — lightweight boolean check.
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Entitlement e " +
            "WHERE e.userId = :userId AND e.isActive = true " +
            "AND e.scopeType = :scopeType AND e.scopeId = :scopeId " +
            "AND e.startsAt <= :now AND (e.expiresAt IS NULL OR e.expiresAt > :now)")
    boolean existsActiveByUserAndScope(
            @Param("userId") Long userId,
            @Param("scopeType") String scopeType,
            @Param("scopeId") Long scopeId,
            @Param("now") LocalDateTime now);

    /**
     * DATA-004: Scope + type filtered query — single-row result for specific entitlement check.
     */
    @Query("SELECT e FROM Entitlement e WHERE e.userId = :userId AND e.entitlementType = :type " +
            "AND e.isActive = true AND e.scopeType = :scopeType AND e.scopeId = :scopeId " +
            "AND e.startsAt <= :now AND (e.expiresAt IS NULL OR e.expiresAt > :now)")
    Optional<Entitlement> findActiveByUserTypeAndScope(
            @Param("userId") Long userId,
            @Param("type") EntitlementType type,
            @Param("scopeType") String scopeType,
            @Param("scopeId") Long scopeId,
            @Param("now") LocalDateTime now);

    /**
     * DATA-004: Find broad (subscription-level) entitlements with no scope restriction.
     * Eliminates duplicate findActiveEntitlements() + in-memory filter pattern.
     */
    @Query("SELECT e FROM Entitlement e WHERE e.userId = :userId AND e.isActive = true " +
            "AND e.scopeType IS NULL AND e.scopeId IS NULL " +
            "AND e.startsAt <= :now AND (e.expiresAt IS NULL OR e.expiresAt > :now) " +
            "ORDER BY e.expiresAt DESC")
    Optional<Entitlement> findActiveBroadEntitlement(
            @Param("userId") Long userId,
            @Param("now") LocalDateTime now);

    List<Entitlement> findByPurchaseId(Long purchaseId);

    /**
     * DATA-001: Revoke all entitlements for a withdrawn user (set isActive = false).
     */
    @Modifying
    @Query("UPDATE Entitlement e SET e.isActive = false WHERE e.userId = :userId AND e.isActive = true")
    int revokeAllByUserId(@Param("userId") Long userId);
}
