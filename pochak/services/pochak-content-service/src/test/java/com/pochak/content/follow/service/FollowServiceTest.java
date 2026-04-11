package com.pochak.content.follow.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.follow.dto.FollowCountResponse;
import com.pochak.content.follow.dto.FollowRequest;
import com.pochak.content.follow.dto.FollowResponse;
import com.pochak.content.follow.entity.Follow;
import com.pochak.content.follow.repository.FollowRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @Mock
    private FollowRepository followRepository;

    @InjectMocks
    private FollowService followService;

    @Test
    @DisplayName("Should follow a team successfully")
    void testFollow() {
        // given
        FollowRequest request = FollowRequest.builder()
                .followerUserId(1L)
                .targetType("TEAM")
                .targetId(10L)
                .build();

        Follow savedFollow = Follow.builder()
                .id(1L)
                .followerUserId(1L)
                .targetType(Follow.TargetType.TEAM)
                .targetId(10L)
                .build();

        given(followRepository.existsByFollowerUserIdAndTargetTypeAndTargetId(1L, Follow.TargetType.TEAM, 10L))
                .willReturn(false);
        given(followRepository.save(any(Follow.class))).willReturn(savedFollow);

        // when
        FollowResponse response = followService.follow(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getFollowerUserId()).isEqualTo(1L);
        assertThat(response.getTargetType()).isEqualTo("TEAM");
        assertThat(response.getTargetId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("Should throw exception when trying to follow yourself")
    void testFollowSelf() {
        // given
        FollowRequest request = FollowRequest.builder()
                .followerUserId(1L)
                .targetType("USER")
                .targetId(1L)
                .build();

        // when / then
        assertThatThrownBy(() -> followService.follow(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Cannot follow yourself");
    }

    @Test
    @DisplayName("Should throw exception when already following")
    void testFollowDuplicate() {
        // given
        FollowRequest request = FollowRequest.builder()
                .followerUserId(1L)
                .targetType("TEAM")
                .targetId(10L)
                .build();

        given(followRepository.existsByFollowerUserIdAndTargetTypeAndTargetId(1L, Follow.TargetType.TEAM, 10L))
                .willReturn(true);

        // when / then
        assertThatThrownBy(() -> followService.follow(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Already following");
    }

    @Test
    @DisplayName("Should unfollow successfully")
    void testUnfollow() {
        // given
        Follow follow = Follow.builder()
                .id(1L)
                .followerUserId(1L)
                .targetType(Follow.TargetType.TEAM)
                .targetId(10L)
                .build();

        given(followRepository.findByFollowerUserIdAndTargetTypeAndTargetId(1L, Follow.TargetType.TEAM, 10L))
                .willReturn(Optional.of(follow));

        // when
        followService.unfollow(1L, "TEAM", 10L);

        // then
        then(followRepository).should().delete(follow);
    }

    @Test
    @DisplayName("Should throw exception when unfollowing non-existent relationship")
    void testUnfollowNotFound() {
        // given
        given(followRepository.findByFollowerUserIdAndTargetTypeAndTargetId(1L, Follow.TargetType.TEAM, 10L))
                .willReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> followService.unfollow(1L, "TEAM", 10L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not found");
    }

    @Test
    @DisplayName("Should list following for a user")
    void testListFollowing() {
        // given
        Follow f1 = Follow.builder().id(1L).followerUserId(1L).targetType(Follow.TargetType.TEAM).targetId(10L).build();
        Follow f2 = Follow.builder().id(2L).followerUserId(1L).targetType(Follow.TargetType.CLUB).targetId(20L).build();

        given(followRepository.findByFollowerUserId(1L)).willReturn(List.of(f1, f2));

        // when
        List<FollowResponse> result = followService.listFollowing(1L);

        // then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTargetType()).isEqualTo("TEAM");
        assertThat(result.get(1).getTargetType()).isEqualTo("CLUB");
    }

    @Test
    @DisplayName("Should return follower count for a target")
    void testGetFollowerCount() {
        // given
        given(followRepository.countByTargetTypeAndTargetId(Follow.TargetType.TEAM, 10L))
                .willReturn(150L);

        // when
        FollowCountResponse response = followService.getFollowerCount("TEAM", 10L);

        // then
        assertThat(response.getFollowerCount()).isEqualTo(150L);
        assertThat(response.getTargetType()).isEqualTo("TEAM");
        assertThat(response.getTargetId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("Should throw exception for invalid target type")
    void testInvalidTargetType() {
        // given
        FollowRequest request = FollowRequest.builder()
                .followerUserId(1L)
                .targetType("INVALID")
                .targetId(10L)
                .build();

        // when / then
        assertThatThrownBy(() -> followService.follow(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid target type");
    }
}
