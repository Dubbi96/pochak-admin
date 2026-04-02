package com.pochak.content.streaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityLevel {

    private String label;
    private Integer bitrate;
    private Integer width;
    private Integer height;
}
