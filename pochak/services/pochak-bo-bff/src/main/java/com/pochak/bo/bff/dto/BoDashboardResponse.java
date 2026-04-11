package com.pochak.bo.bff.dto;

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
public class BoDashboardResponse {

    private JsonNode analytics;
    private JsonNode memberStats;
    private JsonNode assetStats;
    private JsonNode revenueStats;
}
