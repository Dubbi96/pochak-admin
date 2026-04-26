package com.pochak.content.organization.dto;

import com.pochak.content.organization.entity.Organization;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationListResponse {

    private Long id;
    private String name;
    private String nameEn;
    private String orgType;
    private Long parentId;
    private Long sportId;
    private String logoUrl;
    private Boolean canHostCompetition;
    private String accessType;
    private Boolean active;

    // Policy v2 fields
    private String displayArea;
    private Boolean isVerified;
    private String siGunGuCode;
    private Boolean isCug;
    private String joinPolicy;
    private String reservationPolicy;
    private String contentVisibility;
    private Boolean autoJoin;
    private Boolean managerOnlyBooking;
    private String websiteUrl;
    private String description;
    private LocalDateTime createdAt;

    public static OrganizationListResponse from(Organization org) {
        return OrganizationListResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .nameEn(org.getNameEn())
                .orgType(org.getOrgType().name())
                .parentId(org.getParent() != null ? org.getParent().getId() : null)
                .sportId(org.getSportId())
                .logoUrl(org.getLogoUrl())
                .canHostCompetition(org.getCanHostCompetition())
                .accessType(org.getAccessType() != null ? org.getAccessType().name() : null)
                .active(org.getActive())
                .displayArea(org.getDisplayArea() != null ? org.getDisplayArea().name() : null)
                .isVerified(org.getIsVerified())
                .siGunGuCode(org.getSiGunGuCode())
                .isCug(org.getIsCug())
                .joinPolicy(org.getJoinPolicy() != null ? org.getJoinPolicy().name() : null)
                .reservationPolicy(org.getReservationPolicy() != null ? org.getReservationPolicy().name() : null)
                .contentVisibility(org.getDefaultContentVisibility() != null ? org.getDefaultContentVisibility().name() : null)
                .autoJoin(org.getIsAutoJoin())
                .managerOnlyBooking(org.getManagerOnlyBooking())
                .websiteUrl(org.getWebsiteUrl())
                .description(org.getDescription())
                .createdAt(org.getCreatedAt())
                .build();
    }
}
