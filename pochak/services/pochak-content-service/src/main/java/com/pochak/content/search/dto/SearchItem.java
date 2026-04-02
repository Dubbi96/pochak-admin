package com.pochak.content.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchItem {

    private Long id;
    private String title;
    private String thumbnailUrl;
    private String logoUrl;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime createdAt;
    private Map<String, Object> extra;
}
