package com.pochak.content.favorite.dto;

import com.pochak.content.favorite.entity.Favorite;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class FavoriteResponse {

    private Long id;
    private Long userId;
    private String targetType;
    private Long targetId;
    private LocalDateTime createdAt;

    public static FavoriteResponse from(Favorite entity) {
        return FavoriteResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .targetType(entity.getTargetType())
                .targetId(entity.getTargetId())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
