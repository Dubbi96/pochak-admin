package com.pochak.content.sport.dto;

import com.pochak.content.sport.entity.Sport;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SportListResponse {

    private Long id;
    private String name;
    private String code;
    private String imageUrl;
    private Integer displayOrder;
    private Boolean isActive;
    private Integer tagCount;

    public static SportListResponse from(Sport sport) {
        return SportListResponse.builder()
                .id(sport.getId())
                .name(sport.getName())
                .code(sport.getCode())
                .imageUrl(sport.getImageUrl())
                .displayOrder(sport.getDisplayOrder())
                .isActive(sport.getActive())
                .tagCount(sport.getTags() != null ? sport.getTags().size() : 0)
                .build();
    }
}
