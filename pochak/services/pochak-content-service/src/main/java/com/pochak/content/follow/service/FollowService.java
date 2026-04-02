package com.pochak.content.follow.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.common.exception.ErrorCode;
import com.pochak.content.follow.dto.*;
import com.pochak.content.follow.entity.Follow;
import com.pochak.content.follow.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowService {

    private final FollowRepository followRepository;

    /**
     * Follow a target (USER, TEAM, CLUB, ORGANIZATION).
     */
    @Transactional
    public FollowResponse follow(FollowRequest request) {
        Follow.TargetType targetType = parseTargetType(request.getTargetType());

        // Prevent self-follow for USER type
        if (targetType == Follow.TargetType.USER
                && request.getFollowerUserId().equals(request.getTargetId())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Cannot follow yourself");
        }

        // Check if already following
        if (followRepository.existsByFollowerUserIdAndTargetTypeAndTargetId(
                request.getFollowerUserId(), targetType, request.getTargetId())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Already following this target");
        }

        Follow follow = Follow.builder()
                .followerUserId(request.getFollowerUserId())
                .targetType(targetType)
                .targetId(request.getTargetId())
                .build();

        Follow saved = followRepository.save(follow);
        return FollowResponse.from(saved);
    }

    /**
     * Unfollow a target.
     */
    @Transactional
    public void unfollow(Long followerUserId, String targetTypeStr, Long targetId) {
        Follow.TargetType targetType = parseTargetType(targetTypeStr);

        Follow follow = followRepository
                .findByFollowerUserIdAndTargetTypeAndTargetId(followerUserId, targetType, targetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Follow relationship not found"));

        followRepository.delete(follow);
    }

    /**
     * List all entities a user is following.
     */
    public List<FollowResponse> listFollowing(Long userId) {
        return followRepository.findByFollowerUserId(userId)
                .stream()
                .map(FollowResponse::from)
                .toList();
    }

    /**
     * Get follower count for a target.
     */
    public FollowCountResponse getFollowerCount(String targetTypeStr, Long targetId) {
        Follow.TargetType targetType = parseTargetType(targetTypeStr);
        long count = followRepository.countByTargetTypeAndTargetId(targetType, targetId);
        return FollowCountResponse.builder()
                .targetType(targetType.name())
                .targetId(targetId)
                .followerCount(count)
                .build();
    }

    private Follow.TargetType parseTargetType(String targetTypeStr) {
        try {
            return Follow.TargetType.valueOf(targetTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid target type: " + targetTypeStr);
        }
    }
}
