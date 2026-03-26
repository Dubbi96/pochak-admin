package com.pochak.identity.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckDuplicateResponse {

    private Boolean loginIdAvailable;
    private Boolean emailAvailable;
    private Boolean phoneAvailable;
}
