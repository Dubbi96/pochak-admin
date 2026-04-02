package com.pochak.content.organization.dto;

import com.pochak.content.organization.entity.Organization;
import lombok.*;

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
                .build();
    }
}
