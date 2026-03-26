package com.pochak.content.follow.repository;

import com.pochak.content.follow.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerUserIdAndTargetTypeAndTargetId(
            Long followerUserId, Follow.TargetType targetType, Long targetId);

    boolean existsByFollowerUserIdAndTargetTypeAndTargetId(
            Long followerUserId, Follow.TargetType targetType, Long targetId);

    List<Follow> findByFollowerUserId(Long followerUserId);

    long countByTargetTypeAndTargetId(Follow.TargetType targetType, Long targetId);

    List<Follow> findByTargetTypeAndTargetId(Follow.TargetType targetType, Long targetId);

    /**
     * DATA-001: Delete all follows where user is follower OR is the followed target (USER type).
     */
    @Modifying
    @Query("DELETE FROM Follow f WHERE f.followerUserId = :userId " +
            "OR (f.targetType = 'USER' AND f.targetId = :userId)")
    int deleteAllByUserId(@Param("userId") Long userId);
}
