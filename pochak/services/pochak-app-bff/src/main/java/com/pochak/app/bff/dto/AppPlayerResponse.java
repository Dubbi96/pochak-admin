package com.pochak.app.bff.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AppPlayerResponse {

    private JsonNode playerData;
    private boolean accessGranted;
    private String accessDeniedReason;
    private JsonNode cameras;
    private boolean pipSupported;
    private JsonNode productSuggestions;
}
