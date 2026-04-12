package com.pochak.content.publiclink.dto;

import com.pochak.content.publiclink.entity.PublicLink;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PublicResolveResponse {

    private String slug;
    private String resourceType;
    private Long resourceId;

    public static PublicResolveResponse from(PublicLink link) {
        return PublicResolveResponse.builder()
                .slug(link.getSlug())
                .resourceType(link.getResourceType().name())
                .resourceId(link.getResourceId())
                .build();
    }
}
