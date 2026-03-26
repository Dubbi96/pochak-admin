package com.pochak.content.organization.dto;

import com.pochak.content.organization.entity.Organization;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDetailResponse {

    private Long id;
    private String name;
    private String nameEn;
    private String description;
    private String orgType;
    private Long parentId;
    private String parentName;
    private Long sportId;
    private String logoUrl;
    private String websiteUrl;
    private Boolean canHostCompetition;
    private Boolean isAutoJoin;
    private String accessType;
    private Boolean autoApprove;
    private Boolean managerOnlyBooking;
    private String defaultContentVisibility;
    private String displayArea;
    private Boolean isVerified;
    private String siGunGuCode;
    private Boolean isCug;
    private String joinPolicy;
    private String reservationPolicy;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrganizationListResponse> children;

    public static OrganizationDetailResponse from(Organization org) {
        return from(org, null);
    }

    public static OrganizationDetailResponse from(Organization org, List<Organization> children) {
        OrganizationDetailResponseBuilder builder = OrganizationDetailResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .nameEn(org.getNameEn())
                .description(org.getDescription())
                .orgType(org.getOrgType().name())
                .parentId(org.getParent() != null ? org.getParent().getId() : null)
                .parentName(org.getParent() != null ? org.getParent().getName() : null)
                .sportId(org.getSportId())
                .logoUrl(org.getLogoUrl())
                .websiteUrl(org.getWebsiteUrl())
                .canHostCompetition(org.getCanHostCompetition())
                .isAutoJoin(org.getIsAutoJoin())
                .accessType(org.getAccessType() != null ? org.getAccessType().name() : null)
                .autoApprove(org.getAutoApprove())
                .managerOnlyBooking(org.getManagerOnlyBooking())
                .defaultContentVisibility(org.getDefaultContentVisibility() != null ? org.getDefaultContentVisibility().name() : null)
                .displayArea(org.getDisplayArea() != null ? org.getDisplayArea().name() : null)
                .isVerified(org.getIsVerified())
                .siGunGuCode(org.getSiGunGuCode())
                .isCug(org.getIsCug())
                .joinPolicy(org.getJoinPolicy() != null ? org.getJoinPolicy().name() : null)
                .reservationPolicy(org.getReservationPolicy() != null ? org.getReservationPolicy().name() : null)
                .active(org.getActive())
                .createdAt(org.getCreatedAt())
                .updatedAt(org.getUpdatedAt());

        if (children != null) {
            builder.children(children.stream().map(OrganizationListResponse::from).toList());
        }

        return builder.build();
    }
}
