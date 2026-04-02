package com.pochak.content.client.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CommerceApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
}
