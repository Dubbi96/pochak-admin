package com.pochak.content.upload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityLevel {

    private String label;
    private Integer width;
    private Integer height;
    private Integer bitrate;
}
