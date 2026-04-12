package com.pochak.content.publiclink.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SlugCheckResponse {

    private String slug;
    private boolean available;
}
