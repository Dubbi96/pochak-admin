package com.pochak.content.recommendation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RecommendedContentResponse {

    private Long id;
    private String title;
    private String thumbnailUrl;
    private ContentType type;
    private String matchInfo;
    private List<String> tags;
    private String reason;

    public enum ContentType {
        LIVE, VOD, CLIP
    }
}
