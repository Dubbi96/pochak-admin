package com.pochak.content.follow.repository;

import com.pochak.content.follow.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
