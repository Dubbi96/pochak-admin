package com.pochak.content.organization.service;

import com.pochak.common.exception.BusinessException;
import com.pochak.content.organization.dto.*;
import com.pochak.content.organization.entity.Organization;
import com.pochak.content.organization.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @InjectMocks
    private OrganizationService organizationService;

    private Organization testAssociation;
    private Organization testBranch;

    @BeforeEach
    void setUp() {
        testAssociation = Organization.builder()
                .id(1L)
                .name("Korea Football Association")
                .nameEn("KFA")
                .orgType(Organization.OrgType.ASSOCIATION)
                .canHostCompetition(true)
                .isAutoJoin(false)
                .active(true)
                .children(new ArrayList<>())
                .build();

        testBranch = Organization.builder()
                .id(2L)
                .name("Seoul Branch")
                .orgType(Organization.OrgType.PRIVATE)
                .parent(testAssociation)
                .canHostCompetition(false)
                .isAutoJoin(true)
                .active(true)
                .children(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should create an association successfully")
    void testCreateAssociation() {
        // given
        CreateOrganizationRequest request = CreateOrganizationRequest.builder()
                .name("Korea Football Association")
                .nameEn("KFA")
                .orgType("ASSOCIATION")
                .canHostCompetition(true)
                .build();

        given(organizationRepository.save(any(Organization.class))).willReturn(testAssociation);

        // when
        OrganizationDetailResponse result = organizationService.createOrganization(request);

        // then
        assertThat(result.getName()).isEqualTo("Korea Football Association");
        assertThat(result.getOrgType()).isEqualTo("ASSOCIATION");
        assertThat(result.getCanHostCompetition()).isTrue();
    }

    @Test
    @DisplayName("Should fail to create branch without existing parent")
    void testCreateBranch_withoutParent_fails() {
        // given
        CreateOrganizationRequest request = CreateOrganizationRequest.builder()
                .name("Seoul Branch")
                .orgType("PRIVATE")
                .parentId(999L)
                .build();

        given(organizationRepository.findByIdAndActiveTrue(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> organizationService.createOrganization(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Parent organization not found");
    }

    @Test
    @DisplayName("Should return children for an organization")
    void testGetChildren() {
        // given
        given(organizationRepository.findByIdAndActiveTrue(1L)).willReturn(Optional.of(testAssociation));
        given(organizationRepository.findByParentIdAndActiveTrue(1L)).willReturn(List.of(testBranch));

        // when
        List<OrganizationListResponse> children = organizationService.getChildren(1L);

        // then
        assertThat(children).hasSize(1);
        assertThat(children.get(0).getName()).isEqualTo("Seoul Branch");
        assertThat(children.get(0).getParentId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should get organization detail with children")
    void testGetOrganizationDetail() {
        // given
        given(organizationRepository.findByIdAndActiveTrue(1L)).willReturn(Optional.of(testAssociation));
        given(organizationRepository.findByParentIdAndActiveTrue(1L)).willReturn(List.of(testBranch));

        // when
        OrganizationDetailResponse result = organizationService.getOrganizationDetail(1L);

        // then
        assertThat(result.getName()).isEqualTo("Korea Football Association");
        assertThat(result.getChildren()).hasSize(1);
        assertThat(result.getChildren().get(0).getName()).isEqualTo("Seoul Branch");
    }

    @Test
    @DisplayName("Should soft delete an organization")
    void testDeleteOrganization() {
        // given
        given(organizationRepository.findByIdAndActiveTrue(1L)).willReturn(Optional.of(testAssociation));

        // when
        organizationService.deleteOrganization(1L);

        // then
        assertThat(testAssociation.getActive()).isFalse();
    }
}
