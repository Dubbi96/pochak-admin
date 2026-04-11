package com.pochak.web.bff.dto;

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
public class WebMyPageResponse {

    private JsonNode userProfile;
    private JsonNode watchHistory;
    private JsonNode favorites;
    private JsonNode wallet;
    private JsonNode entitlements;
}
