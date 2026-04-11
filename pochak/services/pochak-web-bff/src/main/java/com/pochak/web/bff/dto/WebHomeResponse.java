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
public class WebHomeResponse {

    private JsonNode banners;
    private JsonNode liveNow;
    private JsonNode recommended;
    private JsonNode featuredProducts;
}
