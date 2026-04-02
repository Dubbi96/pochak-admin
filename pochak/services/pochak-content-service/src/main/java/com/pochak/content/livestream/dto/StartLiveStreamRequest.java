package com.pochak.content.livestream.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StartLiveStreamRequest {

    private String streamUrl;
}
