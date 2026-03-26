package com.pochak.content.sport.dto;

import com.pochak.content.sport.entity.Sport;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SportDetailResponse {

    private Long id;
    private String name;
    private String nameEn;
    private String code;
    private String description;
    private String imageUrl;
    private String iconUrl;
    private Integer displayOrder;
    private Boolean isActive;
    private List<SportTagResponse> tags;

    public static SportDetailResponse from(Sport sport) {
        return SportDetailResponse.builder()
                .id(sport.getId())
                .name(sport.getName())
                .nameEn(sport.getNameEn())
                .code(sport.getCode())
                .description(sport.getDescription())
                .imageUrl(sport.getImageUrl())
                .iconUrl(sport.getIconUrl())
                .displayOrder(sport.getDisplayOrder())
                .isActive(sport.getActive())
                .tags(sport.getTags() != null
                        ? sport.getTags().stream().map(SportTagResponse::from).toList()
                        : List.of())
                .build();
    }
}
