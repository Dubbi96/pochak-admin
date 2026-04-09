package com.pochak.content.highlight.dto;

import com.pochak.content.asset.entity.ClipAsset;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiClipResponse {

    private Long id;
    private String title;
    private Integer startTimeSec;
    private Integer endTimeSec;
    private Integer duration;

    public static AiClipResponse from(ClipAsset entity) {
        return AiClipResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .startTimeSec(entity.getStartTimeSec())
                .endTimeSec(entity.getEndTimeSec())
                .duration(entity.getDuration())
                .build();
    }
}
