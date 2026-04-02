package com.pochak.content.organization.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.membership.repository.MembershipRepository;
import com.pochak.content.organization.dto.OrganizationDetailResponse;
import com.pochak.content.organization.dto.UpdateOrganizationRequest;
import com.pochak.content.organization.entity.*;
import com.pochak.content.organization.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

/**
 * M4: CITY is_verified + reservation_policy invariant tests.
 */
@ExtendWith(MockitoExtension.class)
class OrganizationServiceCityInvariantTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @InjectMocks
    private OrganizationService organizationService;

    private Organization verifiedCityOrg;
    private Organization unverifiedOrg;
    private Organization clubOrg;

    @BeforeEach
    void setUp() {
        verifiedCityOrg = Organization.builder()
                .id(1L)
                .name("Verified City Org")
                .orgType(Organization.OrgType.PUBLIC)
                .isVerified(true)
                .displayArea(DisplayArea.CLUB) // will be updated to CITY
                .reservationPolicy(ReservationPolicy.MANAGER_ONLY)
                .joinPolicy(JoinPolicy.APPROVAL)
                .isCug(false)
                .active(true)
                .children(new ArrayList<>())
                .build();

        unverifiedOrg = Organization.builder()
                .id(2L)
                .name("Unverified Org")
                .orgType(Organization.OrgType.PUBLIC)
                .isVerified(false)
                .displayArea(DisplayArea.CLUB)
                .reservationPolicy(ReservationPolicy.MANAGER_ONLY)
                .active(true)
                .children(new ArrayList<>())
                .build();

        clubOrg = Organization.builder()
                .id(3L)
                .name("Club Org")
                .orgType(Organization.OrgType.PRIVATE)
                .isVerified(false)
                .displayArea(DisplayArea.CLUB)
                .reservationPolicy(ReservationPolicy.MANAGER_ONLY)
                .joinPolicy(JoinPolicy.INVITE_ONLY)
                .isCug(true)
                .active(true)
                .children(new ArrayList<>())
                .build();
    }

    @Nested
    @DisplayName("M4: CITY is_verified 검증")
    class CityVerificationTests {

        @Test
        @DisplayName("CITY + is_verified=false -> CITY 정책 자동 적용 (OPEN, PUBLIC, non-CUG)")
        void city_unverified_appliesCityInvariants() {
            // given: unverified org sets displayArea=CITY
            given(organizationRepository.findByIdAndActiveTrue(2L))
                    .willReturn(Optional.of(unverifiedOrg));
            given(organizationRepository.findByParentIdAndActiveTrue(2L))
                    .willReturn(List.of());

            UpdateOrganizationRequest request = UpdateOrganizationRequest.builder()
                    .displayArea("CITY")
                    .build();

            // when
            OrganizationDetailResponse result = organizationService.updateOrganization(2L, request);

            // then: CITY invariants applied even for unverified org
            assertThat(result).isNotNull();
            assertThat(unverifiedOrg.getDisplayArea()).isEqualTo(DisplayArea.CITY);
            assertThat(unverifiedOrg.getJoinPolicy()).isEqualTo(JoinPolicy.OPEN);
        }

        @Test
        @DisplayName("CITY + is_verified=true -> 성공")
        void city_verified_succeeds() {
            // given: verified org sets displayArea=CITY
            given(organizationRepository.findByIdAndActiveTrue(1L))
                    .willReturn(Optional.of(verifiedCityOrg));
            given(organizationRepository.findByParentIdAndActiveTrue(1L))
                    .willReturn(List.of());

            UpdateOrganizationRequest request = UpdateOrganizationRequest.builder()
                    .displayArea("CITY")
                    .build();

            // when
            OrganizationDetailResponse result = organizationService.updateOrganization(1L, request);

            // then: no exception, success
            assertThat(result).isNotNull();
            assertThat(verifiedCityOrg.getDisplayArea()).isEqualTo(DisplayArea.CITY);
        }
    }

    @Nested
    @DisplayName("M4: CITY reservation_policy 강제 교정")
    class CityReservationPolicyTests {

        @Test
        @DisplayName("CITY + reservation_policy=MANAGER_ONLY -> reservation_policy 그대로 유지, CITY 정책만 적용")
        void city_managerOnly_reservationPolicyUnchanged() {
            // given: verified org with MANAGER_ONLY reservation policy
            given(organizationRepository.findByIdAndActiveTrue(1L))
                    .willReturn(Optional.of(verifiedCityOrg));
            given(organizationRepository.findByParentIdAndActiveTrue(1L))
                    .willReturn(List.of());

            UpdateOrganizationRequest request = UpdateOrganizationRequest.builder()
                    .displayArea("CITY")
                    .reservationPolicy("MANAGER_ONLY")
                    .build();

            // when
            organizationService.updateOrganization(1L, request);

            // then: reservation_policy is NOT auto-corrected; CITY invariants only affect CUG, joinPolicy, contentVisibility
            assertThat(verifiedCityOrg.getReservationPolicy()).isEqualTo(ReservationPolicy.MANAGER_ONLY);
            assertThat(verifiedCityOrg.getJoinPolicy()).isEqualTo(JoinPolicy.OPEN);
            assertThat(verifiedCityOrg.getIsCug()).isFalse();
        }

        @Test
        @DisplayName("CITY + reservation_policy=ALL_MEMBERS -> 그대로 유지")
        void city_allMembers_unchanged() {
            // Build org with ALL_MEMBERS policy already set
            Organization cityOrgWithAllMembers = Organization.builder()
                    .id(1L)
                    .name("Verified City Org")
                    .orgType(Organization.OrgType.PUBLIC)
                    .isVerified(true)
                    .displayArea(DisplayArea.CLUB)
                    .reservationPolicy(ReservationPolicy.ALL_MEMBERS)
                    .joinPolicy(JoinPolicy.APPROVAL)
                    .isCug(false)
                    .active(true)
                    .children(new ArrayList<>())
                    .build();

            given(organizationRepository.findByIdAndActiveTrue(1L))
                    .willReturn(Optional.of(cityOrgWithAllMembers));
            given(organizationRepository.findByParentIdAndActiveTrue(1L))
                    .willReturn(List.of());

            UpdateOrganizationRequest request = UpdateOrganizationRequest.builder()
                    .displayArea("CITY")
                    .build();

            // when
            organizationService.updateOrganization(1L, request);

            // then
            assertThat(cityOrgWithAllMembers.getReservationPolicy()).isEqualTo(ReservationPolicy.ALL_MEMBERS);
        }
    }

    @Nested
    @DisplayName("M4: CLUB은 제약 없음")
    class ClubNoConstraintTests {

        @Test
        @DisplayName("CLUB은 is_verified/reservation_policy 제약 없이 생성 가능")
        void club_noConstraints() {
            // given: unverified CLUB org
            given(organizationRepository.findByIdAndActiveTrue(3L))
                    .willReturn(Optional.of(clubOrg));
            given(organizationRepository.findByParentIdAndActiveTrue(3L))
                    .willReturn(List.of());

            UpdateOrganizationRequest request = UpdateOrganizationRequest.builder()
                    .displayArea("CLUB")
                    .reservationPolicy("MANAGER_ONLY")
                    .build();

            // when
            OrganizationDetailResponse result = organizationService.updateOrganization(3L, request);

            // then: no exception, CLUB allows MANAGER_ONLY and unverified
            assertThat(result).isNotNull();
            assertThat(clubOrg.getReservationPolicy()).isEqualTo(ReservationPolicy.MANAGER_ONLY);
            assertThat(clubOrg.getIsVerified()).isFalse();
        }
    }
}
