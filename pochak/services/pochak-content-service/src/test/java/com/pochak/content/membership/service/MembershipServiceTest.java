package com.pochak.content.membership.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.membership.dto.*;
import com.pochak.content.membership.entity.Membership;
import com.pochak.content.membership.repository.MembershipRepository;
import com.pochak.content.organization.entity.Organization;
import com.pochak.content.organization.repository.OrganizationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class MembershipServiceTest {

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @InjectMocks
    private MembershipService membershipService;

    @Test
    @DisplayName("Should join an organization successfully")
    void testJoinOrganization() {
        // given
        CreateMembershipRequest request = CreateMembershipRequest.builder()
                .userId(100L)
                .targetType("ORGANIZATION")
                .targetId(1L)
                .role("MEMBER")
                .build();

        Organization org = Organization.builder()
                .id(1L)
                .name("Test Org")
                .orgType(Organization.OrgType.PUBLIC)
                .isAutoJoin(false)
                .active(true)
                .children(new ArrayList<>())
                .build();

        given(membershipRepository.existsByUserIdAndTargetTypeAndTargetId(
                100L, Membership.TargetType.ORGANIZATION, 1L)).willReturn(false);
        given(organizationRepository.findByIdAndActiveTrue(1L)).willReturn(Optional.of(org));

        Membership savedMembership = Membership.builder()
                .id(1L)
                .userId(100L)
                .targetType(Membership.TargetType.ORGANIZATION)
                .targetId(1L)
                .role(Membership.MembershipRole.MEMBER)
                .joinType(Membership.JoinType.REQUEST)
                .approvalStatus(Membership.ApprovalStatus.PENDING)
                .active(true)
                .build();
        given(membershipRepository.save(any(Membership.class))).willReturn(savedMembership);

        // when
        MembershipResponse result = membershipService.createMembership(request);

        // then
        assertThat(result.getUserId()).isEqualTo(100L);
        assertThat(result.getTargetType()).isEqualTo("ORGANIZATION");
        assertThat(result.getRole()).isEqualTo("MEMBER");
        assertThat(result.getApprovalStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("Should auto-approve when org has isAutoJoin=true")
    void testJoinOrganization_autoApprove() {
        // given
        CreateMembershipRequest request = CreateMembershipRequest.builder()
                .userId(100L)
                .targetType("ORGANIZATION")
                .targetId(1L)
                .build();

        Organization org = Organization.builder()
                .id(1L)
                .name("Auto Join Org")
                .orgType(Organization.OrgType.PUBLIC)
                .isAutoJoin(true)
                .active(true)
                .children(new ArrayList<>())
                .build();

        given(membershipRepository.existsByUserIdAndTargetTypeAndTargetId(
                100L, Membership.TargetType.ORGANIZATION, 1L)).willReturn(false);
        given(organizationRepository.findByIdAndActiveTrue(1L)).willReturn(Optional.of(org));

        Membership savedMembership = Membership.builder()
                .id(1L)
                .userId(100L)
                .targetType(Membership.TargetType.ORGANIZATION)
                .targetId(1L)
                .role(Membership.MembershipRole.MEMBER)
                .joinType(Membership.JoinType.AUTO)
                .approvalStatus(Membership.ApprovalStatus.APPROVED)
                .active(true)
                .build();
        given(membershipRepository.save(any(Membership.class))).willReturn(savedMembership);

        // when
        MembershipResponse result = membershipService.createMembership(request);

        // then
        assertThat(result.getApprovalStatus()).isEqualTo("APPROVED");
        assertThat(result.getJoinType()).isEqualTo("AUTO");
    }

    @Test
    @DisplayName("Should reject team membership with MEMBER role")
    void testJoinTeam_onlyIndividuals() {
        // given
        CreateMembershipRequest request = CreateMembershipRequest.builder()
                .userId(100L)
                .targetType("TEAM")
                .targetId(1L)
                .role("MEMBER")
                .build();

        given(membershipRepository.existsByUserIdAndTargetTypeAndTargetId(
                100L, Membership.TargetType.TEAM, 1L)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> membershipService.createMembership(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid role for team membership");
    }

    @Test
    @DisplayName("Should reject duplicate membership")
    void testJoinOrganization_duplicate() {
        // given
        CreateMembershipRequest request = CreateMembershipRequest.builder()
                .userId(100L)
                .targetType("ORGANIZATION")
                .targetId(1L)
                .build();

        given(membershipRepository.existsByUserIdAndTargetTypeAndTargetId(
                100L, Membership.TargetType.ORGANIZATION, 1L)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> membershipService.createMembership(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Membership already exists");
    }
}
