package com.pochak.content.livestream.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ViewerCountResponse {

    private Long streamId;
    private int currentViewerCount;
    private int peakViewerCount;
}
