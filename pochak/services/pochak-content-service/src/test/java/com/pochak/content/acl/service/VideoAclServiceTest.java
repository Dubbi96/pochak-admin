package com.pochak.content.acl.service;

import com.pochak.content.acl.entity.VideoAcl;
import com.pochak.content.acl.repository.VideoAclRepository;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.LiveAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.client.CommerceEntitlementClient;
import com.pochak.content.entitlement.dto.AccessCheckResponse;
import com.pochak.content.membership.entity.Membership;
import com.pochak.content.membership.repository.MembershipRepository;
import com.pochak.content.organization.repository.OrganizationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class VideoAclServiceTest {

    @Mock
    private VideoAclRepository videoAclRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private LiveAssetRepository liveAssetRepository;

    @Mock
    private VodAssetRepository vodAssetRepository;

    @Mock
    private ClipAssetRepository clipAssetRepository;

    @Mock
    private CommerceEntitlementClient commerceEntitlementClient;

    @InjectMocks
    private VideoAclService videoAclService;

    @Test
    @DisplayName("Should grant access when no ACL is defined (public by default)")
    void testEvaluateAccess_public() {
        // given
        given(videoAclRepository.findByContentTypeAndContentId(VideoAcl.ContentType.VOD, 1L))
                .willReturn(Optional.empty());

        // when
        AccessCheckResponse result = videoAclService.evaluateAccess("VOD", 1L, 100L);

        // then
        assertThat(result.isHasAccess()).isTrue();
        assertThat(result.getReason()).isEqualTo("PUBLIC");
    }

    @Test
    @DisplayName("Should deny access for MEMBERS_ONLY when user has no matching membership")
    void testEvaluateAccess_membersOnly() {
        // given
        VideoAcl acl = VideoAcl.builder()
                .id(1L)
                .contentType(VideoAcl.ContentType.LIVE)
                .contentId(10L)
                .defaultPolicy(VideoAcl.DefaultPolicy.MEMBERS_ONLY)
                .policy(Map.of(
                        "allowedOrganizations", List.of(1, 2),
                        "allowedTeams", List.of(5)
                ))
                .build();

        given(videoAclRepository.findByContentTypeAndContentId(VideoAcl.ContentType.LIVE, 10L))
                .willReturn(Optional.of(acl));

        // User has no matching memberships (unified query)
        given(membershipRepository.findByUserIdAndTargetTypeInAndActiveTrueAndApprovalStatus(
                100L,
                List.of(Membership.TargetType.ORGANIZATION, Membership.TargetType.TEAM),
                Membership.ApprovalStatus.APPROVED))
                .willReturn(List.of());

        // when
        AccessCheckResponse result = videoAclService.evaluateAccess("LIVE", 10L, 100L);

        // then
        assertThat(result.isHasAccess()).isFalse();
        assertThat(result.getReason()).isEqualTo("MEMBERS_ONLY");
    }

    @Test
    @DisplayName("Should grant access for MEMBERS_ONLY when user is a member of allowed organization")
    void testEvaluateAccess_membersOnly_granted() {
        // given
        VideoAcl acl = VideoAcl.builder()
                .id(1L)
                .contentType(VideoAcl.ContentType.LIVE)
                .contentId(10L)
                .defaultPolicy(VideoAcl.DefaultPolicy.MEMBERS_ONLY)
                .policy(Map.of(
                        "allowedOrganizations", List.of(1, 2)
                ))
                .build();

        given(videoAclRepository.findByContentTypeAndContentId(VideoAcl.ContentType.LIVE, 10L))
                .willReturn(Optional.of(acl));

        Membership orgMembership = Membership.builder()
                .id(1L)
                .userId(100L)
                .targetType(Membership.TargetType.ORGANIZATION)
                .targetId(1L)
                .role(Membership.MembershipRole.MEMBER)
                .approvalStatus(Membership.ApprovalStatus.APPROVED)
                .active(true)
                .build();

        given(membershipRepository.findByUserIdAndTargetTypeInAndActiveTrueAndApprovalStatus(
                100L,
                List.of(Membership.TargetType.ORGANIZATION, Membership.TargetType.TEAM),
                Membership.ApprovalStatus.APPROVED))
                .willReturn(List.of(orgMembership));

        // when
        AccessCheckResponse result = videoAclService.evaluateAccess("LIVE", 10L, 100L);

        // then
        assertThat(result.isHasAccess()).isTrue();
        assertThat(result.getReason()).isEqualTo("GROUP_MEMBER");
    }

    @Test
    @DisplayName("Should deny access when user is blocked")
    void testEvaluateAccess_blockedUser() {
        // given
        VideoAcl acl = VideoAcl.builder()
                .id(1L)
                .contentType(VideoAcl.ContentType.VOD)
                .contentId(5L)
                .defaultPolicy(VideoAcl.DefaultPolicy.PUBLIC)
                .policy(Map.of(
                        "blockedUsers", List.of(100)
                ))
                .build();

        given(videoAclRepository.findByContentTypeAndContentId(VideoAcl.ContentType.VOD, 5L))
                .willReturn(Optional.of(acl));

        // when
        AccessCheckResponse result = videoAclService.evaluateAccess("VOD", 5L, 100L);

        // then
        assertThat(result.isHasAccess()).isFalse();
        assertThat(result.getReason()).isEqualTo("USER_BLOCKED");
    }

    @Test
    @DisplayName("Should require authentication for AUTHENTICATED policy")
    void testEvaluateAccess_authenticated_noUser() {
        // given
        VideoAcl acl = VideoAcl.builder()
                .id(1L)
                .contentType(VideoAcl.ContentType.CLIP)
                .contentId(3L)
                .defaultPolicy(VideoAcl.DefaultPolicy.AUTHENTICATED)
                .build();

        given(videoAclRepository.findByContentTypeAndContentId(VideoAcl.ContentType.CLIP, 3L))
                .willReturn(Optional.of(acl));

        // when
        AccessCheckResponse result = videoAclService.evaluateAccess("CLIP", 3L, null);

        // then
        assertThat(result.isHasAccess()).isFalse();
        assertThat(result.getReason()).isEqualTo("AUTHENTICATION_REQUIRED");
    }
}
