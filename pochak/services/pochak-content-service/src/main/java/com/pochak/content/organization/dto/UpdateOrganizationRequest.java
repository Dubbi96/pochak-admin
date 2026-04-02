package com.pochak.content.organization.dto;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrganizationRequest {

    private String name;

    private String nameEn;

    private String description;

    private String orgType;

    private Long sportId;

    private String logoUrl;

    private String websiteUrl;

    private Boolean canHostCompetition;

    private Boolean isAutoJoin;

    private String accessType;

    private Boolean autoApprove;

    private Boolean managerOnlyBooking;

    private String defaultContentVisibility;

    private Long parentId;

    // === Policy v2 신규 필드 ===

    private String displayArea;

    private Boolean isVerified;

    private String siGunGuCode;

    private Boolean isCug;

    private String joinPolicy;

    private String reservationPolicy;
}
