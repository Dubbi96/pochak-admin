package com.pochak.content.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrganizationRequest {

    @NotBlank
    private String name;

    private String nameEn;

    private String description;

    @NotNull
    private String orgType;

    private Long parentId;

    private Long sportId;

    private String logoUrl;

    private String websiteUrl;

    private Boolean canHostCompetition;

    private Boolean isAutoJoin;

    private String accessType; // OPEN or CLOSED

    private Boolean autoApprove;

    private Boolean managerOnlyBooking;

    private String defaultContentVisibility; // PUBLIC or MEMBERS_ONLY

    // === Policy v2 신규 필드 ===

    private String displayArea; // CITY or CLUB

    private Boolean isVerified;

    private String siGunGuCode;

    private Boolean isCug;

    private String joinPolicy; // OPEN, APPROVAL, INVITE_ONLY

    private String reservationPolicy; // ALL_MEMBERS, MANAGER_ONLY
}
