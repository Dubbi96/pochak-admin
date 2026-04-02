package com.pochak.content.club.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.asset.repository.ClipAssetRepository;
import com.pochak.content.asset.repository.VodAssetRepository;
import com.pochak.content.club.dto.ClubDetailResponse;
import com.pochak.content.club.dto.ClubListResponse;
import com.pochak.content.club.dto.JoinClubRequest;
import com.pochak.content.membership.dto.MembershipResponse;
import com.pochak.content.membership.entity.Membership;
import com.pochak.content.membership.repository.MembershipRepository;
import com.pochak.content.organization.repository.OrganizationRepository;
import com.pochak.content.sport.entity.Sport;
import com.pochak.content.team.entity.Team;
import com.pochak.content.team.repository.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ClubServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private ClipAssetRepository clipAssetRepository;

    @Mock
    private VodAssetRepository vodAssetRepository;

    @InjectMocks
    private ClubService clubService;

    private Sport testSport;
    private Team testTeam;
    private Team testTeam2;

    @BeforeEach
    void setUp() {
        testSport = Sport.builder()
                .id(1L)
                .name("Football")
                .code("FOOTBALL")
                .build();

        testTeam = Team.builder()
                .id(10L)
                .sport(testSport)
                .name("FC Seoul")
                .shortName("FCS")
                .logoUrl("https://example.com/logo.png")
                .siGunGuCode("11010")
                .latitude(new BigDecimal("37.5140"))
                .longitude(new BigDecimal("126.9780"))
                .active(true)
                .build();

        testTeam2 = Team.builder()
                .id(20L)
                .sport(testSport)
                .name("Incheon United")
                .shortName("ICU")
                .siGunGuCode("28010")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should get nearby clubs by siGunGuCode")
    void testGetNearbyClubs() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        Page<Team> page = new PageImpl<>(List.of(testTeam), pageable, 1);
        given(teamRepository.findNearbyBySiGunGuCode(eq(1L), eq("11010"), eq(pageable)))
                .willReturn(page);
        given(membershipRepository.countByTargetTypeAndTargetIdAndApprovalStatusAndActiveTrue(
                Membership.TargetType.TEAM, 10L, Membership.ApprovalStatus.APPROVED))
                .willReturn(25L);

        // when
        Page<ClubListResponse> result = clubService.getNearbyClubs(1L, "11010", null, null, pageable);

        // then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("FC Seoul");
        assertThat(result.getContent().get(0).getMemberCount()).isEqualTo(25L);
        assertThat(result.getContent().get(0).getSiGunGuCode()).isEqualTo("11010");
    }

    @Test
    @DisplayName("Should join a club and create PENDING membership")
    void testJoinClub() {
        // given
        JoinClubRequest request = JoinClubRequest.builder()
                .userId(100L)
                .role("PLAYER")
                .nickname("Player1")
                .build();

        given(teamRepository.findByIdAndActiveTrue(10L)).willReturn(Optional.of(testTeam));
        given(membershipRepository.existsByUserIdAndTargetTypeAndTargetId(
                100L, Membership.TargetType.TEAM, 10L)).willReturn(false);

        Membership savedMembership = Membership.builder()
                .id(1L)
                .userId(100L)
                .targetType(Membership.TargetType.TEAM)
                .targetId(10L)
                .role(Membership.MembershipRole.PLAYER)
                .nickname("Player1")
                .joinType(Membership.JoinType.REQUEST)
                .approvalStatus(Membership.ApprovalStatus.PENDING)
                .active(true)
                .build();
        given(membershipRepository.save(any(Membership.class))).willReturn(savedMembership);

        // when
        MembershipResponse result = clubService.joinClub(10L, request);

        // then
        assertThat(result.getUserId()).isEqualTo(100L);
        assertThat(result.getTargetType()).isEqualTo("TEAM");
        assertThat(result.getTargetId()).isEqualTo(10L);
        assertThat(result.getRole()).isEqualTo("PLAYER");
        assertThat(result.getApprovalStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("Should reject duplicate join request")
    void testJoinClub_duplicate() {
        // given
        JoinClubRequest request = JoinClubRequest.builder()
                .userId(100L)
                .build();

        given(teamRepository.findByIdAndActiveTrue(10L)).willReturn(Optional.of(testTeam));
        given(membershipRepository.existsByUserIdAndTargetTypeAndTargetId(
                100L, Membership.TargetType.TEAM, 10L)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> clubService.joinClub(10L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Already a member");
    }

    @Test
    @DisplayName("Should get popular clubs ordered by member count")
    void testGetPopularClubs() {
        // given
        Pageable pageable = PageRequest.of(0, 20);
        List<Object[]> popularIds = List.of(
                new Object[]{10L, 50L},
                new Object[]{20L, 30L}
        );
        given(membershipRepository.findPopularTargetIds(Membership.TargetType.TEAM, pageable))
                .willReturn(popularIds);
        given(teamRepository.findByIdAndActiveTrue(10L)).willReturn(Optional.of(testTeam));
        given(teamRepository.findByIdAndActiveTrue(20L)).willReturn(Optional.of(testTeam2));

        // when
        Page<ClubListResponse> result = clubService.getPopularClubs(pageable);

        // then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getName()).isEqualTo("FC Seoul");
        assertThat(result.getContent().get(0).getMemberCount()).isEqualTo(50L);
        assertThat(result.getContent().get(1).getName()).isEqualTo("Incheon United");
        assertThat(result.getContent().get(1).getMemberCount()).isEqualTo(30L);
    }

    @Test
    @DisplayName("Should get club detail with organization info and member count")
    void testGetClubDetail() {
        // given
        given(teamRepository.findByIdAndActiveTrue(10L)).willReturn(Optional.of(testTeam));
        given(membershipRepository.countByTargetTypeAndTargetIdAndApprovalStatusAndActiveTrue(
                Membership.TargetType.TEAM, 10L, Membership.ApprovalStatus.APPROVED))
                .willReturn(25L);
        given(clipAssetRepository.findPopularClips(any(Pageable.class))).willReturn(Collections.emptyList());
        given(vodAssetRepository.findRecentVods(any(Pageable.class))).willReturn(Collections.emptyList());

        // when
        ClubDetailResponse result = clubService.getClubDetail(10L);

        // then
        assertThat(result.getTeamId()).isEqualTo(10L);
        assertThat(result.getName()).isEqualTo("FC Seoul");
        assertThat(result.getMemberCount()).isEqualTo(25L);
    }

    @Test
    @DisplayName("Should throw when club not found")
    void testGetClubDetail_notFound() {
        // given
        given(teamRepository.findByIdAndActiveTrue(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> clubService.getClubDetail(999L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Team not found");
    }
}
