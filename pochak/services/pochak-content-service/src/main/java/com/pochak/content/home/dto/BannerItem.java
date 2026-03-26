package com.pochak.content.home.dto;

import com.pochak.content.display.entity.DisplaySection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerItem {

    private Long id;
    private String title;
    private String imageUrl;
    private String linkType;
    private String linkValue;

    public static BannerItem fromDisplaySection(DisplaySection section) {
        return BannerItem.builder()
                .id(section.getId())
                .title(section.getTitle())
                .linkType(section.getSectionType())
                .linkValue(section.getContentQuery())
                .build();
    }
}
