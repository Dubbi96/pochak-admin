package com.pochak.content.sport.dto;

import com.pochak.content.sport.entity.SportTag;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SportTagResponse {

    private Long id;
    private String tag;
    private LocalDateTime createdAt;

    public static SportTagResponse from(SportTag sportTag) {
        return SportTagResponse.builder()
                .id(sportTag.getId())
                .tag(sportTag.getTag())
                .createdAt(sportTag.getCreatedAt())
                .build();
    }
}
